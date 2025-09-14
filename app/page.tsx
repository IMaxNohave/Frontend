import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Ro Trade</h1>
          <p className="text-muted-foreground">Trade your Roblox items safely</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
