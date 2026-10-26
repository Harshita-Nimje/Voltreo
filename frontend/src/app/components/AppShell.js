"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function AppShell({ children }) {
    const pathname = usePathname();

    const hideSidebar = [
        "/",
        "/login",
        "/register",
    ].includes(pathname);

    if (hideSidebar) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-[#080D0B] text-white">
            <Sidebar />

            <main className="min-h-screen pt-12 lg:pt-0 lg:pr-64">
                {children}
            </main>
        </div>
    );
}