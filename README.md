# Multi-Agent AI Developer Assistant

A production-ready, modular AI-powered development assistant that coordinates multiple specialized agents to help you build, research, debug, and learn from code.

## Features

✨ **Orchestrator Agent** - Intelligent task routing and coordination
✨ **Coding Agent** - Writes, modifies, and explains code
✨ **Research Agent** - Researches programming topics with web search
✨ **Code Review Agent** - Finds bugs, security issues, and performance problems
✨ **Notes Agent** - Summarizes and organizes learning into structured notes

## Architecture

```
┌─────────────────────────────────────────┐
│         Frontend (React + Vite)         │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│     Backend API (Express.js)            │
│  - WebSocket for real-time updates      │
│  - Job queue for async processing       │
└──────────────────┬──────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
   ┌────▼─────┐    ┌─────────▼───┐
   │  MongoDB │    │    Redis    │
   │(Persist) │    │(Queue/Cache)│
   └──────────┘    └─────────────┘
        │                     │
   ┌────▼──────────────────────▼────┐
   │   Orchestrator Agent            │
   │   ├─ Coding Agent               │
   │   ├─ Research Agent             │
   │   ├─ Code Review Agent          │
   │   └─ Notes Agent                │
   └─────────────────────────────────┘
         │          │          │
    ┌────▼─┐   ┌────▼──┐  ┌───▼───┐
    │ GPT  │   │SerpAPI│  │Claude │
    └──────┘   └───────┘  └───────┘
```

## Project Structure

```
multi-agent-ai-dev-assistant/
├── server/
│   ├── index.js                 # Express app entry
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   ├── redis.js             # Redis connection
│   │   └── logger.js            # Winston logger
│   ├── agents/
│   │   ├── orchestrator.js      # Main orchestrator
│   │   ├── coding.js            # Coding agent
│   │   ├── research.js          # Research agent
│   │   ├── codeReview.js        # Code review agent
│   │   └── notes.js             # Notes agent
│   ├── services/
│   │   ├── llm.js               # LLM provider (OpenAI, Claude)
│   │   ├── search.js            # Web search service
│   │   ├── database.js          # DB operations
│   │   └── cache.js             # Redis cache
│   ├── models/
│   │   ├── Conversation.js      # Conversation schema
│   │   ├── Note.js              # Notes schema
│   │   ├── CodeReview.js        # Code review schema
│   │   └── Task.js              # Task schema
│   ├── routes/
│   │   ├── chat.js              # Chat endpoints
│   │   ├── notes.js             # Notes endpoints
│   │   ├── tasks.js             # Task management
│   │   └── health.js            # Health check
│   ├── middleware/
│   │   ├── auth.js              # Authentication
│   │   ├── errorHandler.js      # Error handling
│   │   └── validation.js        # Request validation
│   ├── utils/
│   │   ├── prompt.js            # Prompt templates
│   │   ├── parser.js            # Response parsing
│   │   └── helpers.js           # Utility functions
│   └── workflows/
│       ├── agentWorkflow.js     # Agent coordination
│       └── taskProcessor.js     # Task processing
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatInterface.jsx
│   │   │   ├── AgentStatus.jsx
│   │   │   ├── NotesPanel.jsx
│   │   │   ├── CodeReviewPanel.jsx
│   │   │   └── ResearchResults.jsx
│   │   ├── hooks/
│   │   │   ├── useChat.js
│   │   │   ├── useNotes.js
│   │   │   └── useWebSocket.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── socketService.js
│   │   ├── store/
│   │   │   ├── chatStore.js
│   │   │   ├── notesStore.js
│   │   │   └── uiStore.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── tests/
│   ├── agents/
│   ├── services/
│   └── integration/
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── AGENTS.md
│   └── SETUP.md
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- Redis
- OpenAI API Key
- SerpAPI Key (for web search)

### Installation

```bash
# Clone repository
git clone <repo-url>
cd multi-agent-ai-dev-assistant

# Install dependencies
npm install
cd client && npm install && cd ..

# Configure environment
cp .env.example .env
# Edit .env with your API keys and database URLs

# Start services (MongoDB, Redis)
docker-compose up -d  # if using Docker

# Run development server
npm run dev
```

The frontend will be available at `http://localhost:5173`
The backend API will be at `http://localhost:5000`

## Usage Examples

### Build a Feature
```
User: "Build me a React component for user authentication with email and password"
Orchestrator: Routes to Coding Agent
Coding Agent: Generates component, explains implementation
```

### Research Technology
```
User: "Research the latest developments in WebAssembly for 2024"
Orchestrator: Routes to Research Agent
Research Agent: Searches web, summarizes findings, saves to notes
```

### Debug Code
```
User: "Debug this code" [paste code]
Orchestrator: Routes to Code Review Agent
Code Review Agent: Analyzes for bugs, security issues, performance
```

### Get Explanations
```
User: "Explain how this repository is structured"
Orchestrator: Analyzes and explains architecture
```

### Summarize Learning
```
User: "Summarize what I learned today"
Orchestrator: Routes to Notes Agent
Notes Agent: Creates structured summary of conversation history
```

## API Endpoints

### Chat
- `POST /api/chat` - Send message to orchestrator
- `GET /api/chat/:conversationId` - Get conversation history
- `WebSocket /ws/:conversationId` - Real-time chat updates

### Notes
- `GET /api/notes` - List all notes
- `POST /api/notes` - Create note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Tasks
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task details

### Health
- `GET /api/health` - Health check

## Agent Details

### Orchestrator Agent
- Analyzes user requests
- Routes to appropriate agents
- Coordinates multi-agent workflows
- Aggregates results into final answer

### Coding Agent
- Writes and modifies code
- Follows best practices
- Explains code functionality
- Suggests improvements

### Research Agent
- Performs web searches
- Summarizes findings
- Cites sources
- Keeps notes of research

### Code Review Agent
- Identifies bugs
- Finds security vulnerabilities
- Suggests performance improvements
- Provides fix recommendations

### Notes Agent
- Summarizes conversations
- Organizes learning
- Tags and categorizes
- Enables quick retrieval

## Configuration

Edit `.env` to customize:
- LLM provider (OpenAI, Claude, etc.)
- Search provider (SerpAPI, Google, etc.)
- Database and cache settings
- Logging levels
- Agent parameters

## Development

```bash
# Run tests
npm run test

# Lint code
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## Production Deployment

See `docs/DEPLOYMENT.md` for production setup guide.

## License

MIT
