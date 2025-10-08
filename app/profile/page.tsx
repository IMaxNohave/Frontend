import { MarketplaceHeader } from "@/components/marketplace-header";
import { UserProfile } from "@/components/user-profile";
//import { BreadcrumbNav } from "@/components/breadcrumb-nav"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketplaceHeader />
      <div className="container mx-auto px-4 py-6">
        {/* <BreadcrumbNav /> */}
        <UserProfile />
      </div>
    </div>
  );
}
