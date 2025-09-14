"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="bg-card border-border max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="text-6xl font-bold text-accent mb-4">404</div>
          <h1 className="text-2xl font-bold text-card-foreground mb-2">Page Not Found</h1>
          <p className="text-muted-foreground mb-6">The page you're looking for doesn't exist or has been moved.</p>
          <div className="flex gap-3">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="flex-1 border-border text-card-foreground bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button
              onClick={() => router.push("/marketplace")}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
