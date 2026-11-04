const SERVER_LINK = 'https://discord.gg/TUewXwtZRC';
const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_ITEMS = 10;
const MAX_REQUEST_BYTES = 24000;

const SYSTEM_INSTRUCTION = `You are Nexus Assistant, the helpful AI chat assistant for the NEXUS TEAM website.
Answer clearly and accurately using the site knowledge below. Do not claim you can execute Discord commands, access live Roblox/Discord data, or browse the web. For command questions, give the relevant commands exactly as written. If asked something outside this knowledge, say what you can and cannot verify.

NEXUS TEAM SITE KNOWLEDGE
Nexus Bot: Main server management and moderation bot. Slash commands: /bot, /botinfo, /serverinfo, /userinfo [@user], /clear <amount>, /say <message>, /dm_support <message>, /guide, /lock [#channel], /unlock [#channel], /warn <user> [reason], /unwarn <user>, /seewarns [user], /ticket, /createchannels, /activity, /help. Prefix commands: +test, +ping, +botrules, +lock, +unlock, +ban, +kick, +timeout, +mute, +unmute, +warn, +unwarn, +seewarns, +staffcount, +createchannels, +ticket, +support, +setsupportchannel, +dm, +help.
Nexus AI: AI assistant bot. Commands: /ask, /math, /search, /model, /rss (summarize the latest article from an RSS feed).
Nexus Roblox: Fetches Roblox game stats, group info, and user profiles directly in Discord. Commands: /roblox-group (fetch Roblox group info), /roblox-random (fetch a random Roblox user profile), /roblox-stats (fetch Roblox game stats), /roblox-user (fetch Roblox user info by username).
Nexus Stat: Server statistics and leaderboards. Slash commands: /stats, /me, /user, /top, /leaderboard, /rank, /activity, /ping, /invite, /help. Prefix commands: n!stats, n!top messages, n!top voice, n!leaderboard, n!rank, n!activity, n!setprefix, n!reset, n!ping, n!invite, n!help.
Nexus Verification: Exclusive verification and security bot for the NEXUS TEAM server. Commands: /createserver, /rules, /help, /kick, /ban, /timeout, /warn, /warnings, /clearwarnings, /purge, /slowmode, /lock, /unlock, /tempban, /givepremium, /removepremium, /stats, /userinfo, /logs, /nickname. It cannot be invited to other servers.
Nexus Music: Music bot with Spotify and Deezer support and 24/7 playback. Commands: nex!play <song or URL>, nex!skip, nex!stop, nex!pause, nex!resume, nex!volume <1-100>, nex!quit, nex!queue, nex!247, nex!loop <track/queue/off>, nex!setdj @role, nex!history, nex!ping, nex!help.
Nexus FunPlay: Games, challenges, jokes, ranks, and leaderboards. Commands: nfp!trivia, nfp!duel @user, nfp!slots, nfp!roll [max], nfp!coinflip, nfp!8ball <question>, nfp!wyr, nfp!truth @user, nfp!dare @user, nfp!roast @user, nfp!rank [@user], nfp!leaderboard, nfp!help, nfp!ping.
Nexus Rules Gen: Automatically generates and manages server rules. Commands: /rules generate, /rules history, /rules pdf, /rules post, /rules show.
Official NEXUS TEAM Discord server: ${SERVER_LINK}`;

function send(res, statusCode, body) {
    return res.status(statusCode).json(body);
}

function parseHistory(history) {
    if (!Array.isArray(history)) return [];

    return history
        .slice(-MAX_HISTORY_ITEMS)
        .filter((item) => item && (item.role === 'user' || item.role === 'model') && typeof item.text === 'string')
        .map((item) => ({
            role: item.role,
            parts: [{ text: item.text.slice(0, MAX_MESSAGE_LENGTH) }]
        }));
}

module.exports = async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');

    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return send(res, 405, { error: 'Method not allowed.' });
    }

    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    if (Buffer.byteLength(rawBody, 'utf8') > MAX_REQUEST_BYTES) {
        return send(res, 413, { error: 'Request is too large.' });
    }

    const origin = req.headers.origin;
    const host = req.headers.host;
    if (origin && host) {
        try {
            if (new URL(origin).host !== host) return send(res, 403, { error: 'Origin not allowed.' });
        } catch {
            return send(res, 403, { error: 'Origin not allowed.' });
        }
    }

    let payload;
    try {
        payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body;
    } catch {
        return send(res, 400, { error: 'Request must contain valid JSON.' });
    }

    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return send(res, 400, { error: 'Request must be a JSON object.' });
    }

    const message = typeof payload.message === 'string' ? payload.message.trim() : '';
    if (!message || message.length > MAX_MESSAGE_LENGTH) {
        return send(res, 400, { error: `Message must be between 1 and ${MAX_MESSAGE_LENGTH} characters.` });
    }

    if (/\b(server|link)\b/i.test(message)) {
        return send(res, 200, { reply: SERVER_LINK });
    }

    if (/\b(join|discord)\b/i.test(message)) {
        return send(res, 200, { reply: `You can join our official Discord server here: ${SERVER_LINK}` });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return send(res, 503, { error: 'Gemini is not configured yet. Add GEMINI_API_KEY to the Vercel environment variables.' });
    }

    const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    const contents = parseHistory(payload.history);
    contents.push({ role: 'user', parts: [{ text: message }] });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
        const apiResponse = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey
            },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
                contents,
                generationConfig: { temperature: 0.6, maxOutputTokens: 600 }
            }),
            signal: controller.signal
        });
        const result = await apiResponse.json().catch(() => null);

        if (!apiResponse.ok) {
            console.error('Gemini API request failed with status:', apiResponse.status);
            return send(res, 502, { error: 'Gemini could not answer right now. Please try again shortly.' });
        }

        const reply = result?.candidates?.[0]?.content?.parts
            ?.map((part) => part.text || '')
            .join('')
            .trim();

        if (!reply) return send(res, 502, { error: 'Gemini returned an empty response. Please try again.' });
        return send(res, 200, { reply });
    } catch (error) {
        if (error.name === 'AbortError') {
            return send(res, 504, { error: 'Gemini took too long to respond. Please try again.' });
        }
        console.error('Gemini request could not be completed.');
        return send(res, 502, { error: 'Gemini is temporarily unavailable. Please try again.' });
    } finally {
        clearTimeout(timeout);
    }
};