#!/bin/bash

# 🔧 Fix NextAuth PrismaAdapter at runtime
echo "🔧 Fixing NextAuth PrismaAdapter configuration..."

# Create the fix script content
cat > /tmp/fix-nextauth.js << 'EOF'
const fs = require('fs');
const path = require('path');

// Read the current NextAuth route file
const routePath = '/app/app/api/auth/[...nextauth]/route.ts';
let content = fs.readFileSync(routePath, 'utf8');

// Add PrismaAdapter imports and configuration
const imports = `import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';

// Initialize PrismaClient for NextAuth
const prisma = new PrismaClient();`;

const authOptions = `export const authOptions: any = {
  adapter: PrismaAdapter(prisma),
  providers: [`;

// Replace the content
content = content.replace(
  /import NextAuth from 'next-auth';[\s\S]*?export const authOptions: any = \{[\s\S]*?providers: \[/,
  imports + '\n\n' + authOptions
);

// Write back the fixed content
fs.writeFileSync(routePath, content);
console.log('✅ NextAuth PrismaAdapter configured successfully');
EOF

# Copy the fix script to the container and execute it
docker cp /tmp/fix-nextauth.js $(docker-compose -f docker-compose.cloudflare.yml --env-file .env.cloudflare ps -q app):/tmp/fix-nextauth.js
docker-compose -f docker-compose.cloudflare.yml --env-file .env.cloudflare exec app node /tmp/fix-nextauth.js

echo "🎉 NextAuth PrismaAdapter fix complete!"
