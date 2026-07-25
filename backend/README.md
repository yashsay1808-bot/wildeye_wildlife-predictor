# WildEye RAG Backend Integration - Complete Setup Guide

## 📋 Overview

This guide explains how to set up and connect the **RAG (Retrieval-Augmented Generation) backend** to the WildEye Wildlife Conflict Predictor frontend.

### What is RAG?
RAG combines:
- **Vector Database** (Pinecone) - Stores forest guidelines as embeddings
- **LLM** (GPT-4) - Generates intelligent responses
- **Document Retrieval** - Fetches relevant forest policies based on user questions

## 🚀 Quick Setup (5 minutes)

### Step 1: Get API Keys

**OpenAI API Key:**
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy and save it

**Pinecone (Optional):**
1. Sign up at https://www.pinecone.io/
2. Create free tier account
3. Create index: `wildeye-forest-docs`
4. Get API key from dashboard

### Step 2: Install Backend

```bash
cd backend
npm install
```

### Step 3: Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Required
OPENAI_API_KEY=sk_test_your_key_here

# Optional (for production)
PINECONE_API_KEY=your_key
PINECONE_INDEX=wildeye-forest-docs
```

### Step 4: Start Backend

```bash
npm run dev
```

Expected output:
```
📚 Document store initialized
🤖 RAG system initialized
✅ Backend is CONNECTED and ready
🌿 WildEye RAG Backend running on port 5000
```

### Step 5: Update Frontend

Add this to `index.html` before closing `</head>`:

```html
<script src="backend/frontend-integration.js"></script>
```

## ✅ Verify Connection

### Test 1: Backend Health
```bash
curl http://localhost:5000/health
```
Response: `{"status":"OK","timestamp":"2024-01-15T10:30:00Z"}`

### Test 2: RAG Health
```bash
curl http://localhost:5000/api/chat/health
```
Response: `{"status":"OK","rag_initialized":true}`

### Test 3: Chat API
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What should I do about elephant conflict?"}'
```

### Test 4: Frontend Integration
1. Open http://localhost:3000
2. Click "Ask AI" button
3. Type a question
4. Should see response with sources

## 📁 Backend Structure

```
backend/
├── server.js                    # Main Express server
├── package.json                 # Dependencies
├── .env.example                 # Configuration template
├── SETUP.md                     # Setup guide
├── services/
│   ├── ragChat.js              # RAG chat logic + OpenAI
│   └── documentStore.js        # Forest guidelines database
├── routes/
│   ├── index.js                # Route setup
│   ├── chat.js                 # Chat endpoints
│   └── documents.js            # Document endpoints
├── scripts/
│   └── embed-documents.js      # Embed PDFs to Pinecone
└── frontend-integration.js     # Frontend connection code
```

## 🔌 API Endpoints

### Health Check
```
GET /health
Response: {"status":"OK","timestamp":"..."}
```

### Chat with RAG
```
POST /api/chat
Body: {
  "message": "string",
  "conversationHistory": [{"role":"user","content":"..."}]
}
Response: {
  "status":"success",
  "data":{
    "message":"...",
    "sources":[{"text":"...","source":"..."}],
    "usage":{"prompt_tokens":450,"completion_tokens":120}
  }
}
```

### Get All Documents
```
GET /api/documents
Response: {"status":"success","count":3,"data":[...]}
```

### Search Documents
```
GET /api/documents/search?q=elephant
GET /api/documents/search?category=tiger
Response: {"status":"success","count":2,"data":[...]}
```

### Add Document
```
POST /api/documents
Body: {
  "title":"...",
  "content":"...",
  "source":"...",
  "category":"elephant|tiger|fire|health|water"
}
```

## 🔄 How RAG Works

### Flow Diagram
```
User Question
     ↓
[Frontend Chat Input]
     ↓
POST /api/chat
     ↓
Generate Embedding (OpenAI)
     ↓
Search Similar Documents (Pinecone)
     ↓
Build System Prompt with Context
     ↓
Generate Response (GPT-4)
     ↓
Return Response + Sources
     ↓
[Frontend Chat Display]
```

### Example Flow
```
User: "What should I do if I see an elephant?"

1. Question embedded to vector
2. Pinecone searches for similar docs
3. Returns: "Elephant Conflict Management" guideline
4. System prompt builds context with guideline
5. GPT-4 answers: "Stay calm, alert rangers immediately..."
6. Frontend shows response + source document
```

## 🐛 Troubleshooting

### Issue: "Invalid API key"
```bash
# Check OPENAI_API_KEY in .env
echo $OPENAI_API_KEY

# Verify key works
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer sk_test_..."
```

### Issue: "Pinecone connection failed"
```
⚠️ This is OK! System will use in-memory fallback.
All forest guidelines are embedded in documentStore.js
Pinecone is optional for production scaling.
```

### Issue: "CORS error from frontend"
```env
# Update .env with correct frontend URL
FRONTEND_URL=http://localhost:3000
```

### Issue: "Port 5000 already in use"
```bash
# Use different port
PORT=5001 npm run dev

# Or kill process on 5000
lsof -ti:5000 | xargs kill -9
```

### Issue: Backend won't start
```bash
# Check Node.js version (need v18+)
node --version

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Try again
npm run dev
```

## 📊 Forest Guidelines Included

The backend comes with pre-loaded guidelines:

1. **Elephant Conflict Management** (elephant)
   - Prevention measures
   - During conflict response
   - Post-incident procedures

2. **Tiger & Predator Safety** (tiger)
   - Prevention methods
   - Sighting response
   - Night safety

3. **Fire Management** (fire)
   - Fire prevention
   - Detection systems
   - Emergency response

Add more with:
```bash
curl -X POST http://localhost:5000/api/documents \
  -H "Content-Type: application/json" \
  -d '{
    "title":"New Guideline",
    "content":"Guidelines content...",
    "source":"Forest Department",
    "category":"wildlife"
  }'
```

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production (Node.js)
```bash
NODE_ENV=production npm start
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

```bash
docker build -t wildeye-rag .
docker run -p 5000:5000 --env-file .env wildeye-rag
```

### Vercel (Serverless)
```bash
vercel --prod
```

Set environment variables in Vercel dashboard.

### Railway/Render
1. Connect GitHub repo
2. Set environment variables
3. Deploy

## 📈 Performance Tips

1. **Cache Embeddings**: Pinecone caches frequently accessed documents
2. **Batch Requests**: Send multiple messages in conversation for context
3. **Optimize Prompts**: Shorter questions = faster responses
4. **Use Cheaper Models**: Switch to GPT-3.5 Turbo for cost
5. **Local First**: Fallback to in-memory store if Pinecone unavailable

## 🔐 Security Considerations

1. **Never commit `.env`** - Use `.env.example` as template
2. **Rotate API keys** - Regularly update OpenAI/Pinecone keys
3. **CORS validation** - Only allow trusted frontend origins
4. **Rate limiting** - Add rate limiter for production
5. **Input validation** - Sanitize user messages

## 📞 Support

### Check Logs
```bash
# See real-time logs
npm run dev

# Check specific endpoint
curl -v http://localhost:5000/api/chat/health
```

### Common Errors

| Error | Fix |
|-------|-----|
| `Cannot find module 'openai'` | Run `npm install` |
| `Invalid API key` | Check `.env` OPENAI_API_KEY |
| `CORS error` | Update FRONTEND_URL in `.env` |
| `Port already in use` | Change PORT or kill process |
| `No documents found` | Restart server, check documentStore.js |

## 🎯 Next Steps

1. ✅ Backend setup complete
2. ⏳ Embed forest department PDFs to Pinecone
3. ⏳ Add SMS alert integration
4. ⏳ Deploy to production
5. ⏳ Add multi-language support

## 📚 Resources

- [OpenAI API Docs](https://platform.openai.com/docs)
- [Pinecone Docs](https://docs.pinecone.io/)
- [Express.js Guide](https://expressjs.com/)
- [RAG Concepts](https://www.pinecone.io/learn/retrieval-augmented-generation/)

## 📝 License

MIT - See LICENSE file

---

**Questions?** Check the troubleshooting section above or create an issue on GitHub.

**Ready to deploy?** Follow the deployment section for your platform.
