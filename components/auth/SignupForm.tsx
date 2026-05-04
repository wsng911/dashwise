"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { get, post } from "@/lib/apiClient";
import { useRouter } from "next/navigation"
import { Card, CardContent, Card描述, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, Alert描述, AlertTitle } from "@/components/ui/alert"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCircleCheck, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons"
import { setTimeout } from "timers"

export default function SignupCard() {
  const [name, set名称] = useState("");
  const [email, set邮箱] = useState("")
  const [password, set密码] = useState("")
  const [confirm密码, set确认密码] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [enableSSO, setEnableSSO] = useState<boolean | null>(null);

  //on load: check for existing auth, validate using /api/v1/auth/validate-auth endpoint if returned success to /home
  useEffect(() => {
    // Fetch runtime config (e.g. enableSSO)
    get("/appConfig").then(res => setEnableSSO(res.enableSSO ?? false)).catch(() => setEnableSSO(false));

    const validateAuth = async () => {
      const token = localStorage.getItem('pb_token');
      if (!token) return;

      try {
        await post("/auth/validate-auth", undefined, { token });
        router.push("/home");
      } catch (err) {
        // ignore
      }
    };

    validateAuth();
  }, [router]);

  const handle提交 = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password || !confirm密码) {
      setError("All fields are required")
      return
    }

    if (password !== confirm密码) {
      setError("密码s do not match")
      return
    }

    if (password.length < 8) {
      setError("密码 must be at least 8 characters")
      return
    }

    setLoading(true)
    try {
      const data = await post("/auth/signup", { _name: name, email, password, password确认: confirm密码 });
      if (data?.error) {
        setError(data.error || "Signup failed");
      } else {
        setSuccess("Redirecting to login...")

        setTimeout(() => {
          // Clear the form fields
          set名称("")
          set邮箱("")
          set密码("")
          set确认密码("")

          router.push("/auth/login")
        }, 2000)
      }
    } catch (err) {
      console.error("Signup request failed:", err)
      setError((err as any)?.message || "Network error")
    } finally {
      setLoading(false)
    }
  }


  return (
    <Card class名称="w-full max-w-sm frosted text-foreground backdrop-saturate-90 backdrop-brightness-90">
      <CardHeader>
        <CardTitle>Welcome to Dashwise!</CardTitle>
        <Card描述>
          Let's get started by creating an account.
        </Card描述>
      </CardHeader>
      <CardContent>
        <form on提交={handle提交} class名称="flex flex-col gap-6">
          {error && (
            <Alert variant="destructive">
              <FontAwesomeIcon icon={faExclamationTriangle}></FontAwesomeIcon>
              <AlertTitle>Error</AlertTitle>
              <Alert描述>{error}</Alert描述>
            </Alert>
          )}

          {success && (
            <Alert>
              <FontAwesomeIcon icon={faCircleCheck}></FontAwesomeIcon>
              <AlertTitle>Success!</AlertTitle>
              <Alert描述>{success}</Alert描述>
            </Alert>
          )}

          <div class名称="grid gap-2">
            <Label htmlFor="name">名称</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => set名称(e.target.value)}
            />
          </div>
          <div class名称="grid gap-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              placeholder="me@example.com"
              value={email}
              onChange={(e) => set邮箱(e.target.value)}
              required
            />
          </div>
          <div class名称="grid gap-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              placeholder="*********"
              value={password}
              onChange={(e) => set密码(e.target.value)}
              required
            />
          </div>
          <div class名称="grid gap-2">
            <Label htmlFor="confirm-password">确认 密码</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Re-enter your password"
              value={confirm密码}
              onChange={(e) => set确认密码(e.target.value)}
              required
            />
          </div>

          <Button type="submit" class名称="w-full" disabled={loading}>
            {loading ? "Creating account..." : "创建 Account"}
          </Button>
        </form>
      </CardContent>
      <CardFooter class名称="flex-col gap-2">
        <Button variant="outline" class名称="w-full">
          <Link href="/auth/login">Login instead</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
