# 🚀 DS3 World Deployment Checklist

## Phase 1: Database Setup (Neon.tech)
- [ ] Sign up at [Neon.tech](https://neon.tech/)
- [ ] Create project: `ds3-world-prod`
- [ ] Copy pooled connection string
- [ ] Update local `.env` with Neon URL
- [ ] Run: `npx prisma db push`
- [ ] Run: `npx prisma db seed`
- [ ] Verify data in Neon dashboard

## Phase 2: Vercel Deployment
- [ ] Push code to GitHub repository
- [ ] Import repo to Vercel
- [ ] Configure environment variables:
  - [ ] `DATABASE_URL` (Neon connection string)
  - [ ] `NEXTAUTH_URL` (https://ds3.world)
  - [ ] `NEXTAUTH_SECRET` (generate random string)
  - [ ] `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`
  - [ ] `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`
  - [ ] `RAZORPAY_WEBHOOK_SECRET` (from Razorpay webhook)
- [ ] Deploy to Vercel
- [ ] Verify build succeeds

## Phase 3: Razorpay Configuration
- [ ] Sign up at [Razorpay.com](https://razorpay.com/)
- [ ] Get Test Keys from Dashboard → API Keys
- [ ] Go to Developers → Webhooks
- [ ] Add endpoint: `https://your-app.vercel.app/api/webhooks/razorpay`
- [ ] Select events: `payment.captured`, `payment.failed`
- [ ] Reveal webhook secret
- [ ] Update `RAZORPAY_WEBHOOK_SECRET` in Vercel
- [ ] Redeploy Vercel app

## Phase 4: Domain Setup
- [ ] Add `ds3.world` to Vercel domains
- [ ] Add `www.ds3.world` to Vercel domains
- [ ] Update DNS records to Vercel nameservers
- [ ] Verify domain propagation
- [ ] Test SSL certificates

---

# 🧪 QA Testing Checklist

## 🔐 Authentication Testing
- [ ] Sign up with Google OAuth
- [ ] Sign up with Magic Email Link
- [ ] Verify user profile creation
- [ ] Test session persistence
- [ ] Test sign out functionality
- [ ] Verify protected routes redirect to sign in

## 🛒 E-commerce Testing
- [ ] Browse mystery boxes
- [ ] View product details with drop chances
- [ ] Add box to cart
- [ ] Proceed to checkout (Test Mode)
- [ ] Complete Stripe test payment
- [ ] Verify webhook fulfillment (check logs)
- [ ] Confirm items in user inventory
- [ ] Verify Mana points awarded
- [ ] Test order history display

## 🎮 Gamification Testing
- [ ] View Mana balance in dashboard
- [ ] Join Dungeon Raid (500 Mana fee)
- [ ] Verify Mana deduction
- [ ] Test room capacity (10 players)
- [ ] Verify countdown timer
- [ ] Test synchronized unboxing
- [ ] Verify Boss Loot winner selection
- [ ] Test insufficient Mana handling
- [ ] Test authentication requirement

## 📱 Cross-Platform Testing
- [ ] Desktop Chrome/Chrome
- [ ] Desktop Safari
- [ ] Mobile Safari
- [ ] Mobile Chrome
- [ ] Tablet responsiveness
- [ ] Touch interactions
- [ ] Loading states

## 🔧 Technical Testing
- [ ] Database connections under load
- [ ] Stripe webhook reliability
- [ ] WebSocket connections
- [ ] Error handling (404, 500 pages)
- [ ] Environment variable security
- [ ] SSL certificate validity
- [ ] Page load speed

## 📊 Business Logic Testing
- [ ] Probability engine fairness
- [ ] Inventory deduction accuracy
- [ ] Mana calculation (10% of purchase)
- [ ] Guild rank progression
- [ ] Order status updates
- [ ] Email delivery (Magic Links)

---

# 🚨 Critical Issues to Check

## Payment Flow
- [ ] Stripe webhook receives events
- [ ] Database transactions complete successfully
- [ ] Users receive items immediately after payment
- [ ] No duplicate orders created
- [ ] Inventory counts are accurate

## Real-time Features
- [ ] Dungeon Raid rooms update in real-time
- [ ] WebSocket connections stable
- [ ] Multiple users can join simultaneously
- [ ] Countdown timer syncs across clients

## Security
- [ ] Environment variables not exposed
- [ ] Authentication works on all routes
- [ ] Stripe webhook signature verification
- [ ] No client-side probability manipulation

---

# 📱 Launch Day Checklist

## Pre-Launch
- [ ] All QA tests passed
- [ ] Stripe test mode working
- [ ] Database seeded with products
- [ ] Domains configured and working
- [ ] SSL certificates valid
- [ ] Error monitoring set up

## Go-Live
- [ ] Switch Stripe to live mode
- [ ] Update environment variables
- [ ] Redeploy to Vercel
- [ ] Test live payment with small amount
- [ ] Monitor webhook logs
- [ ] Check error rates

## Post-Launch
- [ ] Monitor Stripe dashboard
- [ ] Check Vercel analytics
- [ ] Monitor database performance
- [ ] Watch for error spikes
- [ ] Customer support ready

---

# 🆘 Emergency Rollback Plan

If critical issues discovered:
1. Revert Stripe to test mode
2. Deploy previous working version
3. Notify customers of temporary downtime
4. Investigate logs and fix issues
5. Test thoroughly before re-launch

---

*Last Updated: 2024-03-18*
*Version: 1.0*
