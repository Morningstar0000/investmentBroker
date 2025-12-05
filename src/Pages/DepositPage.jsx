import React from "react";
import { Button } from "../components/ui/Button";
import{ FAQ } from "../components/Faq";

export default function DepositPage({onNavigate}) {

    return (
        <>
            <section id="deposit-withdrawal">
                <div className=" min-h-screen relative overflow-hidden">
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{
                            backgroundImage: "url('/pound.jpg')",
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
                                <h1 className="text-4xl sm:text-5xl lg:text-4xl xl:text-5xl font-semibold text-white leading-tight mb-6">
                                    <span className="text-balance">
                                        Your money, when you want it
                                    </span>
                                </h1>

                                {/* Description */}
                                <p className="text-lg sm:text-xl lg:text-2xl text-white/90 leading-relaxed mb-8 max-w-xl">
                                    <span className="">
                                        Stay in control with 24/7 access to your funds. Get requests approved automatically using secure local and global payment methods.
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

                <div className="min-h-screen bg-white">
                    <div className="align-element py-16">
                        {/* Header Section */}
                        <div className="text-center mb-16 ">
                            <h1 className="text-3xl md:text-5xl lg:text-4xl font-semibold text-gray-900 mb-6 text-balance">
                                Frictionless experience from start to finish
                            </h1>
                            <p className="text-lg text-gray-600 max-w-3xl mx-auto ">
                                Benefit from our unrivaled payments ecosystem: seamless deposits via global and local payment systems, 24/7
                                access and hassle-free release of funds.
                            </p>
                        </div>

                        {/* Main Content Section */}
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                            {/* Left Column - Features */}
                            <div className="space-y-12">
                                {/* Feature 1 */}
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                                        Payment methods for your convenience
                                    </h2>
                                    <p className="text-gray-600 text-lg">
                                        Global, local and secure payment methods for seamless deposits and withdrawals.
                                    </p>
                                </div>

                                {/* Feature 2 */}
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Your money is yours. Period</h2>
                                    <p className="text-gray-600 text-lg">
                                        Funds sent within seconds, even on weekends, with instant withdrawals.

                                    </p>
                                </div>

                                {/* Feature 3 */}
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Your funds, commission-free</h2>
                                    <p className="text-gray-600 text-lg">
                                        Deposit and withdraw without worrying about charges
                                        . We'll cover third-party costs for you.
                                    </p>
                                </div>
                            </div>

                            {/* Right Column - Image with Currency Badges */}
                            <div className="relative">
                                <div className="relative rounded-2xl overflow-hidden">
                                    <img
                                        src="anthony.jpg"
                                        alt="Professional man working on laptop"
                                        className="w-full h-auto object-cover"
                                    />

                                    {/* Currency Badges */}
                                    <div className="absolute top-8 right-8">
                                        <div className="flex items-center bg-white rounded-full px-3 py-2 shadow-lg">
                                            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center mr-2">
                                                <div className="w-3 h-3 bg-yellow-400 rounded-full relative">
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">EUR</span>
                                        </div>
                                    </div>

                                    <div className="absolute top-1/2 left-8 transform -translate-y-1/2">
                                        <div className="flex items-center bg-white rounded-full px-3 py-2 shadow-lg">
                                            <div className="w-5 h-5 rounded-full bg-blue-800 flex items-center justify-center mr-2 relative overflow-hidden">
                                                <div className="absolute inset-0 bg-red-600"></div>
                                                <div className="absolute inset-0 bg-white transform rotate-45 origin-center scale-75"></div>
                                                <div className="absolute inset-0 bg-red-600 transform -rotate-45 origin-center scale-50"></div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">GBP</span>
                                        </div>
                                    </div>

                                    <div className="absolute bottom-8 right-8">
                                        <div className="flex items-center bg-white rounded-full px-3 py-2 shadow-lg">
                                            <div className="w-5 h-5 rounded-full bg-blue-800 flex items-center justify-center mr-2 relative overflow-hidden">
                                                <div className="absolute inset-0 bg-red-600"></div>
                                                <div className="absolute top-0 left-0 right-0 h-1 bg-red-600"></div>
                                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600"></div>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-2 h-2 bg-blue-800 rounded-full relative">
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="w-1 h-1 bg-white"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">USD</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/*  */}
                <section className="bg-white py-12 px-4 sm:px-6 lg:px-8">
                    <div className="align-element">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
                            {/* Left Column - Main Heading */}
                            <div className="lg:pr-8">
                                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight text-balance">
                                    Your money is safe with us
                                </h2>
                            </div>

                            {/* Right Column - Content */}
                            <div className="space-y-8">
                                {/* Intro Paragraph */}
                                <p className="text-gray-600 text-base sm:text-lg leading-relaxed text-pretty">
                                    As the biggest retail copy trade broker in the world, we apply multiple layers of security to keep your
                                    funds safe and instantly available to you upon request.
                                </p>

                                {/* Security Features */}
                                <div className="space-y-6">
                                    {/* Segregated accounts */}
                                    <div className="space-y-2">
                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Segregated accounts</h3>
                                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed text-pretty">
                                            We keep funds in segregated accounts in multiple tier-1 banks to ensure top security and peace of
                                            mind.
                                        </p>
                                    </div>

                                    {/* Secure withdrawal transactions */}
                                    <div className="space-y-2">
                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Secure withdrawal transactions</h3>
                                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed text-pretty">
                                            Your withdrawals are safe and secure, protected by one-time password verification methods.
                                        </p>
                                    </div>

                                    {/* PCI DSS certified */}
                                    <div className="space-y-2">
                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">PCI DSS certified</h3>
                                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed text-pretty">
                                            We have successfully passed PCI DSS compliance requirements for cardholder data security.
                                        </p>
                                    </div>

                                    {/* 3D Secure payments */}
                                    <div className="space-y-2">
                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">3D Secure payments</h3>
                                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed text-pretty">
                                            We provide 3D Secure payments for all major credit cards such as Visa and Mastercard.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/*  */}
                <main className="px-4 py-12 md:py-16 lg:py-20">
                    <div className="align-element">
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-8 md:mb-12 text-balance">
                            Deposit your funds in 3 easy steps
                        </h1>

                        <div className="bg-blue-400 rounded-2xl p-6 md:p-8 lg:p-12">
                            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                                {/* Hero Image */}
                                <div className="order-2 lg:order-1">
                                    <img
                                        src="/kevin01.jpg"
                                        alt="Person using mobile banking app"
                                        width={500}
                                        height={400}
                                        className="w-full h-auto rounded-xl"
                                    />
                                </div>

                                {/* Steps */}
                                <div className="order-1 lg:order-2 space-y-4 md:space-y-6">
                                    <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
                                        <div className="text-sm text-gray-500 mb-2">Step 1</div>
                                        <h3 className="font-semibold text-gray-900 text-sm md:text-base text-pretty">
                                            Register and verify your account
                                        </h3>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
                                        <div className="text-sm text-gray-500 mb-2">Step 2</div>
                                        <h3 className="font-semibold text-gray-900 text-sm md:text-base text-pretty">
                                            Choose one of the available payment methods
                                        </h3>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
                                        <div className="text-sm text-gray-500 mb-2">Step 3</div>
                                        <h3 className="font-semibold text-gray-900 text-sm md:text-base text-pretty">
                                            Complete your deposit request
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                {/* Faq */}
                <FAQ/>
            </section>
        </>
    )
}