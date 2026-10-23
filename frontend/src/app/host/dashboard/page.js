
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
        <main className="min-h-screen bg-[#080D0B] px-5 py-10 text-white sm:px-8 lg:px-12">
            <div className="mx-auto max-w-7xl">
                <header className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                    <div>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#B5FFCE]">
                            Voltreo host
                        </p>

                        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                            Host dashboard
                        </h1>

                        <p className="mt-3 text-sm text-gray-400">
                            {user?.name
                                ? `Welcome back, ${user.name}. `
                                : "Welcome back. "}
                            Manage your chargers and booking requests.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.push("/host/bookings")}
                        className="rounded-xl bg-[#B5FFCE] px-5 py-3 text-sm font-semibold text-[#080D0B] transition hover:bg-[#D0FFDF]"
                    >
                        View booking requests
                    </button>
                </header>

                {error && (
                    <div
                        role="alert"
                        className="mb-6 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300"
                    >
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center text-sm text-gray-400">
                        Loading your dashboard...
                    </div>
                ) : (
                    <>
                        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                                <p className="text-sm text-gray-400">
                                    My chargers
                                </p>
                                <p className="mt-3 text-3xl font-semibold">
                                    {chargers.length}
                                </p>
                                <p className="mt-2 text-xs text-gray-500">
                                    Chargers returned by your account
                                </p>
                            </div>

                            <div className="rounded-2xl border border-amber-400/15 bg-amber-400/[0.03] p-6">
                                <p className="text-sm text-gray-400">
                                    Pending requests
                                </p>
                                <p className="mt-3 text-3xl font-semibold text-amber-300">
                                    {pendingCount}
                                </p>
                                <p className="mt-2 text-xs text-gray-500">
                                    Waiting for your decision
                                </p>
                            </div>

                            <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.03] p-6">
                                <p className="text-sm text-gray-400">
                                    Approved bookings
                                </p>
                                <p className="mt-3 text-3xl font-semibold text-emerald-300">
                                    {approvedCount}
                                </p>
                                <p className="mt-2 text-xs text-gray-500">
                                    Requests you have approved
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                                <p className="text-sm text-gray-400">
                                    Approved booking value
                                </p>
                                <p className="mt-3 text-3xl font-semibold text-[#B5FFCE]">
                                    {formatPrice(totalEarnings)}
                                </p>
                                <p className="mt-2 text-xs text-gray-500">
                                    Total value of approved bookings, not
                                    verified payouts
                                </p>
                            </div>
                        </section>

                        <section className="mt-10">
                            <div className="mb-5 flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-semibold">
                                        My chargers
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-400">
                                        Your listed charging stations
                                    </p>
                                </div>
                            </div>

                            {chargers.length === 0 ? (
                                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
                                    <p className="font-medium">
                                        No chargers found
                                    </p>
                                    <p className="mt-2 text-sm text-gray-400">
                                        Chargers associated with your host
                                        account will appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-4 lg:grid-cols-2">
                                    {chargers.map((charger) => (
                                        <article
                                            key={charger.id}
                                            className="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <h3 className="text-lg font-semibold">
                                                        {charger.title}
                                                    </h3>
                                                    <p className="mt-2 text-sm text-gray-400">
                                                        {charger.address}
                                                    </p>
                                                </div>

                                                <span className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-300">
                                                    #{charger.id}
                                                </span>
                                            </div>

                                            <p className="mt-4 text-sm leading-6 text-gray-400">
                                                {charger.description ||
                                                    "No description provided."}
                                            </p>

                                            <div className="mt-5 flex flex-wrap gap-2">
                                                <span className="rounded-lg bg-white/5 px-3 py-2 text-xs text-gray-300">
                                                    {charger.charger_type ||
                                                        "Type not specified"}
                                                </span>
                                                <span className="rounded-lg bg-white/5 px-3 py-2 text-xs text-gray-300">
                                                    {charger.power_kw
                                                        ? `${charger.power_kw} kW`
                                                        : "Power not specified"}
                                                </span>
                                                <span className="rounded-lg bg-white/5 px-3 py-2 text-xs text-[#B5FFCE]">
                                                    {formatPrice(
                                                        charger.price_per_hour
                                                    )}
                                                    /hour
                                                </span>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="mt-12">
                            <div className="mb-5 flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-semibold">
                                        Recent booking requests
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-400">
                                        The latest activity for your chargers
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        router.push("/host/bookings")
                                    }
                                    className="text-sm font-medium text-[#B5FFCE] transition hover:text-white"
                                >
                                    View all
                                </button>
                            </div>

                            {bookings.length === 0 ? (
                                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-sm text-gray-400">
                                    No booking requests yet.
                                </div>
                            ) : (
                                <div className="overflow-hidden rounded-2xl border border-white/10">
                                    <div className="divide-y divide-white/10">
                                        {bookings.slice(0, 5).map((booking) => (
                                            <div
                                                key={booking.id}
                                                className="flex flex-col justify-between gap-4 bg-white/[0.02] p-5 sm:flex-row sm:items-center"
                                            >
                                                <div>
                                                    <p className="font-medium">
                                                        {booking.charger_title ||
                                                            `Charger #${booking.charger_id}`}
                                                    </p>
                                                    <p className="mt-1 text-sm text-gray-400">
                                                        {booking.driver_name ||
                                                            "Driver"}{" "}
                                                        · Booking #
                                                        {booking.id}
                                                    </p>
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {formatDate(
                                                            booking.start_time
                                                        )}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm font-medium text-gray-200">
                                                        {formatPrice(
                                                            booking.total_price
                                                        )}
                                                    </span>

                                                    <span
                                                        className={`rounded-full border px-3 py-1.5 text-xs capitalize ${statusStyle(
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
                    </>
                )}
            </div>
        </main>
    );
}
