# 🏗️ Tech Stack - Bot Auto Order

## 📋 Overview

Bot Telegram untuk penjualan produk digital dengan sistem pembayaran otomatis menggunakan QRIS dan payment gateway Indonesia.

**Versi:** 5.2.0  
**Arsitektur:** Monolithic (Single file bot.js ~15k lines)  
**Runtime:** Node.js v20.19.5

---

## 🎯 Core Technologies

### 1. **Telegram Bot Framework**
- **Telegraf** v4.16.3
  - Framework untuk Telegram Bot API
  - Middleware-based architecture
  - Support untuk commands, actions, callbacks
  - Long-polling mode (bukan webhook)

### 2. **Database**
- **MongoDB** v7.0.0 (Driver)
- **Mongoose** v8.3.2 (ODM)
  - Schema-based modeling
  - Validation & middleware
  - Query builder
  - Connection: MongoDB Atlas (Cloud)

### 3. **Web Server & API**
- **Express.js** v4.19.2
  - REST API endpoints
  - Admin panel backend
  - Webhook receivers
  - Static file serving

- **Socket.IO** v4.7.5
  - Real-time monitoring dashboard
  - Live stats broadcast
  - Admin notifications

### 4. **Security & Authentication**
- **bcryptjs** v3.0.3
  - Password hashing
  - Admin authentication

- **speakeasy** v2.0.0
  - 2FA (Two-Factor Authentication)
  - TOTP (Time-based OTP)

- **basic-auth** v2.0.1
  - HTTP Basic Authentication
  - Monitor panel auth

- **express-rate-limit** v8.2.1
  - API rate limiting
  - DDoS protection

### 5. **Payment Gateways**

#### QRIS Generators:
- **autoft-qris** v0.0.13
  - Generate QRIS dengan logo & theme
  - Support theme1 & theme2

- **@misterdevs/qris-static-to-dynamic** v1.1.2
  - Convert static QRIS ke dynamic
  - Custom amount injection

- **qrcode** v1.5.3
  - QR code generation (fallback)
  - PNG/SVG output

#### Payment Providers:
- **pakasir-client** v1.0.0
  - Pakasir payment gateway
  - QRIS Indonesia

- **Custom Integrations:**
  - Qiospay (QRIS)
  - Sanpay (QRIS)
  - Midtrans (QRIS)
  - Tripay (QRIS)
  - VioletPay (QRIS)

### 6. **Image Processing**
- **canvas** v2.11.2
  - Server-side canvas rendering
  - QR code customization
  - Image manipulation

- **jimp** v0.22.12
  - Image processing library
  - Logo overlay on QR
  - Resize & composite

### 7. **Utilities**
- **axios** v1.13.2
  - HTTP client
  - Payment gateway API calls

- **body-parser** v1.20.2
  - Parse JSON/URL-encoded bodies
  - Webhook payload parsing

- **multer** v2.0.2
  - File upload handling
  - Multipart form data

- **dotenv** v16.4.5
  - Environment variables
  - Configuration management

- **crypto** v1.0.1 (Built-in)
  - Encryption/decryption
  - HMAC signatures
  - API key generation

- **check-disk-space** v3.4.0
  - Monitor disk usage
  - System health check

### 8. **Push Notifications**
- **web-push** v3.6.7
  - Browser push notifications
  - VAPID authentication
  - Admin alerts

---

## 🗂️ Project Structure

```
BOT-AUTO-ORDER/
├── bot.js                    # Main bot file (~15k lines)
├── bot.js.backup            # Backup before changes
├── package.json             # Dependencies
├── .env                     # Environment config
│
├── models/                  # Mongoose schemas
│   ├── User.js             # User data
│   ├── Product.js          # Products
│   ├── Transaction.js      # Transactions
│   ├── Admin.js            # Admin accounts
│   ├── Reseller.js         # Reseller accounts
│   ├── ResellerTransaction.js
│   ├── Voucher.js          # Discount vouchers
│   ├── Setting.js          # Bot settings
│   ├── SecurityLog.js      # Security audit
│   ├── PushSubscription.js # Push notif
│   └── Banner.js           # Promo banners
│
├── services/               # Business logic
│   └── payment/           # Payment gateway services
│       ├── index.js       # Payment manager
│       ├── pakasir.js     # Pakasir integration
│       ├── qiospay.js     # Qiospay integration
│       ├── sanpay.js      # Sanpay integration
│       ├── midtrans.js    # Midtrans integration
│       ├── tripay.js      # Tripay integration
│       ├── violetpay.js   # VioletPay integration
│       ├── polling.js     # Payment polling
│       └── README.md      # Payment docs
│
├── features/              # Feature modules
│   └── pterodactyl.js    # Pterodactyl panel integration
│
├── routes/               # API routes
│   └── resellerApi.js   # H2H Reseller API
│
├── utils/               # Utilities
│   ├── encryption.js   # Encrypt/decrypt
│   ├── i18n.js        # Multi-language
│   └── constants.js   # Constants
│
├── monitor/            # Monitoring
│   └── monitorService.js
│
├── public/            # Frontend files
│   ├── admin.html    # Admin panel
│   ├── monitor.html  # Monitor dashboard
│   ├── index.html    # Landing page
│   ├── css/
│   └── js/
│
├── storage/          # Encrypted storage
│   ├── .encryption_key
│   └── .encryption_iv
│
└── assets/          # Static assets
    ├── logo.png
    └── icons/
```

---

## 🔄 Architecture Pattern

### **Monolithic Architecture**
- Single `bot.js` file (~15,816 lines)
- All handlers in one place
- Direct database access
- No separation of concerns

**Pros:**
- ✅ Simple deployment
- ✅ Easy to understand flow
- ✅ Fast development

**Cons:**
- ❌ Hard to maintain
- ❌ Difficult to test
- ❌ Code duplication
- ❌ Tight coupling

---

## 🔌 Integration Points

### 1. **Telegram Bot API**
- Long-polling (not webhook)
- Commands, callbacks, inline keyboards
- Message handling
- File uploads

### 2. **MongoDB Atlas**
- Cloud database
- Connection pooling
- Indexes for performance
- TTL for auto-cleanup

### 3. **Payment Gateways**
- REST API calls
- Webhook receivers
- HMAC signature validation
- Polling for status updates

### 4. **Pterodactyl Panel**
- Client API (manage servers)
- Application API (create users)
- Auto-create game servers
- Expiry scheduler

### 5. **Push Notifications**
- VAPID protocol
- Browser notifications
- Admin alerts

---

## 🚀 Deployment

### **Current Setup:**
- Manual deployment
- Direct `node bot.js`
- No process manager
- No auto-restart

### **Recommended:**
- Use PM2 for process management
- Docker containerization
- CI/CD pipeline
- Load balancer for scaling

---

## 📊 Performance Characteristics

### **Strengths:**
- ✅ Fast response time (in-memory state)
- ✅ Real-time payment polling
- ✅ Socket.IO for live updates
- ✅ Rate limiting protection

### **Weaknesses:**
- ❌ Single-threaded (Node.js limitation)
- ❌ No horizontal scaling
- ❌ Memory leaks potential (userStates)
- ❌ No caching layer

### **Bottlenecks:**
- Database queries (no caching)
- Payment gateway API calls
- Image processing (QR generation)
- Large file operations

---

## 🔐 Security Features

1. **Authentication:**
   - bcrypt password hashing
   - 2FA with TOTP
   - Session management
   - API key authentication

2. **Protection:**
   - Rate limiting (API & Bot)
   - Anti-spam middleware
   - Input validation
   - SQL injection prevention (Mongoose)

3. **Encryption:**
   - Sensitive data encryption
   - HMAC signature validation
   - Secure key storage

4. **Audit:**
   - Security logs
   - Admin activity tracking
   - IP logging

---

## 📈 Scalability Considerations

### **Current Limitations:**
- Single instance only
- No load balancing
- In-memory state (not distributed)
- No message queue

### **To Scale:**
1. Refactor to microservices
2. Add Redis for caching & sessions
3. Use message queue (RabbitMQ/Kafka)
4. Implement horizontal scaling
5. Add CDN for static assets
6. Database read replicas

---

## 🛠️ Development Tools

- **nodemon** v3.1.11 (Dev server with auto-reload)
- **dotenv** (Environment management)
- Custom restart scripts (Windows batch)

---

## 📝 Code Quality

### **Current State:**
- No unit tests
- No integration tests
- No linting (ESLint)
- No code formatter (Prettier)
- Minimal documentation

### **Recommendations:**
- Add Jest for testing
- Implement ESLint + Prettier
- Add JSDoc comments
- Create API documentation
- Setup CI/CD pipeline

---

## 🎯 Tech Stack Summary

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Runtime** | Node.js v20 | JavaScript runtime |
| **Bot Framework** | Telegraf v4 | Telegram bot |
| **Database** | MongoDB + Mongoose | Data persistence |
| **Web Server** | Express.js | REST API |
| **Real-time** | Socket.IO | Live updates |
| **Security** | bcrypt + speakeasy | Auth & 2FA |
| **Payment** | Multiple QRIS | Payment processing |
| **Image** | Canvas + Jimp | QR generation |
| **Monitoring** | Custom service | Health checks |

---

## 🔮 Future Improvements

1. **Architecture:**
   - Refactor to modular structure
   - Separate concerns (MVC pattern)
   - Add service layer

2. **Performance:**
   - Implement caching (Redis)
   - Add message queue
   - Optimize database queries

3. **DevOps:**
   - Docker containerization
   - PM2 process manager
   - CI/CD pipeline
   - Monitoring (Prometheus/Grafana)

4. **Code Quality:**
   - Add testing (Jest)
   - Linting (ESLint)
   - Documentation (JSDoc)
   - Type safety (TypeScript?)

---

**Last Updated:** 2026-02-03  
**Bot Version:** 4.5.0
