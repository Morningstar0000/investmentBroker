import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"

export default function RegulationPage() {
  return (
    <div className="min-h-screen bg-background align-element">
      <div className=" py-11 md:py-20 px-4">
        {/* Header Section */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">Regulation</h1>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-pretty max-w-2xl">
            We are licensed and regulated by leading international governing bodies, allowing you to trade knowing your
            financial security is protected.
          </p>
        </div>

        {/* Regulatory Bodies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 py-6">
          {/* FSA Card */}
          <Card className="border border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg md:text-xl font-semibold text-foreground text-balance">
                Financial Services Authority (FSA)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                FSA is the autonomous regulatory body responsible to license, regulate, enforce regulatory and
                compliance measures for the financial and capital market conduct of business in the Abu Dhabi Global
                Market Services sector in Seychelles.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                Aureus capital Ltd is a Securities Dealer authorised and regulated by the Financial Services Authority with
                licence number SD025.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                Aureus capital (SC) Ltd operates under this website for the provision of services to selected jurisdictions
                outside the European Economic Area (EEA).
              </p>
            </CardContent>
          </Card>

          {/* CBCS Card */}
          <Card className="border border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg md:text-xl font-semibold text-foreground text-balance">
                Central Bank of Curaçao and Sint Maarten (CBCS)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                Aureus capital is a Securities Intermediary authorised and regulated by the Central Bank of Curaçao and
                Sint Maarten with licence number 0003LSI.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                The Central Bank of Curaçao and Sint Maarten supervises and regulates the financial sector in Curaçao
                and Sint Maarten to promote the stability, integrity, efficiency, safety, and soundness of this sector.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                Aureus capital operates under this website for the provision of services to selected jurisdictions outside
                the European Economic Area (EEA).
              </p>
            </CardContent>
          </Card>

          {/* FSC Card 1 */}
          <Card className="border border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg md:text-xl font-semibold text-foreground text-balance">
                Financial Services Commission (FSC)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                Aureus capital Ltd is authorised by the Financial Services Commission (FSC) in Mauritius with application
                number 23C226 and Investment business licence number GB20026111.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                The FSC is the Regulatory Authority responsible for all non-bank financial services business and global
                business conducted from within the Republic of Mauritius under the Financial Services Act 2007.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                Aureus capital Ltd operates under this website for the provision of services to selected jurisdictions
                outside the European Economic Area (EEA).
              </p>
            </CardContent>
          </Card>

          {/* FSC Card 2 */}
          <Card className="border border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg md:text-xl font-semibold text-foreground text-balance">
                Financial Services Commission (FSC)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                Aureus capital Ltd is authorised by the Financial Services Commission (FSC) in Mauritius with registration
                number 176967 and Investment Dealer Full Service Dealer Licence number C114013017.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                The FSC is the Regulatory Authority responsible for all non-bank financial services business and global
                business conducted from within the Republic of Mauritius under the Financial Services Act 2007.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                Aureus capital Ltd operates under this website for the provision of services to selected jurisdictions
                outside the European Economic Area (EEA). The company does not recommend this financial products, or
                their statements and opinions expressed herein are its own and accurate.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
