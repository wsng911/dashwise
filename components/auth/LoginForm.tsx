"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { get, post } from "@/lib/apiClient";
import useAuth from "@/context/useAuth"
import { useRouter } from "next/navigation"

import { Card, CardContent, Card描述, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, Alert描述, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  Dialog描述,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCircleCheck, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons"

export default function LoginCard() {
  const router = useRouter()
  const { token, setAuth } = useAuth();
  const [email, set邮箱] = useState("")
  const [password, set密码] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [enableSSO, setEnableSSO] = useState<boolean | null>(null);


  //on load: check for existing auth, validate using /api/v1/auth/validate-auth endpoint if returned success to /home
   useEffect(() => {
    // Fetch runtime config (e.g. enableSSO)
    get("/appConfig").then(data => setEnableSSO(data.enableSSO ?? false)).catch(() => setEnableSSO(false));

    const validateAuth = async () => {
      const tokenToCheck = token;
      if (!tokenToCheck) return;

      try {
        try {
          await post("/auth/validate-auth", undefined, { token: tokenToCheck });
          router.push("/home");
        } catch (e) {
          // ignore
        }
      } catch (err) {
        console.error("Auth validation failed:", err);
      }
    };

    validateAuth();
  }, [router, token]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const { token: newToken, user } = await post("/auth/login", { email, password });
      setAuth(user, newToken);

      setSuccess("Login successful! Redirecting to home...");
      setTimeout(() => {
        set邮箱("");
        set密码("");
        router.push("/home");
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }


  return (
    <Card class名称="w-full max-w-sm frosted text-foreground backdrop-saturate-90 backdrop-brightness-90">
      <CardHeader>
        <CardTitle>Welcome back to Dashwise!</CardTitle>
        <Card描述 class名称="text-muted-foreground">
          Login using your credentials below.
        </Card描述>
      </CardHeader>
      <CardContent>
        <form on提交={handleLogin} class名称="flex flex-col gap-6">
          {error && (
            <Alert variant="destructive">
              <FontAwesomeIcon icon={faExclamationTriangle} class名称="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <Alert描述>{error}</Alert描述>
            </Alert>
          )}

          {success && (
            <Alert>
              <FontAwesomeIcon icon={faCircleCheck} class名称="h-4 w-4" />
              <AlertTitle>Success!</AlertTitle>
              <Alert描述>{success}</Alert描述>
            </Alert>
          )}

          <div class名称="grid gap-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => set邮箱(e.target.value)}
              class名称="frosted"
              required
            />
          </div>
          <div class名称="grid gap-2">
            <div class名称="flex items-center">
              <Label htmlFor="password">密码</Label>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="link"
                    type="button"
                    class名称="ml-auto inline-block h-auto p-0 text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Button>
                </DialogTrigger>
                <DialogContent class名称="sm:max-w-[425px] frosted text-foreground">
                  <DialogHeader>
                    <DialogTitle>Problems Authenticating?</DialogTitle>
                      <div>
                        <h3 class名称="font-semibold">If you're a user...</h3>
                        <p class名称="text-(--text-on-frosted)">Contact your admin.</p>
                      </div>
                      <div>
                        <h3 class名称="font-semibold">If you're an admin...</h3>
                        <p class名称="text-(--text-on-frosted)">
                          Go into pocketbase dashboard (authenticate using the env vars set for pocketbase container) and change login details for your user there.
                        </p>
                      </div>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => set密码(e.target.value)}
              class名称="frosted"
              required
            />
          </div>

          <Button type="submit" class名称="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </CardContent>
      <CardFooter class名称="flex-col gap-2">
        <Button variant="outline" class名称="w-full frosted">
          <Link href="/auth/signup">注册 instead</Link>
        </Button>

        {(enableSSO === true)  && (
          <Button variant="outline" class名称="w-full frosted">
            <Link href="/api/v1/auth/sso">Use SSO</Link>
          </Button>
        )}

      </CardFooter>
    </Card>
  )
}