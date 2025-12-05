"use client"

import React, { useState } from "react"
import { ChevronDown } from "lucide-react"

const faqData = [
  {
    question: 'What do "instant" deposits and withdrawals mean?',
    answer:
      '"Instant" means transactions at Aureus capital are processed automatically, without manual intervention by our payment specialists. We approve your requests immediately, but the time it takes to send or receive funds depends on the payment method you\'ve chosen.',
  },
  {
    question: "How long does it take for withdrawals to be credited?",
    answer:
      "Withdrawal processing times vary depending on the payment method you choose. Most electronic wallets process within minutes, while bank transfers may take 1-3 business days.",
  },
  {
    question: "Can I withdraw funds to an account that is not my own?",
    answer:
      "For security reasons, you can only withdraw funds to payment methods that are registered under your name and verified in your account.",
  },
  {
    question: "What payment accounts can I use to deposit and withdraw?",
    answer:
      "We support various payment methods including bank cards, electronic wallets, bank transfers, and cryptocurrency. The available methods may vary based on your location.",
  },
  {
    question: "When can I deposit and withdraw?",
    answer:
      "You can deposit and withdraw funds 24/7, as our payment processing system operates around the clock. However, some payment providers may have their own processing schedules.",
  },
 
]

export function FAQ() {
  const [openItems, setOpenItems] = useState([]) // First item open by default

  const toggleItem = (index) => {
    setOpenItems((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  return (
    <section className="px-4 py-12 md:py-16 lg:py-20 bg-gray-50">
      <div className="align-element">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-8 md:mb-12 text-balance">
          Frequently asked questions
        </h2>

        <div className="space-y-2">
          {faqData.map((item, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-4 md:px-6 py-4 md:py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-blue-600 text-sm md:text-base pr-4 text-pretty">{item.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform duration-600 ease-in-out flex-shrink-0 ${
                    openItems.includes(index) ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`transition-all duration-300 ease-in-out ${
                  openItems.includes(index) ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                } overflow-hidden`}
              >
                <div className="px-4 md:px-6 pb-4 md:pb-5">
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed text-pretty">{item.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


const faqCommodity = [
  {
    question: 'What are commodities?',
    answer:
      '"Commodities are raw materials that are produced in large quantities and traded on an international market. Examples of commodities include energies like crude oil and natural gas, and precious metals like gold, silver, and platinum. Commodity prices are typically determined by factors like supply and demand, political stability, currency value, and economic performance.',
  },
  {
    question: "What instrument can be invested in the commodity market?",
    answer:
      "Many traders will capitalize on the volatility of energies to benefit from the frequent price fluctuations, while others will trade gold to hedge their portfolio with a safe haven asset. At Aureus capital, you can trade commodity derivatives on the world's most highly-traded commodities, including USOIL, XNGUSD, UKOIL, XAUUSD, XAGUSD, and XPTUSD.",
  },
  {
    question: "What are the most popular commodities to invest?",
    answer:
      "The most popular commodities to trade are precious metals like gold, silver, and platinum, as well as energy products like crude oil, UK oil, and natural gas. Precious metals are particularly popular because of their limited supply and constant demand, while energy commodities are attractive investments because of their sensitivity to global events.",
  },
  {
    question: "What are the main risk of commodity investing?",
    answer:
      "When trading or investing in commodities, the main risk factors to consider are market volatility, leverage, and currency exchange rate risks. Market volatility is basically the rapid fluctuation of prices within a certain time period, which can be a very significant factor in commodity trading.",
  },
  {
    question: "What are the typical spreads for gold at Aureus capital?",
    answer:
      "Aureus capital offers the lowest gold (XAUUSD) spreads in the industry, starting from 0.3 pips. Low and stable pricing allows traders to execute strategies more effectively, even in volatile markets",
  },
    {
    question: "What should i choose Aureus capital for investing in gold and oil?",
    answer:
      "Aureus capital stands out as a top broker for trading gold and oil due to its consistently tight and stable spreads, fast execution, and transparent pricing.'<br/>'Between January and May 2024, we conducted a study comparing our gold (XAUUSD) spreads during the first two seconds after high-impact news with five other leading brokers. The results confirmed that Exness offers the tightest and most stable spreads, even during volatile periods, when every pip can impact profitabilit",
  },
    {
    question: "How does Aureus capital maintain the best spread on gold and oil ?",
    answer:
      "Aureus capital utilizes advanced pricing models, low-latency servers, and strategic partnerships with top liquidity providers to consistently deliver the best spreads on gold and oil. This ensures low trading costs, even during volatile market conditions.",
  },
 
]



export function FAQDataCommodity() {
  const [openItems, setOpenItems] = useState([]) // First item open by default

  const toggleItem = (index) => {
    setOpenItems((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  return (
    <section className="align-element py-12 md:py-16 lg:py-20 bg-gray-50">
      <div className="">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-8 md:mb-12 text-balance">
          Frequently asked questions
        </h2>

        <div className="space-y-2">
          {faqCommodity.map((item, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-4 md:px-6 py-4 md:py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-blue-600 text-sm md:text-base pr-4 text-pretty">{item.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform duration-600 ease-in-out flex-shrink-0 ${
                    openItems.includes(index) ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`transition-all duration-300 ease-in-out ${
                  openItems.includes(index) ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                } overflow-hidden`}
              >
                <div className="px-4 md:px-6 pb-4 md:pb-5">
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed text-pretty">{item.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// FAQ data for crypto
const faqCrypto = [
  {
    question: 'How can I trade crypto?',
    answer: [
      'To start crypto trading with Aureus capital, create an account, verify your profile, and fund your account using your preferred payment methods. Once your account is set up, you can access a wide range of cryptocurrencies through the Aureus capital Terminal, or our Aureus capital copy trading web app.',
      "Before you begin, it's a good idea to familiarize yourself with how crypto markets work. Learn about market trends and risk management strategies before you start, and use tools like demo accounts to practice trading in real conditions without risking your capital."
    ]
  },
  {
    question: 'Why is fast execution important in crypto trading?',
    answer: [
      'Fast execution is crucial in crypto trading because the market is highly volatile, with prices changing in milliseconds. Delays in trade execution can lead to slippage, where your order is filled at a less favorable price than expected.',
      'This means you can seize opportunities faster or protect your earnings in adverse conditions. Whether you\'re using the Exness platform or our crypto trading app, fast execution gives you better control of your trades and consistent results'
    ]
  },
  {
    question: 'Why are trading costs important in crypto trading?',
    answer: [
      'Trading costs—such as spreads and commissions—play a big role in your overall profitability when crypto trading. This is especially true when you\'re trading frequently or over short time frames, where even small costs can add up.',
      'With crypto CFDs, you\'re speculating on price movements without owning the underlying asset, which usually means no wallet fees, no blockchain transaction costs, and more leverage options compared to traditional crypto investing.'
    ]
  },
  {
    question: 'What is blockchain technology, and how does it work?',
    answer: [
      'Blockchain is a distributed ledger technology that records transactions across many computers. Each block in the chain contains a number of transactions, and every time a new transaction occurs, a record of that transaction is added to every participant\'s ledger.',
      'The decentralized nature of blockchain makes it secure and transparent, as no single entity controls the data, and all participants can verify transactions independently.'
    ]
  },
  {
    question: 'How do I decide the best cryptocurrencies to trade in the 2025 crypto market?',
    answer: [
      'Research market trends, analyze trading volumes, consider the technology behind each cryptocurrency, and evaluate their real-world use cases and adoption rates.'
    ]
  },
  {
    question: 'Is Bitcoin a good cryptocurrency to trade?',
    answer: [
      'Bitcoin is often considered a good starting point for crypto trading due to its high liquidity, widespread adoption, and established market presence.'
    ]
  }
];

// / Reusable FAQ component
export function FAQCrypto() {
  const [openItems, setOpenItems] = useState([0]); // First item open by default

  const toggleItem = (index) => {
    setOpenItems((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
  };

  return (
    <div className="min-h-screen bg-background p-8 lg:p-16">
      <div className="align-element">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left column - Title */}
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              Frequently asked questions
            </h1>
          </div>

          {/* Right column - FAQ Accordion */}
          <div>
            {faqCrypto.map((item, index) => (
              <div key={index} className="border-b border-border py-6">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full text-left flex items-center justify-between hover:no-underline"
                >
                  <span className="text-lg font-medium text-foreground pr-4">
                    {item.question}
                  </span>
                  <svg
                    className={`w-5 h-5 text-muted-foreground transition-transform duration-300 flex-shrink-0 ${
                      openItems.includes(index) ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div
                  className={`transition-all duration-300 ease-in-out ${
                    openItems.includes(index) ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
                  } overflow-hidden`}
                >
                  <div className="text-muted-foreground leading-relaxed space-y-4">
                    {item.answer.map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// FAQ data for forex
const faqForex = [
  {
    question: 'what is the most popular currency pairs to invest?',
    answer: [
      'The most popular currency pairs to trade are the ones that offer the most liquidity - i.e. the ones that people trade the most.',
      "These include FX majors like AUDUSD, EURUSD, GBPUSD, NZDUSD, USDCAD, USDCHF, and USDJPY. These currency trading pairs are all available to trade completely swap-free at Aureus capital, so you can hold your positions for longer at no extra charge.",
      "Other popular currency pairs that traders like to add to their portfolios are FX minors. These include AUDCAD, CADCHF, EURAUD, GBPCHF, and more. Most FX minors are also available with no overnight charges at Aureus capital."
    ]
  },
  {
    question: 'What is leverage in Forex trading?',
    answer: [
      'Leverage is essentially the ability to place trades with the use of borrowed capital. Your broker gives you a sort of loan to add to your funds, so you can use less of your own money, but still access larger trading positions',
      "When combined with a solid risk management strategy, leverage in forex can lead to greater returns from FX trading, because it makes capitalizing on smaller price movements more lucrative. But it can also lead to greater losses if you don't combine it with a well-thought-out risk management strategy.",
      "To avoid excess losses and increase your chances of higher returns, make sure you plan your risk strategy and maintain a sensible level of exposure before choosing your preferred leverage option."
    ]
  },
  {
    question: 'What is margin in online forex trading?',
    answer: [
      'Margin in online forex trading is basically the amount of money that you need to open a position. It acts as collateral against any price movements. Forex brokers usually determine this as a percentage of the total position size, based on your chosen leverage.',
      'To open a forex trade online, you need to have enough funds in your account to meet the margin requirement for the trade. You can gain more control over your trades by setting an appropriate margin level that aligns with your overall risk management strategy.'
    ]
  },
  {
    question: 'Why are there higher margin requirement around news?',
    answer: [
      'When important news is released, significant volatility and gaps can occur. Using high leverage in a highly volatile market is risky because sudden movements can result in larger losses. That’s why we cap leverage at 1:200 during news releases for all new positions for instruments impacted.',
      'In cases when these intervals of increased margin requirements for different news releases are less than 15 minutes apart, these periods may be merged into one long period for the instruments involved. You’ll receive an email from us giving you full details of changes to margin requirements on your trading platform.',
      "When the specified period has passed, the margin on positions opened during the period is recalculated based on the amount of funds in the account and the selected leverage value."
    ]
  },
  {
    question: 'Do margin requirement change around weekends and holiday?',
    answer: [
      'An increased margin rule also applies to all forex trading that happens during weekends. All instruments during this period are subject to a maximum leverage of 1:200. Holidays are slightly different as only certain instruments and markets may be affected by this rule. When there is a change in margin requirements due to holidays, we will inform you via email.'
    ]
  },
  {
    question: 'When does the weekend period of increase margin requirement start and finish?',
    answer: [
      'Margin requirements for the opening of new positions will be calculated on a maximum leverage of 1:200 from Friday at 18:00 GMT (three hours before the forex market closes) to Sunday at 22:00 GMT (one hour after the market opens).',
      "or one hour after the market opens, your positions will remain at the increased margin requirements.",
      "One hour after the market opening, the margin on positions opened during the period of increased margin requirements is recalculated based on the amount of funds in your account and the leverage you’ve set."
    ]
  }
];



export function FAQForex() {
  const [openItems, setOpenItems] = useState([0]); // First item open by default

  const toggleItem = (index) => {
    setOpenItems((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
  };

  return (
    <div className="min-h-screen bg-background p-8 lg:p-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left column - Title */}
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              Frequently asked questions
            </h1>
          </div>

          {/* Right column - FAQ Accordion */}
          <div>
            {faqForex.map((item, index) => (
              <div key={index} className="border-b border-border py-6">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full text-left flex items-center justify-between hover:no-underline"
                >
                  <span className="text-lg font-medium text-foreground pr-4">
                    {item.question}
                  </span>
                  <svg
                    className={`w-5 h-5 text-muted-foreground transition-transform duration-300 flex-shrink-0 ${
                      openItems.includes(index) ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div
                  className={`transition-all duration-300 ease-in-out ${
                    openItems.includes(index) ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
                  } overflow-hidden`}
                >
                  <div className="text-muted-foreground leading-relaxed space-y-4">
                    {item.answer.map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
