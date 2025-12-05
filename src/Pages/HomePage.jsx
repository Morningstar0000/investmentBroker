"use client"
import React from 'react';
import { Button } from '../components/ui/Button';
import { Users, FileText, Headphones, Shield, MessageCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export default function HomePage({ onNavigate }) {
  // ... existing code ...

  return (
    <>
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Large circular background */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/4 w-[800px] h-[800px] bg-gray-200 rounded-full opacity-60"></div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main heading */}
          <h1 className="text-6xl md:text-5xl font-bold text-gray-900 mb-10 leading-tight">
            Upgrade the way
            <br />
            you trade
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-2xl mx-auto leading-relaxed">
            Trade with the world's largest retail copy broker and benefit from
            <br />
            better-than-market conditions.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-32">
            <Button 
             onClick={() => onNavigate("register")}
            className="bg-blue-400 hover:bg-blue-600 text-black font-semibold px-8 py-3 text-lg rounded-md">
              Register
            </Button>
          
          </div>
        </div>

        {/* Trust indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <div className="flex items-center gap-3 text-gray-700">
            <Users className="w-6 h-6" />
            <span className="font-medium">1 million+ active traders</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <FileText className="w-6 h-6" />
            <span className="font-medium">Multiple regulatory licenses</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <Headphones className="w-6 h-6" />
            <span className="font-medium">24/7 customer support</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <Shield className="w-6 h-6" />
            <span className="font-medium">PCI DSS certified</span>
          </div>
        </div>
      </div>

      {/* Chat bubble */}
      {/* <div className="fixed bottom-8 right-8 z-20">
        <div className="bg-yellow-400 hover:bg-yellow-500 rounded-full p-4 shadow-lg cursor-pointer transition-colors">
          <MessageCircle className="w-6 h-6 text-black" />
        </div>
      </div> */}
    </div>
    {/* 2nd section */}
     <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden my-10 ">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-slate-900/80" />

      <div className="relative z-10 container mx-auto px-4 py-16 align-element">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance">
            Thrive in the gold, oil, and crypto markets
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto text-balance">
            Trading conditions can make or break a strategy, that's why you need the best.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center max-w-7xl mx-auto">
          {/* Left Features */}
          <div className="space-y-12">
            {/* Instant withdrawals */}
            <div className="text-center lg:text-right">
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                  Withdrawals
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Instant withdrawals</h3>
              <p className="text-slate-300 text-balance">Funds sent within seconds with seamless transactions.*</p>
            </div>

            {/* Unmatched spreads */}
            <div className="text-center lg:text-right">
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">Spreads</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Unmatched spreads</h3>
              <p className="text-slate-300 text-balance">
                Trade with spreads that remain tight and stable, even during market news.
              </p>
            </div>

            {/* 24/7 live support */}
            <div className="text-center lg:text-right">
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">Support</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">24/7 live support</h3>
              <p className="text-slate-300 text-balance">
                Get answers in minutes via phone, live chat or email, in 14 languages.
              </p>
            </div>
          </div>

          {/* Center Phone Mockup */}
          <div className="flex justify-center">
            <div className="relative">
              <img
                src="/behnam.png"
                alt="Trading platform mobile app showing gold chart"
                className="w-80 h-auto max-w-full"
              />
            </div>
          </div>

          {/* Right Features */}
          <div className="space-y-12">
            {/* copy  trading */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">Swaps</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Advance copy trading</h3>
              <p className="text-slate-300 text-balance">
                Copy trade from our expert investors with ease.
              </p>
            </div>

            {/* More speed, less slippage */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                  Execution speed
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-3">More speed, less slippage</h3>
              <p className="text-slate-300 text-balance">Trade with the most precise execution* in the market.</p>
            </div>

            {/* Best-in-class security */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                  Account security
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Best-in-class security</h3>
              <p className="text-slate-300 text-balance">
                Trade knowing your funds are kept safe in separate client accounts, with ironclad data protection.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    {/* 3rd section */}
    <main className="min-h-screen bg-gray-50 align-element">
      <div className=" px-4 py-20 my-5 space-y-24 ">
        {/* First section - Trading opportunity */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 items-center ">
          {/* Left side - Device mockups */}
          <div className="relative order-2 lg:order-1">
            <img
              src="/trading.jpg"
              alt="Trading platform interfaces on multiple devices"
              width={600}
              height={400}
              className="w-full h-auto object-contain rounded-xl"
              priority="true"
            />
          </div>

          {/* Right side - Content */}
          <div className="space-y-8 order-1 lg:order-2 text-center lg:text-left">
            <div className="hidden lg:flex items-center">
              <div className="grid grid-cols-5 gap-1 w-12 h-12">
                {/* Top row */}
                <div></div>
                <div></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div></div>
                <div></div>

                {/* Second row */}
                <div></div>
                <div></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div></div>
                <div></div>

                {/* Middle row - horizontal line */}
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>

                {/* Fourth row */}
                <div></div>
                <div></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div></div>
                <div></div>

                {/* Bottom row */}
                <div></div>
                <div></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div></div>
                <div></div>
              </div>
            </div>

            {/* Main heading */}
            <div className="space-y-4">
              <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 leading-tight">Seize every opportunity</h1>
              <p className="text-base lg:text-lg text-gray-600 leading-relaxed">
                Copy Trade online anytime, anywhere. On webApp and desktop.
              </p>
            </div>
          </div>
        </div>

        {/* Second section - Security */}
        <div className="grid lg:grid-cols-2 gap-12 items-center md:py-11">
          {/* Left side - Security content */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="hidden lg:flex items-center">
              <div className="grid grid-cols-5 gap-1 w-12 h-12">
                {/* Shield pattern with dots */}
                <div></div>
                <div></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div></div>
                <div></div>

                <div></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div></div>

                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>

                <div></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div></div>

                <div></div>
                <div></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div></div>
                <div></div>
              </div>
            </div>

            {/* Security heading */}
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Your security is our priority
              </h2>
              <p className="text-base lg:text-lg text-gray-600 leading-relaxed">
                From secure payments to negative balance protection, you are covered from every angle.
              </p>
            </div>

            {/* Security links */}
            <div className="space-y-4">
             
              <div className="flex items-center justify-center lg:justify-start text-orange-500 hover:text-orange-600 transition-colors cursor-pointer group">
                <span onClick={()=> onNavigate('clients-protection')} 
                className="text-base lg:text-lg">Client protection</span>
                <svg
                  className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
             
            </div>
          </div>

          {/* Right side - Professional image */}
          <div className="relative">
            <img
              src="/touch-screen.jpg"
              alt="Professional trader analyzing data on multiple screens"
              width={600}
              height={500}
              className="w-full h-auto object-cover rounded-xl"
            />
          </div>
        </div>
      </div>
    </main>
   
    </>
 
  );
}