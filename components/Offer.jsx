/* eslint-disable react/no-unescaped-entities */
'use client';
import React, { useState, useEffect } from "react";

const Offer = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 32,
    seconds: 15
  });

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let newSeconds = prev.seconds - 1;
        let newMinutes = prev.minutes;
        let newHours = prev.hours;
        let newDays = prev.days;

        if (newSeconds < 0) {
          newSeconds = 59;
          newMinutes -= 1;
        }
        if (newMinutes < 0) {
          newMinutes = 59;
          newHours -= 1;
        }
        if (newHours < 0) {
          newHours = 23;
          newDays -= 1;
        }

        return {
          days: newDays,
          hours: newHours,
          minutes: newMinutes,
          seconds: newSeconds
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const offers = [
    {
      title: "Summer Escape",
      discount: "25%",
      description: "Beach resorts & coastal getaways",
      color: "from-blue-400 to-blue-600"
    },
    {
      title: "City Breaks",
      discount: "20%",
      description: "Urban adventures & luxury stays",
      color: "from-purple-400 to-purple-600"
    },
    {
      title: "Mountain Retreats",
      discount: "30%",
      description: "Cozy cabins & scenic lodges",
      color: "from-green-400 to-green-600"
    }
  ];

  return (
    <div className="bg-gradient-to-br from-slate-50 to-white py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <span className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></span>
            Limited Time Offers
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Special Summer Deals
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Save up to 30% on handpicked hotels and resorts. Don't miss out on these incredible deals!
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Deals expire in:</h3>
          </div>
          <div className="flex justify-center items-center space-x-4">
            {Object.entries(timeLeft).map(([unit, value]) => (
              <div key={unit} className="text-center">
                <div className="bg-primary text-white rounded-lg p-3 min-w-[60px] shadow-md">
                  <div className="text-2xl font-bold">{value.toString().padStart(2, '0')}</div>
                </div>
                <div className="text-sm text-gray-600 mt-1 capitalize">{unit}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Offers Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {offers.map((offer, index) => (
            <div 
              key={index} 
              className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary/30 hover:-translate-y-1"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${offer.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{offer.title}</h3>
                  <div className={`bg-gradient-to-r ${offer.color} text-white px-3 py-1 rounded-full text-sm font-bold shadow-md`}>
                    {offer.discount} OFF
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{offer.description}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Free cancellation
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          {/* <button className="group relative bg-primary text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:bg-primary/90">
            <span className="relative z-10 flex items-center">
              Explore All Deals
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button> */}
          
          <div className="mt-6 flex justify-center items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Secure booking
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Best price guarantee
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              24/7 support
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Offer;