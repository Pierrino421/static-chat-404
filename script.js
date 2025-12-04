document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    userInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    sendButton.addEventListener('click', sendMessage);
});

function displayMessage(text, sender) {
    const history = document.getElementById('chat-history');
    const msg = document.createElement('div');
    msg.classList.add('message', sender);
    msg.innerHTML = text;
    history.appendChild(msg);
    history.scrollTop = history.scrollHeight;
}

async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const userText = userInput.value.trim();

    if (userText === '') return;

    // 1. Afficher le message de l'utilisateur
    displayMessage(`${userText}`, 'user');
    userInput.value = '';

    // 2. Préparer le message "en attente" du bot
    const botThinkingId = Date.now();
    displayMessage("... Le Chat-404 réfléchit très fort ...", 'bot-thinking', botThinkingId);
    
    // Remplacer le message d'attente
    const thinkingMessage = document.querySelector(`[data-id="${botThinkingId}"]`);
    
    // 3. Appel au backend Python (l'API)
    try {
      const RENDER_URL = 'https://chat-404-api.onrender.com/'; // <-- VOTRE URL PUBLIQUE
      const response = await fetch(`${RENDER_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userText })
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        const botResponse = data.answer;

        // 4. Afficher la réponse du chatbot
        // Retirer le message d'attente et afficher la réponse réelle
        const history = document.getElementById('chat-history');
        if (thinkingMessage) {
             history.removeChild(thinkingMessage);
        }

        displayMessage(`${botResponse}`, 'bot');

    } catch (error) {
        console.error("Erreur API :", error);
        // Afficher un message d'erreur clair si l'API n'est pas lancée
        displayMessage("Le Chat-404 est en panne. Vérifiez que l'API Python est bien lancée (http://127.0.0.1:5000).", 'bot');
    }
}