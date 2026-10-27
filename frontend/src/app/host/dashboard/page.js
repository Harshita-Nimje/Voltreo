
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:5000/api";

export default function HostDashboardPage() {
    const router = useRouter();

    const [user, setUser] = useState(null);
    const [chargers, setChargers] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (!token) {
            router.push("/login");
            return;
        }

        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch {
                setUser(null);
            }
        }

        const fetchDashboard = async () => {
            try {
                const headers = {
                    Authorization: `Bearer ${token}`,
                };

                const [chargerResponse, bookingResponse] =
                    await Promise.all([
                        fetch(`${API_URL}/chargers/my`, { headers }),
                        fetch(`${API_URL}/bookings/host`, { headers }),
                    ]);

                const chargerData = await chargerResponse.json();
                const bookingData = await bookingResponse.json();

                if (!chargerResponse.ok) {
                    throw new Error(
                        chargerData.message ||
                        "Unable to load your chargers."
                    );
                }

                if (!bookingResponse.ok) {
                    throw new Error(
                        bookingData.message ||
                        "Unable to load your booking requests."
                    );
                }

                setChargers(chargerData.chargers || []);
                setBookings(bookingData.bookings || []);
            } catch (err) {
                setError(
                    err.message ||
                    "Something went wrong while loading your dashboard."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, [router]);

    const pendingCount = bookings.filter(
        (booking) => booking.status?.toLowerCase() === "pending"
    ).length;

    const approvedCount = bookings.filter(
        (booking) => booking.status?.toLowerCase() === "approved"
    ).length;

    const totalEarnings = bookings
        .filter((booking) => booking.status?.toLowerCase() === "approved")
        .reduce(
            (total, booking) => total + Number(booking.total_price || 0),
            0
        );

    const formatPrice = (amount) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount);

    const formatDate = (value) =>
        new Date(value).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            timeZone: "Asia/Kolkata",
        });

    const statusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case "pending":
                return "border-amber-400/20 bg-amber-400/10 text-amber-300";
            case "approved":
                return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
            case "rejected":
                return "border-red-400/20 bg-red-400/10 text-red-300";
            default:
                return "border-white/10 bg-white/5 text-gray-400";
        }
    };

    return (
        <main className="min-h-screen bg-[#080D0B] px-4 py-8 text-white sm:px-8 sm:py-10 lg:ml-114 lg:px-12">
            <div className="mx-auto max-w-7xl">
                {/* Dashboard header */}
                <header className="relative mb-10 overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#17231C] via-[#101713] to-[#0B100D] p-6 sm:p-9 lg:p-10">
                    <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-[#B5FFCE]/[0.07] blur-3xl" />
                    <div className="pointer-events-none absolute bottom-0 right-32 h-32 w-32 rounded-full bg-emerald-400/[0.05] blur-3xl" />

                    <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
                        <div className="max-w-2xl">
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#B5FFCE]/20 bg-[#B5FFCE]/[0.07] px-3 py-1.5">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#B5FFCE]" />
                                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B5FFCE]">
                                    Voltreo / Host workspace
                                </span>
                            </div>

                            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                                Your charging
                                <br className="hidden sm:block" /> network,{" "}
                                <span className="text-[#B5FFCE]">at a glance.</span>
                            </h1>

                            <p className="mt-4 max-w-lg text-sm leading-7 text-white/50 sm:text-base">
                                {user?.name
                                    ? `Welcome back, ${user.name}. `
                                    : "Welcome back. "}
                                Keep your stations organized and stay on top of every
                                booking request.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => router.push("/host/bookings")}
                            className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#B5FFCE] px-5 py-3 text-sm font-semibold text-[#08120C] transition duration-200 hover:bg-[#D0FFDF] hover:shadow-[0_0_28px_rgba(181,255,206,0.12)]"
                        >
                            Manage bookings
                            <span className="transition-transform group-hover:translate-x-1">
                                →
                            </span>
                        </button>
                    </div>

                    <div className="relative mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/[0.08] pt-5 text-xs text-white/45">
                        <span className="inline-flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#B5FFCE]" />
                            Host overview
                        </span>
                        <span>Stations and reservations</span>
                        <span className="text-white/25">VOLTREO / HOST</span>
                    </div>
                </header>

                {error && (
                    <div
                        role="alert"
                        className="mb-6 rounded-xl border border-red-400/20 bg-red-400/[0.06] p-4 text-sm text-red-300"
                    >
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="rounded-2xl border border-white/[0.08] bg-[#101612] p-12 text-center">
                        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#B5FFCE]" />
                        <p className="text-sm text-white/50">
                            Preparing your host overview...
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Overview metrics */}
                        <section>
                            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B5FFCE]/70">
                                        Performance overview
                                    </p>
                                    <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
                                        Your activity
                                    </h2>
                                </div>
                                <p className="text-xs text-white/35">
                                    Summary of your host account
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101612] p-5 transition hover:border-[#B5FFCE]/25 sm:p-6">
                                    <div className="mb-7 flex items-center justify-between">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#B5FFCE]/15 bg-[#B5FFCE]/[0.07] text-lg text-[#B5FFCE]">
                                            ⚡
                                        </span>
                                        <span className="text-[10px] font-medium uppercase tracking-wider text-white/30">
                                            Stations
                                        </span>
                                    </div>
                                    <p className="text-sm text-white/50">My chargers</p>
                                    <p className="mt-2 text-3xl font-semibold tracking-tight">
                                        {chargers.length}
                                    </p>
                                    <div className="mt-5 h-px bg-gradient-to-r from-[#B5FFCE]/35 to-transparent" />
                                    <p className="mt-3 text-xs text-white/35">
                                        Chargers linked to your account
                                    </p>
                                </div>

                                <div className="group relative overflow-hidden rounded-2xl border border-amber-300/15 bg-[#15130E] p-5 transition hover:border-amber-300/30 sm:p-6">
                                    <div className="mb-7 flex items-center justify-between">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-300/15 bg-amber-300/[0.07] text-lg text-amber-300">
                                            ◷
                                        </span>
                                        <span className="rounded-full border border-amber-300/15 bg-amber-300/[0.06] px-2.5 py-1 text-[10px] font-medium text-amber-200">
                                            Action needed
                                        </span>
                                    </div>
                                    <p className="text-sm text-white/50">
                                        Pending requests
                                    </p>
                                    <p className="mt-2 text-3xl font-semibold tracking-tight text-amber-200">
                                        {pendingCount}
                                    </p>
                                    <div className="mt-5 h-px bg-gradient-to-r from-amber-300/35 to-transparent" />
                                    <p className="mt-3 text-xs text-white/35">
                                        Awaiting your decision
                                    </p>
                                </div>

                                <div className="group relative overflow-hidden rounded-2xl border border-emerald-300/15 bg-[#0F1712] p-5 transition hover:border-emerald-300/30 sm:p-6">
                                    <div className="mb-7 flex items-center justify-between">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-300/15 bg-emerald-300/[0.07] text-lg text-emerald-300">
                                            ✓
                                        </span>
                                        <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-300/60">
                                            Confirmed
                                        </span>
                                    </div>
                                    <p className="text-sm text-white/50">
                                        Approved bookings
                                    </p>
                                    <p className="mt-2 text-3xl font-semibold tracking-tight text-emerald-200">
                                        {approvedCount}
                                    </p>
                                    <div className="mt-5 h-px bg-gradient-to-r from-emerald-300/35 to-transparent" />
                                    <p className="mt-3 text-xs text-white/35">
                                        Requests you've approved
                                    </p>
                                </div>

                                <div className="group relative overflow-hidden rounded-2xl border border-[#B5FFCE]/15 bg-gradient-to-br from-[#14231A] to-[#101612] p-5 transition hover:border-[#B5FFCE]/30 sm:p-6">
                                    <div className="mb-7 flex items-center justify-between">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#B5FFCE]/20 bg-[#B5FFCE]/[0.08] text-lg text-[#B5FFCE]">
                                            ₹
                                        </span>
                                        <span className="text-[10px] font-medium uppercase tracking-wider text-[#B5FFCE]/60">
                                            Booking value
                                        </span>
                                    </div>
                                    <p className="text-sm text-white/50">
                                        Approved booking value
                                    </p>
                                    <p className="mt-2 break-words text-2xl font-semibold tracking-tight text-[#B5FFCE] sm:text-3xl">
                                        {formatPrice(totalEarnings)}
                                    </p>
                                    <div className="mt-5 h-px bg-gradient-to-r from-[#B5FFCE]/35 to-transparent" />
                                    <p className="mt-3 text-xs leading-5 text-white/35">
                                        Not verified payouts or realized earnings
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Charger inventory */}
                        <section className="mt-12 sm:mt-14">
                            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                                        Your inventory
                                    </p>
                                    <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
                                        Charging stations
                                    </h2>
                                    <p className="mt-2 text-sm text-white/40">
                                        Manage and review your listed locations.
                                    </p>
                                </div>

                                <span className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white/55">
                                    {chargers.length}{" "}
                                    {chargers.length === 1 ? "station" : "stations"}
                                </span>
                            </div>

                            {chargers.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.015] px-6 py-12 text-center">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#B5FFCE]/15 bg-[#B5FFCE]/[0.05] text-2xl text-[#B5FFCE]">
                                        ⚡
                                    </div>
                                    <h3 className="mt-5 font-semibold">
                                        Your network starts here
                                    </h3>
                                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/40">
                                        Chargers associated with your host account
                                        will appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-4 xl:grid-cols-2">
                                    {chargers.map((charger) => (
                                        <article
                                            key={charger.id}
                                            className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0E1410] transition duration-200 hover:border-[#B5FFCE]/25 hover:bg-[#111A14]"
                                        >
                                            <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] p-5 sm:p-6">
                                                <div className="min-w-0">
                                                    <div className="mb-3 flex flex-wrap items-center gap-2">
                                                        <span className="rounded-md border border-[#B5FFCE]/15 bg-[#B5FFCE]/[0.06] px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-[#B5FFCE]">
                                                            Charging station
                                                        </span>
                                                        <span className="text-[10px] text-white/30">
                                                            ID #{charger.id}
                                                        </span>
                                                    </div>
                                                    <h3 className="break-words text-lg font-semibold tracking-tight sm:text-xl">
                                                        {charger.title}
                                                    </h3>
                                                    <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-white/45">
                                                        <span className="mt-0.5 text-[#B5FFCE]/70">
                                                            ↗
                                                        </span>
                                                        <span>{charger.address}</span>
                                                    </p>
                                                </div>

                                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-lg text-[#B5FFCE]/80 transition group-hover:border-[#B5FFCE]/20">
                                                    ⚡
                                                </span>
                                            </div>

                                            <div className="p-5 sm:p-6">
                                                <p className="text-sm leading-6 text-white/45">
                                                    {charger.description ||
                                                        "No description provided."}
                                                </p>

                                                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                                    <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
                                                        <p className="text-[10px] uppercase tracking-wider text-white/35">
                                                            Connector
                                                        </p>
                                                        <p className="mt-2 break-words text-sm font-medium text-white/85">
                                                            {charger.charger_type ||
                                                                "Not specified"}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
                                                        <p className="text-[10px] uppercase tracking-wider text-white/35">
                                                            Power output
                                                        </p>
                                                        <p className="mt-2 text-sm font-medium text-white/85">
                                                            {charger.power_kw
                                                                ? `${charger.power_kw} kW`
                                                                : "Not specified"}
                                                        </p>
                                                    </div>
                                                    <div className="col-span-2 rounded-xl border border-[#B5FFCE]/10 bg-[#B5FFCE]/[0.035] p-3 sm:col-span-1">
                                                        <p className="text-[10px] uppercase tracking-wider text-white/35">
                                                            Listed rate
                                                        </p>
                                                        <p className="mt-2 text-sm font-semibold text-[#B5FFCE]">
                                                            {formatPrice(
                                                                charger.price_per_hour
                                                            )}
                                                            <span className="ml-1 text-xs font-normal text-white/40">
                                                                / hour
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Recent booking activity */}
                        <section className="mt-12 sm:mt-14">
                            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                                        Reservation activity
                                    </p>
                                    <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
                                        Recent booking requests
                                    </h2>
                                    <p className="mt-2 text-sm text-white/40">
                                        Stay up to date with activity across your
                                        charging stations.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => router.push("/host/bookings")}
                                    className="group inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-4 py-2.5 text-xs font-medium text-white/65 transition hover:border-[#B5FFCE]/25 hover:text-[#B5FFCE]"
                                >
                                    All requests
                                    <span className="transition-transform group-hover:translate-x-1">
                                        →
                                    </span>
                                </button>
                            </div>

                            {bookings.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.015] p-8 text-sm text-white/40">
                                    No booking requests yet. New reservations will
                                    appear here.
                                </div>
                            ) : (
                                <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0E1410]">
                                    <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4 sm:px-6">
                                        <span className="text-xs font-medium text-white/65">
                                            Latest activity
                                        </span>
                                        <span className="text-[10px] uppercase tracking-wider text-white/30">
                                            Showing {Math.min(bookings.length, 5)} of{" "}
                                            {bookings.length}
                                        </span>
                                    </div>

                                    <div className="divide-y divide-white/[0.06]">
                                        {bookings.slice(0, 5).map((booking) => (
                                            <div
                                                key={booking.id}
                                                className="flex flex-col gap-4 px-5 py-5 transition hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between sm:px-6"
                                            >
                                                <div className="flex min-w-0 items-start gap-4">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-[#B5FFCE]">
                                                        ⚡
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="break-words font-medium text-white/90">
                                                            {booking.charger_title ||
                                                                `Charger #${booking.charger_id}`}
                                                        </p>
                                                        <p className="mt-1 text-xs text-white/40">
                                                            {booking.driver_name ||
                                                                "Driver"}{" "}
                                                            <span className="text-white/20">
                                                                ·
                                                            </span>{" "}
                                                            Booking #{booking.id}
                                                        </p>
                                                        <p className="mt-2 text-xs text-white/35">
                                                            {formatDate(
                                                                booking.start_time
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center justify-between gap-3 pl-14 sm:justify-end sm:pl-0">
                                                    <span className="text-sm font-semibold text-white/85">
                                                        {formatPrice(
                                                            booking.total_price
                                                        )}
                                                    </span>

                                                    <span
                                                        className={`rounded-full border px-3 py-1.5 text-[11px] font-medium capitalize ${statusStyle(
                                                            booking.status
                                                        )}`}
                                                    >
                                                        {booking.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>

                        <footer className="mt-12 flex flex-col gap-2 border-t border-white/[0.07] pt-6 text-[10px] uppercase tracking-[0.15em] text-white/25 sm:flex-row sm:items-center sm:justify-between">
                            <span>Voltreo / Host workspace</span>
                            <span>Charging infrastructure, simplified.</span>
                        </footer>
                    </>
                )}
            </div>
        </main>
    );
}
