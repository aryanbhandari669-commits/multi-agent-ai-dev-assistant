# Multi-Agent AI Developer Assistant

A sophisticated multi-agent AI system designed to assist developers with coding, research, code reviews, and knowledge management. The system uses specialized agents that work together through an orchestrator to provide comprehensive development support.

## Features

### 🤖 Multi-Agent System
- **Coding Agent**: Write, refactor, and document code
- **Research Agent**: Search and synthesize information from multiple sources
- **Code Review Agent**: Perform comprehensive code reviews and security analysis
- **Notes Agent**: Create, organize, and manage learning notes
- **Orchestrator Agent**: Route requests to appropriate agents and synthesize results

### 💬 Interactive Chat Interface
- Real-time conversations with AI agents
- WebSocket support for live updates
- Code syntax highlighting
- Message history and conversation management

### 📝 Knowledge Management
- Create and organize notes by category and tags
- Automatic note generation from conversations
- Code snippet management
- Full-text search capabilities

### 📋 Task Management
- Create and track development tasks
- Task queue and async processing
- Progress tracking and status updates
- Execution history

### 🔍 Code Analysis
- Security vulnerability detection
- Performance optimization suggestions
- Best practices enforcement
- Comprehensive code reviews

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** for data persistence
- **Redis** for caching and real-time messaging
- **Socket.io** for WebSocket connections
- **LLM Integration**: OpenAI GPT-4, Claude 3
- **Search Integration**: SerpAPI, Google Search

### Frontend
- **React 18** with Vite
- **Zustand** for state management
- **TailwindCSS** for styling
- **Socket.io-client** for real-time updates
- **React Markdown** for message rendering
- **Syntax Highlighter** for code display

## Project Structure

```
.
├── server/                 # Backend
│   ├── agents/            # Agent implementations
│   ├── routes/            # API endpoints
│   ├── services/          # Business logic services
│   ├── models/            # Database schemas
│   ├── middleware/        # Express middleware
│   ├── workflows/         # Agent coordination
│   ├── config/            # Configuration files
│   ├── utils/             # Utility functions
│   └── app.js            # Express app setup
├── client/                # Frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # API services
│   │   ├── store/        # Zustand stores
│   │   └── App.jsx       # Root component
│   └── vite.config.js
├── docker-compose.yml     # Docker setup
└── .env.example          # Environment template
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 6+
- Redis 7+
- Docker & Docker Compose (optional)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd multi-agent-ai-dev-assistant
```

2. **Install dependencies**
```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

3. **Setup environment variables**
```bash
# Backend
cp server/.env.example server/.env
# Edit server/.env with your API keys and configuration

# Frontend
cp client/.env.example client/.env
```

4. **Start services using Docker Compose**
```bash
docker-compose up -d
```

### Manual Setup (Without Docker)

1. **Start MongoDB**
```bash
mongod
```

2. **Start Redis**
```bash
redis-server
```

3. **Start backend server**
```bash
cd server
npm run dev
```

4. **Start frontend dev server**
```bash
cd client
npm run dev
```

Access the application at `http://localhost:5173`

## API Endpoints

### Chat API
- `POST /api/chat` - Send message and get response
- `GET /api/chat/:conversationId` - Get conversation history
- `DELETE /api/chat/:conversationId` - Delete conversation
- `POST /api/chat/:conversationId/review-code` - Review code
- `POST /api/chat/:conversationId/research` - Research topic

### Notes API
- `GET /api/notes` - List notes with filters
- `POST /api/notes` - Create new note
- `GET /api/notes/:noteId` - Get specific note
- `PUT /api/notes/:noteId` - Update note
- `DELETE /api/notes/:noteId` - Delete note
- `POST /api/notes/from-code` - Create note from code
- `POST /api/notes/from-conversation` - Create note from conversation

### Tasks API
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/:taskId` - Get task details
- `PUT /api/tasks/:taskId` - Update task
- `POST /api/tasks/:taskId/execute` - Execute task
- `GET /api/tasks/queue/status` - Get queue status

## Environment Variables

### Backend (.env)
```
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/ai-dev-assistant

# Redis
REDIS_URL=redis://localhost:6379

# LLM
OPENAI_API_KEY=your_openai_key
CLAUDE_API_KEY=your_claude_key
LLM_MODEL=gpt-3.5-turbo

# Search
SERPAPI_API_KEY=your_serpapi_key
GOOGLE_API_KEY=your_google_key
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id
SEARCH_ENGINE=serpapi

# Logging
LOG_LEVEL=info
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## Usage Examples

### Sending a Message
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Write a JavaScript function to calculate factorial",
    "context": {}
  }'
```

### Reviewing Code
```bash
curl -X POST http://localhost:5000/api/chat/conv-123/review-code \
  -H "Content-Type: application/json" \
  -d '{
    "code": "function add(a,b){return a+b}",
    "language": "javascript"
  }'
```

### Creating a Note
```bash
curl -X POST http://localhost:5000/api/notes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "JavaScript Closures",
    "content": "Closures are functions that...",
    "tags": ["javascript", "functions"],
    "category": "learning"
  }'
```

## Agent Workflows

### Sequential Workflow
Perfom tasks in sequence, with results from one step available to the next.

```javascript
const result = await agentWorkflow.processSequentialAgentTask([
  { message: "Research React hooks" },
  { message: "Create a learning note based on the research" }
]);
```

### Multi-Agent Task
Execute multiple agents in parallel for a single task.

```javascript
const result = await agentWorkflow.processMultiAgentTask(
  "Explain quantum computing",
  ['research', 'notes']
);
```

### Feature Build Workflow
Complete workflow for building a feature:
1. Design phase
2. Code implementation
3. Code review

```javascript
const result = await agentWorkflow.createFeatureBuildWorkflow(
  "User authentication with JWT"
);
```

## WebSocket Events

### Client to Server
- `join_conversation` - Join a conversation room

### Server to Client
- `message_processing` - Message is being processed
- `message_completed` - Message processing completed
- `error` - Error occurred

## Development

### Running Tests
```bash
cd server
npm test

cd ../client
npm test
```

### Code Formatting
```bash
npm run format
```

### Linting
```bash
npm run lint
```

## Deployment

### Docker Compose Production
```bash
docker-compose -f docker-compose.yml up -d
```

### Kubernetes
Kubernetes manifests coming soon...

## Performance Optimization

- **Caching**: Redis caching for search results and LLM responses
- **Message Queue**: Task processor for async processing
- **Database Indexing**: Optimized MongoDB indexes
- **Connection Pooling**: MongoDB and Redis connection pooling

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`

### Redis Connection Error
- Ensure Redis is running: `redis-server`
- Check Redis URL in `.env`

### API Key Errors
- Verify all API keys are correctly set in `.env`
- Check API key permissions and quotas

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For support, email support@example.com or open an issue on GitHub.

## Roadmap

- [ ] Advanced caching strategies
- [ ] Real-time collaboration
- [ ] Custom agent creation
- [ ] Plugin system
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] Kubernetes deployment templates
- [ ] CI/CD integration

## Acknowledgments

- OpenAI for GPT API
- Anthropic for Claude API
- MongoDB and Redis communities
- React and Vite communities
