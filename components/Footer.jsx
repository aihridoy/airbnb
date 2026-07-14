"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Facebook, Instagram, Twitter, Send } from "lucide-react";
import { fadeUp, stagger } from "@/lib/motion";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Footer = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!EMAIL_REGEX.test(email)) {
      setStatus("error");
      setMessage("Please enter a valid email address");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to subscribe");
      }

      setStatus("success");
      setMessage(data.message || "Subscribed successfully");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={stagger}
      className="bg-ink text-cream border-t border-brass-dark"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-20 py-16 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={fadeUp}>
          <Image
            src="/logo.svg"
            alt="Hotel Logo"
            width={140}
            height={40}
            className="h-8 w-auto brightness-0 invert"
          />
          <p className="mt-4 text-sm text-cream/70 max-w-xs">
            Curated stays, booked with ease. Luxury hospitality, wherever you land.
          </p>
          <div className="mt-6 flex items-center gap-4">
            <a href="#" aria-label="Facebook" className="text-cream/70 hover:text-brass-light transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" aria-label="Instagram" className="text-cream/70 hover:text-brass-light transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" aria-label="Twitter" className="text-cream/70 hover:text-brass-light transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </motion.div>

        <motion.div variants={fadeUp}>
          <h3 className="font-serif text-lg mb-4">Explore</h3>
          <ul className="space-y-3 text-sm text-cream/70">
            <li><Link href="/" className="hover:text-brass-light transition-colors">Home</Link></li>
            <li><Link href="/bookings" className="hover:text-brass-light transition-colors">Bookings</Link></li>
            <li><Link href="/wishlists" className="hover:text-brass-light transition-colors">Wishlists</Link></li>
            <li><Link href="/add-hotel" className="hover:text-brass-light transition-colors">Add your property</Link></li>
          </ul>
        </motion.div>

        <motion.div variants={fadeUp}>
          <h3 className="font-serif text-lg mb-4">Account</h3>
          <ul className="space-y-3 text-sm text-cream/70">
            <li><Link href="/login" className="hover:text-brass-light transition-colors">Login</Link></li>
            <li><Link href="/register" className="hover:text-brass-light transition-colors">Register</Link></li>
            <li><Link href="/dashboard" className="hover:text-brass-light transition-colors">Dashboard</Link></li>
          </ul>
        </motion.div>

        <motion.div variants={fadeUp}>
          <h3 className="font-serif text-lg mb-4">Stay in the loop</h3>
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="flex-1 min-w-0 bg-cream/10 border border-cream/20 rounded-full px-4 py-2 text-sm text-cream placeholder:text-cream/50 focus:outline-none focus:ring-2 focus:ring-brass"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              aria-label="Subscribe"
              className="shrink-0 bg-brass-dark hover:bg-brass w-9 h-9 rounded-full grid place-items-center transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-cream" />
            </button>
          </form>
          {message && (
            <p className={`mt-2 text-xs ${status === "error" ? "text-red-400" : "text-brass-light"}`}>
              {message}
            </p>
          )}
        </motion.div>
      </div>

      <div className="border-t border-cream/10 py-6 px-4 md:px-8 lg:px-20 text-center text-xs text-cream/50">
        © {new Date().getFullYear()} AirBnB. All rights reserved.
      </div>
    </motion.footer>
  );
};

export default Footer;
