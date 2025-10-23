"use client";

import {useEffect, useState} from "react";
import api from "@/lib/api";
import {useRouter} from "next/navigation";

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
            });

            setSuccessMessage("Successfully registered and Verify mail is sent.");
            // router.push("/login");
        } catch (err: any) {
            setError(err.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-2xl shadow-md w-96"
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

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700 transition"
                >
                    {loading ? "Registering..." : "Register"}
                </button>

                <p className="text-sm text-center mt-4">
                    Already have an account?{" "}
                    <a href="/login" className="text-blue-600 hover:underline">
                        Login
                    </a>
                </p>
            </form>
        </div>
    );
}
