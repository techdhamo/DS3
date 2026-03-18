# 🌐 Cloudflare Tunnel Docker Setup

## 🚀 One-Click Cloudflare Integration

This setup includes Cloudflare Tunnel directly in Docker, eliminating the need for external DNS configuration and handling dynamic IPs automatically.

## 📋 Prerequisites

### 1. Cloudflare Account
- Free Cloudflare account
- Domain: `ds3.world` (or your domain)

### 2. Get Cloudflare Tunnel Token

#### Step 1: Install Cloudflared (locally)
```bash
# On your local machine
curl -L https://pkg.cloudflare.com/cloudflare-main.gpg | sudo gpg --dearmor --yes -o /usr/share/keyrings/cloudflare-main.gpg
echo 'deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/ stable main' | sudo tee /etc/apt/sources.list.d/cloudflare.list
sudo apt-get update && sudo apt-get install cloudflared
```

#### Step 2: Authenticate and Create Tunnel
```bash
# Login to Cloudflare
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create ds3-world-docker

# Note the tunnel UUID from output
# Example: Created tunnel ds3-world-docker with id: abc123-def456-ghi789
```

#### Step 3: Configure Tunnel
```bash
# Create tunnel config
cat > ~/.cloudflared/config.yml << EOF
tunnel: abc123-def456-ghi789  # Replace with your tunnel UUID
credentials-file: /home/user/.cloudflared/abc123-def456-ghi789.json

ingress:
  - hostname: ds3.world
    service: http://app:3000
  - hostname: www.ds3.world
    service: http://app:3000
  - hostname: api.ds3.world
    service: http://app:3000
  - service: http_status:404
EOF

# Test tunnel locally
cloudflared tunnel run ds3-world-docker
```

#### Step 4: Generate Tunnel Token
```bash
# Generate token for Docker
cloudflared tunnel token abc123-def456-ghi789
```

**Copy the generated token** - you'll need it for the Docker setup.

## 🐳 Docker Setup

### 1. Create Environment File
Create `.env.cloudflare`:
```bash
# Cloudflare Tunnel Token (from previous step)
CLOUDFLARE_TUNNEL_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Razorpay
RAZORPAY_KEY_ID=rzp_test_SSdPA3h606fLOj
RAZORPAY_KEY_SECRET=Wliz04YS8d1CTL1jUiySFT6v
RAZORPAY_WEBHOOK_SECRET=razorpay_webhook_ds3_world_8f2a9b7c3d1e6f5a4b8c7d2e9f1a6b3c5d8e2f7a4b9c1d6e3f8a7b2c5d9e1f6a
```

### 2. Update Cloudflare DNS
In Cloudflare Dashboard:
1. Go to DNS settings for `ds3.store`
2. Delete any existing A records
3. Add CNAME records:
```
Type: CNAME
Name: @
Content: abc123-def456-ghi789.cfargotunnel.com
Proxy status: Proxied (orange cloud)

Type: CNAME
Name: www
Content: abc123-def456-ghi789.cfargotunnel.com
Proxy status: Proxied (orange cloud)
```

### 3. Deploy with Docker
```bash
# Use Cloudflare-enabled docker-compose
docker-compose -f docker-compose.cloudflare.yml --env-file .env.cloudflare up -d
```

## 🔧 Configuration Files

### Docker Compose with Cloudflare
The `docker-compose.cloudflare.yml` includes:
- **DS3 World App**: Next.js application
- **PostgreSQL**: Database
- **Cloudflared**: Tunnel service
- **Networking**: Internal Docker network

### Environment Variables
Required variables in `.env.cloudflare`:
- `CLOUDFLARE_TUNNEL_TOKEN`: From Cloudflare
- `GOOGLE_CLIENT_ID`: Google OAuth
- `GOOGLE_CLIENT_SECRET`: Google OAuth
- `RAZORPAY_KEY_ID`: Razorpay API
- `RAZORPAY_KEY_SECRET`: Razorpay secret
- `RAZORPAY_WEBHOOK_SECRET`: Webhook verification

## 🚀 Deployment Commands

### Start Services
```bash
# Start with Cloudflare tunnel
docker-compose -f docker-compose.cloudflare.yml --env-file .env.cloudflare up -d

# Check status
docker-compose -f docker-compose.cloudflare.yml ps

# View logs
docker-compose -f docker-compose.cloudflare.yml logs -f cloudflared
```

### Database Setup
```bash
# Run database migrations
docker-compose -f docker-compose.cloudflare.yml exec app npx prisma db push

# Seed database
docker-compose -f docker-compose.cloudflare.yml exec app npx prisma db seed
```

### Stop Services
```bash
# Stop all services
docker-compose -f docker-compose.cloudflare.yml down
```

## 🌐 Access Points

After deployment, your app will be accessible at:
- **Main Site**: https://ds3.store
- **WWW**: https://www.ds3.store
- **API**: https://api.ds3.store
- **Local**: http://localhost:3000 (for development)

## 🔍 Monitoring

### Check Tunnel Status
```bash
# Check Cloudflare tunnel logs
docker-compose -f docker-compose.cloudflare.yml logs cloudflared

# Check app logs
docker-compose -f docker-compose.cloudflare.yml logs app

# Check database logs
docker-compose -f docker-compose.cloudflare.yml logs postgres
```

### Health Checks
```bash
# Test local access
curl http://localhost:3000

# Test external access
curl https://ds3.store

# Check DNS resolution
nslookup ds3.store
```

## 🔒 Security Features

### Automatic SSL
- **Free SSL certificates** from Cloudflare
- **HTTPS enforcement** automatically
- **Certificate renewal** handled by Cloudflare

### DDoS Protection
- **Cloudflare network** protection
- **Rate limiting** automatically applied
- **Bot protection** included

### Firewall Rules
```bash
# Cloudflare WAF rules (recommended)
- Block SQL injection attempts
- Rate limit API endpoints
- Block suspicious IPs
- Enable bot fight mode
```

## 🔄 Updates and Maintenance

### Update Application
```bash
# Pull latest code
git pull

# Update containers
docker-compose -f docker-compose.cloudflare.yml pull
docker-compose -f docker-compose.cloudflare.yml up -d --force-recreate
```

### Update Tunnel Token
If tunnel token expires:
```bash
# Generate new token
cloudflared tunnel token abc123-def456-ghi789

# Update .env.cloudflare
# Replace CLOUDFLARE_TUNNEL_TOKEN

# Restart services
docker-compose -f docker-compose.cloudflare.yml restart cloudflared
```

### Backup Database
```bash
# Create backup
docker-compose -f docker-compose.cloudflare.yml exec postgres pg_dump -U postgres ds3_world > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker-compose -f docker-compose.cloudflare.yml exec -T postgres psql -U postgres ds3_world < backup_file.sql
```

## 🚨 Troubleshooting

### Tunnel Not Connecting
```bash
# Check token validity
docker-compose -f docker-compose.cloudflare.yml logs cloudflared

# Regenerate token if needed
cloudflared tunnel token abc123-def456-ghi789

# Check DNS configuration
nslookup ds3.store
```

### App Not Accessible
```bash
# Check app status
docker-compose -f docker-compose.cloudflare.yml ps app

# Check app logs
docker-compose -f docker-compose.cloudflare.yml logs app

# Test local connection
curl http://localhost:3000
```

### Database Issues
```bash
# Check database connection
docker-compose -f docker-compose.cloudflare.yml exec app npx prisma db pull

# Reset database
docker-compose -f docker-compose.cloudflare.yml down -v
docker-compose -f docker-compose.cloudflare.yml up -d
```

## 📈 Benefits

### ✅ Advantages of Docker + Cloudflare Setup

1. **Dynamic IP Support**: No need for static IP
2. **Zero Configuration**: Automatic SSL and DNS
3. **Enterprise Security**: DDoS protection and WAF
4. **Global CDN**: Fast content delivery
5. **Easy Deployment**: One-command setup
6. **Cost Effective**: Free Cloudflare tier
7. **Scalable**: Easy to scale and maintain

### 🎯 Perfect For

- **Home servers** with dynamic IP
- **Development environments** 
- **Production deployments** without static IP
- **Global applications** needing CDN
- **Secure sites** requiring SSL

## 🎉 Ready to Launch!

Your DS3 World is now ready for production with:
- **Automatic SSL** certificates
- **Dynamic IP** support
- **Global CDN** delivery
- **Enterprise security**
- **One-command deployment**

**Deploy now with:**
```bash
docker-compose -f docker-compose.cloudflare.yml --env-file .env.cloudflare up -d
```
