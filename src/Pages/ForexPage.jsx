import React from "react";
import { Button } from "../components/ui/Button";
import { FAQDataCommodity, FAQForex } from "../components/Faq";
import { AlignHorizontalDistributeCenter, ArrowBigUpDash, ChartBar, ChartBarBig, ShieldCheck} from "lucide-react"


export default function ForexPage({onNavigate}) {

    return (
        <>
         <section id="forex">
                <div className=" min-h-screen relative overflow-hidden">
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{
                            backgroundImage: "url('/forex-chart.jpg')",
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
                                        Forex trading with low and stable spreads
                                    </span>
                                </h1>

                                {/* Description */}
                                <p className="text-lg sm:text-xl lg:text-2xl text-white/90 leading-relaxed mb-8 max-w-xl">
                                    <span className="">
                                        Access the global forex market and trade the world’s most popular currency pairs with better-than-market conditions.
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
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:my-11 py-16">
                        {/* Header Section */}
                        <div className="text-center mb-16 ">
                            <h1 className="text-3xl md:text-5xl lg:text-4xl font-semibold text-gray-900 mb-6 text-balance">
                                Capitalize on currency pair price movements
                            </h1>

                        </div>

                        {/* Main Content Section */}
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center py-11">
                            {/* Left Column - Features */}
                            <div className="space-y-10">
                                {/* Feature 1 */}
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                                        Trade FX majors, minors, and exotics
                                    </h2>
                                    <p className="text-gray-600 text-lg">
                                       with ultra-tight spreads and flexible leverage
                                    </p>
                                </div>

                                {/* Feature 2 */}
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Access your earnings</h2>
                                    <p className="text-gray-600 text-lg">
                                        with no unnecessary delays

                                    </p>
                                </div>

                                {/* Feature 3 */}
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Enjoy fast and precise execution</h2>
                                    <p className="text-gray-600 text-lg">
                                        on investors-favorite platforms the Aureus capital Web Terminal and Aureus capital Trade app.
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
                                    Forex market conditions
                                </h2>
                            </div>

                            {/* Right Column - Content */}
                            <div className="space-y-8">
                                {/* Intro Paragraph */}
                                <p className="text-gray-600 text-base sm:text-lg leading-relaxed text-pretty">
                                   The forex market is the largest financial market in the world. With over $5.5 trillion in daily trading volume, currency pair trading presents endless opportunities 24 hours a day, 5 days a week.
                                </p>


                                <div className="space-y-6">
                                    {/* spread */}
                                    <div className="space-y-2">
                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Spreads</h3>
                                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed text-pretty mb-10">
                                            Spreads are always floating. Because of this, the spreads in the above table are averages based on the previous trading day. For live spreads, please refer to the trading platform.
                                        </p>
                                        <p>
                                            Please note that spreads may widen when the markets experience lower liquidity, including rollover time. This may persist until liquidity levels are restored.
                                        </p>
                                        <p>
                                            Our lowest spreads are on Zero account and remain fixed at 0.0 pips for 95% of the time. These instruments are marked with an asterisk in the table.
                                        </p>
                                    </div>

                                    {/* Dynamic margin requirement */}
                                    <div className="space-y-2">
                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                                            Dynamic margin requirements</h3>
                                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed text-pretty">
                                            The margin requirement for your account is tied to the amount of leverage you use. Changing leverage will cause margin requirements to change. Just as spreads may change depending on market conditions, the amount of leverage available to you can also vary. You can read more about the changes in margin requirements in the FAQ section below
                                        </p>
                                    </div>

                                    {/* Fixed margin requirement */}
                                    <div className="space-y-2">
                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Fixed margin requirements</h3>
                                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed text-pretty">
                                           Margin requirements for exotic currency pairs always remain fixed, regardless of the leverage you use. The margin for these instruments is held in accordance with the instruments’ margin requirements and is not affected by the leverage on your account.
                                        </p>
                                    </div>

                                    {/* Trading hours */}
                                    <div className="space-y-2">
                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Trading hours</h3>
                                        <ul className="text-gray-600 text-sm sm:text-base leading-relaxed text-pretty list-disc">
                                            <li>USDCNH, USDTHB: Sunday 23:05 to Friday 20:59</li>
                                            <li>USDILS, GBPILS: Monday 05:00 to Friday 14:59 (daily break 15:00-05:00)</li>
                                            
                                        </ul>
                                        <p>
                                            All timings are in server time (GMT+0).
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
                                    Why trade forex market with Aureus capital
                                </h1>
                                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                    Take the currency market by storm and trade currencies on award-winning Forex trading platforms.
                                </p>
                            </div>

                            {/* low and stable spread */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-11">
                                {/* Bold */}
                                <div className="border border-border p-8 rounded-xl">
                                    <div>
                                        <AlignHorizontalDistributeCenter size={60}/>
                                    </div>
                                    <h3 className="text-xl font-semibold text-foreground mb-4">Low and stable spreads</h3>
                                    <p className="text-foreground leading-relaxed">
                                        Trade the forex market with low and predictable trading costs. Enjoy tight spreads that stay stable, even during economic news releases and market events.
                                    </p>
                                </div>

                                {/* fast execution */}
                                <div className="border border-border p-8 rounded-xl">
                                    <div>
                                        <ArrowBigUpDash size={60} color="#3dd115" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-foreground mb-4">Fast execution</h3>
                                    <p className="text-foreground leading-relaxed">
                                        Capitalize on the frequent price movements of popular currency pairs with ultra-fast execution. Get your FX trading orders executed in milliseconds on all available terminals.
                                    </p>
                                </div>

                                {/* security of funds */}
                                <div className="border border-border p-8 rounded-xl">
                                    <div>
                                        <ShieldCheck size={60} color="#1544d1" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-foreground mb-4">Stop Out Protection</h3>
                                    <p className="text-foreground leading-relaxed">
                                        Trade Forex online with a unique market protection feature that shields your positions against temporary market volatility and delays or avoids stop outs.
                                  </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
                {/* Faq */}
                <FAQForex/>
            </section>
        </>
    )
}