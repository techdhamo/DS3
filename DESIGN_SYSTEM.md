# DS3 World - Complete Design System & Architecture

**Project:** DS3 World - Gamified E-Commerce Platform  
**Repository:** https://github.com/techdhamo/DS3  
**Author:** techdhamo <dhamodaran@outlook.in>  
**Version:** 1.0.0  
**Date:** April 17, 2026

---

## 📐 1. SYSTEM ARCHITECTURE DESIGN

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────────────────┐  │
│  │   Web App    │  │  Mobile App  │  │         PWA (Installable)        │  │
│  │  (Next.js)   │  │(React Native)│  │                                    │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┬─────────────────────┘  │
│         │                  │                         │                        │
│         └──────────────────┼─────────────────────────┘                        │
│                            │                                                 │
└────────────────────────────┼─────────────────────────────────────────────────┘
                             │ API Gateway / Edge (Vercel)
┌────────────────────────────┼─────────────────────────────────────────────────┐
│                         API LAYER                                            │
├────────────────────────────┼─────────────────────────────────────────────────┤
│  ┌─────────────────────────┴─────────────────────────────────────────────┐   │
│  │                    Next.js App Router                                   │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │   │
│  │  │ /auth/*  │ │ /store/* │ │ /api/*   │ │ /dash/*  │ │ /dungeon │   │   │
│  │  │ NextAuth │ │  Store   │ │  REST    │ │ Dashboard│ │   Raid   │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                            │                                                 │
└────────────────────────────┼─────────────────────────────────────────────────┘
                             │ Prisma ORM
┌────────────────────────────┼─────────────────────────────────────────────────┐
│                      SERVICE LAYER                                           │
├────────────────────────────┼─────────────────────────────────────────────────┤
│  ┌─────────────────────────┴─────────────────────────────────────────────┐   │
│  │                 Dropshipping Microservice (Java)                      │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐       │   │
│  │  │ Supplier   │ │  Order     │ │ Inventory  │ │  Payment   │       │   │
│  │  │ Interface  │ │  Service   │ │   Sync     │ │  Service   │       │   │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                            │                                                 │
└────────────────────────────┼─────────────────────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────────────────────┐
│                     DATA LAYER                                               │
├────────────────────────────┼─────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────┴───────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  PostgreSQL  │  │    Redis     │  │   Storage    │  │   CDN/Img    │    │
│  │  (Primary)   │  │   (Cache)    │  │   (Uploads)  │  │   (Vercel)   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Domain Architecture

```
ds3.world (Main Domain)
├── /                     → DS3 World Homepage
├── /dashboard            → User Dashboard
├── /dungeon-raid         → Gaming Feature
├── /store                → DS3 Store (Submodule)
│   ├── /                 → Store Home
│   ├── /categories       → Category Browser
│   └── /cart             → Shopping Cart
└── /auth/*               → Authentication

ds3.store (Redirects to ds3.world/store)
store.ds3.world (Redirects to ds3.world/store)
```

### 1.3 Microservices Design

```
┌─────────────────────────────────────────────────────────┐
│           DS3 Dropshipping Service (Java)               │
├─────────────────────────────────────────────────────────┤
│  REST API Layer (Spring Boot)                           │
│  ├── POST /api/v1/suppliers/{id}/orders                 │
│  ├── GET  /api/v1/suppliers/{id}/orders/{orderId}      │
│  ├── GET  /api/v1/suppliers/{id}/products               │
│  └── POST /api/v1/suppliers/{id}/inventory/sync         │
├─────────────────────────────────────────────────────────┤
│  Service Layer                                          │
│  ├── SupplierOrderService                               │
│  ├── InventorySyncService                               │
│  └── SupplierConfigService                              │
├─────────────────────────────────────────────────────────┤
│  Adapter Layer (Supplier Implementations)               │
│  ├── DeoDapClient (implements SupplierClient)           │
│  ├── IndiaMartClient (implements SupplierClient)        │
│  └── TradeIndiaClient (implements SupplierClient)       │
├─────────────────────────────────────────────────────────┤
│  Model Layer                                            │
│  ├── SupplierProduct                                    │
│  ├── DropshipOrderRequest/Response                     │
│  ├── OrderStatusResponse                                  │
│  └── InventorySyncResult                                  │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 2. UI/UX DESIGN SYSTEM

### 2.1 Color Palette

#### Primary Colors
```css
/* DS3 World Brand Colors */
--violet-500: #8b5cf6;        /* Primary action */
--violet-600: #7c3aed;        /* Primary hover */
--violet-700: #6d28d9;        /* Primary dark */

/* Fantasy Theme */
--purple-600: #9333ea;        /* Mystery/Box */
--purple-700: #7e22ce;        /* Dark purple */
--indigo-600: #4f46e5;        /* Links */
--indigo-900: #312e81;        /* Dark background */

/* Status Colors */
--success: #22c55e;           /* Green - success */
--warning: #f59e0b;           /* Amber - warning */
--error: #ef4444;             /* Red - error */
--info: #3b82f6;              /* Blue - info */

/* Dark Theme Backgrounds */
--midnight-900: #0f172a;      /* Main background */
--midnight-800: #1e293b;      /* Card background */
--midnight-700: #334155;      /* Border/divider */
--midnight-600: #475569;      /* Muted text */
--midnight-400: #94a3b8;      /* Secondary text */
--midnight-200: #e2e8f0;      /* Light text */
--midnight-100: #f1f5f9;      /* White text */
```

#### Store Colors (Light Mode)
```css
/* Store UI Colors */
--store-primary: #7c3aed;       /* Violet - primary */
--store-secondary: #a78bfa;     /* Light violet */
--store-background: #f8fafc;    /* Light gray bg */
--store-card: #ffffff;          /* White cards */
--store-text: #1e293b;          /* Dark text */
--store-muted: #64748b;         /* Gray text */
--store-border: #e2e8f0;        /* Light border */

/* Category Colors */
--electronics: #3b82f6;         /* Blue */
--fashion: #ec4899;             /* Pink */
--home: #10b981;                /* Green */
--gaming: #f59e0b;              /* Amber */
--beauty: #8b5cf6;              /* Violet */
```

### 2.2 Typography System

#### Font Families
```css
/* Headings - Fantasy/Game Style */
--font-heading: 'Cinzel', 'Playfair Display', serif;

/* Body - Clean Sans */
--font-body: 'Inter', 'Segoe UI', system-ui, sans-serif;

/* Monospace - Code/Data */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Mobile - Native feel */
--font-mobile: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
```

#### Type Scale
```
Heading 1:  48px / 3rem      (font-bold, font-heading)
Heading 2:  36px / 2.25rem    (font-bold, font-heading)
Heading 3:  30px / 1.875rem   (font-semibold)
Heading 4:  24px / 1.5rem     (font-semibold)
Heading 5:  20px / 1.25rem    (font-semibold)
Heading 6:  18px / 1.125rem   (font-medium)

Body Large: 18px / 1.125rem   (font-normal, leading-relaxed)
Body:       16px / 1rem       (font-normal, leading-normal)
Body Small: 14px / 0.875rem   (font-normal)
Caption:    12px / 0.75rem    (font-medium, uppercase)

Button:     14px / 0.875rem   (font-semibold)
Nav:        14px / 0.875rem   (font-medium)
```

### 2.3 Spacing System

```
4px   - xs    (space-1)
8px   - sm    (space-2)
12px  - md-sm (space-3)
16px  - md    (space-4)
20px  - md-lg (space-5)
24px  - lg    (space-6)
32px  - xl    (space-8)
40px  - 2xl   (space-10)
48px  - 3xl   (space-12)
64px  - 4xl   (space-16)
80px  - 5xl   (space-20)
```

### 2.4 Border Radius System

```
4px   - sm    (rounded)       - Buttons, inputs
8px   - md    (rounded-md)    - Cards, modals
12px  - lg    (rounded-lg)    - Large cards
16px  - xl    (rounded-xl)    - Feature cards
24px  - 2xl   (rounded-2xl)   - Hero sections
9999px- full  (rounded-full)  - Pills, avatars
```

### 2.5 Shadow System

```css
/* Elevation Levels */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

/* Glow Effects (Fantasy Theme) */
--glow-violet: 0 0 20px rgba(139, 92, 246, 0.5);
--glow-purple: 0 0 30px rgba(147, 51, 234, 0.4);
--glow-teal: 0 0 20px rgba(20, 184, 166, 0.5);
```

---

## 🧩 3. COMPONENT ARCHITECTURE

### 3.1 Component Hierarchy

```
DS3 World
├── Layout Components
│   ├── RootLayout
│   │   ├── SessionProvider
│   │   ├── ThemeProvider
│   │   └── Navigation
│   ├── StoreLayout
│   │   ├── Header (with World link)
│   │   ├── Sidebar (categories)
│   │   ├── Main Content
│   │   └── BottomNav (mobile)
│   └── AuthLayout
│
├── UI Components (Shadcn)
│   ├── Button (variants: default, outline, ghost, link)
│   ├── Card (Card, CardHeader, CardTitle, CardContent, CardFooter)
│   ├── Input (with validation states)
│   ├── Badge (variants: default, secondary, outline, destructive)
│   └── utilities (cn function)
│
├── Feature Components
│   ├── Navigation
│   │   ├── AuthNav
│   │   ├── MainNav
│   │   └── StoreNav
│   ├── Product
│   │   ├── ProductCard
│   │   ├── ProductGrid
│   │   ├── ProductDetail
│   │   └── ProductFilters
│   ├── Cart
│   │   ├── CartButton
│   │   ├── CartSidebar
│   │   └── CartItem
│   ├── Wishlist
│   │   ├── WishlistButton
│   │   └── WishlistGrid
│   └── Payment
│       ├── RazorpayCheckout
│       └── PaymentStatus
│
└── Page Components
    ├── HomePage
    ├── StorePage
    ├── CategoryPage
    ├── ProductPage
    ├── CartPage
    ├── CheckoutPage
    └── DashboardPage
```

### 3.2 Component Design Patterns

#### Container/Presentational Pattern
```typescript
// Container (Smart Component)
export function ProductListContainer() {
  const [products, setProducts] = useState<Product[]>([])
  
  useEffect(() => {
    fetchProducts().then(setProducts)
  }, [])
  
  return <ProductListView products={products} />
}

// Presentational (Dumb Component)
interface ProductListViewProps {
  products: Product[]
}

export function ProductListView({ products }: ProductListViewProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  )
}
```

#### Compound Component Pattern
```typescript
// Card Compound Component
const Card = {
  Root: CardRoot,
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Content: CardContent,
  Footer: CardFooter
}

// Usage
<Card.Root>
  <Card.Header>
    <Card.Title>Product Name</Card.Title>
    <Card.Description>Product description</Card.Description>
  </Card.Header>
  <Card.Content>Price, rating, etc.</Card.Content>
  <Card.Footer>
    <Button>Add to Cart</Button>
  </Card.Footer>
</Card.Root>
```

#### Render Props Pattern
```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback: (error: Error) => React.ReactNode
}
```

---

## 🗄️ 4. DATABASE DESIGN

### 4.1 Entity Relationship Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│      USER       │     │     ORDER       │     │  ORDER_ITEM     │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK)         │────<│ id (PK)         │────<│ id (PK)         │
│ email           │     │ userId (FK)     │     │ orderId (FK)    │
│ name            │     │ total           │     │ productId (FK)  │
│ image           │     │ status          │     │ quantity        │
│ role            │     │ paymentStatus   │     │ price           │
│ createdAt       │     │ createdAt       │     │ name (snapshot) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                                              │
         │                                              │
         │                     ┌─────────────────┐       │
         │                     │    PRODUCT      │<──────┘
         │                     ├─────────────────┤
         │                     │ id (PK)         │
         │                     │ name            │
         │                     │ description     │
         │                     │ price           │
         │                     │ stock           │
         │                     │ categoryId (FK) │
         │                     │ supplierId (FK) │
         │                     │ isDropship      │
         │                     └─────────────────┘
         │                              │
         │                              │
         │                     ┌─────────────────┐
         │                     │    CATEGORY     │
         │                     ├─────────────────┤
         │                     │ id (PK)         │
         │                     │ name            │
         │                     │ slug            │
         │                     │ parentId (FK)   │
         │                     │ image           │
         │                     └─────────────────┘
         │
         │                     ┌─────────────────┐
         └────────────────────>│    ACCOUNT      │
                               ├─────────────────┤
                               │ id (PK)         │
                               │ userId (FK)     │
                               │ provider        │
                               │ providerId      │
                               └─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│   WISHLIST      │     │    SUPPLIER     │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │
│ userId (FK)     │     │ name            │
│ productId (FK)  │     │ apiKey          │
│ createdAt       │     │ apiUrl          │
└─────────────────┘     │ isActive        │
                        │ syncInterval    │
                        └─────────────────┘
```

### 4.2 Prisma Schema Design

```prisma
// User & Authentication
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  role          Role      @default(USER)
  emailVerified DateTime?
  accounts      Account[]
  sessions      Session[]
  orders        Order[]
  wishlist      WishlistItem[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// Product Catalog
model Category {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  description String?
  image       String?
  parentId    String?
  parent      Category? @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryHierarchy")
  products    Product[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Product {
  id          String          @id @default(cuid())
  name        String
  description String          @db.Text
  price       Decimal         @db.Decimal(10, 2)
  stock       Int             @default(0)
  images      String[]
  categoryId  String?
  category    Category?       @relation(fields: [categoryId], references: [id])
  supplierId  String?
  supplier    Supplier?       @relation(fields: [supplierId], references: [id])
  isDropship  Boolean         @default(false)
  sku         String?         @unique
  weight      Decimal?        @db.Decimal(8, 2)
  dimensions  Json?
  tags        String[]
  rating      Decimal?        @db.Decimal(2, 1)
  reviews     Int             @default(0)
  orderItems  OrderItem[]
  wishlist    WishlistItem[]
  isActive    Boolean         @default(true)
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
  
  @@index([categoryId])
  @@index([isDropship])
  @@index([isActive])
}

// Order Management
model Order {
  id              String      @id @default(cuid())
  userId          String
  user            User        @relation(fields: [userId], references: [id])
  items           OrderItem[]
  total           Decimal     @db.Decimal(10, 2)
  status          OrderStatus @default(PENDING)
  shippingAddress Json
  paymentMethod   String
  paymentStatus   PaymentStatus @default(PENDING)
  razorpayOrderId String?
  razorpayPaymentId String?
  supplierOrders  SupplierOrder[]
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  @@index([userId])
  @@index([status])
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int
  price     Decimal @db.Decimal(10, 2)
  name      String  // Snapshot of product name at order time
}

// Wishlist
model WishlistItem {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  
  @@unique([userId, productId])
}

// Dropshipping
model Supplier {
  id            String    @id @default(cuid())
  name          String
  type          SupplierType
  apiKey        String?   @db.Text
  apiSecret     String?   @db.Text
  apiUrl        String?
  isActive      Boolean   @default(true)
  syncInterval  Int       @default(60) // minutes
  lastSyncAt    DateTime?
  products      Product[]
  orders        SupplierOrder[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model SupplierOrder {
  id              String    @id @default(cuid())
  orderId         String
  order           Order     @relation(fields: [orderId], references: [id])
  supplierId      String
  supplier        Supplier  @relation(fields: [supplierId], references: [id])
  supplierOrderId String?
  trackingNumber  String?
  status          SupplierOrderStatus @default(PENDING)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

// Enums
enum Role {
  USER
  ADMIN
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}

enum SupplierType {
  DEODAP
  INDIAMART
  TRADEINDIA
}

enum SupplierOrderStatus {
  PENDING
  CONFIRMED
  SHIPPED
  DELIVERED
  CANCELLED
}
```

---

## 🔌 5. API DESIGN

### 5.1 REST API Structure

```
/api/v1
├── /auth
│   ├── GET  /session           → Get current session
│   └── POST /signout           → Sign out user
│
├── /products
│   ├── GET  /                 → List products (with filters)
│   ├── GET  /:id              → Get product details
│   └── GET  /categories       → List categories
│
├── /cart
│   ├── GET    /               → Get cart items
│   ├── POST   /add            → Add item to cart
│   ├── PUT    /:id            → Update item quantity
│   └── DELETE /:id            → Remove item from cart
│
├── /wishlist
│   ├── GET    /               → Get wishlist items
│   ├── POST   /add            → Add to wishlist
│   └── DELETE /:id            → Remove from wishlist
│
├── /orders
│   ├── GET  /                 → List user orders
│   ├── GET  /:id              → Get order details
│   └── POST /                 → Create new order
│
├── /checkout
│   └── POST /                 → Create Razorpay order
│
├── /webhooks
│   └── POST /razorpay         → Razorpay payment webhook
│
├── /suppliers
│   └── POST /:id/sync         → Sync supplier inventory
│
└── /cron
    └── GET  /sync-inventory    → Automated inventory sync
```

### 5.2 API Response Format

```typescript
// Success Response
interface ApiResponse<T> {
  success: true
  data: T
  message?: string
  meta?: {
    page: number
    limit: number
    total: number
  }
}

// Error Response
interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, string[]>
  }
}

// Example: Product List Response
{
  "success": true,
  "data": {
    "products": [...],
    "filters": {
      "categories": [...],
      "priceRange": { "min": 0, "max": 1000 }
    }
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

### 5.3 Dropshipping API (Java Backend)

```java
// Supplier Client Interface
public interface SupplierClient {
    // Inventory
    List<SupplierProduct> getProducts();
    SupplierProduct getProduct(String sku);
    int checkStock(String sku);
    
    // Orders
    DropshipOrderResponse placeOrder(DropshipOrderRequest request);
    OrderStatusResponse getOrderStatus(String orderId);
    boolean cancelOrder(String orderId);
}

// REST Endpoints (Spring Boot)
@RestController
@RequestMapping("/api/v1/suppliers/{supplierId}")
public class SupplierController {
    
    @GetMapping("/products")
    public ResponseEntity<List<SupplierProduct>> getProducts(
        @PathVariable String supplierId
    ) {
        // Implementation
    }
    
    @PostMapping("/orders")
    public ResponseEntity<DropshipOrderResponse> placeOrder(
        @PathVariable String supplierId,
        @RequestBody DropshipOrderRequest request
    ) {
        // Implementation
    }
    
    @PostMapping("/inventory/sync")
    public ResponseEntity<InventorySyncResult> syncInventory(
        @PathVariable String supplierId
    ) {
        // Implementation
    }
}
```

---

## 📱 6. MOBILE APP DESIGN (React Native)

### 6.1 Navigation Structure

```
Mobile App Navigation
├── RootStack
│   ├── TabNavigator (Bottom Tabs)
│   │   ├── HomeTab
│   │   │   └── HomeScreen
│   │   ├── CategoriesTab
│   │   │   └── CategoriesScreen
│   │   ├── CartTab
│   │   │   └── CartScreen
│   │   └── MenuTab
│   │       └── MenuScreen
│   └── ProductStack
│       └── ProductDetailScreen
```

### 6.2 Screen Designs

#### HomeScreen
```typescript
// Layout Structure
<SafeAreaView>
  <ScrollView>
    {/* Header */}
    <Header title="DS3 Store" />
    
    {/* Banner Carousel */}
    <BannerCarousel data={banners} />
    
    {/* Categories Horizontal Scroll */}
    <CategoryScroll categories={categories} />
    
    {/* Featured Products */}
    <Section title="Featured">
      <ProductGrid products={featured} />
    </Section>
    
    {/* Trending Products */}
    <Section title="Trending">
      <ProductGrid products={trending} />
    </Section>
  </ScrollView>
</SafeAreaView>
```

#### ProductCard Mobile Design
```typescript
// Component Structure
<TouchableOpacity onPress={onPress}>
  <View style={styles.card}>
    {/* Image with Wishlist Button */}
    <View style={styles.imageContainer}>
      <Image source={product.image} style={styles.image} />
      <TouchableOpacity style={styles.wishlistButton}>
        <HeartIcon filled={isWishlisted} />
      </TouchableOpacity>
      {/* DropShip Badge */}
      {product.isDropship && (
        <View style={styles.dropshipBadge}>
          <Text>DropShip</Text>
        </View>
      )}
    </View>
    
    {/* Product Info */}
    <View style={styles.info}>
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>₹{product.price}</Text>
      <View style={styles.rating}>
        <StarIcon />
        <Text>{product.rating}</Text>
      </View>
    </View>
    
    {/* Add to Cart Button */}
    <TouchableOpacity style={styles.addToCart}>
      <Text>Add to Cart</Text>
    </TouchableOpacity>
  </View>
</TouchableOpacity>
```

### 6.3 Mobile Design System

```typescript
// theme.ts
export const theme = {
  colors: {
    primary: '#7c3aed',
    primaryLight: '#a78bfa',
    background: '#f8fafc',
    card: '#ffffff',
    text: '#1e293b',
    textMuted: '#64748b',
    border: '#e2e8f0',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
  },
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
  },
}
```

---

## 🎮 7. GAMING INTEGRATION DESIGN

### 7.1 Dungeon Raid Feature

```
Dungeon Raid System
├── Game Loop
│   ├── Entry
│   │   └── Select Dungeon
│   ├── Combat
│   │   ├── Turn-based
│   │   ├── Loot Drops
│   │   └── Boss Battles
│   └── Rewards
│       ├── Mystery Boxes
│       ├── In-game Currency
│       └── Store Discounts
│
└── Integration
    ├── Mystery Box → Store Product
    ├── Loot → Inventory
    └── Achievements → Rewards
```

---

## 🔄 8. STATE MANAGEMENT DESIGN

### 8.1 Client State (React Hooks)

```typescript
// useCart Hook
const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([])
  
  // Actions
  const addItem = (product: Product) => {...}
  const removeItem = (id: string) => {...}
  const updateQuantity = (id: string, qty: number) => {...}
  const clearCart = () => {...}
  
  // Derived State
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = items.length
  
  return { items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }
}

// useWishlist Hook
const useWishlist = () => {
  const [wishlist, setWishlist] = useState<string[]>([])
  
  const toggleWishlist = (productId: string) => {...}
  const isInWishlist = (productId: string) => wishlist.includes(productId)
  
  return { wishlist, toggleWishlist, isInWishlist }
}
```

### 8.2 Server State (SWR/React Query Pattern)

```typescript
// Data Fetching Pattern
const useProducts = (filters: ProductFilters) => {
  const { data, error, isLoading } = useSWR(
    ['/api/products', filters],
    ([url, filters]) => fetchProducts(url, filters)
  )
  
  return { products: data, error, isLoading }
}
```

---

## 🔐 9. SECURITY DESIGN

### 9.1 Authentication Flow

```
Authentication Flow
├── OAuth (Google)
│   ├── User clicks "Sign in with Google"
│   ├── Redirect to Google OAuth
│   ├── Callback to /api/auth/callback/google
│   ├── Create/Update user in DB
│   └── Set session cookie
│
├── Session Management
│   ├── JWT stored in encrypted cookie
│   ├── Session validation on API routes
│   └── Automatic refresh
│
└── Protected Routes
    ├── Middleware checks session
    ├── Redirect to login if unauthenticated
    └── Continue to protected page
```

### 9.2 Payment Security (Razorpay)

```
Payment Flow
├── Server Side (Secure)
│   ├── Create order with Razorpay API
│   ├── Store order ID in database
│   └── Return order ID to client
│
├── Client Side
│   ├── Initialize Razorpay checkout
│   ├── User completes payment
│   └── Razorpay returns payment ID
│
├── Webhook Verification
│   ├── Razorpay sends webhook
│   ├── Verify signature
│   ├── Update order status
│   └── Fulfill order
```

---

## 🚀 10. DEPLOYMENT ARCHITECTURE

### 10.1 Production Architecture

```
Production Deployment
├── Web (Vercel)
│   ├── Edge Network (CDN)
│   ├── Serverless Functions
│   ├── Edge Middleware
│   └── Image Optimization
│
├── Database (Supabase/Neon)
│   ├── PostgreSQL Primary
│   ├── Read Replicas
│   └── Automated Backups
│
├── Storage (Cloudflare R2/AWS S3)
│   ├── Product Images
│   ├── User Uploads
│   └── Static Assets
│
├── Microservice (Java)
│   ├── Deployed on Railway/Fly.io
│   ├── Docker Container
│   └── Health Checks
│
└── Monitoring
    ├── Vercel Analytics
    ├── Sentry Error Tracking
    └── Uptime Monitoring
```

---

## 📊 11. DESIGN TOKENS SUMMARY

```css
:root {
  /* Colors */
  --color-primary: #7c3aed;
  --color-primary-dark: #6d28d9;
  --color-secondary: #a78bfa;
  --color-background: #0f172a;
  --color-surface: #1e293b;
  --color-text: #f8fafc;
  --color-text-muted: #94a3b8;
  
  /* Spacing */
  --space-unit: 4px;
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  
  /* Typography */
  --font-heading: 'Cinzel', serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-glow: 0 0 20px rgba(139, 92, 246, 0.5);
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 300ms ease;
  --transition-slow: 500ms ease;
}
```

---

## ✅ 12. DESIGN CHECKLIST

### Visual Design
- [x] Color palette defined
- [x] Typography system established
- [x] Spacing scale defined
- [x] Border radius system
- [x] Shadow system
- [x] Dark theme (DS3 World)
- [x] Light theme (DS3 Store)

### Component Design
- [x] Shadcn UI components
- [x] Button variants
- [x] Card components
- [x] Input components
- [x] Badge components
- [x] Layout components

### Architecture
- [x] System architecture diagram
- [x] Domain architecture
- [x] Microservices design
- [x] Component hierarchy
- [x] Database schema
- [x] API structure

### Mobile Design
- [x] Navigation structure
- [x] Screen layouts
- [x] Component designs
- [x] Theme configuration

### Security
- [x] Authentication flow
- [x] Payment security
- [x] Session management

---

**Document Version:** 1.0.0  
**Last Updated:** April 17, 2026  
**Author:** techdhamo  
**Repository:** https://github.com/techdhamo/DS3
