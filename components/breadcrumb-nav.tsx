// "use client"

// import { ChevronRight, Home } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { useRouter, usePathname } from "next/navigation"

// export function BreadcrumbNav() {
//   const router = useRouter()
//   const pathname = usePathname()

//   const pathSegments = pathname.split("/").filter(Boolean)

//   const breadcrumbs = [
//     { label: "Home", path: "/marketplace", icon: Home },
//     ...pathSegments.map((segment, index) => {
//       const path = "/" + pathSegments.slice(0, index + 1).join("/")
//       const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace("-", " ")
//       return { label, path }
//     }),
//   ]

//   if (pathname === "/" || pathname === "/marketplace") {
//     return null
//   }

//   return (
//     <nav className="flex items-center gap-2 mb-6 text-sm">
//       {breadcrumbs.map((crumb, index) => (
//         <div key={crumb.path} className="flex items-center gap-2">
//           {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => router.push(crumb.path)}
//             className="text-muted-foreground hover:text-card-foreground p-1 h-auto"
//           >
//             {crumb.icon && <crumb.icon className="h-4 w-4 mr-1" />}
//             {crumb.label}
//           </Button>
//         </div>
//       ))}
//     </nav>
//   )
// }
