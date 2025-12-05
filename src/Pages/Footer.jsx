import React from "react"
import { Button } from "../components/ui/Button"
import { Shield } from "../components/ui/Icons"
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react"

export default function Footer({onNavigate}) {

  const handleNavClick = (page) => {
    onNavigate(page);
  };

  return (
    <footer className="w-full bg-white px-4 py-14 sm:px-6 md:px-8 lg:px-12">
      <div className="align-element">
        {/* Social Media Icons */}
        <div className="mb-8 flex flex-wrap items-center justify-start gap-3 sm:gap-4">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full border-gray-200 hover:bg-gray-50 sm:h-11 sm:w-11 bg-transparent"
            aria-label="Facebook"
          >
            <Facebook className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full border-gray-200 hover:bg-gray-50 sm:h-11 sm:w-11 bg-transparent"
            aria-label="Twitter"
          >
            <Twitter className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full border-gray-200 hover:bg-gray-50 sm:h-11 sm:w-11 bg-transparent"
            aria-label="Instagram"
          >
            <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full border-gray-200 hover:bg-gray-50 sm:h-11 sm:w-11 bg-transparent"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full border-gray-200 hover:bg-gray-50 sm:h-11 sm:w-11 bg-transparent"
            aria-label="YouTube"
          >
            <Youtube className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>

        {/* Legal Text Content */}
        <div className="space-y-4 text-sm leading-relaxed text-gray-600 sm:text-base sm:leading-relaxed">
          <p className="text-balance">
            Aureus capital Ltd is a Securities Dealer registered in Seychelles with registration number 8423606-1 and
            authorised by the Financial Services Authority (FSA) with licence number SD025. Aureus capital Ltd is also
            authorized as an Over-The-Counter Derivatives Provider (ODP) by the Financial Sector Conduct Authority
            (FSCA) in South Africa. The registered office of Aureus capital Ltd is at 9A CT House, 2nd floor, Providence,
            Mane, Seychelles.
          </p>

          <p className="text-balance">
            Aureus capital is a Securities Intermediary registered in Curaçao with registration number 148698(0) and
            authorised by the Central Bank of Curaçao and Sint Maarten (CBCS) with licence number 0003LSI. The
            registered office of Aureus capital is at Emancipatie Boulevard Dominico F. "Don" Martina 31, Curaçao.
          </p>

          <p className="text-balance">
            Aureus capital Ltd is authorised by the Financial Services Commission (FSC) in BVI with registration number
            2032226 and investment business licence number SIBA/L/20/1133. The registered office of Aureus capital Ltd is
            at Trinity Chambers, P.O. Box 4301, Road Town, Tortola, BVI.
          </p>

          <p className="text-balance">
            The entities above are duly authorized to operate under the Aureus capital brand and trademarks.
          </p>

          <p className="text-balance">
            <span className="font-medium text-gray-700">Risk Warning:</span> Our services relate to complex derivative
            products which are traded outside an exchange. These products come with a high risk of losing money rapidly
            due to leverage and thus are not appropriate for all investors. Under no circumstances shall Aureus capital have any
            liability to any person or entity for any loss or damage in whole or part caused by, resulting from, or
            relating to any investing activity.{" "}
           
            .
          </p>

          <p className="text-balance">
            The entities above do not offer services to residents of certain jurisdictions including the
            Iran, North Korea, china and others.
          </p>

          <p className="text-balance">
            The information on this website does not constitute investment advice or a recommendation or a solicitation
            to engage in any investment activity.
          </p>

          <p className="text-balance">
            Any interaction with this website constitutes an individual and voluntary operation on the part of the
            person accessing it. This website and its content should not be understood as an invitation for the
            contracting and/or acquisition of Aureus capital' financial services and products.
          </p>

          <p className="text-balance">
            The information on this website may only be copied with the express written permission of Aureus capital.
          </p>

          <p className="text-balance">
            Aureus capital complies with the Payment Card Industry Data Security Standard (PCI DSS) to ensure your security and
            privacy. We conduct regular vulnerability scans and penetration tests in accordance with the PCI DSS
            requirements for our business model.
          </p>
        </div>

        <div className="my-8 border-t border-gray-200"></div>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Footer Links */}
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm sm:text-base">
            <a className="text-gray-700 underline hover:text-gray-900 transition-colors">
              Risk Disclosure
            </a>
            <a className="text-gray-700 underline hover:text-gray-900 transition-colors">
              Preventing Money Laundering
            </a>
            <a className="text-gray-700 underline hover:text-gray-900 transition-colors">
              Privacy Policy
            </a>
            <a className="text-gray-700 underline hover:text-gray-900 transition-colors">
              PAIA Manual
            </a>

             <Button
            onClick={() => handleNavClick('admin-login')}
            variant="outline"
            size="sm"
            className="border-white text-red-700 hover:bg-red-50 hover:text-red-800"
          >
            <Shield className="w-4 h-4 mr-1" />
        
          </Button>
          </nav>

          {/* Copyright */}
        
          <p
            className="text-sm text-gray-600 sm:text-base">© 2025 Aureus capital</p>
        </div>

        <div className="mt-8">
          <img src="/download.png" alt="PCI DSS Compliant" className="h-12 w-auto sm:h-14" />
        </div>
      </div>
    </footer>
  )
}
