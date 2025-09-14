import { MarketplaceHeader } from "@/components/marketplace-header"
import { ItemUploadForm } from "@/components/item-upload-form"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"

export default function SellPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketplaceHeader />
      <div className="container mx-auto px-4 py-6">
        <BreadcrumbNav />
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Sell Your Item</h1>
            <p className="text-muted-foreground">List your Roblox items for other players to buy</p>
          </div>
          <ItemUploadForm />
        </div>
      </div>
    </div>
  )
}
