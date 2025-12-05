import React from "react"

export default function AboutUsPage() {
  return (
    <>
    {/* // Header-hero */}
    <div className="min-h-screen relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/kevin.jpg)" }}
      />
      <div className="absolute inset-0" />

      {/* Main content container */}
      <div className="relative z-10 align-element px-6 lg:px-8 py-16 lg:py-24">
        <div className="max-w-2xl">
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-6xl font-bold text-black leading-tight">This is Aureus Capital</h1>
            <p className="text-lg lg:text-xl text-white leading-relaxed max-w-lg">
              Aureus capital is a multi-asset, tech-focused broker utilizing advanced algorithms for enhanced trading
              conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
    {/* // 2nd sections */}
      <main className="min-h-screen bg-white">
      <div className=" align-element py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image Section */}
          <div className="relative">
            <img
              src="israel.jpg"
              alt="Professional office environment with people working at laptops"
              width={600}
              height={400}
              className="w-full h-auto rounded-xl object-cover"
              priority
            />
          </div>

          {/* Content Section */}
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-gray-900 leading-tight">The Aureus capital way is about balance</h1>

            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                We set out in 2008 to balance ethics and technology to reimagine how the ideal trading experience could
                be. Today, as a leader in the industry of CFD trading, servicing over 1 million active traders, we know
                we're on the right path.
              </p>

              <p>
                We built our proprietary trading features so we could offer something unique, something no other broker
                had ever attempted. We were the first to offer traders instant withdrawals¹, stop out protection and
                more. Features that give traders an edge.
              </p>

              <p>
                Trading is just one part of the picture. We believe in creating ecosystems of benefit for traders,
                partners, and employees to thrive within. Making what once was deemed impossible, a reality.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
      {/* 3rd section */}
      <main className="min-h-screen bg-white">
      {/* People First Section */}
      <section className="py-16 ">
        <div className=" align-element py-16">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Image */}
            <div className="order-2 lg:order-1">
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src="/bruce-mar.jpg"
                  alt="Diverse team of professionals working together"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>
            </div>

            {/* Content */}
            <div className="order-1 lg:order-2 space-y-6">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">People first</h2>
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                Aureus capital consists of over 2,000 tech experts and forward-thinkers from around the world, working to shape
                a marketplace like no other. With offices across four continents, we challenge our people to think
                differently and ask themselves every day – how should trading look like tomorrow?
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 px-4 md:px-8 lg:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {/* sucess rate */}
            <div className="text-center space-y-2">
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">87%</div>
              <div className="text-sm md:text-base text-blue-600 font-semibold">Success Rate</div>
              <div className="text-sm md:text-base text-black font-semibold">Average annual profitability</div>
            </div>

            {/* Active client*/}
            <div className="text-center space-y-2">
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">50K+</div>
              <div className="text-sm md:text-base text-blue-600 font-semibold">Active Clients</div>
                 <div className="text-sm md:text-base text-black font-medium">Globally</div>
            </div>

            {/* vAssets Managed */}
            <div className="text-center space-y-2">
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">€2.5M</div>
              <div className="text-sm md:text-base text-blue-600 font-semibold">Assets Managed</div>
               <div className="text-sm md:text-base text-black font-medium">Total investments under management</div>
            </div>

            {/* Years Experience */}
            <div className="text-center space-y-2">
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">6</div>
              <div className="text-sm md:text-base text-blue-600 font-medium">Years Experience</div>
              <div className="text-sm md:text-base text-black font-medium">Serving European markets</div>
            </div>
          </div>
        </div>
      </section>
    </main>
    {/*  */}
    <div className="min-h-screen bg-background">
      <section className="py-16 px-4">
        <div className="align-element">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
              Our values guide every advancement
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From business strategy to employee care, every step we take follows our 4 key values.
            </p>
          </div>

          {/* Values Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ">
            {/* Bold */}
            <div className="border border-border p-8 rounded-xl">
              <h3 className="text-xl font-semibold text-foreground mb-4">Bold</h3>
              <p className="text-foreground leading-relaxed">
                We have innovated, pushed boundaries, and challenged the status quo from day one. We follow a simple
                rule: if it doesn't exist, we invent it. If it does exist, we improve it.
              </p>
            </div>

            {/* Good people */}
            <div className="border border-border p-8 rounded-full">
              <h3 className="text-xl font-semibold text-foreground mb-4">Good people</h3>
              <p className="text-foreground leading-relaxed">
                We prioritize our clients, making sure all our innovations are influenced by our desire to give them the
                best trading experience possible.
              </p>
            </div>

            {/* Tech professionals */}
            <div className="border border-border p-8 rounded-full">
              <h3 className="text-xl font-semibold text-foreground mb-4">Tech professionals</h3>
              <p className="text-foreground leading-relaxed">
                We are science-driven, using sophisticated models and data in everything we do to keep our clients
                protected and offer them better-than-market conditions.
              </p>
            </div>

            {/* Reliable */}
            <div className="border border-border p-8 rounded-xl">
              <h3 className="text-xl font-semibold text-foreground mb-4">Reliable</h3>
              <p className="text-foreground leading-relaxed">
                We prioritize reliability in our platform, giving us a solid foundation on which to innovate. Stable
                spreads, fast, execution, and other client-centered benefits, make trading with Aureus capital more dependable.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
</>
  )
}
