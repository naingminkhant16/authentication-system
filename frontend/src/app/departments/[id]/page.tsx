"use client";

import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import api from "@/lib/api";

interface Employee {
    id: number;
    name: string;
    email: string;
    employeeId: string;
}

interface User {
    id: number;
    name: string;
    departmentId: number;
    departmentName: string;
}

export default function DepartmentStaffPage() {
    const router = useRouter();
    const params = useParams();
    const deptId = Number(params.id);

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const userRes = await api.get("/api/auth/me");
                const currentUser = userRes.data.auth;
                setUser(currentUser);

                // authorization check
                if (currentUser.departmentId !== deptId) {
                    alert("You are not authorized to view this department");
                    router.push("/dashboard");
                    return;
                }

                const empRes = await api.get(`/api/departments/${deptId}/employees`);
                console.log(empRes.data);
                setEmployees(empRes.data.data.employees);

            } catch (err) {
                setError("Failed to load data");
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [deptId, router]);

    if (loading)
        return (
            <div className="flex min-h-screen justify-center items-center">
                Loading...
            </div>
        );

    if (error)
        return (
            <div className="flex min-h-screen justify-center items-center text-red-500">
                {error}
            </div>
        );

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-6">
                <h2 className="text-2xl font-semibold mb-4 text-center">
                    Department Staff List ({user?.departmentName})
                </h2>

                <table className="w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="text-left p-2 border-b">#</th>
                        <th className="text-left p-2 border-b">Name</th>
                        <th className="text-left p-2 border-b">Email</th>
                        <th className="text-left p-2 border-b">Employee ID</th>
                    </tr>
                    </thead>
                    <tbody>
                    {employees.length > 0 && employees.map((emp, i) => (
                        <tr key={emp.id} className="hover:bg-gray-50">
                            <td className="p-2 border-b">{i + 1}</td>
                            <td className="p-2 border-b">{emp.name}</td>
                            <td className="p-2 border-b">{emp.email}</td>
                            <td className="p-2 border-b">{emp.employeeId}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}
