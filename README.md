# Tradeazy 🛒

A multi-vendor marketplace built with **Spring Boot + React + MySQL**.

Sellers pay a monthly "Rent" to list products. Buyers browse, save favorites, chat with sellers, negotiate prices, place orders, and complete purchases.

---

## 📋 Status

| Phase | What | Status |
|-------|------|--------|
| 0 | Foundation — Spring Boot + React + MySQL + CORS | ✅ |
| 1 | Authentication & Roles — JWT, register, login | ✅ |
| 2 | Products & Categories — CRUD, images, seller dashboard | ✅ |
| 3 | Search & Filters — keyword, price, category, location, condition | ✅ |
| 4 | Favorites — save/unsave products | ✅ |
| 5 | Rent Subscriptions — monthly seller fee with mock payment | ✅ |
| 6 | Orders — buyer purchase flow, seller order management | ✅ |
| 7 | Chat — buyer ↔ seller messaging with unread tracking | ✅ |
| 8 | Offers — structured price negotiation inside chat | ✅ |
| 9 | Admin Dashboard — stats, user management, product moderation | ✅ |
| 10 | Polish, Tests, Deployment Prep | ✅ |

**13+ unit tests passing.**

---

## 🏗️ Tech Stack

**Backend**
- Java 21 · Spring Boot 4 · Spring Web · Spring Data JPA · Spring Security
- Hibernate ORM · MySQL 8 · Maven
- JWT (jjwt) · Lombok · SpringDoc OpenAPI / Swagger UI

**Frontend**
- React 18 · Vite · React Router v6 · Axios · Tailwind CSS

**Database**
- MySQL 8 (`tradeazy_db`) — 12 tables

---

## 🚀 Getting Started

### Prerequisites

- Java 21 (JDK)
- Node.js 20+
- MySQL 8

### Database

```sql
CREATE DATABASE tradeazy_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'tradeazy_user'@'localhost' IDENTIFIED BY 'TradeazyDev@123';
GRANT ALL PRIVILEGES ON tradeazy_db.* TO 'tradeazy_user'@'localhost';
FLUSH PRIVILEGES;