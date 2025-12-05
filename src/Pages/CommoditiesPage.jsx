import React from "react";
import { Button } from "../components/ui/Button";
import { FAQDataCommodity } from "../components/Faq";
import { AlignHorizontalDistributeCenter, ArrowBigUpDash, ChartBar, ChartBarBig, ShieldCheck} from "lucide-react"


export default function CommoditiesPage({onNavigate}) {

    return (
        <>
         <section id="deposit-withdrawal">
                <div className=" min-h-screen relative overflow-hidden">
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{
                            backgroundImage: "url('/Gold.jpg')",
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
                                        Invest in commodities with confidence
                                    </span>
                                </h1>

                                {/* Description */}
                                <p className="text-lg sm:text-xl lg:text-2xl text-white/90 leading-relaxed mb-8 max-w-xl">
                                    <span className="">
                                        Take advantage of the lowest and most stable spreads on gold while trading the global commodity market and growing your income.
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
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        {/* Header Section */}
                        <div className="text-center mb-16 ">
                            <h1 className="text-3xl md:text-5xl lg:text-4xl font-semibold text-gray-900 mb-6 text-balance">
                                Open an account and start trading commodities
                            </h1>

                        </div>

                        {/* Main Content Section */}
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                            {/* Left Column - Features */}
                            <div className="space-y-12">
                                {/* Feature 1 */}
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                                        Expand your Income
                                    </h2>
                                    <p className="text-gray-600 text-lg">
                                        with commodity trading and capitalize on endless opportunities.
                                    </p>
                                </div>

                                {/* Feature 2 */}
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Enjoy copy trading gold with an advantage</h2>
                                    <p className="text-gray-600 text-lg">
                                        riding market volatility with the most stable gold spreads.

                                    </p>
                                </div>

                                {/* Feature 3 */}
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Leverage unique trading conditions</h2>
                                    <p className="text-gray-600 text-lg">
                                        like Stop Out Protection to give your strategy an advantage.
                                    </p>
                                </div>
                            </div>

                            {/* Right Column - Image with Currency Badges */}
                            <div className="relative">
                                <div className="relative rounded-2xl overflow-hidden">
                                    <img
                                        src="michael.jpg"
                                        alt="Professional man working on laptop"
                                        className="w-full h-80 object-cover"
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
                                    Commodity market conditions
                                </h2>
                            </div>

                            {/* Right Column - Content */}
                            <div className="space-y-8">
                                {/* Intro Paragraph */}
                                <p className="text-gray-600 text-base sm:text-lg leading-relaxed text-pretty">
                                    The commodity market is a global marketplace for trading various types of commodities like precious metals and energies. Trading them allows you to speculate on the price of highly volatile instruments like gold and oil without buying the underlying asset, whether the commodity price is going up or down.

                                </p>


                                <div className="space-y-6">
                                    {/* spread */}
                                    <div className="space-y-2">
                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Spreads</h3>
                                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed text-pretty mb-10">
                                            When it comes to gold and oil trading, Aureus capital leads with the tightest spreads in the market. Keep in mind that our spreads are floating, and the table above shows the previous day's average rates. For live spreads, please check your trading platform.
                                        </p>
                                        <p>
                                            Please note that spreads may widen when markets experience low liquidity. This may persist until liquidity levels are restored.
                                        </p>
                                    </div>

                                    {/* Dynamic margin requirement */}
                                    <div className="space-y-2">
                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                                            Dynamic margin requirements</h3>
                                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed text-pretty">
                                            Margin requirements are tied to the rate of leverage you use. Changing your leverage will cause margin requirements on XAU (gold) and XAG (silver) pairs to change. Just as spreads change depending on conditions, the leverage available to you can also vary. You can read more about the changes in margin requirements in the FAQ section below.
                                        </p>
                                    </div>

                                    {/* Fixed margin requirement */}
                                    <div className="space-y-2">
                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Fixed margin requirements</h3>
                                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed text-pretty">
                                            Margin requirements for the following commodities always remain fixed, regardless of the maximum leverage set on your account:
                                        </p>
                                        <ul className="list-disc">
                                            <li>
                                                For XAL (aluminum), XCU (copper), XNI (nickel), XPB (lead), XPT (platinum), XPD (palladium) and XZN (zinc) leverage is set at 1:100
                                            </li>
                                            <li>
                                                leverage is set at 1:10 For XNGUSD (natural gas), leverage is set at 1:20
                                            </li>
                                        </ul>
                                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed text-pretty">
                                            Margin requirements for USOIL and UKOIL always remain fixed with a leverage of 1:1000 and 1:200, respectively, except for specific periods of higher margin requirements. During the following higher margin requirements periods, the margin requirements for both USOIL and UKOIL are set at 5% (1:20 leverage):
                                        </p>
                                        <ul className="list-disc">
                                            <li>USOIL: from 16:45 (GMT+0) on Friday to 22:59 (GMT+0) on Sunday</li>
                                            <li>UKOIL: from 08:00 (GMT+0) on Friday to 00:30 (GMT+0) on Monday</li>
                                        </ul>
                                    </div>

                                    {/* Trading hours */}
                                    <div className="space-y-2">
                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Trading hours</h3>
                                        <ul className="text-gray-600 text-sm sm:text-base leading-relaxed text-pretty list-disc">
                                            <li>XAU: Sunday 22:05 – Friday 20:58 (daily break 20:58-22:02)</li>
                                            <li>XAG: Sunday 22:05 – Friday 20:58 (daily break 20:58-22:01)</li>
                                            <li>XPDUSD, XPTUSD: Sunday 22:10 – Friday 20:58 (daily break 20:58-22:05)</li>
                                            <li>XALUSD, XCUUSD, XPBUSD, XZNUSD: daily 00:00 – 17:55 (daily break 17:55-00:00)</li>
                                            <li>XNIUSD: daily 07:00 – 17:55 (daily break 17:55-07:00)</li>
                                            <li>USOIL, XNGUSD: Sunday 22:10 – Friday 20:44 (daily break 20:45-22:10)</li>
                                            <li>UKOIL: Monday 00:10 – Friday 20:54 (daily break 20:55-00:10)</li>
                                        </ul>
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
                                    Why trade commodities online with Aureus capital
                                </h1>
                                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                    Trade precious metals and energies with trading conditions that give your strategy an advantage.
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
                                        Keep your trading costs low, even when prices are fluctuating. Enjoy low and stable spreads, even during high-impact market news and economic events.
                                    </p>
                                </div>

                                {/* fast execution */}
                                <div className="border border-border p-8 rounded-xl">
                                    <div>
                                        <ArrowBigUpDash size={60} color="#3dd115" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-foreground mb-4">Fast execution</h3>
                                    <p className="text-foreground leading-relaxed">
                                        Never miss a pip. Get your orders executed in milliseconds on Aureus capital Terminals.
                                    </p>
                                </div>

                                {/* security of funds */}
                                <div className="border border-border p-8 rounded-xl">
                                    <div>
                                        <ShieldCheck size={60} color="#1544d1" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-foreground mb-4">Security of funds</h3>
                                    <p className="text-foreground leading-relaxed">
                                        
                                        Trade the commodity markets with Negative Balance Protection. Benefit from PCI DSS financial data protection, and segregated client accounts in tier-1 banks
                                </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
                {/* Faq */}
                <FAQDataCommodity/>
            </section>
        </>
    )
}