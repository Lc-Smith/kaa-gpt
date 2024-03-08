// Author: LcSmith
// Updated: 29/02/2024

// Import necessary modules
require('dotenv/config');
const { Client } = require('discord.js');
const { OpenAI } = require('openai');
const { generateKaaResponse } = require('./kaaPersonality');

// Initialize Discord client
const client = new Client({
    intents: ['Guilds', 'GuildMembers', 'GuildMessages', 'MessageContent'],
});

// Event: Bot ready
client.on('ready', () => {
    console.log('Bot ready!');
});

// Constants
const IGNORE_PREFIX = "!";
const CHANNELS = ['1204184883300401174', '1213490924127129681'];

// Initialize OpenAI API client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
});

// Event: Message received
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.content.startsWith(IGNORE_PREFIX)) return;
    if (!CHANNELS.includes(message.channelId) && !message.mentions.users.has(client.user.id)) return;
    if (message.system) return;

    await message.channel.sendTyping();

    const sendTypingInterval = setInterval(() => {
        message.channel.sendTyping();
    }, 5000);

    let conversation = [];
    conversation.push({
        role: 'system',
        content: 'Kaa is an AI Discord Bot created by LcSmith.'
    });

    let prevMessages = await message.channel.messages.fetch({ limit: 30 });
    prevMessages.reverse();

    prevMessages.forEach((msg) => {
        if (msg.author.bot && msg.author.id !== client.user.id) return;
        if (msg.content.startsWith(IGNORE_PREFIX)) return;

        const username = msg.author.username.replace(/\s+/g, '_').replace(/[^\w\s]/gi, '');

        // Bot -- itself
        if (msg.author.id === client.user.id) {
            conversation.push({
                role: 'assistant',
                name: username,
                content: msg.content,
            });
            return;
        }
        // Owner -- me
        else if (msg.author.id === 301313670850543616) {
            conversation.push({
                role: 'user',
                name: username,
                content: msg.content + "Concise",
            });
        }

        conversation.push({
            role: 'user',
            name: username,
            content: msg.content + "Concise",
        });
    });

    const response = await openai.chat.completions
        .create({
            model: 'gpt-3.5-turbo-0125',
            messages: conversation,
        })
        .catch((error) => console.error('OpenAI Error:\n', error));

    clearInterval(sendTypingInterval);

    if (!response) {
        message.reply("I'm having trouble connecting to my API. Please retry in a moment or contact LcSmith.");
        return;
    }

    const responseMessage = response.choices[0].message.content;
    const chunkSizeLimit = 2000;

    for (let i = 0; i < responseMessage.length; i += chunkSizeLimit) {
        const chunk = responseMessage.substring(i, i + chunkSizeLimit);
        const kaaLikeResponse = generateKaaResponse(chunk); // Generate Kaa-like response
        await message.reply(kaaLikeResponse);
    }
});

// Login to Discord
client.login(process.env.TOKEN);
