# 🌐 Cloudflare DNS Setup for DS3 World

## 📋 Prerequisites
- Cloudflare account
- Domain: `ds3.world`
- Server IP (dynamic - will use Cloudflare Tunnel)

## 🔧 Step-by-Step Setup

### 1. Add Domain to Cloudflare
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click "Add a site"
3. Enter domain: `ds3.world`
4. Choose Free plan
5. Follow DNS setup instructions

### 2. Configure DNS Records
After adding domain, create these records:

#### A Records (for subdomains)
```
Type: A
Name: @
Content: 192.0.2.1 (temporary - will be replaced)
TTL: Auto
Proxy status: Proxied (orange cloud)

Type: A  
Name: www
Content: 192.0.2.1 (temporary - will be replaced)
TTL: Auto
Proxy status: Proxied (orange cloud)
```

#### CNAME Records (for services)
```
Type: CNAME
Name: api
Content: ds3.store
TTL: Auto
Proxy status: Proxied (orange cloud)

Type: CNAME
Name: app
Content: ds3.store  
TTL: Auto
Proxy status: Proxied (orange cloud)
```

### 3. Set Up Cloudflare Tunnel (for Dynamic IP)

#### Install Cloudflare Tunnel
```bash
# On your server
curl -L https://pkg.cloudflare.com/cloudflare-main.gpg | sudo gpg --dearmor --yes -o /usr/share/keyrings/cloudflare-main.gpg
echo 'deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/ stable main' | sudo tee /etc/apt/sources.list.d/cloudflare.list
sudo apt-get update && sudo apt-get install cloudflared
```

#### Create Tunnel
```bash
# Authenticate cloudflared
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create ds3-world

# Note the tunnel UUID from output
```

#### Configure Tunnel
Create `~/.cloudflared/config.yml`:
```yaml
tunnel: YOUR_TUNNEL_UUID
credentials-file: /home/user/.cloudflared/YOUR_TUNNEL_UUID.json

ingress:
  - hostname: ds3.world
    service: http://localhost:3000
  - hostname: www.ds3.world
    service: http://localhost:3000
  - hostname: api.ds3.world
    service: http://localhost:3000
  - service: http_status:404
```

#### Start Tunnel
```bash
# Run tunnel
cloudflared tunnel run ds3-world

# Or run as systemd service
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

### 4. Update DNS Records
After tunnel is running, update A records:
```
Type: CNAME
Name: @
Content: YOUR_TUNNEL_UUID.cfargotunnel.com
Proxy status: Proxied (orange cloud)

Type: CNAME
Name: www  
Content: YOUR_TUNNEL_UUID.cfargotunnel.com
Proxy status: Proxied (orange cloud)
```

### 5. SSL Configuration
Cloudflare provides free SSL certificates:
- SSL/TLS → Overview → Full (strict)
- Edge Certificates → Always Use HTTPS → On

### 6. Security Settings
Configure these security features:
- **WAF**: Enable Web Application Firewall
- **DDoS Protection**: Enable (free tier)
- **Bot Fight Mode**: Enable
- **Rate Limiting**: Configure for API endpoints

### 7. Performance Optimization
```
Caching → Configuration Level: Standard
Page Rules → Cache Everything for static assets
Argo Smart Routing: Enable (paid feature)
```

## 🚀 Deployment Commands

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Environment Variables
Create `.env` file:
```bash
# Database
DATABASE_URL="postgresql://postgres:password@postgres:5432/ds3_world?sslmode=disable"

# NextAuth
NEXTAUTH_URL="https://ds3.store"
NEXTAUTH_SECRET="ds3_world_secret_9f2a8b7c3d1e6f5a4b8c7d2e9f1a6b3c5d8e2f7a4b9c1d6e3f8a7b2c5d9e1f6a"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Razorpay
RAZORPAY_KEY_ID="rzp_test_SSdPA3h606fLOj"
RAZORPAY_KEY_SECRET="Wliz04YS8d1CTL1jUiySFT6v"
RAZORPAY_WEBHOOK_SECRET="razorpay_webhook_ds3_world_8f2a9b7c3d1e6f5a4b8c7d2e9f1a6b3c5d8e2f7a4b9c1d6e3f8a7b2c5d9e1f6a"
```

## 📊 Monitoring

### Cloudflare Analytics
- Dashboard → Analytics → Overview
- Monitor traffic, requests, and security events

### Server Monitoring
```bash
# Check tunnel status
cloudflared tunnel info ds3-world

# Check Docker containers
docker ps
docker stats
```

## 🔒 Security Checklist

- [ ] Cloudflare WAF enabled
- [ ] SSL/TLS Full (strict) mode
- [ ] Rate limiting configured
- [ ] DDoS protection enabled
- [ ] DNS records proxied (orange cloud)
- [ ] Firewall rules for API endpoints
- [ ] Regular security updates

## 🎯 Result

After setup:
- **Main Site**: https://ds3.store
- **API**: https://api.ds3.store  
- **CDN**: Cloudflare global network
- **SSL**: Free automatic certificates
- **DDoS Protection**: Cloudflare network
- **Dynamic IP**: Cloudflare Tunnel handles IP changes

Your DS3 World app will be accessible globally with enterprise-grade security and performance!
