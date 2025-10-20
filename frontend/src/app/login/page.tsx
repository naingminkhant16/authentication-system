"use client";

import React, {useState, useEffect} from "react";
import api from "@/lib/api";
import {useRouter} from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (token) {
            router.push("/dashboard");
            return;
        }
    })

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await api.post("/api/auth/login", {email, password});
            if (res.status === 200) {
                const access_token = res.data.data.access_token;
                // Save token to localStorage
                localStorage.setItem("access_token", access_token);

                // Redirect to dashboard
                router.push("/dashboard");
            } else {
                throw new Error(res.data.message);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <form
                onSubmit={handleLogin}
                className="bg-white p-8 rounded-2xl shadow-md w-96"
            >
                <h1 className="text-2xl font-semibold text-center mb-6">
                    Employee Login
                </h1>

                {error && (
                    <p className="text-red-500 text-center text-sm mb-4">{error}</p>
                )}

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                        type="email"
                        className="w-full border rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-200"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input
                        type="password"
                        className="w-full border rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-200"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700 transition"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
}
