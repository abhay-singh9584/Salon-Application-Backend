****#Salon Application — Backend****

A scalable backend system for a salon booking platform that enables 
customers to discover nearby salons, book services, and manage appointments.

---

## Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose)
- **Caching:** Redis
- **Authentication:** JWT (JSON Web Tokens)
- **Cloud Storage:** AWS S3
- **Architecture:** Layered (Controller → Service → Repository)

---

## Features
- JWT based authentication & authorization
- Role based access control (Customer / Merchant)
- Geospatial search — find nearby salons using MongoDB 2dsphere indexes
- Redis caching for frequently accessed data (nearby salons, service catalog)
- AWS S3 integration for media uploads using pre-signed URLs
- Optimized MongoDB queries with proper indexing

---

## Folder Structure
src/
├── controllers/     # Handles HTTP requests and responses
├── services/        # Business logic layer
├── repositories/    # Database interaction layer
├── models/          # Mongoose schemas
├── middleware/      # Auth, error handling, validation
├── routes/          # API route definitions
└── utils/           # Helper functions

---

## Architecture Overview
Client Request
↓
Routes
↓
Controllers        ← Handles req/res
↓
Services          ← Business logic
↓
Repositories        ← DB queries
↓
MongoDB

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login and get JWT token |

### Salons
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/salons/nearby | Get nearby salons by location |
| GET | /api/salons/:id | Get salon details |
| POST | /api/salons | Create salon (Merchant only) |

### Services
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/services/:salonId | Get services of a salon |
| POST | /api/services | Add service (Merchant only) |

---

## Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB
- Redis
- AWS Account (for S3)

### Steps
```bash
# Clone the repo
git clone https://github.com/abhay-singh9584/Salon-Application-Backend.git

# Install dependencies
cd Salon-Application-Backend
npm install

# Setup environment variables
cp .env.example .env
# Fill in your values in .env

# Start the server
npm run dev
```

---

## Environment Variables
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
REDIS_HOST=localhost
REDIS_PORT=6379
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_BUCKET_NAME=your_bucket_name

---

## Key Technical Decisions

**Why Redis Caching?**
Nearby salon queries are frequent and expensive — caching 
them in Redis reduced MongoDB load by ~40%

**Why Layered Architecture?**
Separating Controller, Service, and Repository makes the 
codebase testable, maintainable, and easy to scale

**Why MongoDB 2dsphere Index?**
Enables efficient geospatial queries to find salons within 
a radius of the user's location with low latency

---

## Author
**Abhay Singh**  
[LinkedIn](https://linkedin.com/in/abhay-singh05) | 
[GitHub](https://github.com/abhay-singh9584)
