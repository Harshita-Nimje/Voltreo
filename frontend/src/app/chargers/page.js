"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";


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
        <main className="relative -top-16 min-h-screen overflow-x-hidden bg-[#101412] px-4 py-10 text-white sm:top-0 sm:px-6 lg:translate-x-64">
            <div className="mx-auto w-full max-w-7xl">
                <p className="mb-3 ml-14 text-sm font-medium text-[#B5FFCE] sm:ml-0">
                    Your journey starts here.
                </p>
                {/* Page heading */}
                <div className="mb-8 pl-0 sm:pl-0">
                    <div className="mb-4 mt-4 inline-flex items-center gap-2 rounded-full border border-[#B5FFCE]/15 bg-[#B5FFCE]/[0.06] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B5FFCE]">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#B5FFCE]" />
                        EV charging network
                    </div>

                    <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                        Find your next{" "}
                        <span className="text-[#B5FFCE]">charge.</span>
                    </h1>

                    <p className="mt-3 max-w-xl text-sm leading-6 text-white/45 sm:text-base">
                        Discover charging stations, compare prices, and find
                        the right charger for your journey.
                    </p>
                </div>

                {/* Search and filters */}
                <section className="mb-6 rounded-2xl border border-white/[0.09] bg-gradient-to-br from-[#19221C] to-[#111713] p-4 shadow-xl shadow-black/10 sm:p-6">
                    <div className="mb-5 flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-sm font-semibold text-white/90">
                                Explore charging stations
                            </h2>
                            <p className="mt-1 text-xs text-white/40">
                                Refine your search to find a suitable charger.
                            </p>
                        </div>

                        <span className="shrink-0 rounded-lg border border-white/[0.08] bg-black/20 px-3 py-2 text-xs text-white/55">
                            {filteredChargers.length} found
                        </span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
                        {/* Search */}
                        <div>
                            <label className="mb-2 block text-xs font-medium text-white/55">
                                Search location or station
                            </label>

                            <div className="flex items-center gap-3 rounded-xl border border-white/[0.09] bg-[#0D120F] px-4 transition focus-within:border-[#B5FFCE]/50">
                                <svg
                                    className="h-5 w-5 shrink-0 text-[#B5FFCE]/70"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                    aria-hidden="true"
                                >
                                    <circle cx="11" cy="11" r="7" />
                                    <path d="m16 16 4 4" />
                                </svg>

                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Try a station name or address"
                                    className="min-w-0 w-full bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-white/25"
                                />

                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchTerm("")}
                                        aria-label="Clear search"
                                        className="text-white/40 transition hover:text-white"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Connector */}
                        <div>
                            <label className="mb-2 block text-xs font-medium text-white/55">
                                Connector type
                            </label>

                            <select
                                value={connectorFilter}
                                onChange={(e) => setConnectorFilter(e.target.value)}
                                className="w-full rounded-xl border border-white/[0.09] bg-[#0D120F] px-4 py-3.5 text-sm text-white outline-none transition focus:border-[#B5FFCE]/50"
                            >
                                {connectorTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type === "All" ? "All connectors" : type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Price */}
                        <div>
                            <label className="mb-2 block text-xs font-medium text-white/55">
                                Maximum hourly price
                            </label>

                            <select
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className="w-full rounded-xl border border-white/[0.09] bg-[#0D120F] px-4 py-3.5 text-sm text-white outline-none transition focus:border-[#B5FFCE]/50"
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

                    {(searchTerm || connectorFilter !== "All" || maxPrice !== "All") && (
                        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-4">
                            <span className="mr-1 text-xs text-white/40">
                                Active filters
                            </span>

                            {searchTerm && (
                                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/70">
                                    Search: {searchTerm}
                                </span>
                            )}

                            {connectorFilter !== "All" && (
                                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/70">
                                    {connectorFilter}
                                </span>
                            )}

                            {maxPrice !== "All" && (
                                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/70">
                                    Up to ₹{maxPrice}/hr
                                </span>
                            )}

                            <button
                                type="button"
                                onClick={() => {
                                    setSearchTerm("");
                                    setConnectorFilter("All");
                                    setMaxPrice("All");
                                }}
                                className="ml-auto text-xs font-medium text-[#B5FFCE] transition hover:text-white"
                            >
                                Clear all
                            </button>
                        </div>
                    )}
                </section>

                {/* Map */}
                <section className="overflow-hidden rounded-2xl border border-white/[0.09] bg-[#151B17] shadow-2xl shadow-black/20">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-4 sm:px-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#B5FFCE]/15 bg-[#B5FFCE]/[0.07] text-[#B5FFCE]">
                                <svg
                                    className="h-5 w-5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                    aria-hidden="true"
                                >
                                    <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                                    <circle cx="12" cy="10" r="2.5" />
                                </svg>
                            </div>

                            <div>
                                <h2 className="text-sm font-semibold">
                                    Charging map
                                </h2>
                                <p className="mt-1 text-xs text-white/40">
                                    Explore available stations
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 rounded-full border border-[#B5FFCE]/10 bg-[#B5FFCE]/[0.05] px-3 py-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#B5FFCE]" />
                            <span className="text-[10px] font-medium uppercase tracking-wider text-[#B5FFCE]">
                                {filteredChargers.length} stations
                            </span>
                        </div>
                    </div>

                    <div className="p-2 sm:p-3">
                        <div className="overflow-hidden rounded-xl">
                            <ChargerMap
                                chargers={filteredChargers}
                                onSelectCharger={setSelectedCharger}
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] px-4 py-3 sm:px-5">
                        <p className="text-xs text-white/35">
                            Select a map marker to explore a station.
                        </p>
                        <p className="text-xs text-white/35">
                            Powered by Voltreo
                        </p>
                    </div>
                </section>

                {/* Loading */}
                {loading && (
                    <div className="mt-6 flex items-center gap-3 rounded-xl border border-white/[0.07] bg-[#151B17] p-5">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/10 border-t-[#B5FFCE]" />
                        <p className="text-sm text-white/50">
                            Finding charging stations...
                        </p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="mt-6 rounded-xl border border-red-400/15 bg-red-400/[0.04] p-5">
                        <p className="text-sm text-red-300">{error}</p>
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && filteredChargers.length === 0 && (
                    <div className="mt-6 rounded-2xl border border-dashed border-white/[0.12] bg-[#151B17] px-6 py-12 text-center sm:py-16">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#B5FFCE]/15 bg-[#B5FFCE]/[0.06] text-2xl">
                            ⚡
                        </div>

                        <h2 className="mt-5 text-lg font-semibold">
                            No stations match your search
                        </h2>

                        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/40">
                            Try a different location, connector type, or price range.
                        </p>

                        <button
                            type="button"
                            onClick={() => {
                                setSearchTerm("");
                                setConnectorFilter("All");
                                setMaxPrice("All");
                            }}
                            className="mt-5 rounded-xl bg-[#B5FFCE] px-5 py-3 text-sm font-semibold text-[#102019] transition hover:bg-[#9df5bb]"
                        >
                            Reset filters
                        </button>
                    </div>
                )}

                {/* Selected charger details */}
                {selectedCharger && (
                    <section className="mt-6 overflow-hidden rounded-2xl border border-[#B5FFCE]/20 bg-gradient-to-br from-[#19251D] to-[#111713] shadow-xl shadow-black/10">
                        <div className="flex flex-col justify-between gap-4 border-b border-white/[0.07] p-5 sm:flex-row sm:items-start sm:p-6">
                            <div className="min-w-0">
                                <div className="inline-flex items-center gap-2 rounded-full border border-[#B5FFCE]/15 bg-[#B5FFCE]/[0.06] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#B5FFCE]">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#B5FFCE]" />
                                    Station selected
                                </div>

                                <h2 className="mt-4 break-words text-xl font-semibold tracking-tight sm:text-2xl">
                                    {selectedCharger.title}
                                </h2>

                                <p className="mt-2 break-words text-sm leading-6 text-white/45">
                                    {selectedCharger.address}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedCharger(null)}
                                aria-label="Close charger details"
                                className="self-end rounded-xl border border-white/10 px-3 py-2 text-sm text-white/50 transition hover:bg-white/[0.06] hover:text-white sm:self-start"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3 sm:p-6">
                            <div className="rounded-xl border border-white/[0.07] bg-black/15 p-4">
                                <p className="text-xs text-white/40">
                                    Connector type
                                </p>
                                <p className="mt-2 break-words text-sm font-semibold">
                                    {selectedCharger.charger_type}
                                </p>
                            </div>

                            <div className="rounded-xl border border-white/[0.07] bg-black/15 p-4">
                                <p className="text-xs text-white/40">
                                    Charging power
                                </p>
                                <p className="mt-2 text-sm font-semibold">
                                    {selectedCharger.power_kw} kW
                                </p>
                            </div>

                            <div className="rounded-xl border border-[#B5FFCE]/15 bg-[#B5FFCE]/[0.04] p-4">
                                <p className="text-xs text-white/40">
                                    Price per hour
                                </p>
                                <p className="mt-2 text-lg font-semibold text-[#B5FFCE]">
                                    ₹{Number(selectedCharger.price_per_hour).toFixed(2)}
                                    <span className="ml-1 text-xs font-normal text-white/40">
                                        /hour
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 border-t border-white/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
                            <p className="text-xs leading-5 text-white/35">
                                Ready to go? Reserve this station for your next charge.
                            </p>

                            <button
                                type="button"
                                onClick={() => {
                                    window.location.href = `/booking?charger_id=${selectedCharger.id}`;
                                }}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#B5FFCE] px-6 py-3.5 text-sm font-semibold text-[#102019] transition hover:bg-[#9df5bb] sm:w-auto"
                            >
                                Book this charger
                                <span aria-hidden="true">→</span>
                            </button>
                        </div>
                    </section>
                )}

                {/* Available chargers */}
                {!loading && !error && filteredChargers.length > 0 && (
                    <section className="mt-10 sm:mt-12">
                        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#B5FFCE]/65">
                                    Your next stop
                                </p>
                                <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                                    Available chargers
                                </h2>
                                <p className="mt-2 text-sm text-white/40">
                                    Compare stations and choose what works for you.
                                </p>
                            </div>

                            <span className="w-fit rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-xs text-white/50">
                                {filteredChargers.length}{" "}
                                {filteredChargers.length === 1 ? "station" : "stations"}
                            </span>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {filteredChargers.map((charger) => (
                                <article
                                    key={charger.id}
                                    className={`group flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-gradient-to-br from-[#19211B] to-[#111713] transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 ${selectedCharger?.id === charger.id
                                        ? "border-[#B5FFCE]/50 shadow-lg shadow-[#B5FFCE]/[0.04]"
                                        : "border-white/[0.08] hover:border-white/[0.17]"
                                        }`}
                                >
                                    <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
                                        <div className="flex items-center gap-2 text-xs text-white/45">
                                            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#B5FFCE]/10 bg-[#B5FFCE]/[0.05] text-base text-[#B5FFCE]">
                                                ⚡
                                            </span>
                                            Charging station
                                        </div>

                                        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#B5FFCE]/15 bg-[#B5FFCE]/[0.05] px-2.5 py-1.5 text-[10px] font-medium text-[#B5FFCE]">
                                            <span className="h-1.5 w-1.5 rounded-full bg-[#B5FFCE]" />
                                            Approved
                                        </span>
                                    </div>

                                    <div className="flex flex-1 flex-col p-5">
                                        <h3
                                            title={charger.title}
                                            className="break-words text-lg font-semibold tracking-tight transition group-hover:text-[#B5FFCE]"
                                        >
                                            {charger.title}
                                        </h3>

                                        <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-white/40">
                                            <span className="mt-0.5 shrink-0 text-[#B5FFCE]/70">
                                                ⌖
                                            </span>
                                            <span className="min-w-0 break-words">
                                                {charger.address || "Address unavailable"}
                                            </span>
                                        </p>

                                        <div className="mt-5 grid grid-cols-2 gap-3">
                                            <div className="rounded-xl border border-white/[0.06] bg-black/15 p-3">
                                                <p className="text-[10px] uppercase tracking-wider text-white/35">
                                                    Connector
                                                </p>
                                                <p className="mt-2 break-words text-sm font-medium text-white/85">
                                                    {charger.charger_type}
                                                </p>
                                            </div>

                                            <div className="rounded-xl border border-white/[0.06] bg-black/15 p-3">
                                                <p className="text-[10px] uppercase tracking-wider text-white/35">
                                                    Power output
                                                </p>
                                                <p className="mt-2 text-sm font-medium text-white/85">
                                                    {charger.power_kw} kW
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-5 flex items-end justify-between gap-3 border-t border-white/[0.07] pt-4">
                                            <div>
                                                <p className="text-xs text-white/40">
                                                    Charging rate
                                                </p>
                                                <p className="mt-1 text-xl font-semibold tracking-tight text-[#B5FFCE]">
                                                    ₹{Number(charger.price_per_hour).toFixed(2)}
                                                    <span className="ml-1 text-xs font-normal text-white/40">
                                                        /hr
                                                    </span>
                                                </p>
                                            </div>

                                            <span className="pb-1 text-[10px] text-white/30">
                                                Per hour
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setSelectedCharger(charger)}
                                            className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${selectedCharger?.id === charger.id
                                                ? "border border-[#B5FFCE]/20 bg-[#B5FFCE]/[0.08] text-[#B5FFCE]"
                                                : "bg-white/[0.05] text-white hover:bg-[#B5FFCE] hover:text-[#102019]"
                                                }`}
                                        >
                                            {selectedCharger?.id === charger.id
                                                ? "Station selected"
                                                : "View station details"}
                                            <span aria-hidden="true">→</span>
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                )}

                <footer className="mt-12 border-t border-white/[0.06] py-6 text-center">
                    <p className="text-xs text-white/25">
                        Find your charge. Keep your journey moving.
                    </p>
                    <p className="mt-2 text-[10px] tracking-[0.18em] text-[#B5FFCE]/35">
                        VOLTREO
                    </p>
                </footer>
            </div>
        </main>
    );

}