// ============================================================
//  RAG BACKEND CONFIGURATION
// ============================================================

// Backend URL - Change this based on your environment
const RAG_CONFIG = {
    BACKEND_URL: 'http://localhost:5000',  // Local development
    // For production: 'https://your-backend-domain.com'
    CHAT_ENDPOINT: '/api/chat',
    HEALTH_ENDPOINT: '/health',
    CHAT_HEALTH_ENDPOINT: '/api/chat/health',
};

// State for RAG chat
const ragState = {
    conversationHistory: [],
    isConnected: false,
    backendReady: false,
};

// ============================================================
//  RAG BACKEND CONNECTION CHECK
// ============================================================

/**
 * Check if RAG backend is connected
 */
async function checkRAGBackend() {
    try {
        const response = await fetch(`${RAG_CONFIG.BACKEND_URL}${RAG_CONFIG.HEALTH_ENDPOINT}`);
        if (response.ok) {
            ragState.isConnected = true;
            console.log('✅ RAG Backend Connected');
            updateBackendStatus(true);
            return true;
        }
    } catch (error) {
        console.log('⚠️ RAG Backend offline:', error);
        ragState.isConnected = false;
        updateBackendStatus(false);
        return false;
    }
}

/**
 * Update backend status in UI
 */
function updateBackendStatus(isConnected) {
    const statusIndicator = document.getElementById('backendStatus');
    if (statusIndicator) {
        if (isConnected) {
            statusIndicator.innerHTML = '<span style="color:var(--success);">✅ RAG Connected</span>';
        } else {
            statusIndicator.innerHTML = '<span style="color:var(--danger);">❌ RAG Offline</span>';
        }
    }
}

/**
 * Send message to RAG backend
 */
async function sendMessageToRAG(userMessage) {
    if (!ragState.isConnected) {
        return {
            message: '⚠️ Backend connection lost. Please refresh the page.',
            sources: [],
        };
    }

    try {
        const response = await fetch(`${RAG_CONFIG.BACKEND_URL}${RAG_CONFIG.CHAT_ENDPOINT}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: userMessage,
                conversationHistory: ragState.conversationHistory,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('❌ RAG API Error:', error);
        return {
            message: '❌ Failed to get response. Please try again.',
            sources: [],
        };
    }
}

// ============================================================
//  CHAT PANEL INTEGRATION
// ============================================================

// Initialize chat panel event listeners
function initializeChatPanel() {
    const toggleChatBtn = document.getElementById('toggleChatBtn');
    const closeChat = document.getElementById('closeChat');
    const chatPanel = document.getElementById('chatPanel');
    const chatSendBtn = document.getElementById('chatSendBtn');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');

    // Toggle chat panel
    toggleChatBtn.addEventListener('click', () => {
        chatPanel.classList.toggle('open');
    });

    closeChat.addEventListener('click', () => {
        chatPanel.classList.remove('open');
    });

    // Send message
    chatSendBtn.addEventListener('click', async () => {
        const message = chatInput.value.trim();
        if (!message) return;

        // Add user message to chat
        const userMsgDiv = document.createElement('div');
        userMsgDiv.className = 'chat-msg user';
        userMsgDiv.textContent = message;
        chatMessages.appendChild(userMsgDiv);

        // Clear input
        chatInput.value = '';

        // Show loading indicator
        const loadingMsgDiv = document.createElement('div');
        loadingMsgDiv.className = 'chat-msg bot';
        loadingMsgDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Thinking...';
        chatMessages.appendChild(loadingMsgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Add to conversation history
        ragState.conversationHistory.push({ role: 'user', content: message });

        try {
            // Get RAG response
            const response = await sendMessageToRAG(message);

            // Remove loading message
            chatMessages.removeChild(loadingMsgDiv);

            // Add bot response
            const botMsgDiv = document.createElement('div');
            botMsgDiv.className = 'chat-msg bot';
            botMsgDiv.textContent = response.message;
            chatMessages.appendChild(botMsgDiv);

            // Add sources if available
            if (response.sources && response.sources.length > 0) {
                const sourcesDiv = document.createElement('div');
                sourcesDiv.style.fontSize = '10px';
                sourcesDiv.style.color = 'var(--text-secondary)';
                sourcesDiv.style.marginTop = '6px';
                sourcesDiv.innerHTML = `<strong>📚 Sources:</strong> ${response.sources[0].source}`;
                chatMessages.appendChild(sourcesDiv);
            }

            // Add to conversation history
            ragState.conversationHistory.push({ role: 'assistant', content: response.message });
        } catch (error) {
            console.error('Chat error:', error);
            chatMessages.removeChild(loadingMsgDiv);
            const errorMsgDiv = document.createElement('div');
            errorMsgDiv.className = 'chat-msg bot';
            errorMsgDiv.textContent = '❌ Error: Could not get response.';
            chatMessages.appendChild(errorMsgDiv);
        }

        // Auto-scroll to latest message
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });

    // Send on Enter key
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            chatSendBtn.click();
        }
    });
}

// ============================================================
//  STARTUP
// ============================================================

// Check backend connection on page load
window.addEventListener('load', async () => {
    console.log('🚀 Initializing RAG system...');
    
    // Check backend connection
    await checkRAGBackend();
    
    // Initialize chat panel
    initializeChatPanel();
    
    // Set up periodic health checks (every 30 seconds)
    setInterval(checkRAGBackend, 30000);
});
