
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
        <main className="min-h-screen bg-[#080D0B] px-5 py-10 text-white sm:px-8 lg:px-12">
            <div className="mx-auto max-w-6xl">
                <div className="mb-10">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#B5FFCE]">
                        Host dashboard
                    </p>

                    <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                        Booking requests
                    </h1>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400">
                        Review charging requests for your listed chargers.
                        Approve requests you can accommodate or reject those
                        you cannot.
                    </p>
                </div>

                {message && (
                    <div
                        role="status"
                        className="mb-6 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-300"
                    >
                        {message}
                    </div>
                )}

                {error && (
                    <div
                        role="alert"
                        className="mb-6 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300"
                    >
                        {error}
                    </div>
                )}

                <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm text-gray-400">
                            Total booking requests
                        </p>
                        <p className="mt-1 text-2xl font-semibold">
                            {bookings.length}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={fetchBookings}
                        disabled={loading}
                        className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-gray-200 transition hover:bg-white/5 disabled:opacity-50"
                    >
                        {loading ? "Refreshing..." : "Refresh"}
                    </button>
                </div>

                {loading ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center text-sm text-gray-400">
                        Loading booking requests...
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-16 text-center">
                        <h2 className="text-lg font-medium">
                            No booking requests yet
                        </h2>
                        <p className="mt-2 text-sm text-gray-400">
                            New requests for your chargers will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {bookings.map((booking) => (
                            <article
                                key={booking.id}
                                className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-7"
                            >
                                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Booking #{booking.id}
                                        </p>

                                        <h2 className="mt-2 text-xl font-semibold">
                                            {booking.charger_title ||
                                                `Charger #${booking.charger_id}`}
                                        </h2>

                                        <p className="mt-2 text-sm text-gray-400">
                                            Requested by{" "}
                                            <span className="text-gray-200">
                                                {booking.driver_name ||
                                                    "Driver"}
                                            </span>
                                        </p>

                                        {booking.driver_email && (
                                            <p className="mt-1 text-sm text-gray-500">
                                                {booking.driver_email}
                                            </p>
                                        )}
                                    </div>

                                    <span
                                        className={`w-fit rounded-full border px-3 py-1.5 text-xs font-medium capitalize ${statusStyle(
                                            booking.status
                                        )}`}
                                    >
                                        {booking.status}
                                    </span>
                                </div>

                                <div className="mt-6 grid gap-5 border-t border-white/10 pt-5 sm:grid-cols-3">
                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Charging starts
                                        </p>
                                        <p className="mt-2 text-sm font-medium text-gray-200">
                                            {formatDateTime(
                                                booking.start_time
                                            )}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Charging ends
                                        </p>
                                        <p className="mt-2 text-sm font-medium text-gray-200">
                                            {formatDateTime(booking.end_time)}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Total price
                                        </p>
                                        <p className="mt-2 text-lg font-semibold text-[#B5FFCE]">
                                            {formatPrice(booking.total_price)}
                                        </p>
                                    </div>
                                </div>

                                {booking.status?.toLowerCase() ===
                                    "pending" && (
                                        <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
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
                                                className="rounded-xl border border-red-400/20 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-400/10 disabled:opacity-50"
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
                                                className="rounded-xl bg-[#B5FFCE] px-5 py-3 text-sm font-semibold text-[#080D0B] transition hover:bg-[#D0FFDF] disabled:opacity-50"
                                            >
                                                {updatingId === booking.id
                                                    ? "Updating..."
                                                    : "Approve request"}
                                            </button>
                                        </div>
                                    )}
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
