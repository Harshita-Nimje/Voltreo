"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const driverLinks = [
    { label: "Dashboard", href: "/dashboard", icon: "⌂" },
    { label: "Explore Chargers", href: "/chargers", icon: "⌖" },
    { label: "My Bookings", href: "/bookings", icon: "▤" },
];

const hostLinks = [
    { label: "Host Dashboard", href: "/host/dashboard", icon: "⌂" },
    { label: "My Chargers", href: "/host/chargers", icon: "⚡" },
    { label: "Manage Bookings", href: "/host/bookings", icon: "▤" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [role, setRole] = useState("");
    const [userName, setUserName] = useState("");
    const [open, setOpen] = useState(false);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem("user");

            if (storedUser) {
                const user = JSON.parse(storedUser);
                setRole(user.role || "user");
                setUserName(user.name || "Voltreo User");
            }
        } catch (error) {
            console.error("Unable to read user information:", error);
        }
    }, []);

    const links = role === "host" ? hostLinks : driverLinks;

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="fixed left-4 top-4 z-50 rounded-lg border border-white/10 bg-[#111814] px-3 py-2 text-white lg:hidden"
                aria-label="Toggle navigation"
            >
                ☰
            </button>

            {open && (
                <button
                    type="button"
                    aria-label="Close navigation"
                    onClick={() => setOpen(false)}
                    className="fixed inset-0 z-40 bg-black/60 lg:hidden"
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-[60] flex h-dvh w-64 flex-col overflow-hidden border-r border-white/10 bg-[#080D0B] p-4 text-white transition-transform duration-200 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <Link
                    href={role === "host" ? "/host/dashboard" : "/dashboard"}
                    className="mb-10 flex items-center gap-3"
                    onClick={() => setOpen(false)}
                >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#B5FFCE] text-xl font-bold text-[#080D0B]">
                        V
                    </span>
                    <span>
                        <span className="block text-lg font-bold tracking-wide">
                            VOLTREO
                        </span>
                        <span className="text-xs text-white/45">
                            EV charging made simple
                        </span>
                    </span>
                </Link>

                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">
                    Navigation
                </p>

                <nav className="space-y-2">
                    {links.map((link) => {
                        const active = pathname === link.href;

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setOpen(false)}
                                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${active
                                    ? "bg-[#B5FFCE]/10 font-medium text-[#B5FFCE]"
                                    : "text-white/65 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                <span className="w-5 text-center text-lg">
                                    {link.icon}
                                </span>
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto border-t border-white/10 pt-4">
                    <p className="truncate text-sm font-medium">
                        {userName || "Your account"}
                    </p>
                    <p className="mb-4 mt-1 text-xs capitalize text-white/45">
                        {role || "Loading account"}
                    </p>

                    <button
                        type="button"
                        onClick={logout}
                        className="w-full rounded-xl px-3 py-2 text-left text-sm text-white/60 transition hover:bg-red-400/10 hover:text-red-300"
                    >
                        Log out
                    </button>
                </div>
            </aside>
        </>
    );
}