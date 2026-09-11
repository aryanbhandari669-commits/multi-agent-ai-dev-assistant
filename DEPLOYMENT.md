# Deployment Guide

## Prerequisites
- Node.js 18+
- MongoDB 6+
- Redis 7+
- Docker & Docker Compose

## Local Development

### Using Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Setup
```bash
# Start MongoDB
mongod

# Start Redis
redis-server

# Start backend
cd server
npm install
npm run dev

# Start frontend (new terminal)
cd client
npm install
npm run dev
```

## Production Deployment

### Environment Setup
1. Copy `.env.example` to `.env`
2. Add production API keys and configuration
3. Set `NODE_ENV=production`

### Using Docker
```bash
# Build images
docker-compose build

# Start containers
docker-compose up -d

# View logs
docker-compose logs -f
```

### Database Optimization
```javascript
// Create indexes
db.conversations.createIndex({ conversationId: 1 });
db.conversations.createIndex({ createdAt: -1 });
db.notes.createIndex({ category: 1, createdAt: -1 });
db.notes.createIndex({ "tags": 1 });
db.tasks.createIndex({ status: 1, createdAt: -1 });
```

### Performance Tuning
- Enable Redis caching for all external API calls
- Set appropriate MongoDB connection pool size
- Use CDN for static assets
- Enable gzip compression
- Set appropriate timeout values

## Monitoring

### Health Checks
```bash
curl http://localhost:5000/health
```

### Logs
- Backend logs: stdout/docker logs
- Frontend logs: browser console
- Database logs: MongoDB logs

## Scaling

### Horizontal Scaling
- Use load balancer (nginx, HAProxy)
- Deploy multiple server instances
- Use shared MongoDB and Redis

### Vertical Scaling
- Increase memory allocation
- Optimize database queries
- Implement caching strategies

## Security

1. Use HTTPS in production
2. Set secure CORS headers
3. Implement rate limiting
4. Use environment variables for secrets
5. Keep dependencies updated
6. Use strong JWT secrets
7. Implement API authentication

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :5000
# Kill process
kill -9 <PID>
```

### MongoDB Connection Issues
- Check MongoDB is running
- Verify connection string
- Check firewall rules

### Redis Connection Issues
- Check Redis is running
- Verify Redis URL
- Check port 6379 is open

## Backup Strategy

### MongoDB Backup
```bash
mongodump --uri="mongodb://localhost:27017/ai-dev-assistant" --out=./backup
```

### Redis Backup
```bash
redis-cli BGSAVE
cp /var/lib/redis/dump.rdb ./backup/
```
