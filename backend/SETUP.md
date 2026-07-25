# WildEye RAG Backend Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```env
OPENAI_API_KEY=sk_your_key_here
PINECONE_API_KEY=your_pinecone_key  # Optional
PINECONE_INDEX=wildeye-forest-docs
FRONTEND_URL=http://localhost:3000
```

### 3. Get API Keys

**OpenAI API Key:**
- Go to https://platform.openai.com/api-keys
- Create new API key
- Copy and paste into `.env`

**Pinecone (Optional):**
- Sign up at https://www.pinecone.io/
- Create an index named `wildeye-forest-docs`
- Get API key and add to `.env`

### 4. Start Server
```bash
npm run dev
```

You should see:
```
📚 Document store initialized
🤖 RAG system initialized
✅ Backend is CONNECTED and ready
```

## Check Connection

### Test Backend Health
```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Test RAG Health
```bash
curl http://localhost:5000/api/chat/health
```

Response:
```json
{
  "status": "OK",
  "rag_initialized": true,
  "embedding_model": "text-embedding-3-small",
  "chat_model": "gpt-4-turbo"
}
```

### Test Chat API
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What should I do about elephant conflict?"}'
```

## Frontend Integration

The frontend will connect to `http://localhost:5000/api/chat` automatically.

## Troubleshooting

**Issue:** `Invalid API key`
- Check OPENAI_API_KEY in .env
- Verify key is active on OpenAI dashboard

**Issue:** `Pinecone connection failed`
- System will fallback to in-memory store
- Check PINECONE_API_KEY and PINECONE_INDEX

**Issue:** `CORS error from frontend`
- Update FRONTEND_URL in .env
- Ensure it matches your frontend origin

**Issue:** Backend won't start
- Check Node.js version (v18+)
- Run `npm install` again
- Check port 5000 is available
