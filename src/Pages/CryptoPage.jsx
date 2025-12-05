import React from "react";
import { Button } from "../components/ui/Button";
import { FAQCrypto, FAQDataCommodity } from "../components/Faq";
import { ArrowUpWideNarrow, ShieldOff, TrendingUpDown } from "lucide-react"


export default function CryptoPage({onNavigate}) {

    return (
        <>
            <section id="deposit-withdrawal">
                <div className=" min-h-screen relative overflow-hidden">
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{
                            backgroundImage: "url('/Bitcoin.jpg')",
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
                                        Invest in crypto CFDs with near 0% slippage
                                    </span>
                                </h1>

                                {/* Description */}
                                <p className="text-lg sm:text-xl lg:text-2xl text-white/90 leading-relaxed mb-8 max-w-xl">
                                    <span className="">
                                        Take your crypto trading to the next level with 100% better execution² than the industry standard.
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

                <div className="min-h-screen bg-white align-element">
                    <div className=" px-4 py-16 lg:py-20 lg:my-11">
                        {/* Header Section */}
                        <div className="text-center mb-16 ">
                            <h1 className="text-3xl md:text-5xl lg:text-4xl font-semibold text-gray-900 mb-6 text-balance">
                                Open an account and start trading crypto today
                            </h1>

                        </div>

                        {/* Main Content Section */}
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                            {/* Left Column - Features */}
                            <div className="space-y-12">
                                {/* Feature 1 */}
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                                        Experience crypto copy trading with a reliable platform
                                    </h2>
                                    <p className="text-gray-600 text-lg">
                                        Speculate on the price movements of popular cryptocurrencies on a user-friendly platform and crypto trading app
                                    </p>
                                </div>

                                {/* Feature 2 */}
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Lower your investing costs on bitcoin, ethereum, and other top cryptocurrencies</h2>
                                    <p className="text-gray-600 text-lg">
                                        Trade the volatile crypto trading markets with some of the tightest and most stable spreads on the market, even after major market news.
                                    </p>
                                </div>

                                {/* Feature 3 */}
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Withdraw your earnings in seconds</h2>
                                    <p className="text-gray-600 text-lg">
                                        Make fee-free withdrawals in seconds, any time, using secure local and global payment methods.
                                    </p>
                                </div>
                            </div>

                            {/* Right Column - Image with Currency Badges */}
                            <div className="relative">
                                <div className="relative rounded-2xl overflow-hidden">
                                    <img
                                        src="man.jpg"
                                        alt="Professional man working on laptop"
                                        className="w-full h-auto object-cover"
                                    />

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
                                    Crypto market conditions
                                </h2>
                            </div>

                            {/* Right Column - Content */}
                            <div className="space-y-8">
                                {/* Intro Paragraph */}
                                <p className="text-gray-600 text-base sm:text-lg leading-relaxed text-pretty">
                                    The crypto market is a digital currency market that uses blockchain technology to create new coins and provide users with secure transactions. Trading crypto derivatives allows you to diversify your online portfolio and capitalize on the movements of cryptocurrency prices, whether they’re rising or falling.

                                </p>


                                <div className="space-y-6">
                                    {/* Trading hours */}
                                    <div className="space-y-2">
                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Crypto trading hours</h3>
                                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed text-pretty mb-10">
                                            You can trade cryptocurrencies 24/7 except during server maintenance. We will email you to inform you when this occurs.
                                        </p>
                                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed text-pretty">
                                            The following cryptocurrency pairs are in close-only mode during these periods:
                                        </p>
                                        <ul className="text-gray-600 text-sm sm:text-base leading-relaxed text-pretty list-disc">
                                            <li>Sunday from 20:35 to 21:05: BTCAUD, BTCJPY, BTCCNH, BTCTHB, and BTCZAR.</li>
                                            <li>Thursday from 20:58 to 22:01: BTCXAU and BTCXAG.</li>
                                        </ul>
                                    </div>

                                    {/* spread */}
                                    <div className="space-y-2">
                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Spreads</h3>
                                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed text-pretty mb-10">
                                            Aureus capital offers the tightest and most stable spreads on the market for BTCUSD, and some of the most competitive and stable spreads for other crypto trading assets.
                                        </p>
                                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed text-pretty mb-10">
                                            Spreads are always floating, meaning the spreads in the table above are yesterday’s averages. For live spreads, please refer to the trading platform.
                                        </p>
                                        <p>Please note: Spreads may widen when markets experience lower liquidity, and this may persist until liquidity levels are restored.</p>
                                    </div>


                                    {/* Fixed margin requirement */}
                                    <div className="space-y-2">
                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Fixed margin requirements</h3>
                                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed text-pretty">
                                            Margin requirements for all cryptocurrency pairs are fixed, regardless of the leverage you use.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/*  */}
                <div className="min-h-screen bg-background">
                    <section className="py-20 my-6 px-4">
                        <div className="align-element">
                            {/* Header Section */}
                            <div className="text-center mb-16">
                                <h1 className="text-4xl md:text-5xl font-semi-bold text-foreground mb-4 text-balance">
                                    Why trade crypto with Aureus capital
                                </h1>
                                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                    From bitcoin to ethereum, and more, experience crypto trading with better-than-market conditions.
                                </p>
                            </div>

                            {/* low and stable spread */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-11 ">
                                {/* fast and relaible execution */}
                                <div className="border border-border p-8 rounded-xl">
                                    <div>
                                        <ArrowUpWideNarrow size={60} color="#38941e" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-foreground mb-4">Fast and reliable executions</h3>
                                    <p className="text-foreground leading-relaxed">
                                        Trade the crypto markets with the lowest slippage rates on the market, and keep more of what you make.
                                    </p>
                                </div>

                                {/* 0% Stop out level*/}
                                <div className="border border-border p-8 rounded-xl">
                                    <div>
                                        <ShieldOff size={60} color="#ba3817" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-foreground mb-4">0% Stop out level</h3>
                                    <p className="text-foreground leading-relaxed">
                                        Trade on your own terms with the lowest stop out level in the market. Keep your trade alive for as long as your margin allows it or until you decide to close your position.
                                    </p>
                                </div>

                                {/* Stop Out Protection*/}
                                <div className="border border-border p-8 rounded-xl">
                                    <div>
                                        <TrendingUpDown size={60} color="#1daa34" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-foreground mb-4">Stop Out Protection</h3>
                                    <p className="text-foreground leading-relaxed">
                                        Enjoy this unique market protection feature, which strengthens your positions and helps delay or avoid stop outs, particularly during increased volatility.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
                {/* Faq */}
                <FAQCrypto/>
            </section>
        </>
    )
}