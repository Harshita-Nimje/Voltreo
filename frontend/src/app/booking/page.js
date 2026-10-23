
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:5000/api";

export default function BookingPage() {
    const router = useRouter();

    const [chargerId, setChargerId] = useState(null);
    const [charger, setCharger] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [bookingDate, setBookingDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [bookingError, setBookingError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Read chargerId from the URL after the page mounts.
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setChargerId(params.get("chargerId"));
    }, []);

    // Fetch the selected charger's details.
    useEffect(() => {
        if (chargerId === null) return;

        const controller = new AbortController();

        async function fetchCharger() {
            if (!chargerId) {
                setError(
                    "No charger was selected. Please return to the dashboard and choose a charger."
                );
                setLoading(false);
                return;
            }

            setLoading(true);
            setError("");

            try {
                // Uses the same approved-chargers endpoint as your dashboard.
                const requestUrl = "http://localhost:5000/api/chargers/approved";

                console.log("Booking API request:", requestUrl);

                const response = await fetch(requestUrl, {
                    signal: controller.signal,
                });

                console.log("Booking API status:", response.status);
                console.log("Booking API response URL:", response.url);

                const contentType = response.headers.get("content-type") || "";
                const responseText = await response.text();

                console.log("API_URL:", API_URL);
                console.log("Actual response URL:", response.url);
                console.log("HTTP status:", response.status);
                console.log("Content-Type:", contentType);
                console.log("Response body:", responseText.slice(0, 500));

                if (!response.ok) {
                    throw new Error(
                        `Request failed with HTTP ${response.status}. URL: ${response.url}`
                    );
                }

                if (!contentType.includes("application/json")) {
                    throw new Error(
                        `Expected JSON but received ${contentType || "unknown content type"}. Check the Console for the response body.`
                    );
                }

                const data = JSON.parse(responseText);

                if (!response.ok) {
                    throw new Error(
                        data.message || "Unable to load chargers."
                    );
                }

                if (!Array.isArray(data.chargers)) {
                    throw new Error(
                        "The server returned an unexpected charger list."
                    );
                }

                const selected = data.chargers.find(
                    (item) => String(item.id) === String(chargerId)
                );

                if (!selected) {
                    throw new Error(
                        "This charger could not be found among the approved chargers."
                    );
                }

                setCharger(selected);
            } catch (err) {
                if (err.name !== "AbortError") {
                    console.error("Error loading charger:", err);
                    setError(
                        err.message || "Unable to load charger details."
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        fetchCharger();

        return () => controller.abort();
    }, [chargerId]);

    function formatPrice(price) {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2,
        }).format(Number(price) || 0);
    }

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#080D0B] text-white">
                <p className="text-sm text-white/60">
                    Loading charger details...
                </p>
            </main>
        );
    }

    if (error || !charger) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#080D0B] px-5 text-white">
                <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0D1510] p-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-400/10 text-red-300">
                        !
                    </div>

                    <h1 className="mt-5 text-xl font-semibold">
                        Unable to load charger
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-white/50">
                        {error || "Charger details are unavailable."}
                    </p>

                    <button
                        type="button"
                        onClick={() => router.push("/dashboard")}
                        className="mt-6 w-full rounded-xl bg-[#B5FFCE] px-5 py-3 text-sm font-semibold text-[#080D0B] transition hover:bg-[#D0FFDF]"
                    >
                        Back to dashboard
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#080D0B] px-5 py-10 text-white sm:px-8 sm:py-14">
            <div className="mx-auto max-w-2xl">
                <button
                    type="button"
                    onClick={() => router.push("/dashboard")}
                    className="mb-8 text-sm text-white/50 transition hover:text-[#B5FFCE]"
                >
                    ← Back to dashboard
                </button>

                <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#B5FFCE]/70">
                    Voltreo reservations
                </p>

                <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                    Book your charging session
                </h1>

                <p className="mt-3 text-sm leading-6 text-white/45">
                    Review your selected charging station before choosing your
                    reservation time.
                </p>

                <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-[#0D1510]">
                    <div className="border-b border-white/[0.07] p-6 sm:p-8">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs uppercase tracking-[0.16em] text-white/35">
                                    Selected charger
                                </p>

                                <h2 className="mt-3 text-2xl font-semibold">
                                    {charger.title || "Charging station"}
                                </h2>

                                <p className="mt-3 text-sm leading-6 text-white/50">
                                    {charger.address || "Address unavailable"}
                                </p>
                            </div>

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#B5FFCE]/15 bg-[#B5FFCE]/[0.07] text-[#B5FFCE]">
                                ⚡
                            </div>
                        </div>

                        {charger.description && (
                            <p className="mt-5 text-sm leading-6 text-white/55">
                                {charger.description}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 p-6 sm:p-8">
                        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                            <p className="text-xs text-white/40">
                                Charging power
                            </p>
                            <p className="mt-2 font-medium">
                                {charger.power_kw != null
                                    ? `${charger.power_kw} kW`
                                    : "Not specified"}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                            <p className="text-xs text-white/40">
                                Connector type
                            </p>
                            <p className="mt-2 font-medium">
                                {charger.charger_type || "Not specified"}
                            </p>
                        </div>

                        <div className="col-span-2 rounded-2xl border border-[#B5FFCE]/15 bg-[#B5FFCE]/[0.04] p-5">
                            <p className="text-xs text-white/45">
                                Price per hour
                            </p>
                            <p className="mt-2 text-2xl font-semibold text-[#B5FFCE]">
                                {formatPrice(charger.price_per_hour)}
                            </p>
                        </div>
                    </div>

                    <div className="px-6 pb-6 sm:px-8 sm:pb-8">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
                            <h3 className="text-lg font-semibold">
                                Choose your charging time
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-white/45">
                                Select a date and time for your charging session.
                                Charging is available between 8:00 AM and 10:00 PM.
                            </p>

                            <div className="mt-6 space-y-5">
                                <div>
                                    <label
                                        htmlFor="bookingDate"
                                        className="mb-2 block text-sm font-medium text-white/75"
                                    >
                                        Booking date
                                    </label>

                                    <input
                                        id="bookingDate"
                                        type="date"
                                        value={bookingDate}
                                        min={new Date().toLocaleDateString("en-CA")}
                                        onChange={(e) => {
                                            setBookingDate(e.target.value);
                                            setBookingError("");
                                        }}
                                        className="w-full rounded-xl border border-white/10 bg-[#080D0B] px-4 py-3 text-white outline-none transition focus:border-[#B5FFCE]/60"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="startTime"
                                            className="mb-2 block text-sm font-medium text-white/75"
                                        >
                                            Start time
                                        </label>

                                        <select
                                            id="startTime"
                                            value={startTime}
                                            onChange={(e) => {
                                                setStartTime(e.target.value);
                                                setBookingError("");
                                            }}
                                            className="w-full rounded-xl border border-white/10 bg-[#080D0B] px-4 py-3 text-white outline-none transition focus:border-[#B5FFCE]/60"
                                        >
                                            <option value="">Select start time</option>
                                            {Array.from({ length: 14 }, (_, i) => 8 + i).map(
                                                (hour) => (
                                                    <option
                                                        key={hour}
                                                        value={`${String(hour).padStart(2, "0")}:00`}
                                                    >
                                                        {new Date(2000, 0, 1, hour).toLocaleTimeString(
                                                            "en-IN",
                                                            {
                                                                hour: "numeric",
                                                                minute: "2-digit",
                                                                hour12: true,
                                                            }
                                                        )}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="endTime"
                                            className="mb-2 block text-sm font-medium text-white/75"
                                        >
                                            End time
                                        </label>

                                        <select
                                            id="endTime"
                                            value={endTime}
                                            onChange={(e) => {
                                                setEndTime(e.target.value);
                                                setBookingError("");
                                            }}
                                            className="w-full rounded-xl border border-white/10 bg-[#080D0B] px-4 py-3 text-white outline-none transition focus:border-[#B5FFCE]/60"
                                        >
                                            <option value="">Select end time</option>
                                            {Array.from({ length: 14 }, (_, i) => 9 + i).map(
                                                (hour) => (
                                                    <option
                                                        key={hour}
                                                        value={`${String(hour).padStart(2, "0")}:00`}
                                                    >
                                                        {new Date(2000, 0, 1, hour).toLocaleTimeString(
                                                            "en-IN",
                                                            {
                                                                hour: "numeric",
                                                                minute: "2-digit",
                                                                hour12: true,
                                                            }
                                                        )}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>
                                </div>

                                {bookingError && (
                                    <p className="rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-sm text-red-300">
                                        {bookingError}
                                    </p>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                                        <p className="text-sm text-white/50">
                                            Selected duration
                                        </p>

                                        <p className="mt-2 text-xl font-semibold text-white">
                                            {startTime && endTime && endTime > startTime
                                                ? `${(
                                                    (new Date(`2000-01-01T${endTime}:00`) -
                                                        new Date(`2000-01-01T${startTime}:00`)) /
                                                    3600000
                                                ).toFixed(1)} hours`
                                                : "—"}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-[#B5FFCE]/15 bg-[#B5FFCE]/[0.04] p-4">
                                        <p className="text-sm text-white/50">
                                            Estimated total
                                        </p>

                                        <p className="mt-2 text-xl font-semibold text-[#B5FFCE]">
                                            {startTime && endTime && endTime > startTime
                                                ? `₹${(
                                                    ((new Date(`2000-01-01T${endTime}:00`) -
                                                        new Date(`2000-01-01T${startTime}:00`)) /
                                                        3600000) *
                                                    Number(charger.price_per_hour)
                                                ).toLocaleString("en-IN", {
                                                    maximumFractionDigits: 2,
                                                })}`
                                                : "—"}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    disabled={submitting}
                                    onClick={async () => {
                                        setBookingError("");

                                        if (!bookingDate || !startTime || !endTime) {
                                            setBookingError(
                                                "Please select a date, start time, and end time."
                                            );
                                            return;
                                        }

                                        if (endTime <= startTime) {
                                            setBookingError(
                                                "End time must be later than start time."
                                            );
                                            return;
                                        }

                                        const startDateTime = new Date(
                                            `${bookingDate}T${startTime}:00`
                                        );
                                        const endDateTime = new Date(
                                            `${bookingDate}T${endTime}:00`
                                        );

                                        if (startDateTime <= new Date()) {
                                            setBookingError(
                                                "Please select a future start time."
                                            );
                                            return;
                                        }

                                        if (startTime < "08:00" || endTime > "22:00") {
                                            setBookingError(
                                                "Charging sessions must be between 8:00 AM and 10:00 PM."
                                            );
                                            return;
                                        }

                                        const token = localStorage.getItem("token");

                                        if (!token) {
                                            setBookingError(
                                                "Please log in before booking a charger."
                                            );
                                            return;
                                        }

                                        setSubmitting(true);

                                        try {
                                            const response = await fetch(
                                                "http://localhost:5000/api/bookings",
                                                {
                                                    method: "POST",
                                                    headers: {
                                                        "Content-Type": "application/json",
                                                        Authorization: `Bearer ${token}`,
                                                    },
                                                    body: JSON.stringify({
                                                        charger_id: Number(charger.id),
                                                        start_time: startDateTime.toISOString(),
                                                        end_time: endDateTime.toISOString(),
                                                    }),
                                                }
                                            );

                                            const data = await response.json();

                                            if (!response.ok) {
                                                throw new Error(
                                                    data.message || "Unable to create your booking."
                                                );
                                            }

                                            router.push("/bookings");
                                        } catch (err) {
                                            setBookingError(
                                                err.message ||
                                                "Something went wrong. Please try again."
                                            );
                                        } finally {
                                            setSubmitting(false);
                                        }
                                    }}
                                    className="w-full rounded-xl bg-[#B5FFCE] px-5 py-3.5 text-sm font-semibold text-[#080D0B] transition hover:bg-[#D0FFDF] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {submitting ? "Creating booking..." : "Confirm booking"}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
