"use client";

import React, {useEffect, useState} from "react";
import api from "@/lib/api";
import {useRouter} from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";

interface Department {
    id: number;
    name: string;
}

export default function RegisterPage() {
    const router = useRouter();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        departmentId: "",
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

    // Fetch departments on mount
    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (token) {
            router.push("/dashboard");
            return;
        }
        api
            .get("/api/departments")
            .then((res) => setDepartments(res.data.data))
            .catch(() => setError("Failed to load departments"));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setForm((prev) => ({...prev, [name]: value}));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!recaptchaToken) {
            setError("Please complete the reCAPTCHA");
            setLoading(false);
            return;
        }


        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            await api.post("/api/auth/register", {
                name: form.name,
                email: form.email,
                password: form.password,
                confirmPassword: form.confirmPassword,
                departmentId: parseInt(form.departmentId),
                recaptchaToken
            });

            setSuccessMessage("Successfully registered and Verify mail is sent.");
        } catch (err: any) {
            setError(err.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };
    const handleGoogleSignUp = async () => {
        if (form.departmentId == "") {
            setError("Please select a department to register with Google");
            return;
        }
        window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL}/api/auth/google?departmentId=` + form.departmentId;
    }
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-2xl shadow-md w-96">

                <form
                    onSubmit={handleSubmit}

                >
                    <h1 className="text-2xl font-semibold text-center mb-6">
                        Employee Registration
                    </h1>
                    {successMessage
                        && (<p className={"text-green-400 text-center mb-4"}>{successMessage}</p>)}

                    {error && (
                        <p className="text-red-500 text-center text-sm mb-4">{error}</p>
                    )}

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            className="w-full border rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-200"
                            placeholder="John Doe"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="w-full border rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-200"
                            placeholder="john@example.com"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            className="w-full border rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-200"
                            placeholder="********"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                            Confirm Password
                        </label>
                        <input
                            name="confirmPassword"
                            type="password"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            required
                            className="w-full border rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-200"
                            placeholder="********"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-1">Department</label>
                        <select
                            name="departmentId"
                            value={form.departmentId}
                            onChange={handleChange}
                            required
                            className="w-full border rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-200"
                        >
                            <option value="">Select Department</option>
                            {departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                    {dept.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4 flex justify-center">
                        <ReCAPTCHA
                            sitekey={process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY!}
                            onChange={(token: any) => setRecaptchaToken(token)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700 transition"
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>
                <button
                    onClick={handleGoogleSignUp}
                    disabled={loading}
                    className="w-full flex justify-center mt-3 border bg-white text-black rounded-md py-2 hover:bg-gray-100 transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="25" height="25"
                         viewBox="0 0 48 48">
                        <path fill="#FFC107"
                              d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                        <path fill="#FF3D00"
                              d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                        <path fill="#4CAF50"
                              d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                        <path fill="#1976D2"
                              d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                    </svg>
                    <span className={'ml-1.5'}>Sign Up With Google</span>
                </button>
                <p className="text-sm text-center mt-4">
                    Already have an account?{" "}
                    <a href="/login" className="text-blue-600 hover:underline">
                        Login
                    </a>
                </p>
            </div>
        </div>
    );
}
