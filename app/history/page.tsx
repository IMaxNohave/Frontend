import { MarketplaceHeader } from "@/components/marketplace-header"
import { TransactionHistory } from "@/components/transaction-history"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketplaceHeader />
      <div className="container mx-auto px-4 py-6">
        <BreadcrumbNav />
        <TransactionHistory />
      </div>
    </div>
  )
}
