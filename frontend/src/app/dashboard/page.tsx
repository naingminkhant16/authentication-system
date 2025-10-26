"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import api from "@/lib/api";

interface Department {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    departmentId: number;
}

export default function DashboardPage() {
    const router = useRouter();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch user and departments
    useEffect(() => {
        // const token = localStorage.getItem("access_token");
        // if (!token) {
        //     router.push("/login");
        //     return;
        // }

        async function loadData() {
            try {
                const [userRes, deptRes] = await Promise.all([
                    api.get("/api/auth/me"),
                    api.get("/api/departments"),
                ]);
                setUser(userRes.data.auth);
                setDepartments(deptRes.data.data);
            } catch (err: any) {
                setError("Failed to load data");
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    const handleViewStaff = (deptId: number) => {
        if (!user) return;
        if (user.departmentId === deptId) {
            router.push(`/departments/${deptId}`);
        } else {
            alert("You are not authorized to view this department’s staff!");
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen justify-center items-center">
                <p>Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen justify-center items-center text-red-500">
                {error}
            </div>
        );
    }
    const handleLogout = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post("/api/auth/logout");
            console.log(res)
            if (res.status === 200) {
                localStorage.removeItem("access_token");

                router.push("/login");
            } else {
                throw new Error(res.data.message);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Logout Failed");
        }
    }
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <h1 className="text-3xl font-semibold mb-6 text-center">
                Welcome, {user?.name}
            </h1>

            <div className="max-w-3xl mx-auto bg-white shadow rounded-2xl p-6">
                <div className={'flex justify-between items-center mb-4'}>
                    <h2 className="text-xl font-semibold ">Departments</h2>
                    <div>
                        <form onSubmit={handleLogout}>
                            <button className={'px-4 py-1 rounded-md text-white bg-red-400'}>Logout</button>
                        </form>
                    </div>
                </div>
                <div className="space-y-3">
                    {departments.map((dept) => (
                        <div
                            key={dept.id}
                            className="flex justify-between items-center border rounded-lg p-3 hover:shadow transition"
                        >
                            <div>
                                <p className="font-medium">{dept.name}</p>
                            </div>
                            <button
                                onClick={() => handleViewStaff(dept.id)}
                                className={`px-4 py-1 rounded-md text-white ${
                                    user?.departmentId === dept.id
                                        ? "bg-blue-600 hover:bg-blue-700"
                                        : "bg-gray-400 cursor-not-allowed"
                                }`}
                            >
                                View Staff
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
