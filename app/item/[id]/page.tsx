import { ItemDetail } from "@/components/item-detail";
import { MarketplaceHeader } from "@/components/marketplace-header";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";

interface ItemPageProps {
  params: {
    id: string;
  };
}

export default function ItemPage({ params }: ItemPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <MarketplaceHeader />
      <div className="container mx-auto px-4 py-6">
        <BreadcrumbNav />
        <ItemDetail itemId={params.id} />
      </div>
    </div>
  );
}
