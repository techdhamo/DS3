# 🚀 DS3 World v1.0 Deployment Guide

## 📋 Overview

DS3 World is a gamified e-commerce platform with mystery boxes, real-time multiplayer features, and Razorpay payment integration. This guide covers Docker deployment with Cloudflare DNS for dynamic IP handling.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Cloudflare    │    │     Docker      │    │   PostgreSQL    │
│     DNS/CDN     │◄──►│   Container     │◄──►│    Database     │
│                 │    │                 │    │                 │
│ • SSL/TLS       │    │ • Next.js App   │    │ • User Data     │
│ • DDoS Protect  │    │ • API Routes    │    │ • Inventory     │
│ • Global CDN    │    │ • Auth System   │    │ • Orders        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Prerequisites

### System Requirements
- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 20GB minimum
- **OS**: Linux, macOS, or Windows with Docker
- **Network**: Stable internet connection

### Required Services
- [Docker](https://docker.com/) (v20+)
- [Docker Compose](https://docs.docker.com/compose/) (v2+)
- [Cloudflare Account](https://cloudflare.com/)
- Domain name (e.g., `ds3.store`)

### API Keys Required
- **Google OAuth**: Client ID & Secret
- **Razorpay**: Key ID, Secret, Webhook Secret
- **Email Provider**: SMTP credentials (optional)

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd ds3
```

### 2. Configure Environment
```bash
# Copy environment template
cp ENV_EXAMPLE.txt .env

# Edit with your credentials
nano .env
```

**Required Environment Variables:**
```bash
# Database
DATABASE_URL="postgresql://postgres:password@postgres:5432/ds3_world?sslmode=disable"

# Authentication
NEXTAUTH_URL="https://ds3.store"
NEXTAUTH_SECRET="ds3_world_secret_9f2a8b7c3d1e6f5a4b8c7d2e9f1a6b3c5d8e2f7a4b9c1d6e3f8a7b2c5d9e1f6a"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Razorpay Payments
RAZORPAY_KEY_ID="rzp_test_SSdPA3h606fLOj"
RAZORPAY_KEY_SECRET="Wliz04YS8d1CTL1jUiySFT6v"
RAZORPAY_WEBHOOK_SECRET="razorpay_webhook_ds3_world_8f2a9b7c3d1e6f5a4b8c7d2e9f1a6b3c5d8e2f7a4b9c1d6e3f8a7b2c5d9e1f6a"
```

### 3. Deploy Application
```bash
# One-command deployment
./deploy.sh deploy
```

### 4. Setup Cloudflare DNS
Follow the [Cloudflare DNS Setup Guide](./cloudflare-dns-setup.md)

## 📁 Project Structure

```
ds3/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── store/             # E-commerce pages
│   └── dashboard/         # User dashboard
├── src/
│   └── components/        # React components
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── public/                # Static assets
├── Dockerfile             # Docker container config
├── docker-compose.yml     # Multi-container setup
├── nginx.conf             # Reverse proxy config
├── deploy.sh              # Deployment script
└── cloudflare-dns-setup.md # DNS setup guide
```

## 🔧 Configuration

### Docker Compose Services

#### 1. App Container
- **Next.js 16** with App Router
- **Node.js 18** Alpine Linux
- **Prisma ORM** for database
- **Razorpay SDK** for payments
- **NextAuth.js** for authentication

#### 2. PostgreSQL Database
- **PostgreSQL 15** Alpine
- **Persistent storage** with Docker volumes
- **Automatic backups** with deploy script

#### 3. Nginx Reverse Proxy
- **SSL termination** with Cloudflare
- **Static file caching**
- **API proxying**
- **Security headers**

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `NEXTAUTH_URL` | Application URL | ✅ |
| `NEXTAUTH_SECRET` | Session encryption secret | ✅ |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | ✅ |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | ✅ |
| `RAZORPAY_KEY_ID` | Razorpay API key | ✅ |
| `RAZORPAY_KEY_SECRET` | Razorpay secret | ✅ |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook verification | ✅ |
| `EMAIL_SERVER_HOST` | SMTP server (optional) | ❌ |
| `EMAIL_SERVER_USER` | SMTP username (optional) | ❌ |

## 🌐 DNS Configuration

### Cloudflare Setup

1. **Add Domain**: Add `ds3.store` to Cloudflare
2. **DNS Records**: Configure CNAME to Cloudflare Tunnel
3. **SSL/TLS**: Enable Full (strict) mode
4. **Security**: Configure WAF and DDoS protection

### Cloudflare Tunnel

For dynamic IP addresses:
```bash
# Install cloudflared
curl -L https://pkg.cloudflare.com/cloudflare-main.gpg | sudo gpg --dearmor --yes -o /usr/share/keyrings/cloudflare-main.gpg

# Create tunnel
cloudflared tunnel create ds3-world

# Configure tunnel
cat > ~/.cloudflared/config.yml << EOF
tunnel: YOUR_TUNNEL_UUID
credentials-file: ~/.cloudflared/YOUR_TUNNEL_UUID.json
ingress:
  - hostname: ds3.store
    service: http://localhost:3000
  - service: http_status:404
EOF

# Run tunnel
cloudflared tunnel run ds3-world
```

## 📊 Monitoring & Maintenance

### Health Checks
```bash
# Check service status
./deploy.sh status

# View logs
./deploy.sh logs

# Check Docker containers
docker ps
docker stats
```

### Database Management
```bash
# Run migrations
docker-compose exec app npx prisma db push

# Seed database
docker-compose exec app npx prisma db seed

# Access database
docker-compose exec postgres psql -U postgres -d ds3_world

# Backup database
./deploy.sh backup
```

### Updates
```bash
# Update application
./deploy.sh update

# Rebuild with no cache
docker-compose build --no-cache
docker-compose up -d
```

## 🔒 Security

### Application Security
- **Environment variables**: All secrets in .env file
- **HTTPS enforced**: Cloudflare SSL/TLS
- **CSRF protection**: NextAuth.js built-in
- **Rate limiting**: Cloudflare WAF
- **Input validation**: Prisma ORM

### Docker Security
- **Non-root user**: Container runs as `nextjs` user
- **Minimal base image**: Alpine Linux
- **Read-only filesystem**: Where possible
- **Resource limits**: Configured in docker-compose

### Network Security
- **Internal network**: Docker bridge network
- **Port mapping**: Only necessary ports exposed
- **Firewall rules**: Cloudflare WAF
- **DDoS protection**: Cloudflare network

## 🚨 Troubleshooting

### Common Issues

#### 1. Container Won't Start
```bash
# Check logs
docker-compose logs app

# Check environment variables
docker-compose config

# Rebuild container
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

#### 2. Database Connection Failed
```bash
# Check PostgreSQL status
docker-compose logs postgres

# Test connection
docker-compose exec app npx prisma db pull

# Reset database
docker-compose down -v
docker-compose up -d
```

#### 3. Google OAuth Error
- Verify `NEXTAUTH_URL` matches your domain
- Check Google Console redirect URIs
- Ensure OAuth consent screen is configured
- Add domain to authorized domains

#### 4. Razorpay Payment Failed
- Verify API keys in environment
- Check webhook endpoint is accessible
- Ensure webhook secret matches
- Test with Razorpay test mode

### Performance Issues

#### Memory Usage
```bash
# Check container memory
docker stats

# Limit memory usage
# Edit docker-compose.yml:
# deploy:
#   resources:
#     limits:
#       memory: 2G
```

#### Slow Loading
- Enable Cloudflare caching
- Optimize images and assets
- Use CDN for static files
- Monitor database queries

## 📈 Scaling

### Horizontal Scaling
```yaml
# docker-compose.yml
services:
  app:
    deploy:
      replicas: 3
    # Add load balancer
```

### Database Scaling
- **Read replicas**: For read-heavy workloads
- **Connection pooling**: PgBouncer
- **Caching**: Redis for session storage

### CDN Optimization
- **Cloudflare Argo**: Smart routing
- **Image optimization**: Cloudflare Polish
- **Minification**: Auto-minify CSS/JS

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy DS3 World
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        run: |
          ssh user@server 'cd /path/to/ds3 && ./deploy.sh update'
```

## 📞 Support

### Documentation
- [API Documentation](./API.md)
- [Database Schema](./DATABASE.md)
- [Security Guide](./SECURITY.md)

### Contact
- **Email**: dhamo.developer@gmail.com
- **Issues**: GitHub repository issues
- **Discord**: Community server (if available)

---

## 🎉 Ready to Launch!

Your DS3 World platform is now ready for production deployment with:

✅ **Docker containerization**  
✅ **Cloudflare DNS & CDN**  
✅ **SSL/TLS encryption**  
✅ **Dynamic IP support**  
✅ **Automated deployment**  
✅ **Monitoring & backups**  

**Deploy now with: `./deploy.sh deploy`** 🚀
