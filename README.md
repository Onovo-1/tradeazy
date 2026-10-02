# Tradeazy 🛒

A multi-vendor marketplace built with **Spring Boot + React + MySQL**.

Tradeazy connects buyers and sellers. Sellers pay a monthly **Rent** subscription to list products. Buyers browse, save favorites, negotiate, and purchase via in-app chat.

---

## 📋 Project Status

| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Foundation — Spring Boot, React, MySQL, CORS | ✅ Complete |
| 1 | Authentication & Roles — JWT, register, login, protected routes | ✅ Complete |
| 2 | Products & Categories — CRUD, images, seller dashboard | ✅ Complete |
| 3 | Search & Filters | 🔜 Planned |
| 4 | Favorites | 🔜 Planned |
| 5 | Rent / Subscriptions | 🔜 Planned |
| 6 | Orders | 🔜 Planned |
| 7 | Chat | 🔜 Planned |
| 8 | Offers & Payment Plans | 🔜 Planned |
| 9 | Admin Dashboard | 🔜 Planned |
| 10 | Polish, Tests, Deployment | 🔜 Planned |

---

## 🏗️ Tech Stack

### Backend
- **Java 21**
- **Spring Boot 4.x**
- Spring Web (REST APIs)
- Spring Data JPA + Hibernate
- Spring Security + JWT (jjwt)
- MySQL 8
- Maven
- Lombok
- Swagger / OpenAPI (springdoc)

### Frontend
- **React 18** with **Vite**
- React Router v6
- Axios
- Tailwind CSS

### Database
- MySQL 8 (`tradeazy_db`)

---

## 🚀 Getting Started

### Prerequisites

- **Java 21** (JDK)
- **Maven** (or use the included `./mvnw`)
- **Node.js 20+**
- **MySQL 8**

### 1. Database Setup

```sql
CREATE DATABASE tradeazy_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'tradeazy_user'@'localhost' IDENTIFIED BY 'TradeazyDev@123';
GRANT ALL PRIVILEGES ON tradeazy_db.* TO 'tradeazy_user'@'localhost';
FLUSH PRIVILEGES;