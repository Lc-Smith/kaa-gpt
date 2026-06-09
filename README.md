# Kaa AI
Discord bot that uses OpenAI to answer questions and can optionally search online for sources.

## Requirements

- Node.js 18+ recommended
- `discord.js` and `openai` installed via `npm install`
- A `.env` file in the project root

## Environment Variables

Required:

- `TOKEN` — your Discord bot token
- `OPENAI_KEY` — OpenAI API key

Optional online search support:

- `GOOGLE_API_KEY` — Google Custom Search API key
- `SEARCH_ENGINE_ID` — Google Custom Search Engine ID

If both `GOOGLE_API_KEY` and `SEARCH_ENGINE_ID` are set, the bot will include search results when answering questions.

### Example `.env`

```env
TOKEN=your-discord-bot-token
OPENAI_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SEARCH_ENGINE_ID=012345678901234567890:abcdefg1234
```

## Usage

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file with your keys.

3. Start the bot:

```bash
node index.js
```

## Notes

- Messages beginning with `!` are ignored by the bot.
- The bot only responds in configured channels or when mentioned.
- Online search is optional and only enabled when the Google search variables are provided.

