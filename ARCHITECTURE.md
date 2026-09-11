# Architecture Overview

## System Design

### Multi-Agent Architecture

The system uses a sophisticated multi-agent architecture where:

1. **Orchestrator Agent** - Routes user requests to appropriate specialized agents
2. **Coding Agent** - Handles code generation, refactoring, and implementation
3. **Research Agent** - Performs research and information gathering
4. **Code Review Agent** - Analyzes code for quality, security, and performance
5. **Notes Agent** - Manages knowledge organization and summarization

### Request Flow

```
User Input
    ↓
  API Endpoint
    ↓
  Orchestrator Agent (decides routing)
    ↓
  Specialized Agent(s) (process request)
    ↓
  LLM/External Services (if needed)
    ↓
  Result Synthesis
    ↓
  Response to User
```

### Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ Chat Module  │  │ Notes Module │  │ Tasks Module    │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬────────┘  │
│         │                 │                   │            │
│         └─────────────────┼───────────────────┘            │
│                           │                                 │
│                    Zustand Store                           │
└───────────────────────────┼─────────────────────────────────┘
                            │
                    WebSocket / HTTP
                            │
┌───────────────────────────┼─────────────────────────────────┐
│                   Express Server                           │
│  ┌────────────────────────────────────────────────────┐   │
│  │              API Routes                            │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐    │   │
│  │  │ Chat API │  │Notes API │  │ Tasks API    │    │   │
│  │  └─────┬────┘  └─────┬────┘  └──────┬───────┘    │   │
│  └────────┼─────────────┼──────────────┼────────────┘   │
│           │             │              │                │
│  ┌────────┴─────────────┴──────────────┴────────────┐   │
│  │        Agent Workflow Manager                    │   │
│  │  ┌──────────────────────────────────────────┐   │   │
│  │  │  Orchestrator Agent                      │   │   │
│  │  ├──────────────────────────────────────────┤   │   │
│  │  │  • Coding Agent                          │   │   │
│  │  │  • Research Agent                        │   │   │
│  │  │  • Code Review Agent                     │   │   │
│  │  │  • Notes Agent                           │   │   │
│  │  └──────────────────────────────────────────┘   │   │
│  └────────────────────────────────────────────────┘   │
│           │             │              │                │
│  ┌────────┴─────────────┴──────────────┴────────────┐   │
│  │        External Services                        │   │
│  │  ┌──────────────┐  ┌──────────────────────┐   │   │
│  │  │ LLM Services │  │  Search Services     │   │   │
│  │  │ • OpenAI     │  │  • SerpAPI           │   │   │
│  │  │ • Claude     │  │  • Google Search     │   │   │
│  │  └──────────────┘  └──────────────────────┘   │   │
│  └────────────────────────────────────────────────┘   │
│           │             │              │                │
│  ┌────────┴─────────────┴──────────────┴────────────┐   │
│  │        Services Layer                           │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │   │
│  │  │ Database │  │ Cache    │  │ Search       │  │   │
│  │  │ (MongoDB)│  │ (Redis)  │  │ Service      │  │   │
│  │  └──────────┘  └──────────┘  └──────────────┘  │   │
│  └────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────┘
```

## Data Flow

### Conversation Flow
1. User sends message through chat UI
2. Frontend stores in Zustand store
3. HTTP POST to `/api/chat`
4. Server receives and processes through agent workflow
5. Orchestrator analyzes request and routes to agent(s)
6. Agent(s) process request with LLM/search services
7. Results synthesized and returned
8. WebSocket broadcasts update to connected clients
9. Frontend receives and updates UI

### Note Creation Flow
1. User creates note through Notes UI
2. POST request to `/api/notes`
3. Validation middleware checks data
4. Database service inserts into MongoDB
5. Response sent back to client
6. Frontend updates Zustand store
7. UI reflects changes

## Technology Decisions

### Backend: Node.js + Express
- **Why**: Non-blocking I/O for handling multiple concurrent requests
- **Benefit**: Efficient for real-time applications with WebSocket

### MongoDB
- **Why**: Flexible schema for diverse data types
- **Benefit**: Easy to evolve data structure as agents evolve

### Redis
- **Why**: Fast in-memory caching
- **Benefit**: Reduces API calls and improves response times

### React + Zustand
- **Why**: Modern, efficient state management
- **Benefit**: Lightweight, performant, easy to understand

### WebSocket (Socket.io)
- **Why**: Real-time bidirectional communication
- **Benefit**: Live updates without polling

## Scalability Considerations

### Horizontal Scaling
- Stateless API design allows multiple server instances
- Load balancer distributes requests
- Shared MongoDB and Redis for state

### Vertical Scaling
- Connection pooling for database
- Caching strategy reduces database hits
- Code optimization for performance

### Performance Optimization
- Redis caching for frequent queries
- Database indexing for common queries
- Message compression for WebSocket
- CDN for static assets

## Error Handling

1. **Request Validation**: Zod schemas validate all inputs
2. **Service Errors**: Caught and logged at service layer
3. **Agent Failures**: Fallback to research agent
4. **API Failures**: Retry logic with exponential backoff
5. **Client Errors**: Meaningful error messages returned

## Security Architecture

1. **CORS**: Restrict cross-origin requests
2. **Rate Limiting**: Prevent abuse
3. **Input Validation**: Zod schemas
4. **Error Handling**: No stack traces in production
5. **Environment Variables**: Secrets not in code
6. **HTTPS**: Required in production
