"use client";
import React from "react";
import { Percent, ShieldCheck, BadgeCheck, Clock } from "lucide-react";

const OFFERS = [
  {
    title: "Summer Escape",
    discount: "25%",
    description: "Beach resorts & coastal getaways",
  },
  {
    title: "City Breaks",
    discount: "20%",
    description: "Urban adventures & luxury stays",
  },
  {
    title: "Mountain Retreats",
    discount: "30%",
    description: "Cozy cabins & scenic lodges",
  },
];

const Offer = () => {
  return (
    <div className="bg-surface-alt py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-brass-light/40 text-brass-dark px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Percent className="w-4 h-4 mr-2" />
            Limited Time Offers
          </div>
          <h2 className="font-serif text-4xl md:text-5xl text-ink mb-4">
            Special Summer Deals
          </h2>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Save up to 30% on handpicked hotels and resorts.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {OFFERS.map((offer, index) => (
            <div
              key={index}
              className="group relative bg-surface rounded-xl border border-hairline hover:shadow-luxe transition-all duration-300 overflow-hidden hover:-translate-y-1"
            >
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-ink">{offer.title}</h3>
                  <div className="bg-brass-dark text-cream px-3 py-1 rounded-full text-sm font-bold">
                    {offer.discount} OFF
                  </div>
                </div>
                <p className="text-muted mb-4">{offer.description}</p>
                <div className="flex items-center text-sm text-muted">
                  <BadgeCheck className="w-4 h-4 mr-1 text-brass-dark" />
                  Free cancellation
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <div className="mt-6 flex flex-wrap justify-center items-center gap-6 text-sm text-muted">
            <div className="flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1 text-brass-dark" />
              Secure booking
            </div>
            <div className="flex items-center">
              <BadgeCheck className="w-4 h-4 mr-1 text-brass-dark" />
              Best price guarantee
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1 text-brass-dark" />
              24/7 support
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Offer;
