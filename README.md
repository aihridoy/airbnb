# AirBnB: Hotel Booking App

![AirBnB Homepage](https://i.ibb.co.com/VYRC3pY9/airbnb.png)

A feature-rich Airbnb clone built with **Next.js**, **React**, and **MongoDB**, delivering a seamless user experience for property rentals and bookings. Explore, book, and manage listings with ease!

## 📖 Overview

This project is a full-stack web application mimicking core Airbnb functionalities, including property listings, user authentication, booking management, and responsive design. It showcases modern web development practices with a focus on scalability and performance.

## ✨ Features

- **User Authentication**: Secure sign-up/login via NextAuth with MongoDB integration.
- **Property Listings**: Browse, filter, and search rental listings with dynamic data rendering.
- **Booking System**: Seamless booking experience with date selection using `react-datepicker`.
- **Responsive Design**: Mobile-friendly UI crafted with Tailwind CSS and Swiper for carousels.
- **Social Sharing**: Integrated sharing options with `next-share` for enhanced user engagement.
- **Notifications**: User feedback with `react-toastify` for smooth interactions.
- **PDF Generation**: Generate booking confirmations using `pdf-lib` (optional feature).
- **Image Optimization**: High-quality visuals with `sharp` for fast loading.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: MongoDB, Mongoose, NextAuth
- **Libraries**:
  - `react-datepicker`: For booking date selection
  - `swiper`: For image carousels
  - `react-toastify`: For notifications
  - `pdf-lib`: For PDF generation
  - `next-share`: For social sharing
  - `sharp`: For image optimization
  - `date-fns`: For date manipulation
  - `resend`: For email integration
- **Tools**: ESLint, PostCSS

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/airbnb-clone.git
   cd airbnb-clone
2. **Install dependencies**:
   ```bash
   npm install
   npm run dev
3. **Build for Production**:
   ```bash
   npm run build
   npm start
### ENV File

.env.local:
```
MONGODB_CONNECTION_STRING=
IMGBB_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
AUTH_SECRET=
NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_RESEND_API_KEY=
