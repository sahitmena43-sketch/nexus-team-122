(() => {
    const SERVER_LINK = 'https://discord.gg/TUewXwtZRC';
    const BOT_KNOWLEDGE = [
        {
            names: ['nexus verification', 'verification'],
            description: 'Handles member verification and security for the NEXUS TEAM server.'
        },
        {
            names: ['nexus rules gen', 'rules gen', 'rules generator'],
            description: 'Creates and manages server rules.'
        },
        {
            names: ['nexus funplay', 'funplay'],
            description: 'Adds games, challenges, jokes, ranks, and leaderboards to your server.'
        },
        {
            names: ['nexus roblox', 'roblox'],
            description: 'Fetches Roblox game stats, group info, and user profiles in Discord.'
        },
        {
            names: ['nexus music', 'music bot'],
            description: 'Plays music with Spotify and Deezer support, including 24/7 playback.'
        },
        {
            names: ['nexus stat', 'nexus statistics', 'server stats'],
            description: 'Tracks server activity, ranks, and leaderboards.'
        },
        {
            names: ['nexus ai', 'ai bot'],
            description: 'Provides AI assistance for questions, math, search, model selection, and RSS summaries.'
        },
        {
            names: ['nexus bot', 'main bot'],
            description: 'Provides server management and moderation tools for NEXUS TEAM.'
        }
    ];

    const widget = document.getElementById('nexus-chat');
    const launcher = document.getElementById('chat-launcher');
    const closeButton = document.getElementById('chat-close');
    const panel = document.getElementById('chat-panel');
    const form = document.getElementById('chat-form');
    const input = document.getElementById('chat-input');
    const messages = document.getElementById('chat-messages');
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

    function getReply(message) {
        const normalizedMessage = message.toLowerCase();

        if (/\b(server|join|discord|link)\b/i.test(normalizedMessage)) {
            return `You can join our official NEXUS TEAM Discord server here: ${SERVER_LINK}`;
        }

        if (/\b(hello|hi|hey)\b/i.test(normalizedMessage)) {
            return 'Hello! I am the NEXUS TEAM Assistant. How can I help you today?';
        }

        if (/\b(all bots|list bots|what bots)\b/i.test(normalizedMessage)) {
            return `NEXUS TEAM bots: ${BOT_KNOWLEDGE.map((bot) => bot.names[0].replace(/^nexus /, 'Nexus ')).join(', ')}. Ask about any bot to learn what it does.`;
        }

        const matchingBot = BOT_KNOWLEDGE.find((bot) =>
            bot.names.some((name) => normalizedMessage.includes(name))
        );

        if (matchingBot) {
            return `${matchingBot.names[0].replace(/^nexus /, 'Nexus ')} ${matchingBot.description} You can see all commands by clicking "View Commands" on its page.`;
        }

        return 'I can help with NEXUS TEAM bots, their commands, and our community. Ask about Nexus Bot, Nexus AI, Nexus Roblox, Nexus Stat, Nexus Verification, Nexus Music, Nexus FunPlay, or Nexus Rules Gen.';
    }

    launcher.addEventListener('click', () => setOpen(!widget.classList.contains('is-open')));
    closeButton.addEventListener('click', () => setOpen(false));
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && widget.classList.contains('is-open')) setOpen(false);
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const question = input.value.trim();
        if (!question) return;

        addMessage(question, 'user');
        input.value = '';
        addMessage(getReply(question), 'assistant');
        input.focus();
    });
})();