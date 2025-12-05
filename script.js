// NOTE: URL de l'API Python. À changer pour l'URL Render/Heroku lors du déploiement.
const API_URL = 'http://127.0.0.1:5000'; 
let isLoading = false; // Ajout d'un état global pour le bouton/input

document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const chatHistory = document.getElementById('chat-history');
    
    userInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            sendMessage();
            e.preventDefault(); 
        }
    });

    sendButton.addEventListener('click', sendMessage);
});

// Fonction d'auto-scroll
function scrollToBottom() {
    const chatHistory = document.getElementById('chat-history');
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

// Fonction pour créer et afficher un message (Maintenant avec support Thinking/ID)
function displayMessage(text, sender, isThinking = false, messageId = null) {
    const chatHistory = document.getElementById('chat-history');
    
    const containerClasses = sender === 'user' ? 'flex justify-end' : 'flex justify-start';
    // Utilisation des classes CSS que nous avons définies dans l'HTML
    const bubbleClasses = sender === 'user'
        ? 'message user' // Classes de la bulle utilisateur
        : 'message bot';  // Classes de la bulle bot

    let contentHTML = `<p class="text-sm font-light leading-relaxed whitespace-pre-wrap">${text}</p>`;

    if (isThinking) {
        // SVG pour l'effet de chargement (Spinner)
        const spinnerSVG = `<svg class="animate-spin w-4 h-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`;
        
        // Ajustement de la couleur du texte pour le message d'attente
        const thinkingTextStyle = sender === 'bot' ? 'color: #4c51bf;' : ''; 
        contentHTML = `<span style="${thinkingTextStyle}" class="flex items-center space-x-2 text-sm italic"><span>${text}</span></span>`;
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = containerClasses;
    // CRÉATION DE L'ID DANS LE DOM (Correction principale)
    if (messageId) {
        messageDiv.dataset.messageId = messageId; 
    }
    
    messageDiv.innerHTML = `
        <div class="${bubbleClasses}">
            ${contentHTML}
        </div>
    `;
    
    chatHistory.appendChild(messageDiv);
    scrollToBottom();
}

// Fonction principale d'envoi de message
async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const userText = userInput.value.trim();

    if (!userText || isLoading) return;

    // 1. Afficher le message de l'utilisateur
    displayMessage(`${userText}`, 'user');
    userInput.value = '';

    // --- Gestion de l'état de chargement ---
    isLoading = true;
    userInput.disabled = true;
    sendButton.disabled = true;

    // 2. Préparer le message "en attente" du bot
    const botThinkingId = Date.now();
    // Passage de TRUE pour isThinking et du botThinkingId (Correction)
    displayMessage("... Le Chat-404 réfléchit très fort ...", 'bot', true, botThinkingId);
    
    // 3. Appel au backend Python (l'API)
    try {
        const RENDER_URL = API_URL; // Utilise la variable globale API_URL
        const response = await fetch(`${RENDER_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: userText }) // Utiliser 'question' pour correspondre à app.py
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        const botResponse = data.answer || "Le délire a échoué. Socrate 2.0 est en panne philosophique.";

        // 4. Retrouver et supprimer le message d'attente (Correction)
        const thinkingMessageContainer = document.querySelector(`[data-message-id="${botThinkingId}"]`);
        if (thinkingMessageContainer) {
             thinkingMessageContainer.remove(); 
        }

        // 5. Afficher la réponse du chatbot
        displayMessage(`${botResponse}`, 'bot');

    } catch (error) {
        console.error("Erreur API :", error);
        // Afficher un message d'erreur clair si l'API n'est pas lancée
        displayMessage("Le Chat-404 est en panne. Vérifiez que l'API Python est bien lancée.", 'bot');
        
    } finally {
        // 6. Réinitialiser l'état
        isLoading = false;
        userInput.disabled = false;
        sendButton.disabled = false;
        userInput.focus(); // Retour du focus pour continuer la conversation
        scrollToBottom();
    }
}