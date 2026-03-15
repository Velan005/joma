# 🧥 Chic Threads Emporium

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/)

**Chic Threads Emporium** is a premium, full-stack e-commerce experience. Built with a focus on high-end fashion, the platform combines a minimalist design system with powerful features like secure authentication, real-time inventory management, and seamless payment processing.

---

## ✨ Features

- **🛍️ Storefront**: Dynamic product catalog with category-based filtering and real-time search.
- **🔐 Authentication**: Secure user accounts with Role-Based Access Control (RBAC) via NextAuth.
- **🛒 Persistent Cart**: State-of-the-art cart and wishlist management using Zustand.
- **💳 Multi-method Payments**: Fully integrated Razorpay checkout for secure transactions.
- **📊 Admin Dashboard**: Comprehensive management suite for products, orders, and analytics.
- **🖼️ Image Optimization**: Cloudinary integration for lightning-fast media delivery.
- **📱 Responsive Design**: A pixel-perfect experience across all devices.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, Mongoose, NextAuth.js
- **State Management**: Zustand, TanStack Query (v5)
- **Services**: Cloudinary (Images), Razorpay (Payments)
- **UI Components**: Shadcn UI, Lucide Icons, Radix UI

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ 
- MongoDB Atlas Account
- Cloudinary & Razorpay API Keys

### 2. Installation
```bash
git clone https://github.com/your-username/chic-threads.git
cd chic-threads
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory and add your credentials:

```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_auth_secret
NEXTAUTH_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

RAZORPAY_KEY_ID=your_razorpay_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_id
```

### 4. Database Seeding
To initialize the project with default products:
```bash
npm run seed
```

### 5. Start Development
```bash
npm run dev
```

---

## 📂 Project Structure

- `src/app/(store)` - Public shop routes.
- `src/app/(admin)` - Protected management dashboard.
- `src/app/api` - Backend logic and integrations.
- `src/components` - Shared UI elements.
- `src/models` - Database schema definitions.

---

## 📜 License
Distibuted under the MIT License. See `LICENSE` for more information.

---

*Built with ♥ by the Chic Threads Team.*
