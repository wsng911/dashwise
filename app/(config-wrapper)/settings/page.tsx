"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function 设置Redirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/settings/appearance"); 
    }, [router]);

    return null;

}