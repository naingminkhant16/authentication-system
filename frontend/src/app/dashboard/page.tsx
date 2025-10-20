"use client";

import {useEffect, useState} from "react";
import api from "@/lib/api";
import {useRouter} from "next/navigation";

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            router.push("/login");
            return;
        }

        api.get("/api/auth/me")
            .then((res) => setUser(res.data))
            .catch(() => router.push("/login"));
    }, [router]);

    if (!user) return <p>Loading...</p>;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Welcome, {user.auth.name}</h1>
            <p>Department: {user.auth.department.name}</p>
        </div>
    );
}
