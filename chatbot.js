document.addEventListener('DOMContentLoaded', function() {
    const chatBot = document.querySelector('.chat-bot');
    const chatToggle = document.querySelector('.chat-bot-toggle');
    const chatClose = document.querySelector('.chat-bot-close');
    const chatInput = document.querySelector('#chat-input');
    const chatSend = document.querySelector('.chat-send');
    const chatMessages = document.querySelector('.chat-bot-messages');
    const chatBadge = document.querySelector('.chat-bot-badge');
    const chatLoading = document.querySelector('.chat-loading');

    let model = null;
    let portfolioContext = '';

    // Initialize chatbot
    async function initChatbot() {
        try {
            // Load QnA model
            model = await qna.load();
            
            // Build context from portfolio sections
            portfolioContext = buildPortfolioContext();
            
            chatLoading.style.display = 'none';
            enableChat();
            sendMessage("Hi! 👋 I'm your AI assistant powered by TensorFlow.js. I can answer questions about Sandesh's portfolio. What would you like to know?", false);
        } catch (error) {
            console.error('Error loading model:', error);
            enableFallbackMode();
        }
    }

    // Build context from portfolio content
    function buildPortfolioContext() {
        const sections = {
            about: document.querySelector('#about'),
            experience: document.querySelector('#experience'),
            skills: document.querySelector('#skills'),
            projects: document.querySelector('#projects'),
            contact: document.querySelector('#contact')
        };

        let context = '';
        for (const [section, element] of Object.entries(sections)) {
            if (element) {
                context += element.textContent.replace(/\s+/g, ' ').trim() + ' ';
            }
        }
        return context;
    }

    // Enable chat interface
    function enableChat() {
        chatInput.disabled = false;
        chatSend.disabled = false;
        chatInput.placeholder = "Ask me anything about Sandesh's portfolio...";
    }

    // Enable fallback mode
    function enableFallbackMode() {
        chatLoading.style.display = 'none';
        enableChat();
        sendMessage("I'm having trouble loading the AI model. I'll still try my best to help you with basic information!", false);
    }

    // Process message using QnA model
    async function processMessage(question) {
        if (!model) {
            return getFallbackResponse(question);
        }

        try {
            const answers = await model.findAnswers(question, portfolioContext);
            
            if (answers && answers.length > 0) {
                // Sort answers by score and get the best one
                const bestAnswer = answers.sort((a, b) => b.score - a.score)[0];
                
                // Only use answers with reasonable confidence
                if (bestAnswer.score > 0.3) {
                    return bestAnswer.text;
                }
            }
            
            // If no good answer found, try fallback
            return getFallbackResponse(question);
        } catch (error) {
            console.error('Error processing message:', error);
            return getFallbackResponse(question);
        }
    }

    // Fallback response system
    function getFallbackResponse(question) {
        question = question.toLowerCase();
        
        // Basic keyword matching for fallback responses
        if (question.includes('experience') || question.includes('work')) {
            return "Sandesh is currently a Software Engineer at The High Innovations, working on POS systems and property review applications. He has previous experience at Aava Global and Kantipur Media Group.";
        } else if (question.includes('skills') || question.includes('technologies')) {
            return "Sandesh is skilled in C#, JavaScript, .NET, Blazor, React, Next.js, and various database technologies. He has extensive experience in both frontend and backend development.";
        } else if (question.includes('projects')) {
            return "Some of Sandesh's notable projects include a POS System, Property Watch platform, Election Results Website, and HRIS Development. Would you like to know more about any specific project?";
        } else if (question.includes('contact')) {
            return "You can reach Sandesh via email or phone. He's based in Kathmandu, Nepal. Would you like his contact details?";
        } else if (question.includes('education')) {
            return "Sandesh holds a Bachelor's in Computing from Islington College, Kathmandu, completed between January 2020 and April 2022.";
        }
        
        return "I understand you're asking about " + question + ". Could you please rephrase your question about Sandesh's experience, skills, projects, or contact information?";
    }

    // Send message function
    function sendMessage(message, isUser = true) {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const messageHTML = `
            <div class="chat-message ${isUser ? 'user' : 'bot'}">
                <div class="chat-message-content">
                    <p>${message}</p>
                </div>
                <span class="chat-time">${time}</span>
            </div>
        `;
        chatMessages.insertAdjacentHTML('beforeend', messageHTML);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Event Listeners
    chatToggle.addEventListener('click', () => {
        chatBot.classList.add('active');
        chatBadge.style.display = 'none';
    });

    chatClose.addEventListener('click', () => {
        chatBot.classList.remove('active');
    });

    chatSend.addEventListener('click', async () => {
        const message = chatInput.value.trim();
        if (message) {
            sendMessage(message);
            chatInput.value = '';
            const response = await processMessage(message);
            setTimeout(() => sendMessage(response, false), 500);
        }
    });

    chatInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            const message = chatInput.value.trim();
            if (message) {
                sendMessage(message);
                chatInput.value = '';
                const response = await processMessage(message);
                setTimeout(() => sendMessage(response, false), 500);
            }
        }
    });

    // Auto-open chat after 3 seconds
    setTimeout(() => {
        if (!chatBot.classList.contains('active')) {
            chatBadge.style.display = 'flex';
        }
    }, 3000);

    // Initialize the chatbot
    initChatbot();
});