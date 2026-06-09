// Author: LcSmith
// Updated: 09/06/2026

require('dotenv/config');
const { Client, GatewayIntentBits } = require('discord.js');
const { OpenAI } = require('openai');

const https = require('https');
const DISCORD_TOKEN = process.env.TOKEN;
const OPENAI_KEY = process.env.OPENAI_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const SEARCH_ENGINE_ID = process.env.SEARCH_ENGINE_ID;
const SEARCH_ENABLED = Boolean(GOOGLE_API_KEY && SEARCH_ENGINE_ID);

if (!DISCORD_TOKEN || !OPENAI_KEY) {
    console.error('Missing required environment variables: TOKEN and OPENAI_KEY');
    process.exit(1);
}

if (SEARCH_ENABLED) {
    console.log('Online search enabled using Google Custom Search');
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const IGNORE_PREFIX = '!';
const CHANNELS = new Set(['1240108604183543909', '1513943984182132937']);
const OWNER_ID = '301313670850543616';
const HISTORY_LIMIT = 15;
const SYSTEM_PROMPT = 'Kaa is an AI Discord Bot created by LcSmith. Be concise. You are Kaa, use the speech patterns of the snake character Kaa from The Jungle Book, including multiple s and stuff.';
const SEARCH_RESULT_LIMIT = 3;

async function fetchGoogleSearch(query) {
    const params = new URLSearchParams({
        key: GOOGLE_API_KEY,
        cx: SEARCH_ENGINE_ID,
        q: query,
        num: String(SEARCH_RESULT_LIMIT),
        safe: 'active',
    });

    const url = `https://www.googleapis.com/customsearch/v1?${params.toString()}`;
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let body = '';
            res.on('data', (chunk) => { body += chunk; });
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    return reject(new Error(`Search API returned status ${res.statusCode}`));
                }
                try {
                    resolve(JSON.parse(body));
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', reject);
    });
}

async function getSearchContext(query) {
    if (!SEARCH_ENABLED || !query || !query.trim()) return null;

    try {
        const data = await fetchGoogleSearch(query);
        const items = data?.items || [];
        if (!items.length) return null;

        return items
            .map((item, index) => `Result ${index + 1}:
Title: ${item.title}
Snippet: ${item.snippet}
Link: ${item.link}`)
            .join('\n\n');
    } catch (error) {
        console.error('Search error:', error);
        return null;
    }
}

const openai = new OpenAI({ apiKey: OPENAI_KEY });

client.on('ready', () => {
    console.log(`Bot ready as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.system) return;
    if (message.content.startsWith(IGNORE_PREFIX)) return;

    const isAllowedChannel = CHANNELS.has(message.channelId);
    const mentionsBot = message.mentions.users.has(client.user.id);
    if (!isAllowedChannel && !mentionsBot) return;

    await message.channel.sendTyping();
    const typingInterval = setInterval(() => {
        message.channel.sendTyping().catch(() => {});
    }, 5000);

    const conversation = [
        { role: 'system', content: SYSTEM_PROMPT },
    ];

    const sanitizeName = (username) => username.replace(/\s+/g, '_').replace(/[^\w\s]/gi, '');
    const searchContext = await getSearchContext(message.content);

    if (searchContext) {
        conversation.push({
            role: 'system',
            content: `Use the following online search results to answer the user's question, and cite any source URLs when relevant:\n\n${searchContext}`,
        });
    }

    try {
        const fetchedMessages = await message.channel.messages.fetch({ limit: HISTORY_LIMIT });
        const sortedMessages = [...fetchedMessages.values()].reverse();

        const seenIds = new Set();
        for (const msg of sortedMessages) {
            if (seenIds.has(msg.id)) continue;
            seenIds.add(msg.id);

            if (msg.author.bot && msg.author.id !== client.user.id) continue;
            if (msg.content.startsWith(IGNORE_PREFIX)) continue;

            const username = sanitizeName(msg.author.username);
            if (msg.author.id === client.user.id) {
                conversation.push({ role: 'assistant', name: username, content: msg.content });
                continue;
            }
            conversation.push({ role: 'user', name: username, content: msg.content });
        }

        if (!seenIds.has(message.id)) {
            conversation.push({
                role: 'user',
                name: sanitizeName(message.author.username),
                content: message.content,
            });
        }

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: conversation,
        });

        const responseMessage = response?.choices?.[0]?.message?.content?.trim();
        if (!responseMessage) {
            throw new Error('Empty response from OpenAI');
        }

        const chunkSizeLimit = 2000;
        for (let i = 0; i < responseMessage.length; i += chunkSizeLimit) {
            const chunk = responseMessage.substring(i, i + chunkSizeLimit);
            await message.reply(chunk);
        }
    } catch (error) {
        console.error('OpenAI Error:', error);
        await message.reply("I'm having trouble connecting to my API. Please retry in a moment or contact LcSmith.");
    } finally {
        clearInterval(typingInterval);
    }
});

client.login(DISCORD_TOKEN);
