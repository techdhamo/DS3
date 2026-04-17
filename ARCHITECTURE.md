# DS3 World & Store Architecture

## Overview

DS3 World is a unified platform where the **Store** is an integral submodule, while also being accessible as a standalone experience through `ds3.store`.

## Domain Structure

```
ds3.world              → Main DS3 World Platform
├── /                  → DS3 World Homepage
├── /dashboard         → User Dashboard
├── /dungeon-raid      → Gaming Features
└── /store             → DS3 Store (Integrated Submodule)
    ├── /              → Store Home
    ├── /categories    → Category Browser
    └── /cart          → Shopping Cart

ds3.store              → Redirects to ds3.world/store
store.ds3.world        → Redirects to ds3.world/store
```

## Architecture Principles

### 1. Store as Submodule
- DS3 Store is located at `app/(store)/` using Next.js route groups
- It shares the same layout system but has its own navigation
- Store is accessible via `ds3.world/store`

### 2. Standalone Capability
- Store can function independently
- All store features work without DS3 World context
- Mobile app provides standalone store experience

### 3. Domain Redirection
- `ds3.store` → `ds3.world/store` (301 redirect)
- `store.ds3.world` → `ds3.world/store` (301 redirect)
- Implemented via Next.js middleware and config

## File Structure

```
app/
├── page.tsx                 # DS3 World Homepage (with Store CTA)
├── layout.tsx               # Root layout
├── (store)/                 # Store route group
│   ├── layout.tsx           # Store layout with bottom nav
│   ├── page.tsx             # Store homepage
│   └── categories/
│       └── page.tsx         # Category browser
├── dashboard/               # DS3 World features
├── dungeon-raid/            # Gaming features
└── api/                     # API routes

mobile-app/                  # React Native App
├── App.tsx                  # Navigation setup
└── src/screens/
    ├── HomeScreen.tsx       # Store home
    ├── MenuScreen.tsx       # User menu
    └── ...

middleware.ts                # Domain redirection logic
next.config.js               # Redirect/rewrite rules
```

## Key Features

### Web Platform
- **DS3 World Homepage**: Entry point with Store CTA
- **Integrated Store**: Seamless shopping within DS3 World
- **Domain Flexibility**: Access via ds3.world/store or ds3.store
- **Unified Navigation**: Back to World from Store
- **Shared Auth**: Single authentication system

### Mobile App (React Native)
- **Standalone Store**: Full shopping experience
- **DS3 World Integration**: Links back to web platform
- **Native Features**: Push notifications, offline mode
- **Cross-Platform**: iOS & Android support

### Backend Integration
- **Dropshipping Service**: Java Spring Boot microservice
- **Supplier Integration**: DeoDap, IndiaMart, TradeIndia
- **Inventory Sync**: Real-time product updates
- **Order Management**: Complete order lifecycle

## Navigation Flow

```
User Journey:

1. Lands on ds3.world
   └── Sees DS3 World + DS3 Store options

2. Clicks DS3 Store
   └── Goes to ds3.world/store
   └── Sees "Part of DS3 World" banner
   └── Can navigate back to World anytime

3. Or visits ds3.store directly
   └── Redirected to ds3.world/store
   └── Same experience as above

4. Mobile App
   └── Opens DS3 Store app
   └── Full standalone shopping
   └── Can open ds3.world in browser
```

## Technical Implementation

### Domain Redirects (middleware.ts)
```typescript
// ds3.store → ds3.world/store
if (hostname === 'ds3.store') {
  url.hostname = 'ds3.world'
  url.pathname = '/store'
  return NextResponse.redirect(url, 301)
}
```

### Store Layout Integration
- Header shows "DS3 Store - Part of DS3 World"
- Back button to return to DS3 World
- "World" link in header for quick navigation
- Consistent branding with DS3 World

### Mobile App Architecture
- React Native with Expo
- Shared components with web where possible
- Independent navigation stack
- API integration with dropshipping service

## Environment Variables

```env
# Domains
NEXT_PUBLIC_MAIN_DOMAIN=ds3.world
NEXT_PUBLIC_STORE_DOMAIN=ds3.store

# API
NEXT_PUBLIC_DROPSHIP_API_URL=http://localhost:8080
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...

# Mobile
EXPO_PUBLIC_API_URL=https://api.ds3.world
```

## Deployment

### Web (Vercel)
```bash
# Deploy DS3 World + Store
git push origin main

# Configure domains in Vercel:
# - ds3.world (primary)
# - ds3.store (redirect to /store)
# - store.ds3.world (redirect to /store)
```

### Mobile (Expo)
```bash
cd mobile-app
expo build:android
expo build:ios
# Or use EAS Build
```

## Future Enhancements

1. **Unified Cart**: DS3 World items + Store items in single cart
2. **Shared Wallet**: DS3 World currency works in Store
3. **Cross-Promotion**: Store items in DS3 World game
4. **Inventory Sync**: Real-time across all platforms
5. **PWA Store**: Installable ds3.store as standalone app

## Summary

DS3 Store is both:
- **Integrated**: Part of DS3 World platform at ds3.world/store
- **Standalone**: Accessible directly via ds3.store (redirects)
- **Mobile**: Native app for iOS/Android
- **Unified**: Single backend, shared auth, consistent UX

This architecture provides maximum flexibility while maintaining a cohesive brand experience.
