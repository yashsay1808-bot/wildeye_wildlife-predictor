import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { RAGChat } from './services/ragChat.js';
import { DocumentStore } from './services/documentStore.js';
import { setupRoutes } from './routes/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Initialize services
const ragChat = new RAGChat();
const documentStore = new DocumentStore();

// Make services available to routes
app.locals.ragChat = ragChat;
app.locals.documentStore = documentStore;

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Setup routes
setupRoutes(app);

// Initialize and start server
async function startServer() {
  try {
    // Initialize document store (load forest guidelines)
    await documentStore.initialize();
    console.log('📚 Document store initialized');

    // Initialize RAG system
    await ragChat.initialize();
    console.log('🤖 RAG system initialized');

    app.listen(PORT, () => {
      console.log(`🌿 WildEye RAG Backend running on port ${PORT}`);
      console.log(`📡 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      console.log(`✅ Backend is CONNECTED and ready`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
