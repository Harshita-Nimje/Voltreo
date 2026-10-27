
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NotificationBell from "../components/NotificationBell";

const API_URL = "http://localhost:5000/api";

function Icon({ name, size = 18, className = "" }) {
    const common = {
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.7,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        className,
        "aria-hidden": true,
    };

    const paths = {
        bolt: <><path d="m13 2-3 8h7l-6 12 1-9H5l8-11Z" /></>,
        pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
        calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
        search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
        arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
        home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v12h14V9M9 21v-7h6v7" /></>,
        map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z" /><path d="M9 3v15M15 6v15" /></>,
        settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.5 2.6-1.7-.6a8 8 0 0 1-1.8 1l-.3 1.8h-3l-.3-1.8a8 8 0 0 1-1.8-1l-1.7.6-1.5-2.6 1.4-1.1a8 8 0 0 1 0-2l-1.4-1.1 1.5-2.6 1.7.6a8 8 0 0 1 1.8-1L12.8 7h3l.3 1.8a8 8 0 0 1 1.8 1l1.7-.6 1.5 2.6-1.4 1.1a8 8 0 0 1-.3 2.1Z" /></>,
        logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" /></>,
        menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
        check: <><path d="m5 12 4 4L19 6" /></>,
        alert: <><path d="M12 3 2.5 20h19L12 3Z" /><path d="M12 9v4M12 17h.01" /></>,
    };

    return <svg {...common}>{paths[name] || paths.bolt}</svg>;
}

function formatPrice(price) {
    const value = Number(price);

    if (!Number.isFinite(value)) {
        return "Price unavailable";
    }

    return `₹${value.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    })}/hour`;
}

export default function DashboardPage() {
    const [chargers, setChargers] = useState([]);
    const [loadingChargers, setLoadingChargers] = useState(true);
    const [fetchError, setFetchError] = useState("");
    const [search, setSearch] = useState("");
    const [location, setLocation] = useState("");
    const [selectedCharger, setSelectedCharger] = useState(null);
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        const controller = new AbortController();

        async function fetchChargers() {
            setLoadingChargers(true);
            setFetchError("");

            try {
                const requestUrl = `${API_URL}/chargers/approved`;

                console.log("API_URL:", API_URL);
                console.log("Request URL:", requestUrl);

                const response = await fetch(
                    `${API_URL}/chargers/approved`,
                    { signal: controller.signal }
                );

                console.log("Response status:", response.status);
                console.log("Response URL:", response.url);
                console.log("Content-Type:", response.headers.get("content-type"));

                if (!response.ok) {
                    throw new Error(
                        `Unable to load chargers (HTTP ${response.status}).`
                    );
                }

                const data = await response.json();

                if (!Array.isArray(data.chargers)) {
                    throw new Error("The server returned an unexpected response.");
                }

                setChargers(data.chargers);
            } catch (error) {
                if (error.name !== "AbortError") {
                    console.error("Error fetching approved chargers:", error);
                    setFetchError(
                        "We couldn't load chargers. Please check that the backend is running and try again."
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoadingChargers(false);
                }
            }
        }

        fetchChargers();

        return () => controller.abort();
    }, []);

    useEffect(() => {
        const sections = ["overview", "explore"];

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveTab(entry.target.id);
                    }
                });
            },
            {
                rootMargin: "-20% 0px -65% 0px",
            }
        );

        sections.forEach((id) => {
            const section = document.getElementById(id);
            if (section) observer.observe(section);
        });

        return () => observer.disconnect();
    }, []);

    const filteredChargers = useMemo(() => {
        const searchTerm = search.trim().toLowerCase();
        const locationTerm = location.trim().toLowerCase();

        return chargers.filter((charger) => {
            const title = charger.title || "";
            const address = charger.address || "";
            const connector = charger.charger_type || "";

            const matchesSearch =
                !searchTerm ||
                title.toLowerCase().includes(searchTerm) ||
                address.toLowerCase().includes(searchTerm) ||
                connector.toLowerCase().includes(searchTerm);

            const matchesLocation =
                !locationTerm ||
                address.toLowerCase().includes(locationTerm);

            return matchesSearch && matchesLocation;
        });
    }, [chargers, search, location]);

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
    }

    return (
        <div className="min-h-screen bg-[#080D0B] text-white lg:ml-60">
            <div className="min-h-screen lg:pl-64">
                {/* Sidebar */}

                <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 shrink-0 flex-col border-r border-white/[0.07] bg-[#0A100C] px-5 py-7 lg:flex">
                    <Link
                        href="/"
                        className="mb-12 px-3 text-2xl font-bold tracking-tight"
                    >
                        volt<span className="text-[#B5FFCE]">reo</span>
                    </Link>

                    <p className="mb-3 px-3 text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">
                        Workspace
                    </p>

                    <nav className="space-y-1">
                        <a
                            href="#overview"
                            onClick={() => setActiveTab("overview")}
                            className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-sm transition ${activeTab === "overview"
                                ? "border-[#B5FFCE]/20 bg-[#B5FFCE]/[0.08] text-[#B5FFCE]"
                                : "border-transparent text-white/50 hover:bg-white/[0.04] hover:text-white"
                                }`}
                        >
                            <Icon name="home" size={18} />
                            Overview
                            {activeTab === "overview" && (
                                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#B5FFCE]" />
                            )}
                        </a>

                        <a
                            href="#explore"
                            onClick={() => setActiveTab("explore")}
                            className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-sm transition ${activeTab === "explore"
                                ? "border-[#B5FFCE]/20 bg-[#B5FFCE]/[0.08] text-[#B5FFCE]"
                                : "border-transparent text-white/50 hover:bg-white/[0.04] hover:text-white"
                                }`}
                        >
                            <Icon name="map" size={18} />
                            Explore chargers
                            {activeTab === "explore" && (
                                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#B5FFCE]" />
                            )}
                        </a>

                        <Link
                            href="/bookings"
                            onClick={() => setActiveTab("bookings")}
                            className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-sm transition ${activeTab === "bookings"
                                ? "border-[#B5FFCE]/20 bg-[#B5FFCE]/[0.08] text-[#B5FFCE]"
                                : "border-transparent text-white/50 hover:bg-white/[0.04] hover:text-white"
                                }`}
                        >
                            <Icon name="calendar" size={18} />
                            My bookings
                            {activeTab === "bookings" && (
                                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#B5FFCE]" />
                            )}
                        </Link>
                    </nav>

                    <div className="mt-auto shrink-0">
                        <div className="mb-5 rounded-2xl border border-[#B5FFCE]/10 bg-[#B5FFCE]/[0.04] p-4">
                            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-[#B5FFCE]/10 text-[#B5FFCE]">
                                <Icon name="bolt" size={19} />
                            </div>
                            <p className="text-sm font-medium">Keep moving.</p>
                            <p className="mt-1 text-xs leading-5 text-white/40">
                                Find your next charging stop with Voltreo.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/45 transition hover:bg-white/[0.04] hover:text-white"
                        >
                            <Icon name="logout" size={17} />
                            Log out
                        </button>
                    </div>
                </aside>


                {/* Main content */}
                <section
                    id="overview"
                    className="relative -top-10 min-w-0 flex-1 px-5 py-7 sm:top-0 sm:px-8 sm:py-9 lg:px-12 lg:py-10"
                >
                    <div className="mx-auto max-w-6xl">
                        {/* Top bar */}
                        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
                            <div className="-mt-3 pl-14 sm:mt-0 sm:pl-0">
                                <p className="text-xs text-white/35">
                                    Workspace /{" "}
                                    <span className="text-[#B5FFCE]">Overview</span>
                                </p>
                                <p className="mt-2 text-sm text-white/60">
                                    Your charging, all in one place.
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Desktop: Keep the existing EV Driver profile */}
                                <div className="hidden items-center gap-3 sm:flex">
                                    <div className="text-right">
                                        <p className="text-sm font-medium">EV Driver</p>
                                        <p className="mt-1 text-xs text-white/35">
                                            Driver account
                                        </p>
                                    </div>

                                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#B5FFCE]/20 bg-[#B5FFCE]/10 text-sm font-semibold text-[#B5FFCE]">
                                        EV
                                    </div>
                                </div>

                                {/* Mobile: Show the notification bell in the same place */}
                                <div className="sm:hidden">
                                    <NotificationBell />
                                </div>
                            </div>
                        </div>

                        {/* Welcome banner */}
                        <div className="relative mb-8 overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#14251B] via-[#101A13] to-[#0B100D] p-7 sm:p-10">
                            <div className="pointer-events-none absolute -right-12 -top-20 h-72 w-72 rounded-full border border-[#B5FFCE]/[0.07]" />
                            <div className="pointer-events-none absolute -right-1 -top-9 h-52 w-52 rounded-full border border-[#B5FFCE]/[0.10]" />
                            <div className="pointer-events-none absolute right-12 top-10 h-24 w-24 rounded-full bg-[#B5FFCE]/[0.06] blur-3xl" />

                            <div className="relative z-10 max-w-2xl">
                                <span className="inline-flex items-center gap-2 rounded-full border border-[#B5FFCE]/15 bg-[#B5FFCE]/[0.06] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[#B5FFCE]">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#B5FFCE]" />
                                    Your electric journey
                                </span>

                                <h1 className="mt-6 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
                                    Ready for your
                                    <br />
                                    <span className="text-[#B5FFCE]">next charge?</span>
                                </h1>

                                <p className="mt-4 max-w-md text-sm leading-6 text-white/55">
                                    Discover charging stations, find the right connector,
                                    and plan your next stop with confidence.
                                </p>

                                <button
                                    type="button"
                                    onClick={() =>
                                        document.getElementById("explore")?.scrollIntoView({
                                            behavior: "smooth",
                                        })
                                    }
                                    className="mt-7 inline-flex items-center gap-3 rounded-xl bg-[#B5FFCE] px-5 py-3 text-sm font-semibold text-[#080D0B] transition hover:bg-[#D0FFDF]"
                                >
                                    Explore chargers
                                    <Icon name="arrow" size={17} />
                                </button>
                            </div>
                        </div>

                        {/* Summary cards */}
                        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                                <div className="mb-5 flex items-center justify-between">
                                    <span className="text-sm text-white/50">
                                        Approved chargers
                                    </span>
                                    <span className="rounded-xl bg-[#B5FFCE]/10 p-2 text-[#B5FFCE]">
                                        <Icon name="bolt" size={18} />
                                    </span>
                                </div>
                                <p className="text-3xl font-semibold">
                                    {loadingChargers ? "—" : chargers.length}
                                </p>
                                <p className="mt-2 text-xs text-white/35">
                                    Approved listings in the marketplace
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                                <div className="mb-5 flex items-center justify-between">
                                    <span className="text-sm text-white/50">
                                        Matching results
                                    </span>
                                    <span className="rounded-xl bg-emerald-400/10 p-2 text-emerald-300">
                                        <Icon name="pin" size={18} />
                                    </span>
                                </div>
                                <p className="text-3xl font-semibold">
                                    {loadingChargers ? "—" : filteredChargers.length}
                                </p>
                                <p className="mt-2 text-xs text-white/35">
                                    Based on your current search
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                                <div className="mb-5 flex items-center justify-between">
                                    <span className="text-sm text-white/50">
                                        My bookings
                                    </span>
                                    <span className="rounded-xl bg-sky-400/10 p-2 text-sky-300">
                                        <Icon name="calendar" size={18} />
                                    </span>
                                </div>
                                <p className="text-3xl font-semibold">—</p>
                                <p className="mt-2 text-xs text-white/35">
                                    Booking data not connected yet
                                </p>
                            </div>
                        </div>

                        {/* Charger exploration */}
                        <div id="explore" className="scroll-mt-8">
                            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#B5FFCE]/70">
                                        Discover
                                    </p>
                                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                                        Explore chargers
                                    </h2>
                                    <p className="mt-2 text-sm text-white/40">
                                        Find a station that fits your journey.
                                    </p>
                                </div>

                                <span className="text-xs text-white/35">
                                    {loadingChargers
                                        ? "Loading chargers..."
                                        : `${filteredChargers.length} results`}
                                </span>
                            </div>

                            {/* Search and location filters */}
                            <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                                <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 focus-within:border-[#B5FFCE]/40">
                                    <span className="text-white/35">
                                        <Icon name="search" size={18} />
                                    </span>
                                    <input
                                        type="search"
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        placeholder="Search stations, locations, connectors..."
                                        aria-label="Search chargers"
                                        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                                    />
                                </div>

                                <input
                                    type="text"
                                    value={location}
                                    onChange={(event) => setLocation(event.target.value)}
                                    placeholder="Filter by area"
                                    aria-label="Filter by area"
                                    className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#B5FFCE]/40 sm:w-44"
                                />
                            </div>

                            {/* Loading state */}
                            {loadingChargers && (
                                <div className="grid gap-4 xl:grid-cols-2">
                                    {[1, 2].map((item) => (
                                        <div
                                            key={item}
                                            className="animate-pulse rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6"
                                        >
                                            <div className="h-4 w-40 rounded bg-white/10" />
                                            <div className="mt-4 h-3 w-56 rounded bg-white/[0.06]" />
                                            <div className="mt-8 h-12 rounded bg-white/[0.06]" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Error state */}
                            {!loadingChargers && fetchError && (
                                <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.04] p-6">
                                    <div className="flex items-start gap-3">
                                        <span className="text-red-300">
                                            <Icon name="alert" size={20} />
                                        </span>
                                        <div>
                                            <p className="font-medium">Unable to load chargers</p>
                                            <p className="mt-2 text-sm leading-6 text-white/50">
                                                {fetchError}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => window.location.reload()}
                                                className="mt-4 rounded-lg border border-white/10 px-4 py-2 text-sm transition hover:border-[#B5FFCE]/30 hover:text-[#B5FFCE]"
                                            >
                                                Try again
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Real charger cards */}
                            {!loadingChargers && !fetchError && (
                                <>
                                    <div className="grid gap-4 xl:grid-cols-2">
                                        {filteredChargers.map((charger) => (
                                            <article
                                                key={charger.id}
                                                className="group rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition duration-300 hover:border-[#B5FFCE]/20 hover:bg-white/[0.04] sm:p-6"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex min-w-0 items-start gap-4">
                                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#B5FFCE]/10 bg-[#B5FFCE]/[0.06] text-[#B5FFCE]">
                                                            <Icon name="bolt" size={22} />
                                                        </div>

                                                        <div className="min-w-0">
                                                            <h3 className="truncate font-medium transition group-hover:text-[#B5FFCE]">
                                                                {charger.title}
                                                            </h3>
                                                            <p className="mt-1 flex items-start gap-1.5 text-xs leading-5 text-white/40">
                                                                <span className="mt-0.5 shrink-0">
                                                                    <Icon name="pin" size={13} />
                                                                </span>
                                                                <span>{charger.address || "Address unavailable"}</span>
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <span className="shrink-0 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-medium text-emerald-300">
                                                        <span className="mr-1">●</span>
                                                        Approved
                                                    </span>
                                                </div>

                                                <div className="my-5 grid grid-cols-3 gap-3 border-y border-white/[0.07] py-4">
                                                    <div>
                                                        <p className="text-[10px] text-white/35">
                                                            Power
                                                        </p>
                                                        <p className="mt-1.5 text-sm font-medium">
                                                            {charger.power_kw != null
                                                                ? `${charger.power_kw} kW`
                                                                : "Not specified"}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-[10px] text-white/35">
                                                            Connector
                                                        </p>
                                                        <p className="mt-1.5 text-sm font-medium">
                                                            {charger.charger_type || "Not specified"}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-[10px] text-white/35">
                                                            Price
                                                        </p>
                                                        <p className="mt-1.5 text-sm font-medium text-[#B5FFCE]">
                                                            {formatPrice(charger.price_per_hour)}
                                                        </p>
                                                    </div>
                                                </div>

                                                {charger.description && (
                                                    <p className="mb-4 line-clamp-2 text-xs leading-5 text-white/45">
                                                        {charger.description}
                                                    </p>
                                                )}

                                                <div className="flex items-center justify-between gap-3">
                                                    <p className="text-xs text-white/35">
                                                        Charger #{charger.id}
                                                    </p>

                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedCharger(charger)}
                                                        className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-white/70 transition hover:border-[#B5FFCE]/30 hover:text-[#B5FFCE]"
                                                    >
                                                        View details
                                                        <Icon name="arrow" size={14} />
                                                    </button>
                                                </div>
                                            </article>
                                        ))}
                                    </div>

                                    {filteredChargers.length === 0 && (
                                        <div className="rounded-2xl border border-dashed border-white/10 px-5 py-12 text-center">
                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] text-white/40">
                                                <Icon name="search" size={21} />
                                            </div>
                                            <p className="mt-4 font-medium">
                                                No matching chargers
                                            </p>
                                            <p className="mt-2 text-sm text-white/40">
                                                Try another station name or location.
                                            </p>
                                            {(search || location) && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSearch("");
                                                        setLocation("");
                                                    }}
                                                    className="mt-4 text-sm text-[#B5FFCE] hover:underline"
                                                >
                                                    Clear filters
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] py-6 text-xs text-white/30">
                            <p>© 2026 Voltreo. Find power. Find your way.</p>
                            <Link
                                href="/"
                                className="transition hover:text-[#B5FFCE]"
                            >
                                Visit website →
                            </Link>
                        </footer>
                    </div>
                </section>
            </div>

            {/* Charger details modal */}
            {selectedCharger && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
                    onClick={() => setSelectedCharger(null)}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="charger-modal-title"
                        className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0D1510] p-6 shadow-2xl sm:p-8"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-[#B5FFCE]/70">
                                    Charger details
                                </p>
                                <h2
                                    id="charger-modal-title"
                                    className="mt-3 text-2xl font-semibold"
                                >
                                    {selectedCharger.title}
                                </h2>
                            </div>

                            <button
                                type="button"
                                aria-label="Close details"
                                onClick={() => setSelectedCharger(null)}
                                className="rounded-lg px-3 py-2 text-white/50 hover:bg-white/[0.06] hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <p className="mt-4 flex items-start gap-2 text-sm leading-6 text-white/50">
                            <Icon name="pin" size={17} className="mt-0.5 shrink-0" />
                            {selectedCharger.address || "Address unavailable"}
                        </p>

                        {selectedCharger.description && (
                            <p className="mt-5 text-sm leading-6 text-white/65">
                                {selectedCharger.description}
                            </p>
                        )}

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
                                <p className="text-xs text-white/40">Charging power</p>
                                <p className="mt-2 font-medium">
                                    {selectedCharger.power_kw != null
                                        ? `${selectedCharger.power_kw} kW`
                                        : "Not specified"}
                                </p>
                            </div>
                            <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
                                <p className="text-xs text-white/40">Connector</p>
                                <p className="mt-2 font-medium">
                                    {selectedCharger.charger_type || "Not specified"}
                                </p>
                            </div>
                            <div className="col-span-2 rounded-xl border border-[#B5FFCE]/10 bg-[#B5FFCE]/[0.04] p-4">
                                <p className="text-xs text-white/40">Price</p>
                                <p className="mt-2 text-xl font-semibold text-[#B5FFCE]">
                                    {formatPrice(selectedCharger.price_per_hour)}
                                </p>
                            </div>
                        </div>


                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setSelectedCharger(null)}
                                className="flex-1 rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-white/70 transition hover:bg-white/[0.05]"
                            >
                                Close
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    const charger = selectedCharger;
                                    setSelectedCharger(null);
                                    window.location.href = `/booking?chargerId=${charger.id}`;
                                }}
                                className="flex-1 rounded-xl bg-[#B5FFCE] px-5 py-3 text-sm font-semibold text-[#080D0B] transition hover:bg-[#D0FFDF]"
                            >
                                Book this charger
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
