"use client"
import React, {FormEvent, useEffect, useState} from "react";
import api from "@/lib/api";
import {useRouter} from "next/navigation";

export default function OtpPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [code, setCode] = useState<string>("");
    const router = useRouter();

    useEffect(() => {
        const loginInfo = localStorage.getItem("login_info");
        if (!loginInfo) {
            router.push("/login");
        }
    }, [router]);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setError(null);
            setLoading(true);

            const {email, password, recaptchaToken} = JSON.parse(localStorage.getItem("login_info") as string);

            const res = await api.post("/api/auth/otp/verify", {email, code});

            if (res.status === 200) {
                const loginRes = await api.post("/api/auth/login", {
                    email,
                    password,
                    recaptchaToken,
                });

                if (loginRes.status === 200) {
                    const access_token = loginRes.data.data.access_token;
                    localStorage.setItem("access_token", access_token);
                    localStorage.removeItem("login_info");
                    router.push("/dashboard");
                } else {
                    throw new Error(loginRes.data.message);
                }
            } else {
                setError("Invalid OTP code.");
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Verification failed");
        } finally {
            setLoading(false);
        }

    }
    return (
        <div className={'flex min-h-screen items-center justify-center bg-gray-100'}>
            <div className="bg-white p-8 rounded-2xl shadow-md w-96">
                <form onSubmit={handleFormSubmit}>
                    <h1 className="text-2xl font-semibold text-center mb-6">Enter OTP</h1>
                    {error && <p className="text-red-500 text-center text-sm mb-4">{error}</p>}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">OTP Code</label>
                        <input
                            type="text"
                            className="w-full border rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-200"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                        />
                    </div>
                    <button type={'submit'} disabled={loading}
                            className="w-full bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700 transition"

                    >
                        {loading ? "Verifying..." : "Verify"}
                    </button>
                </form>
                <p className="text-sm text-center mt-4">
                    Back to {" "}
                    <a href="/login" className="text-blue-600 hover:underline">
                        Login
                    </a>
                </p>
            </div>
        </div>
    )
}