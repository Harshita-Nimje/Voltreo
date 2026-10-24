"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

const ChargerMap = dynamic(
    () => import("../components/ChargerMap"),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-[500px] items-center justify-center rounded-2xl bg-[#191F1B] text-gray-400">
                Loading map...
            </div>
        ),
    }
);

const API_URL = "http://localhost:5000/api";

export default function ChargersPage() {
    const [chargers, setChargers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedCharger, setSelectedCharger] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [connectorFilter, setConnectorFilter] = useState("All");
    const [maxPrice, setMaxPrice] = useState("All");
    const searchParams = useSearchParams();
    const chargerId = searchParams.get("charger_id");

    const connectorTypes = [
        "All",
        ...new Set(chargers.map((charger) => charger.charger_type)),
    ];

    const filteredChargers = chargers.filter((charger) => {
        const matchesSearch =
            charger.title
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            charger.address
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase());

        const matchesConnector =
            connectorFilter === "All" ||
            charger.charger_type === connectorFilter;

        const matchesPrice =
            maxPrice === "All" ||
            Number(charger.price_per_hour) <= Number(maxPrice);

        return matchesSearch && matchesConnector && matchesPrice;
    });

    useEffect(() => {
        async function fetchChargers() {
            try {
                const response = await fetch(
                    `${API_URL}/chargers/approved`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch chargers.");
                }

                const data = await response.json();
                setChargers(data.chargers || []);
            } catch (err) {
                setError(err.message || "Something went wrong.");
            } finally {
                setLoading(false);
            }
        }

        fetchChargers();
    }, []);

    return (
        <main className="min-h-screen bg-[#101412] px-6 py-10 text-white">
            <div className="mx-auto max-w-7xl">
                {/* Page heading */}
                <h1 className="text-3xl font-bold">
                    Find Your Charger
                </h1>

                <p className="mt-2 text-gray-400">
                    Discover EV charging stations near you.
                </p>

                {/* Charger map */}
                {/* Search and Filters */}
                <div className="mt-8 rounded-2xl border border-white/10 bg-[#191F1B] p-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        {/* Search */}
                        <div>
                            <label className="mb-2 block text-sm text-gray-400">
                                Search by name or location
                            </label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search chargers..."
                                className="w-full rounded-xl border border-white/10 bg-[#101412] px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-[#B5FFCE]"
                            />
                        </div>

                        {/* Connector Filter */}
                        <div>
                            <label className="mb-2 block text-sm text-gray-400">
                                Connector type
                            </label>
                            <select
                                value={connectorFilter}
                                onChange={(e) => setConnectorFilter(e.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-[#101412] px-4 py-3 text-white outline-none focus:border-[#B5FFCE]"
                            >
                                {connectorTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Price Filter */}
                        <div>
                            <label className="mb-2 block text-sm text-gray-400">
                                Maximum price per hour
                            </label>
                            <select
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-[#101412] px-4 py-3 text-white outline-none focus:border-[#B5FFCE]"
                            >
                                <option value="All">Any price</option>
                                <option value="50">Up to ₹50</option>
                                <option value="100">Up to ₹100</option>
                                <option value="150">Up to ₹150</option>
                                <option value="200">Up to ₹200</option>
                                <option value="300">Up to ₹300</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Map */}
                <div className="mt-6">
                    <ChargerMap
                        chargers={filteredChargers}
                        onSelectCharger={setSelectedCharger}
                    />
                </div>

                {/* Loading state */}
                {loading && (
                    <p className="mt-8 text-gray-400">
                        Loading chargers...
                    </p>
                )}

                {/* Error state */}
                {error && (
                    <p className="mt-8 text-red-400">
                        {error}
                    </p>
                )}

                {/* Empty state */}
                {!loading && !error && filteredChargers.length === 0 && (
                    <div className="mt-8 rounded-2xl border border-white/10 bg-[#191F1B] px-6 py-10 text-center">
                        <p className="text-lg font-semibold text-white">
                            No chargers found
                        </p>
                        <p className="mt-2 text-sm text-gray-400">
                            Try changing your search or filters to find available chargers.
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setSearchTerm("");
                                setConnectorFilter("All");
                                setMaxPrice("All");
                            }}
                            className="mt-5 rounded-xl bg-[#B5FFCE] px-5 py-2.5 font-semibold text-[#102019] transition hover:bg-[#9df5bb]"
                        >
                            Clear filters
                        </button>
                    </div>
                )}

                {/* Selected charger details */}
                {selectedCharger && (
                    <section className="mt-6 rounded-2xl border border-[#B5FFCE]/20 bg-[#191F1B] p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-[#B5FFCE]">
                                    CHARGER DETAILS
                                </p>

                                <h2 className="mt-2 text-xl font-semibold">
                                    {selectedCharger.title}
                                </h2>

                                <p className="mt-2 text-sm text-gray-400">
                                    {selectedCharger.address}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedCharger(null)}
                                aria-label="Close charger details"
                                className="rounded-lg px-3 py-1 text-gray-400 hover:bg-white/10 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                            <div>
                                <p className="text-sm text-gray-400">
                                    Connector
                                </p>
                                <p className="mt-1 font-medium">
                                    {selectedCharger.charger_type}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-400">
                                    Charging power
                                </p>
                                <p className="mt-1 font-medium">
                                    {selectedCharger.power_kw} kW
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-400">
                                    Price
                                </p>
                                <p className="mt-1 font-medium">
                                    ₹
                                    {Number(
                                        selectedCharger.price_per_hour
                                    ).toFixed(2)}
                                    /hour
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                window.location.href = `/booking?charger_id=${selectedCharger.id}`;
                            }}
                            className="mt-6 inline-flex w-fit items-center justify-center rounded-xl bg-[#B5FFCE] px-6 py-3 font-semibold text-[#102019] transition hover:bg-[#9df5bb]"
                        >
                            Book This Charger
                        </button>
                    </section>
                )}



                {/* Charger cards */}
                {!loading && !error && filteredChargers.length > 0 && (
                    <section className="mt-10">
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-2xl font-semibold">
                                Available Chargers
                            </h2>

                            <p className="text-sm text-gray-400">
                                {filteredChargers.length}{" "}
                                {filteredChargers.length === 1
                                    ? "station"
                                    : "stations"}{" "}
                                found
                            </p>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredChargers.map((charger) => (
                                <article
                                    key={charger.id}
                                    className={`flex min-w-0 flex-col rounded-2xl border bg-[#191F1B] p-5 transition ${selectedCharger?.id === charger.id
                                        ? "border-[#B5FFCE]/60"
                                        : "border-white/10 hover:border-white/25"
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <h3
                                            title={charger.title}
                                            className="min-w-0 flex-1 truncate text-lg font-semibold"
                                        >
                                            {charger.title}
                                        </h3>

                                        <span className="shrink-0 rounded-full bg-[#B5FFCE]/10 px-2 py-1 text-xs text-[#B5FFCE]">
                                            Approved
                                        </span>
                                    </div>

                                    <p className="mt-3 text-sm text-gray-400">
                                        {charger.address}
                                    </p>

                                    <div className="mt-5 space-y-2 text-sm text-gray-300">
                                        <p>
                                            Connector:{" "}
                                            {charger.charger_type}
                                        </p>

                                        <p>
                                            Power: {charger.power_kw} kW
                                        </p>

                                        <p>
                                            Price: ₹
                                            {Number(
                                                charger.price_per_hour
                                            ).toFixed(2)}
                                            /hour
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelectedCharger(charger)
                                        }
                                        className="mt-6 w-full rounded-xl bg-[#B5FFCE] px-4 py-3 font-semibold text-[#102019] transition hover:bg-[#9df5bb]"
                                    >
                                        View Details
                                    </button>
                                </article>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}