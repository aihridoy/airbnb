"use client";
import React, { useState } from "react";
import { Target, Plane, Zap, Map, Loader2, Check } from "lucide-react";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

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

      setIsSubmitted(true);
      setEmail("");

      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } catch (error) {
      setEmailError(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    { icon: Target, title: "Exclusive Deals", description: "Get access to member-only discounts up to 40% off" },
    { icon: Plane, title: "Travel Tips", description: "Expert advice and hidden gems from travel professionals" },
    { icon: Zap, title: "Flash Sales", description: "Be the first to know about limited-time offers" },
    { icon: Map, title: "Destination Guides", description: "Comprehensive guides for your next adventure" },
  ];

  return (
    <div className="bg-ink py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-cream/10 text-brass-light px-4 py-2 rounded-full text-sm font-semibold mb-4">
            Join 50,000+ Happy Travelers
          </div>
          <h2 className="font-serif text-4xl md:text-5xl text-cream mb-4">
            Never Miss a <span className="italic text-brass-light">Deal</span>
          </h2>
          <p className="text-xl text-cream/70 max-w-2xl mx-auto">
            Get exclusive access to flash sales, travel tips, and insider deals
            delivered straight to your inbox
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-16">
          <div className="flex items-center bg-cream/5 rounded-2xl border border-cream/10 overflow-hidden">
            <div className="flex-1 relative">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
                placeholder="Enter your email address"
                className="w-full px-6 py-4 text-cream bg-transparent focus:outline-none placeholder-cream/40"
                required
              />
              {emailError && (
                <div className="absolute -bottom-6 left-0 text-red-400 text-sm">
                  {emailError}
                </div>
              )}
            </div>
            <button
              onClick={handleSubmit}
              disabled={isLoading || isSubmitted}
              className="bg-brass-dark hover:bg-brass text-cream px-8 py-4 font-semibold transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Subscribing...
                </span>
              ) : isSubmitted ? (
                <span className="flex items-center">
                  <Check className="w-4 h-4 mr-2" />
                  Subscribed!
                </span>
              ) : (
                "Subscribe"
              )}
            </button>
          </div>

          {isSubmitted && (
            <div className="mt-6 p-4 bg-cream/5 border border-brass-dark/40 rounded-lg text-center">
              <span className="text-brass-light font-medium">
                Welcome aboard! Check your email to get regular updates.
              </span>
            </div>
          )}

          <div className="mt-6 flex flex-wrap justify-center items-center gap-6 text-sm text-cream/60">
            <span>100% Secure</span>
            <span>No Spam</span>
            <span>Unsubscribe Anytime</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="bg-cream/5 rounded-2xl p-6 border border-cream/10 hover:border-brass-dark/50 transition-all duration-300"
              >
                <Icon className="w-8 h-8 text-brass-light mb-3" />
                <h3 className="text-lg font-semibold text-cream mb-2">{benefit.title}</h3>
                <p className="text-cream/60 text-sm">{benefit.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 bg-cream/5 rounded-2xl p-8 border border-cream/10">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-serif text-brass-light mb-2">50,000+</div>
              <div className="text-cream/60">Happy Subscribers</div>
            </div>
            <div>
              <div className="text-3xl font-serif text-brass-light mb-2">2x/week</div>
              <div className="text-cream/60">Newsletter Frequency</div>
            </div>
            <div>
              <div className="text-3xl font-serif text-brass-light mb-2">$500+</div>
              <div className="text-cream/60">Average Savings</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;
