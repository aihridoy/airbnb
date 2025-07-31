# 🏠 AirBnB Clone - Hotel Booking App

![AirBnB Homepage](https://i.ibb.co.com/VYRC3pY9/airbnb.png)

A feature-rich Airbnb clone built with **Next.js**, **React**, and **MongoDB**, delivering a seamless user experience for property rentals and bookings. Explore, book, and manage listings with ease!

---

## 📖 Overview

This project is a full-stack web application that replicates core Airbnb functionalities, including property listings, user authentication, booking management, and responsive design. Built with modern web development practices, it emphasizes scalability, performance, and user experience.

---

## ✨ Key Features

### 🔐 Authentication & User Management
- Secure sign-up/login via **NextAuth** with Google OAuth integration
- MongoDB-based user data storage and session management

### 🏘️ Property Management
- Browse and search rental listings with advanced filtering
- Dynamic property data rendering from MongoDB
- High-quality image galleries with carousel functionality

### 📅 Booking System
- Intuitive date selection using `react-datepicker`
- Real-time availability checking
- Booking confirmation with PDF generation capabilities

### 🎨 User Interface
- Fully responsive design optimized for all devices
- Modern UI crafted with **Tailwind CSS**
- Interactive image carousels powered by **Swiper**
- Toast notifications for enhanced user feedback

### 🔧 Additional Features
- Social sharing integration with `next-share`
- Email notifications via **Resend API**
- Image optimization with `sharp` for fast loading
- PDF booking confirmations using `pdf-lib`

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Components**: Custom React components

### Backend
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js with Google Provider
- **API**: Next.js API Routes

### Key Dependencies
| Package | Purpose |
|---------|---------|
| `react-datepicker` | Date selection for bookings |
| `swiper` | Image carousels and sliders |
| `react-toastify` | User notifications |
| `pdf-lib` | PDF generation for bookings |
| `next-share` | Social media sharing |
| `sharp` | Image optimization |
| `date-fns` | Date manipulation utilities |
| `resend` | Email service integration |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (local or cloud instance)
- **npm** or **yarn** package manager

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/airbnb-clone.git
   cd airbnb-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory and add the following variables:

   ```env
   # Database Configuration
   MONGODB_CONNECTION_STRING=mongodb+srv://[username]:[password]@cluster0.suylw.mongodb.net/airbnb

   # Image Upload Service
   IMGBB_API_KEY=your_imgbb_api_key_here

   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here

   # NextAuth Configuration
   AUTH_SECRET=your_nextauth_secret_here

   # Application URLs
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

   # Email Service
   NEXT_PUBLIC_RESEND_API_KEY=your_resend_api_key_here
   ```

   > ⚠️ **Security Note**: Never commit your `.env.local` file to version control. The actual API keys and secrets should be obtained from their respective service providers.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   
   Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

---

## 📁 Project Structure

```
airbnb-clone/
├── app/                    # Next.js 14 App Router
├── components/             # Reusable React components
├── lib/                    # Utility functions and configurations
├── models/                 # MongoDB/Mongoose models
├── public/                 # Static assets
├── styles/                 # Global styles and Tailwind config
├── .env.local             # Environment variables
├── next.config.js         # Next.js configuration
└── package.json           # Project dependencies
```

---

## 🔐 Environment Variables Guide

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_CONNECTION_STRING` | MongoDB database connection URL | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `IMGBB_API_KEY` | Image upload service API key | Get from [ImgBB](https://api.imgbb.com/) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Get from [Google Console](https://console.developers.google.com/) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Get from [Google Console](https://console.developers.google.com/) |
| `AUTH_SECRET` | NextAuth secret for JWT encryption | Generate with `openssl rand -base64 32` |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL for API calls | `http://localhost:3000` (development) |
| `NEXT_PUBLIC_RESEND_API_KEY` | Email service API key | Get from [Resend](https://resend.com/) |




## 🙏 Acknowledgments

- **Airbnb** for the inspiration and design reference
- **Next.js Team** for the amazing framework
- **MongoDB** for the flexible database solution
- **Tailwind CSS** for the utility-first CSS framework

---

## 📞 Support

If you have any questions or need help with setup, please open an issue in the GitHub repository.

**Happy Coding! 🚀**