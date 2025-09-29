"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
//import { useNavigate } from "react-router-dom"

interface LoginFormProps {
  onSwitchToSignup: () => void
}

export function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  //const nav = useNavigate();
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const router = useRouter()

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}

    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email address"
    }

    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    // Simulate Google login
    try {
        const res = await fetch("/api/auth/signin/google"); // <- มี /auth
        const data = await res.json();
        if (data.redirect && data.url) {
          window.location.assign(data.url); // วิ่งไป Google
          
        } else {
          console.error("Unexpected response:", data);
        }
    } finally {
        setIsLoading(false);
    }  
  }

  const handleRobloxLogin = async () => {
    setIsLoading(true)
    // Simulate Roblox login
    try {
        const res = await fetch("/api/auth/signin/roblox"); // <- มี /auth
        const data = await res.json();
        if (data.redirect && data.url) {
          window.location.assign(data.url); // วิ่งไป Roblox
          
        } else {
          console.error("Unexpected response:", data);
        }
    } finally {
        setIsLoading(false);
    }  
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      if (email === "admin@gmail.com" && password === "123456") {
        localStorage.setItem("isAdmin", "true")
        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            email: "admin@gmail.com",
            name: "Admin",
            role: "admin",
          }),
        )
        router.push("/admin")
        return
      }

      localStorage.setItem("isAdmin", "false")
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          email: email,
          name: "ProTrader123",
          role: "user",
        }),
      )

      const res = await fetch("/api/auth/signin/email", {
        method: "POST",
        credentials: "include",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          email,
          password
        })
      })

      router.push("/marketplace")
    } catch (error) {
      console.error("Login failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-card-foreground">Login</CardTitle>
        <CardDescription className="text-muted-foreground">Choose your preferred login method</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3"
        >
          {isLoading ? "Signing in..." : "Login with Google"}
        </Button>

        <Button
          onClick={handleRobloxLogin}
          disabled={isLoading}
          variant="outline"
          className="w-full border-border hover:bg-accent hover:text-accent-foreground font-semibold py-3 bg-transparent"
        >
          {isLoading ? "Signing in..." : "Login with Roblox"}
        </Button>

        <div className="relative">
          <Separator className="my-4" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-sm text-muted-foreground">
            or
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-card-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="bg-input border-border text-foreground"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-card-foreground">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="bg-input border-border text-foreground"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
          </div>
          <Button
            type="submit"
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <button onClick={onSwitchToSignup} className="text-accent hover:text-accent/90 font-medium">
            Sign up here
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
