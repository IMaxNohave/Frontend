import { MarketplaceHeader } from "@/components/marketplace-header"
import { BuySellSection } from "@/components/buy-sell-section"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"

export default function BuySellPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketplaceHeader />
      <div className="container mx-auto px-4 py-6">
        <BreadcrumbNav />
        <BuySellSection />
      </div>
    </div>
  )
}
