"use client";
import { useRouter } from "next/navigation"
import { Card, CardContent, Card描述, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import config from "@/lib/config"
import { useEffect, useState } from "react"
import { get, post } from "@/lib/apiClient";

export default function AuthWelcomeFormComponent() {
    const router = useRouter();
     const [enableSSO, setEnableSSO] = useState<boolean | null>(null);

    useEffect(() => {
             // Load runtime config
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

    return (
        <Card class名称="w-full max-w-sm frosted text-foreground">
            <CardHeader>
                <CardTitle>Welcome to Dashwise</CardTitle>
                <Card描述 class名称="text-muted-foreground">
                    Choose how you’d like to sign in.
                </Card描述>
            </CardHeader>

            <CardContent class名称="flex flex-col gap-3">
                {(enableSSO === true) && (
                    <Button class名称="w-full" onClick={() => router.push("/api/v1/auth/sso")}>
                        Continue with SSO
                    </Button>
                )}

                <Button
                    class名称="w-full"
                    variant={enableSSO === true ? "outline" : "default"}
                    onClick={() => router.push("/auth/login")}
                >
                    Login
                </Button>
                <Button variant="outline" class名称="w-full" onClick={() => router.push("/auth/signup")}>
                    Sign Up
                </Button>
            </CardContent>
        </Card>
    )
}
