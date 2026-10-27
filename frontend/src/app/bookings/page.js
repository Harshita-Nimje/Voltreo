
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import socket from "@/lib/socket";

const API_URL = "http://localhost:5000";

const statusStyles = {
    pending: "border-amber-300/20 bg-amber-300/[0.08] text-amber-200",
    approved: "border-[#B8F28B]/25 bg-[#B8F28B]/[0.08] text-[#B8F28B]",
    rejected: "border-red-300/20 bg-red-300/[0.08] text-red-200",
    cancelled: "border-white/10 bg-white/[0.04] text-white/45",
    completed: "border-sky-300/20 bg-sky-300/[0.08] text-sky-200",
    expired: "border-orange-300/20 bg-orange-300/[0.08] text-orange-200",
};

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
    });
}

function formatTime(dateString) {
    return new Date(dateString).toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
    });
}

function isUpcoming(booking) {
    const endTime = new Date(booking.end_time).getTime();

    return (
        Number.isFinite(endTime) &&
        endTime > Date.now() &&
        ["pending", "approved"].includes(booking.status)
    );
}

function getDisplayStatus(booking) {
    const endTime = new Date(booking.end_time).getTime();

    if (
        ["pending", "approved"].includes(booking.status) &&
        Number.isFinite(endTime) &&
        endTime <= Date.now()
    ) {
        return "expired";
    }

    return booking.status;
}

function getBookingActionLabel(booking) {
    switch (booking.latest_event_type) {
        case "booking_cancelled":
            return "Cancelled by you";
        case "booking_rejected":
            return "Rejected by host";
        case "booking_approved":
            return "Approved by host";
        default:
            return null;
    }
}
export default function BookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("all");
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [cancelling, setCancelling] = useState(false);
    const [cancelError, setCancelError] = useState("");

    useEffect(() => {
        async function fetchBookings() {
            const token = localStorage.getItem("token");

            if (!token) {
                setError("Please log in to view your bookings.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_URL}/api/bookings/my`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Unable to load your bookings."
                    );
                }

                setBookings(
                    Array.isArray(data.bookings) ? data.bookings : []
                );
            } catch (err) {
                setError(err.message || "Something went wrong.");
            } finally {
                setLoading(false);
            }
        }

        fetchBookings();
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) return;

        socket.auth = { token };
        socket.connect();

        const handleBookingUpdate = (update) => {
            if (!update || !update.booking) return;

            setBookings((previous) =>
                previous.map((booking) =>
                    String(booking.id) === String(update.booking.id)
                        ? {
                            ...booking,
                            ...update.booking,
                            latest_event_type:
                                update.event_type ??
                                booking.latest_event_type,
                            latest_event_actor_id:
                                update.actor_id ??
                                booking.latest_event_actor_id,
                        }
                        : booking
                )
            );
        };

        socket.on("booking_updated", handleBookingUpdate);

        return () => {
            socket.off("booking_updated", handleBookingUpdate);
            socket.disconnect();
        };
    }, []);

    const upcomingCount = bookings.filter(isUpcoming).length;

    const pendingCount = bookings.filter(
        (booking) => getDisplayStatus(booking) === "pending"
    ).length;

    const filteredBookings = useMemo(() => {
        if (filter === "upcoming") {
            return bookings.filter(isUpcoming);
        }

        if (filter === "pending") {
            return bookings.filter(
                (booking) => getDisplayStatus(booking) === "pending"
            );
        }

        if (filter === "history") {
            return bookings.filter(
                (booking) =>
                    ["rejected", "cancelled", "completed", "expired"].includes(
                        getDisplayStatus(booking)
                    ) || !isUpcoming(booking)
            );
        }

        return bookings;
    }, [bookings, filter]);

    async function cancelBooking() {
        if (!selectedBooking || cancelling) return;

        // Recheck eligibility before making the request.
        if (!isUpcoming(selectedBooking)) {
            setCancelError(
                "This reservation has expired and can no longer be cancelled here."
            );
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            setCancelError("Your session has expired. Please log in again.");
            return;
        }

        setCancelling(true);
        setCancelError("");

        try {
            const response = await fetch(
                `${API_URL}/api/bookings/${selectedBooking.id}/cancel`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to cancel this reservation."
                );
            }

            setBookings((previous) =>
                previous.map((booking) =>
                    booking.id === selectedBooking.id
                        ? {
                            ...booking,
                            status: "cancelled",
                            latest_event_type: "booking_cancelled",
                            latest_event_actor_id: booking.user_id,
                            latest_event_details: "Driver cancelled the booking.",
                        }
                        : booking
                )
            );

            setSelectedBooking(null);
            setCancelError("");
        } catch (err) {
            setCancelError(
                err.message || "Something went wrong. Please try again."
            );
        } finally {
            setCancelling(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#080D09] text-white lg:pl-94">
            <main className="relative -top-10 mx-auto max-w-6xl px-5 pb-16 pt-8 sm:top-0 sm:px-8 lg:pt-12">
                <p className="relative -mt-2 pl-15 text-xs text-white/35 sm:mt-0 sm:pl-0">
                    Your Activity / <span className="text-[#B8F28B]">My Bookings</span>
                </p>

                <section className="relative mt-8 overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#142119] via-[#0E1711] to-[#0B100C] p-6 sm:p-9 lg:p-10">
                    <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-[#B8F28B]/[0.07] blur-3xl" />

                    <div className="relative flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
                        <div>
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#B8F28B]/15 bg-[#B8F28B]/[0.06] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B8F28B]">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#B8F28B]" />
                                Your charging hub
                            </div>

                            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                                My <span className="text-[#B8F28B]">Bookings.</span>
                            </h1>

                            <p className="mt-4 max-w-lg text-sm leading-6 text-white/50 sm:text-base">
                                Every reservation, all in one place. Keep your
                                next charge organised and your journey moving.
                            </p>
                        </div>

                        <Link
                            href="/dashboard#explore"
                            className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-[#B8F28B] px-5 py-3 text-sm font-semibold text-[#10180D] transition hover:bg-[#C9F5A7] sm:self-auto"
                        >
                            <span className="text-lg">+</span>
                            Find a charger
                        </Link>
                    </div>

                    <div className="relative mt-9 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-white/[0.07] bg-black/15 p-4 sm:p-5">
                            <p className="text-xs text-white/45">Total reservations</p>
                            <p className="mt-2 text-3xl font-semibold tracking-tight">
                                {bookings.length}
                            </p>
                            <p className="mt-1 text-xs text-white/35">Across your account</p>
                        </div>

                        <div className="rounded-2xl border border-[#B8F28B]/10 bg-[#B8F28B]/[0.035] p-4 sm:p-5">
                            <p className="text-xs text-white/45">Upcoming journeys</p>
                            <p className="mt-2 text-3xl font-semibold tracking-tight text-[#B8F28B]">
                                {upcomingCount}
                            </p>
                            <p className="mt-1 text-xs text-white/35">
                                Pending or approved
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/[0.07] bg-black/15 p-4 sm:p-5">
                            <p className="text-xs text-white/45">Awaiting response</p>
                            <p className="mt-2 text-3xl font-semibold tracking-tight">
                                {pendingCount}
                            </p>
                            <p className="mt-1 text-xs text-white/35">
                                Pending host approval
                            </p>
                        </div>
                    </div>
                </section>

                <section className="mt-10">
                    <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#B8F28B]/70">
                                Reservation manager
                            </p>
                            <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
                                Your journeys
                            </h2>
                        </div>

                        {!loading && !error && bookings.length > 0 && (
                            <p className="text-xs text-white/40">
                                {filteredBookings.length} shown
                            </p>
                        )}
                    </div>

                    {!loading && !error && bookings.length > 0 && (
                        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
                            {[
                                { id: "all", label: "All bookings" },
                                { id: "upcoming", label: "Upcoming" },
                                { id: "pending", label: "Pending" },
                                { id: "history", label: "History" },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setFilter(item.id)}
                                    className={`shrink-0 rounded-xl border px-4 py-2.5 text-xs font-medium transition ${filter === item.id
                                        ? "border-[#B8F28B]/25 bg-[#B8F28B]/10 text-[#B8F28B]"
                                        : "border-white/[0.08] bg-white/[0.02] text-white/45 hover:border-white/15 hover:text-white/80"
                                        }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {loading ? (
                        <div className="rounded-2xl border border-white/[0.08] bg-[#0D1510] p-12 text-center">
                            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-[#B8F28B]" />
                            <p className="mt-4 text-sm text-white/45">
                                Loading your reservations...
                            </p>
                        </div>
                    ) : error ? (
                        <div className="rounded-2xl border border-red-300/15 bg-red-300/[0.04] p-8 text-center">
                            <p className="text-sm text-red-200">{error}</p>
                            {error.toLowerCase().includes("log in") && (
                                <Link
                                    href="/login"
                                    className="mt-5 inline-flex rounded-xl bg-[#B8F28B] px-5 py-3 text-sm font-semibold text-[#10180D]"
                                >
                                    Log in →
                                </Link>
                            )}
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/[0.12] bg-[#0D1510] px-6 py-16 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#B8F28B]/15 bg-[#B8F28B]/[0.06] text-2xl">
                                ⚡
                            </div>
                            <h3 className="mt-5 text-lg font-medium">
                                Your next charge starts here
                            </h3>
                            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/45">
                                You haven't made a reservation yet. Find a
                                charger that fits your route and schedule.
                            </p>
                            <Link
                                href="/dashboard#explore"
                                className="mt-6 inline-flex rounded-xl bg-[#B8F28B] px-5 py-3 text-sm font-semibold text-[#10180D] transition hover:bg-[#C9F5A7]"
                            >
                                Explore chargers →
                            </Link>
                        </div>
                    ) : filteredBookings.length === 0 ? (
                        <div className="rounded-2xl border border-white/[0.08] bg-[#0D1510] p-10 text-center">
                            <p className="text-sm text-white/50">
                                No bookings match this filter.
                            </p>
                            <button
                                onClick={() => setFilter("all")}
                                className="mt-4 text-sm font-medium text-[#B8F28B] hover:underline"
                            >
                                View all bookings
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredBookings.map((booking) => {
                                const displayStatus = getDisplayStatus(booking);

                                return (
                                    <article
                                        key={booking.id}
                                        className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0D1510] transition duration-200 hover:border-white/[0.14]"
                                    >
                                        <div className="flex flex-col sm:flex-row">
                                            <div
                                                className={`hidden w-1 shrink-0 sm:block ${displayStatus === "approved"
                                                    ? "bg-[#B8F28B]/70"
                                                    : displayStatus === "pending"
                                                        ? "bg-amber-300/70"
                                                        : displayStatus === "rejected"
                                                            ? "bg-red-300/50"
                                                            : displayStatus === "expired"
                                                                ? "bg-orange-300/60"
                                                                : "bg-white/10"
                                                    }`}
                                            />

                                            <div className="min-w-0 flex-1 p-5 sm:p-6">
                                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                    <div className="flex min-w-0 gap-4">
                                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#B8F28B]/10 bg-[#B8F28B]/[0.05] text-xl">
                                                            ⚡
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/35">
                                                                Reservation #{booking.id}
                                                            </p>
                                                            <h3 className="mt-1.5 truncate text-base font-semibold tracking-tight sm:text-lg">
                                                                {booking.charger_title || "EV Charger"}
                                                            </h3>
                                                            <p className="mt-1 flex items-center gap-1.5 text-xs text-white/40">
                                                                <span>⌖</span>
                                                                {booking.charger_address || "Address unavailable"}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col items-start gap-2">
                                                        <span
                                                            className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium capitalize ${statusStyles[displayStatus] ||
                                                                "border-white/10 bg-white/5 text-white/60"
                                                                }`}
                                                        >
                                                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                                            {displayStatus}
                                                        </span>

                                                        {getBookingActionLabel(booking) && (
                                                            <p className="text-[11px] text-white/40">
                                                                {getBookingActionLabel(booking)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-white/[0.05] bg-black/10 p-4 sm:grid-cols-3 sm:gap-6">
                                                    <div>
                                                        <p className="text-[10px] uppercase tracking-[0.12em] text-white/35">
                                                            Date
                                                        </p>
                                                        <p className="mt-2 text-sm font-medium">
                                                            {formatDate(booking.start_time)}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-[10px] uppercase tracking-[0.12em] text-white/35">
                                                            Charging time
                                                        </p>
                                                        <p className="mt-2 text-sm font-medium">
                                                            {formatTime(booking.start_time)} –{" "}
                                                            {formatTime(booking.end_time)}
                                                        </p>
                                                    </div>

                                                    <div className="col-span-2 border-t border-white/[0.06] pt-3 sm:col-span-1 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
                                                        <p className="text-[10px] uppercase tracking-[0.12em] text-white/35">
                                                            Total price
                                                        </p>
                                                        <p className="mt-2 text-lg font-semibold tracking-tight text-[#B8F28B]">
                                                            ₹{Number(booking.total_price).toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                    <p className="text-xs text-white/40">
                                                        Hosted by{" "}
                                                        <span className="text-white/65">
                                                            {booking.host_name || "Charger host"}
                                                        </span>
                                                    </p>

                                                    {isUpcoming(booking) && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedBooking(booking);
                                                                setCancelError("");
                                                            }}
                                                            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-red-300/15 bg-red-300/[0.035] px-4 py-2.5 text-xs font-medium text-red-200/80 transition hover:border-red-300/35 hover:bg-red-300/[0.09] hover:text-red-100 focus:outline-none focus:ring-2 focus:ring-red-300/20 sm:self-auto"
                                                        >
                                                            <span aria-hidden="true">×</span>
                                                            Cancel reservation
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>

                {!loading && !error && bookings.length > 0 && (
                    <p className="mt-8 text-center text-xs text-white/25">
                        Your reservations are synced with Voltreo.
                    </p>
                )}
            </main>

            {selectedBooking && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !cancelling) {
                            setSelectedBooking(null);
                            setCancelError("");
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="cancel-title"
                        className="w-full max-w-md rounded-3xl border border-white/[0.1] bg-[#101812] p-6 shadow-2xl shadow-black/40 sm:p-7"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-300/15 bg-red-300/[0.07] text-xl text-red-200">
                            !
                        </div>

                        <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-red-200/70">
                            Cancellation request
                        </p>

                        <h2
                            id="cancel-title"
                            className="mt-2 text-xl font-semibold tracking-tight"
                        >
                            Cancel this reservation?
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-white/50">
                            You're about to cancel booking #{selectedBooking.id} for{" "}
                            <span className="text-white/80">
                                {selectedBooking.charger_title || "this charger"}
                            </span>
                            .
                        </p>

                        <div className="mt-5 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
                            <p className="text-sm font-medium">
                                {formatDate(selectedBooking.start_time)}
                            </p>
                            <p className="mt-1 text-xs text-white/45">
                                {formatTime(selectedBooking.start_time)} –{" "}
                                {formatTime(selectedBooking.end_time)}
                            </p>
                            <p className="mt-3 text-sm font-semibold text-[#B8F28B]">
                                ₹{Number(selectedBooking.total_price).toFixed(2)}
                            </p>
                        </div>

                        <p className="mt-4 text-xs leading-5 text-white/40">
                            The reservation status will change to cancelled, and
                            this time slot may become available to other drivers.
                        </p>

                        {cancelError && (
                            <p
                                role="alert"
                                className="mt-4 rounded-xl border border-red-300/15 bg-red-300/[0.05] p-3 text-sm text-red-200"
                            >
                                {cancelError}
                            </p>
                        )}

                        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                disabled={cancelling}
                                onClick={() => {
                                    setSelectedBooking(null);
                                    setCancelError("");
                                }}
                                className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-white/65 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
                            >
                                Keep booking
                            </button>

                            <button
                                type="button"
                                disabled={cancelling}
                                onClick={cancelBooking}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-300 px-5 py-3 text-sm font-semibold text-[#26100F] transition hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {cancelling ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#26100F]/25 border-t-[#26100F]" />
                                        Cancelling...
                                    </>
                                ) : (
                                    "Confirm cancellation"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
