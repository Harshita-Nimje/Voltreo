
"use client";

import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";

export default function HostBookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);
    const [message, setMessage] = useState("");

    const fetchBookings = async () => {
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setError("Please log in with your host account.");
                return;
            }

            const response = await fetch(`${API_URL}/bookings/host`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to load booking requests."
                );
            }

            setBookings(data.bookings || []);
        } catch (err) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const updateStatus = async (bookingId, status) => {
        setError("");
        setMessage("");
        setUpdatingId(bookingId);

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("Please log in with your host account.");
            }

            const response = await fetch(
                `${API_URL}/bookings/${bookingId}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ status }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to update this booking."
                );
            }

            setMessage(data.message || `Booking ${status} successfully.`);
            await fetchBookings();
        } catch (err) {
            setError(err.message || "Something went wrong.");
        } finally {
            setUpdatingId(null);
        }
    };

    const formatDateTime = (value) =>
        new Date(value).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: "Asia/Kolkata",
        });

    const formatPrice = (value) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2,
        }).format(Number(value || 0));

    const statusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case "pending":
                return "border-amber-400/20 bg-amber-400/10 text-amber-300";
            case "approved":
                return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
            case "rejected":
                return "border-red-400/20 bg-red-400/10 text-red-300";
            case "cancelled":
                return "border-white/10 bg-white/5 text-gray-400";
            default:
                return "border-white/10 bg-white/5 text-gray-300";
        }
    };

    return (
        <main className="min-h-screen bg-[#080D0B] px-5 py-8 text-white sm:px-8 sm:py-10 lg:ml-114 lg:px-12">
            <div className="mx-auto max-w-6xl">
                {/* Page header */}
                <header className="relative mb-9 overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#17231C] via-[#101713] to-[#0B100D] p-6 sm:p-9">
                    <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#B5FFCE]/[0.07] blur-3xl" />

                    <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                        <div className="max-w-2xl">
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#B5FFCE]/20 bg-[#B5FFCE]/[0.06] px-3 py-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#B5FFCE]" />
                                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B5FFCE]">
                                    Voltreo / Host workspace
                                </span>
                            </div>

                            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                                Booking{" "}
                                <span className="text-[#B5FFCE]">requests.</span>
                            </h1>

                            <p className="mt-4 max-w-xl text-sm leading-7 text-white/50 sm:text-base">
                                Every reservation, in one place. Review charging
                                schedules, assess requests, and keep your network
                                running smoothly.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={fetchBookings}
                            disabled={loading}
                            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-white/80 transition hover:border-[#B5FFCE]/25 hover:bg-[#B5FFCE]/[0.05] hover:text-[#B5FFCE] disabled:opacity-50"
                        >
                            <span className={loading ? "animate-spin" : ""}>↻</span>
                            {loading ? "Refreshing..." : "Refresh requests"}
                        </button>
                    </div>

                    <div className="relative mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-white/[0.08] pt-5 text-xs text-white/40">
                        <span className="inline-flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#B5FFCE]" />
                            Reservation management
                        </span>
                        <span>Review · Approve · Manage</span>
                    </div>
                </header>

                {/* Feedback messages */}
                {message && (
                    <div
                        role="status"
                        className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4 text-sm text-emerald-300"
                    >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/10">
                            ✓
                        </span>
                        <p className="pt-1">{message}</p>
                    </div>
                )}

                {error && (
                    <div
                        role="alert"
                        className="mb-6 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/[0.06] p-4 text-sm text-red-300"
                    >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-400/10">
                            !
                        </span>
                        <p className="pt-1">{error}</p>
                    </div>
                )}

                {/* Request summary */}
                <section className="mb-8 grid gap-4 sm:grid-cols-2">
                    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101612] p-5 sm:p-6">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm text-white/45">
                                    Total reservations
                                </p>
                                <p className="mt-3 text-4xl font-semibold tracking-tight">
                                    {bookings.length}
                                </p>
                                <p className="mt-2 text-xs text-white/30">
                                    Booking requests associated with your chargers
                                </p>
                            </div>

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#B5FFCE]/15 bg-[#B5FFCE]/[0.06] text-xl text-[#B5FFCE]">
                                ≡
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-2xl border border-amber-300/15 bg-[#15130E] p-5 sm:p-6">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm text-white/45">
                                    Awaiting review
                                </p>
                                <p className="mt-3 text-4xl font-semibold tracking-tight text-amber-200">
                                    {
                                        bookings.filter(
                                            (booking) =>
                                                booking.status?.toLowerCase() ===
                                                "pending"
                                        ).length
                                    }
                                </p>
                                <p className="mt-2 text-xs text-white/30">
                                    Requests that need a decision
                                </p>
                            </div>

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-300/15 bg-amber-300/[0.06] text-xl text-amber-200">
                                ◷
                            </div>
                        </div>
                    </div>
                </section>

                {/* Booking list */}
                <section>
                    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                                Reservation activity
                            </p>
                            <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
                                All requests
                            </h2>
                            <p className="mt-2 text-sm text-white/40">
                                Review each reservation and its scheduled charging time.
                            </p>
                        </div>

                        <span className="rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-xs text-white/50">
                            {bookings.length}{" "}
                            {bookings.length === 1 ? "request" : "requests"}
                        </span>
                    </div>

                    {loading ? (
                        <div className="rounded-2xl border border-white/[0.08] bg-[#101612] p-12 text-center">
                            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#B5FFCE]" />
                            <p className="text-sm text-white/45">
                                Loading booking requests...
                            </p>
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.015] px-6 py-16 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#B5FFCE]/15 bg-[#B5FFCE]/[0.05] text-2xl text-[#B5FFCE]">
                                ↗
                            </div>
                            <h2 className="mt-5 text-lg font-semibold">
                                No booking requests yet
                            </h2>
                            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/40">
                                When drivers request a charging session at one of your
                                stations, their reservations will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {bookings.map((booking) => (
                                <article
                                    key={booking.id}
                                    className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0E1410] transition duration-200 hover:border-[#B5FFCE]/20 hover:bg-[#101812]"
                                >
                                    {/* Booking heading */}
                                    <div className="flex flex-col justify-between gap-5 p-5 sm:flex-row sm:items-start sm:p-6">
                                        <div className="flex min-w-0 items-start gap-4">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#B5FFCE]/15 bg-[#B5FFCE]/[0.06] text-lg text-[#B5FFCE]">
                                                ⚡
                                            </div>

                                            <div className="min-w-0">
                                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/35">
                                                        Booking #{booking.id}
                                                    </span>
                                                </div>

                                                <h3 className="break-words text-lg font-semibold tracking-tight sm:text-xl">
                                                    {booking.charger_title ||
                                                        `Charger #${booking.charger_id}`}
                                                </h3>

                                                <p className="mt-2 text-sm text-white/45">
                                                    Requested by{" "}
                                                    <span className="font-medium text-white/80">
                                                        {booking.driver_name ||
                                                            "Driver"}
                                                    </span>
                                                </p>

                                                {booking.driver_email && (
                                                    <p className="mt-1 break-all text-xs text-white/35">
                                                        {booking.driver_email}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <span
                                            className={`w-fit shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium capitalize ${statusStyle(
                                                booking.status
                                            )}`}
                                        >
                                            {booking.status}
                                        </span>
                                    </div>

                                    {/* Booking information */}
                                    <div className="grid gap-3 border-t border-white/[0.06] bg-black/10 p-5 sm:grid-cols-3 sm:p-6">
                                        <div className="rounded-xl border border-white/[0.05] bg-white/[0.015] p-4">
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/35">
                                                Charging starts
                                            </p>
                                            <p className="mt-3 text-sm font-medium leading-6 text-white/85">
                                                {formatDateTime(booking.start_time)}
                                            </p>
                                        </div>

                                        <div className="rounded-xl border border-white/[0.05] bg-white/[0.015] p-4">
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/35">
                                                Charging ends
                                            </p>
                                            <p className="mt-3 text-sm font-medium leading-6 text-white/85">
                                                {formatDateTime(booking.end_time)}
                                            </p>
                                        </div>

                                        <div className="rounded-xl border border-[#B5FFCE]/10 bg-[#B5FFCE]/[0.035] p-4">
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/35">
                                                Total price
                                            </p>
                                            <p className="mt-2 text-2xl font-semibold tracking-tight text-[#B5FFCE]">
                                                {formatPrice(booking.total_price)}
                                            </p>
                                            <p className="mt-1 text-[10px] text-white/30">
                                                Booking amount
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    {booking.status?.toLowerCase() === "pending" && (
                                        <div className="flex flex-col gap-3 border-t border-white/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                            <p className="text-xs leading-5 text-white/35">
                                                Review the reservation before making
                                                your decision.
                                            </p>

                                            <div className="flex flex-col gap-3 sm:flex-row">
                                                <button
                                                    type="button"
                                                    disabled={
                                                        updatingId === booking.id
                                                    }
                                                    onClick={() =>
                                                        updateStatus(
                                                            booking.id,
                                                            "rejected"
                                                        )
                                                    }
                                                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-red-400/20 bg-red-400/[0.03] px-5 py-3 text-sm font-semibold text-red-300 transition hover:border-red-400/40 hover:bg-red-400/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {updatingId === booking.id
                                                        ? "Updating..."
                                                        : "Reject request"}
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={
                                                        updatingId === booking.id
                                                    }
                                                    onClick={() =>
                                                        updateStatus(
                                                            booking.id,
                                                            "approved"
                                                        )
                                                    }
                                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#B5FFCE] px-5 py-3 text-sm font-semibold text-[#080D0B] transition hover:bg-[#D0FFDF] hover:shadow-[0_0_22px_rgba(181,255,206,0.10)] disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {updatingId === booking.id
                                                        ? "Updating..."
                                                        : "Approve request"}
                                                    {updatingId !== booking.id && (
                                                        <span>→</span>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                <footer className="mt-12 border-t border-white/[0.07] pt-6 text-[10px] uppercase tracking-[0.15em] text-white/25">
                    Voltreo / Reservation management
                </footer>
            </div>
        </main>
    );
}
