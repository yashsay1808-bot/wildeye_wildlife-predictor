import { OpenAI } from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';

export class RAGChat {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.pinecone = null;
    this.pineconeIndex = null;
    this.embeddingModel = 'text-embedding-3-small';
    this.chatModel = 'gpt-4-turbo';
  }

  async initialize() {
    try {
      // Initialize Pinecone
      if (process.env.PINECONE_API_KEY && process.env.PINECONE_INDEX) {
        this.pinecone = new Pinecone({
          apiKey: process.env.PINECONE_API_KEY,
        });
        this.pineconeIndex = this.pinecone.Index(process.env.PINECONE_INDEX);
        console.log('✅ Connected to Pinecone');
      } else {
        console.warn('⚠️ Pinecone not configured. Using in-memory vector store.');
      }
    } catch (error) {
      console.error('Error initializing RAG:', error);
      throw error;
    }
  }

  /**
   * Generate embedding for text
   */
  async generateEmbedding(text) {
    try {
      const response = await this.openai.embeddings.create({
        model: this.embeddingModel,
        input: text,
        encoding_format: 'float',
      });
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  /**
   * Search for relevant documents
   */
  async searchDocuments(query, topK = 5) {
    try {
      const queryEmbedding = await this.generateEmbedding(query);

      if (this.pineconeIndex) {
        // Search in Pinecone
        const results = await this.pineconeIndex.query({
          vector: queryEmbedding,
          topK,
          includeMetadata: true,
        });
        return results.matches.map(match => ({
          id: match.id,
          text: match.metadata?.text || '',
          source: match.metadata?.source || 'Unknown',
          score: match.score,
        }));
      } else {
        // Fallback: return pre-defined documents
        return this.getRelevantDocuments(query);
      }
    } catch (error) {
      console.error('Error searching documents:', error);
      return this.getRelevantDocuments(query);
    }
  }

  /**
   * Get relevant documents (fallback)
   */
  getRelevantDocuments(query) {
    // Simple keyword matching fallback
    const documents = [
      {
        id: '1',
        text: 'Elephant Conflict Management: When human-elephant conflict occurs, farmers should alert wildlife authorities immediately. Use noise makers and fire to scare elephants away from crops. Never approach elephants directly.',
        source: 'Forest Dept Guidelines - Elephant Management',
        score: 0.9,
      },
      {
        id: '2',
        text: 'Tiger Safety: In case of tiger sighting, stay indoors and alert forest rangers. Do not attempt to chase or corner tigers. Keep livestock in secure enclosures.',
        source: 'Forest Dept Guidelines - Predator Safety',
        score: 0.85,
      },
      {
        id: '3',
        text: 'Fire Prevention: Clear dry grass and fallen branches from forest boundaries. Report any unauthorized burning. Maintain firebreaks of 50 meters width.',
        source: 'Forest Dept Guidelines - Fire Management',
        score: 0.8,
      },
    ];

    const lowerQuery = query.toLowerCase();
    return documents.filter(doc => 
      doc.text.toLowerCase().includes(lowerQuery) || 
      doc.source.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Main chat method with RAG
   */
  async chat(userMessage, conversationHistory = []) {
    try {
      // Search for relevant documents
      const relevantDocs = await this.searchDocuments(userMessage);
      
      // Build context from documents
      const context = relevantDocs
        .map(doc => `[${doc.source}]: ${doc.text}`)
        .join('\n\n');

      // Build system prompt
      const systemPrompt = `You are the Forest AI Assistant for WildEye Wildlife Conflict Predictor. You help farmers and wildlife officials in the Bandipur-Nagarahole region with wildlife conflict management.

You have access to official Forest Department guidelines and best practices. When answering questions:
1. Prioritize safety and official guidelines
2. Be concise and practical
3. Reference the source documents when applicable
4. For emergencies, advise contacting forest rangers immediately
5. Provide specific actions the user can take

Context from official documents:
${context}`;

      // Prepare messages
      const messages = [
        ...conversationHistory.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        })),
        {
          role: 'user',
          content: userMessage,
        },
      ];

      // Get response from OpenAI
      const response = await this.openai.chat.completions.create({
        model: this.chatModel,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          ...messages,
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      return {
        message: response.choices[0].message.content,
        sources: relevantDocs.map(doc => ({
          text: doc.text,
          source: doc.source,
        })),
        usage: {
          prompt_tokens: response.usage.prompt_tokens,
          completion_tokens: response.usage.completion_tokens,
        },
      };
    } catch (error) {
      console.error('Error in RAG chat:', error);
      throw error;
    }
  }
}
