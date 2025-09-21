"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"

interface SignupFormProps {
  onSwitchToLogin: () => void
}

export function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const router = useRouter()

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.name || formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email address"
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleGoogleSignup = async () => {
    setIsLoading(true)
    // Simulate Google signup
    setTimeout(() => {
      setIsLoading(false)
      router.push("/marketplace")
    }, 1500)
  }

  const handleRobloxSignup = async () => {
    setIsLoading(true)
    // Simulate Roblox signup
    setTimeout(() => {
      setIsLoading(false)
      router.push("/marketplace")
    }, 1500)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      localStorage.setItem("isAdmin", "false")
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          email: formData.email,
          name: formData.name,
          role: "user",
        }),
      )

      router.push("/marketplace")
    } catch (error) {
      console.error("Signup failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-card-foreground">Sign Up</CardTitle>
        <CardDescription className="text-muted-foreground">Create your account to start trading</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleGoogleSignup}
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3"
        >
          {isLoading ? "Creating account..." : "Sign up with Google"}
        </Button>

        <Button
          onClick={handleRobloxSignup}
          disabled={isLoading}
          variant="outline"
          className="w-full border-border hover:bg-accent hover:text-accent-foreground font-semibold py-3 bg-transparent"
        >
          {isLoading ? "Creating account..." : "Sign up with Roblox"}
        </Button>

        <div className="relative">
          <Separator className="my-4" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-sm text-muted-foreground">
            or
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-card-foreground">
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              className="bg-input border-border text-foreground"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-card-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="bg-input border-border text-foreground"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
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
              placeholder="Create a password"
              className="bg-input border-border text-foreground"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
            />
            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-card-foreground">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              className="bg-input border-border text-foreground"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
            />
            {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
          </div>
          <Button
            type="submit"
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <button onClick={onSwitchToLogin} className="text-accent hover:text-accent/90 font-medium">
            Sign in here
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
