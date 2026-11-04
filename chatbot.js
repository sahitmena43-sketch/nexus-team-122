(() => {
    const widget = document.getElementById('nexus-chat');
    const launcher = document.getElementById('chat-launcher');
    const closeButton = document.getElementById('chat-close');
    const panel = document.getElementById('chat-panel');
    const form = document.getElementById('chat-form');
    const input = document.getElementById('chat-input');
    const messages = document.getElementById('chat-messages');
    const sendButton = form.querySelector('button[type="submit"]');
    const conversation = [];

    function setOpen(isOpen) {
        widget.classList.toggle('is-open', isOpen);
        launcher.setAttribute('aria-expanded', String(isOpen));
        panel.setAttribute('aria-hidden', String(!isOpen));
        if (isOpen) input.focus();
    }

    function addMessage(text, sender) {
        const message = document.createElement('div');
        message.className = `chat-message ${sender}-message`;
        message.textContent = text;
        messages.appendChild(message);
        messages.scrollTop = messages.scrollHeight;
    }

    launcher.addEventListener('click', () => setOpen(!widget.classList.contains('is-open')));
    closeButton.addEventListener('click', () => setOpen(false));
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && widget.classList.contains('is-open')) setOpen(false);
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const question = input.value.trim();
        if (!question || sendButton.disabled) return;

        addMessage(question, 'user');
        input.value = '';
        sendButton.disabled = true;
        input.disabled = true;
        addMessage('Thinking...', 'assistant');
        const thinkingMessage = messages.lastElementChild;

        conversation.push({ role: 'user', text: question });
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: question, history: conversation.slice(-12, -1) })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'The assistant is unavailable.');

            thinkingMessage.textContent = result.reply;
            conversation.push({ role: 'model', text: result.reply });
            if (conversation.length > 12) conversation.splice(0, conversation.length - 12);
        } catch (error) {
            thinkingMessage.textContent = error.message || 'I could not reach Gemini. Please try again.';
            conversation.pop();
        } finally {
            sendButton.disabled = false;
            input.disabled = false;
            input.focus();
        }
    });
})();