import React from "react";
import { Button } from "../components/ui/Button";
import { MessageCircle, Shield } from "lucide-react";

export default function ClientProtection({onNavigate}) {
    return (
        <>
            <section id="clients-protection">
                <div className=" min-h-screen relative overflow-hidden">
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{
                            backgroundImage: "url('/cyber.jpg')",
                        }}
                    >
                        {/* Dark overlay for better text contrast */}
                        <div className="absolute inset-0 bg-slate-900/60" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex items-center min-h-screen">
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="align-element">
                                {/* Main Heading */}
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold text-white leading-tight mb-6">
                                    <span className="text-balance">
                                        Account security and client protection
                                    </span>
                                </h1>

                                {/* Description */}
                                <p className="text-lg sm:text-xl lg:text-2xl text-white/90 leading-relaxed mb-8 max-w-xl">
                                    <span className="">
                                        We are committed to providing a secure investing
                                        environment, with enhanced account safety, fund protection
                                        and 24/7 customer support to put you at ease.
                                    </span>
                                </p>

                                {/* Call to Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Button
                                     onClick={() => onNavigate("register")}
                                        size="lg"
                                        className="bg-blue-400 hover:bg-blue-600 text-black font-semibold px-8 py-3 text-lg"
                                    >
                                        Register
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* 2nd section */}
                <div className="align-element px-4 sm:px-6 lg:px-8 ">
                    <p className="text-center text-wrap py-16">
                        We understand the concern for investment scams and risks for
                        traders, which is why your peace of mind is our top priority. At
                        Aureus capital, you’ll benefit from state-of-the-art security measures to
                        ensure that your account, financial information and personal details
                        remain protected at all times. From advanced encryption technologies
                        to stringent authentication protocols, we continuously strive to
                        uphold the highest standards of account security so you can trade
                        with confidence.
                    </p>
                </div>
                {/* 3rd section */}
                <main className="min-h-screen bg-white">
                    <div className="container mx-auto px-4 py-12 lg:py-20">
                        {/* Header Section */}
                        <div className="text-center mb-16 lg:mb-20">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 text-balance">
                                Your trusted broker
                            </h1>
                            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto text-pretty leading-relaxed">
                                As a licensed and regulated leading global broker, we offer you multiple account security options.
                            </p>
                        </div>

                        {/* Main Content Section */}
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center align-element">
                            {/* Left Content */}
                            <div className="space-y-12 ">
                                {/* Regulations Section */}
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <Shield className="w-5 h-5 text-gray-700" />
                                        </div>
                                    </div>
                                    <div>
                                        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">Regulations</h2>
                                        <p className="text-gray-600 leading-relaxed">
                                            If you've been wondering, 'is <span className="text-blue-600 font-medium">Aureus capital legit</span>
                                            ?', you can rest assured that we are a licensed broker,{" "}
                                            <span className="text-blue-600 font-medium">regulated</span> by leading international governing bodies
                                            globally.
                                        </p>
                                    </div>
                                </div>

                                {/* Account Security Section */}
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <Shield className="w-5 h-5 text-gray-700" />
                                        </div>
                                    </div>
                                    <div>
                                        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">Account security</h2>
                                        <p className="text-gray-600 leading-relaxed">
                                            Prevent unauthorized access to your secure trading accounts by choosing a security option – either
                                            phone or email – during your registration process.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Illustration */}
                            <div className="relative">
                                <div className="bg-gray-100 rounded-2xl p-8 lg:p-12 relative overflow-hidden">
                                    {/* Security Badge */}
                                    <div className="absolute top-6 right-6 bg-white rounded-full px-4 py-2 shadow-sm flex items-center gap-2">
                                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                            <Shield className="w-2.5 h-2.5 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">Security</div>
                                            <div className="text-xs text-gray-500">2FA and more</div>
                                        </div>
                                    </div>

                                    {/* Regulated Badge */}
                                    <div className="absolute bottom-20 left-8 bg-white rounded-lg px-4 py-3 shadow-sm flex items-center gap-3">
                                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">Regulated</div>
                                            <div className="text-xs text-gray-500">by FSA and more</div>
                                        </div>
                                    </div>

                                    {/* 3D Chart Illustration */}
                                    <div className="flex items-center justify-center h-64 lg:h-80">
                                        <div className="relative">
                                            {/* Candlestick Chart Representation */}
                                            <div className="flex items-end gap-2 opacity-60">
                                                <div className="w-3 h-16 bg-gray-400 rounded-sm"></div>
                                                <div className="w-3 h-24 bg-gray-500 rounded-sm"></div>
                                                <div className="w-3 h-12 bg-gray-400 rounded-sm"></div>
                                                <div className="w-3 h-32 bg-gray-600 rounded-sm"></div>
                                                <div className="w-3 h-20 bg-gray-500 rounded-sm"></div>
                                                <div className="w-3 h-28 bg-gray-400 rounded-sm"></div>
                                            </div>

                                            {/* 3D Platform Base */}
                                            <div className="absolute -bottom-4 -left-8 w-32 h-8 bg-gray-300 rounded-full transform perspective-1000 rotate-x-60 opacity-40"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                {/* 4th section */}
                <div className="min-h-screen bg-background p-6 md:p-12">
                    <div className="align-element">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
                            {/* Left Column - Title and Description */}
                            <div className="space-y-6">
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                                    Platform protection
                                </h1>
                                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                                    Learn more about our safe and secure trading conditions and protection measures for a smooth trading
                                    experience.
                                </p>
                            </div>

                            {/* Right Column - Features */}
                            <div className="space-y-8 md:space-y-12">
                                {/* Web attack protection */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                    <h2 className="text-xl md:text-2xl font-semibold text-foreground">Web attack protection</h2>
                                    <p className="text-gray-600 leading-relaxed">
                                        Our Web Application Firewall (WAF) protects our infrastructure and servers from web threats like SQL
                                        injection, XSS attacks, and blocks harmful traffic.
                                    </p>
                                </div>

                                {/* Trading platform fault tolerance */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                    <h2 className="text-xl md:text-2xl font-semibold text-foreground">Trading platform fault tolerance</h2>
                                    <p className="text-gray-600 leading-relaxed">
                                        Our DDoS protection offers you seamless order execution, 24/7 access to your Personal Area, swift
                                        deposits and withdrawals, and uninterrupted servers' operations.
                                    </p>
                                </div>

                                {/* Zero trust approach */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                    <h2 className="text-xl md:text-2xl font-semibold text-foreground">Zero trust approach</h2>
                                    <p className="text-gray-600 leading-relaxed">
                                        Our Zero Trust model assumes minimal trust for company IT components and includes features like user and
                                        device authentication, restricted access, and network monitoring.
                                    </p>
                                </div>

                                {/* Bug Bounty program */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                    <h2 className="text-xl md:text-2xl font-semibold text-foreground">Bug Bounty program</h2>
                                    <p className="text-gray-600 leading-relaxed">
                                        You gain an extra layer of security with our Bug Bounty program, where we invite external experts to
                                        examine our platforms and give reviews that help us improve our services.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                    <h2 className="text-xl md:text-2xl font-semibold text-foreground">Cybersecurity knowledge and skills</h2>
                                    <p className="text-gray-600 leading-relaxed">
                                        Our Information Security Team are continuously updated on security technology and upgrade their skills through workshops and certifications.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* 5th section */}
                <main className="min-h-screen bg-white">
                    <div className=" align-element">
                        {/* Header Section */}
                        <div className="text-center mb-16 lg:mb-20">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 text-balance">
                                Payment protection
                            </h1>
                        </div>

                        {/* Main Content Section */}
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                            {/* Left Content */}
                            <div className="space-y-12">
                                {/* Regulations Section */}
                                <div className="flex gap-4">
                                    <div>
                                        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">Seamless withdrawals </h2>
                                        <p className="text-gray-600 leading-relaxed">
                                            Say goodbye to uncertainty. Your money is yours whenever you want it, even on weekends. Get deposits and withdrawals approved automatically, with no delays or hassle¹.
                                        </p>
                                    </div>
                                </div>

                                {/* Account Security Section */}
                                <div className="flex gap-4">
                                    <div>
                                        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">Segregated accounts</h2>
                                        <p className="text-gray-600 leading-relaxed">
                                            We safeguard your funds by holding them segregated from our own. Our funds are always larger, so we can meet your withdrawal needs any time of the day.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div>
                                        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">3D Secure verification</h2>
                                        <p className="text-gray-600 leading-relaxed">
                                            We ensure secure trading with 3D Secure debit card transactions, offering extra fraud protection through a one-time pin sent to your phone.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div>
                                        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">PCI DSS compliance</h2>
                                        <p className="text-gray-600 leading-relaxed">
                                            We're fully audited, adhering to all PCI DSS needs, ensuring card data security through effective management, custom security settings, and regular vulnerability scans
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Illustration */}
                            <div className="relative">
                                <div className="bg-gray-100 rounded-2xl p-8 lg:p-12 relative overflow-hidden">
                                    {/* Security Badge */}
                                    <div className="absolute top-6 right-6 bg-white rounded-full px-4 py-2 shadow-sm flex items-center gap-2">
                                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                            <Shield className="w-2.5 h-2.5 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">Security</div>
                                            <div className="text-xs text-gray-500">2FA and more</div>
                                        </div>
                                    </div>

                                    {/* Regulated Badge */}
                                    <div className="absolute bottom-20 left-8 bg-white rounded-lg px-4 py-3 shadow-sm flex items-center gap-3">
                                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">Regulated</div>
                                            <div className="text-xs text-gray-500">by FSA and more</div>
                                        </div>
                                    </div>

                                    {/* 3D Chart Illustration */}
                                    <div className="flex items-center justify-center h-64 lg:h-80">
                                        <div className="relative">
                                            {/* Candlestick Chart Representation */}
                                            <div className="flex items-end gap-2 opacity-60">
                                                <div className="w-3 h-16 bg-gray-400 rounded-sm"></div>
                                                <div className="w-3 h-24 bg-gray-500 rounded-sm"></div>
                                                <div className="w-3 h-12 bg-gray-400 rounded-sm"></div>
                                                <div className="w-3 h-32 bg-gray-600 rounded-sm"></div>
                                                <div className="w-3 h-20 bg-gray-500 rounded-sm"></div>
                                                <div className="w-3 h-28 bg-gray-400 rounded-sm"></div>
                                            </div>

                                            {/* 3D Platform Base */}
                                            <div className="absolute -bottom-4 -left-8 w-32 h-8 bg-gray-300 rounded-full transform perspective-1000 rotate-x-60 opacity-40"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                {/* 6th section */}
                <div className="min-h-screen bg-background p-4 md:p-8 lg:p-12">
                    <div className="align-element py-16">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
                            {/* Left Column - Heading */}
                            <div className="lg:sticky lg:top-8">
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight text-balance">
                                    Take steps to protect yourself
                                </h1>
                            </div>

                            {/* Right Column - Content */}
                            <div className="space-y-8">
                                {/* Description */}
                                <p className="text-base md:text-lg text-muted-foreground leading-relaxed text-pretty">
                                    Enhance your security by familiarizing yourself with practices that help prevent unauthorized account
                                    activities, scams, and fraud attempts.
                                </p>

                                {/* Security Steps */}
                                <div className="space-y-6">
                                    {/* Step 1 */}
                                    <div className="flex gap-4 items-start">
                                        <div className="flex-shrink-0 w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center">
                                            <span className="text-black font-semibold text-sm">1</span>
                                        </div>
                                        <p className="text-sm md:text-base text-foreground leading-relaxed text-pretty pt-1">
                                            Keep your Personal Area private, never share access and personal documents. Don't let anyone use your
                                            name to create an Aureus capital account or share your security information.
                                        </p>
                                    </div>

                                    {/* Step 2 */}
                                    <div className="flex gap-4 items-start">
                                        <div className="flex-shrink-0 w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center">
                                            <span className="text-black font-semibold text-sm">2</span>
                                        </div>
                                        <p className="text-sm md:text-base text-foreground leading-relaxed text-pretty pt-1">
                                            Only conduct financial activities within the Aureus capital Personal Area and avoid transferring funds to
                                            unknown accounts.
                                        </p>
                                    </div>

                                    {/* Step 3 */}
                                    <div className="flex gap-4 items-start">
                                        <div className="flex-shrink-0 w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center">
                                            <span className="text-black font-semibold text-sm">3</span>
                                        </div>
                                        <p className="text-sm md:text-base text-foreground leading-relaxed text-pretty pt-1">
                                            Be vigilant towards suspicious links and unknown sources, never provide sensitive information if
                                            contacted unexpectedly, and reach out directly to Aureus capital via live chat or email for any concerns about
                                            fraudulent activities or message authenticity.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
