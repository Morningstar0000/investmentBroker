import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from "../components/ui/Button";

export default function AccountPage({onNavigate}) {

  return (
    <>
      {/* Trading Account Types Section */}
      <section id="accounts">

        <div className=" min-h-screen relative overflow-hidden">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/stock.jpg')",
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
                    Copy Trading accounts
                  </span>
                </h1>

                {/* Description */}
                <p className="text-lg sm:text-xl lg:text-2xl text-white/90 leading-relaxed mb-8 max-w-xl">
                  <span className="">
                    Discover the benefits of our copy trading platform where you as a investor you can use our copying trading tools to share your grow and boost your income.
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

        <div className="align-element px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 py-10">
            <h2 className="text-3xl md:text-4xl font-black font-montserrat text-foreground mb-6">Account Types</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Choose the perfect account type that matches your investment level and trading goals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Standard Account */}
            <Card className="border-border rounded-xl hover:shadow-lg transition-shadow relative bg-slate-400">
              <CardHeader>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <CardTitle className="text-xl font-semibold text-primary">Standard Account</CardTitle>
                    <CardDescription className="mt-2">
                      Our basic investment account, ideal for new investors.
                    </CardDescription>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Min. Investment</p>
                    <p className="text-2xl font-bold">$1,000</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Supported Risk Levels</p>
                  <div className="flex gap-2">
                    <Badge variant="outline">Conservative</Badge>
                    <Badge variant="outline">Moderate</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="font-semibold mb-2">Key Features</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Access to major currency pairs</li>
                    <li>• Basic analytics tools</li>
                    <li>• Standard customer support</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Premium Account */}
            <Card className="border-border rounded-xl hover:shadow-lg transition-shadow bg-slate-400">
              <CardHeader>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <CardTitle className="text-xl font-semibold text-primary">Premium Account</CardTitle>
                    <CardDescription className="mt-2">
                      Enhanced features and lower fees for active traders.
                    </CardDescription>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Min. Investment</p>
                    <p className="text-2xl font-bold">$5,000</p>
                  </div>

                </div>
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Supported Risk Levels</p>
                  <div className="flex gap-2">
                    <Badge variant="outline">Conservative</Badge>
                    <Badge variant="outline">Moderate</Badge>
                    <Badge variant="outline">Aggressive</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="font-semibold mb-2">Key Features</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Reduced spreads on major pairs</li>
                    <li>• Advanced charting tools</li>
                    <li>• Priority customer support</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* VIP Account */}
            <Card className="border-border rounded-xl hover:shadow-lg transition-shadow bg-slate-400">
              <CardHeader>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <CardTitle className="text-xl font-semibold text-primary">VIP Account</CardTitle>
                    <CardDescription className="mt-2">
                      Exclusive benefits and personalized service for high-volume traders.
                    </CardDescription>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Min. Investment</p>
                    <p className="text-2xl font-bold">$25,000</p>
                  </div>

                </div>
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Supported Risk Levels</p>
                  <div className="flex gap-2">
                    <Badge variant="outline">Moderate</Badge>
                    <Badge variant="outline">Aggressive</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="font-semibold mb-2">Key Features</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Lowest spreads</li>
                    <li>• Direct market access</li>
                    <li>• Exclusive market insights</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Pro/Professional Account */}
            <Card className="border-border rounded-xl hover:shadow-lg transition-shadow bg-slate-400 ">
              <CardHeader>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <CardTitle className="text-xl font-semibold text-primary">Pro/Professional Account</CardTitle>
                    <CardDescription className="mt-2">
                      Designed for experienced traders and financial professionals.
                    </CardDescription>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Min. Investment</p>
                    <p className="text-2xl font-bold">$10,000</p>
                  </div>

                </div>
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Supported Risk Levels</p>
                  <div className="flex gap-2">
                    <Badge variant="outline">Moderate</Badge>
                    <Badge variant="outline">Aggressive</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="font-semibold mb-2">Key Features</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Higher leverage options</li>
                    <li>• Advanced API access</li>
                    <li>• Institutional-grade research</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

          </div>
          <div className="py-6">
            <p>Spreads may fluctuate and widen due to factors including market volatility, news releases, economic events, when markets open or close, and the type of instruments being traded.</p>
          </div>
        </div>
      </section>
    </>
  )
};