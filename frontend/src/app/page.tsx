"use client"
import {useEffect} from "react";
import {useRouter} from "next/navigation";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        router.push("/dashboard");
        return
    })
    return (
        <div
            className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
            <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">

            </main>
            <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
                <a
                    className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                    href=""
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Employee Authentication System by <b>Naing Min Khant</b>. Made with passion.
                </a>
            </footer>
        </div>
    );
}
