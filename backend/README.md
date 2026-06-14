# Gawali Fresh — Backend API

## Setup Steps

### 1. Install Node.js
Download from: https://nodejs.org (LTS version)

### 2. Install dependencies
```bash
cd backend
npm install
```

### 3. Setup MongoDB (Free)
- Go to: https://www.mongodb.com/atlas
- Create free account → New Project → Free Cluster
- Get connection string → replace in .env

### 4. Create .env file
```bash
cp .env.example .env
# Edit .env with your MongoDB URI
```

### 5. Run the server
```bash
npm run dev
```

### 6. Create first Admin (run once)
```
POST http://localhost:5000/api/auth/setup
```

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/login | Admin login |
| POST | /api/auth/setup | Create first admin (once) |
| GET  | /api/dashboard | Dashboard stats |
| GET  | /api/customers | All customers |
| POST | /api/customers | Add customer |
| PUT  | /api/customers/:id | Update customer |
| GET  | /api/orders | All orders |
| GET  | /api/orders/today | Today's orders |
| POST | /api/orders | Create order |
| PUT  | /api/orders/:id/status | Update order status |
| GET  | /api/subscriptions | All subscriptions |
| POST | /api/subscriptions | Create subscription |
| PUT  | /api/subscriptions/:id/pause | Pause subscription |
| PUT  | /api/subscriptions/:id/resume | Resume subscription |
| POST | /api/subscriptions/generate-orders | Generate today's orders |
| GET  | /api/delivery/list | Today's delivery list |
| PUT  | /api/delivery/:id/delivered | Mark delivered |
| GET  | /api/delivery/summary | Today's summary |
