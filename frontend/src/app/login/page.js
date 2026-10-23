
"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed. Please try again.");
            }

            if (!data.token || !data.user) {
                throw new Error("Invalid response from server. Please try again.");
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            window.location.href =
                data.user.role === "host" ? "/host/dashboard" : "/dashboard";
        } catch (err) {
            setError(
                err.message === "Failed to fetch"
                    ? "Unable to connect to the server. Please try again."
                    : err.message
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080D0B] px-5 py-12 text-white">
            {/* Background glow */}
            <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-[#B5FFCE]/10 blur-[120px]" />
            <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />

            {/* Back to home */}
            <Link
                href="/"
                className="absolute left-6 top-6 text-sm text-white/60 transition hover:text-[#B5FFCE] sm:left-10 sm:top-8"
            >
                ← Back to home
            </Link>

            <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#101813]/80 shadow-2xl shadow-black/30 backdrop-blur-xl md:grid-cols-2">
                {/* Left panel */}
                <section className="relative hidden min-h-[600px] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#183524] via-[#102219] to-[#080D0B] p-10 md:flex lg:p-14">
                    {/* Animated orbital circles */}
                    <div className="absolute -right-20 top-28 h-64 w-64 animate-[spin_14s_linear_infinite] rounded-full border border-[#B5FFCE]/10">
                        <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#B5FFCE] shadow-[0_0_14px_4px_rgba(181,255,206,0.6)]" />
                    </div>

                    <div className="absolute -right-10 top-36 h-44 w-44 animate-[spin_9s_linear_infinite_reverse] rounded-full border border-[#B5FFCE]/20">
                        <span className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 translate-x-1/2 rounded-full bg-[#B5FFCE] shadow-[0_0_12px_3px_rgba(181,255,206,0.7)]" />
                    </div>

                    <div className="absolute -right-1 top-44 h-28 w-28 rounded-full bg-[#B5FFCE]/10 blur-2xl" />

                    <Link
                        href="/"
                        className="relative z-10 text-2xl font-bold tracking-tight"
                    >
                        volt<span className="text-[#B5FFCE]">reo</span>
                        <span className="ml-2 align-top text-xs text-white/40">®</span>
                    </Link>

                    <div className="relative z-10">
                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#B5FFCE]/20 bg-[#B5FFCE]/10 text-[#B5FFCE]">
                            <svg
                                width="25"
                                height="25"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.6"
                            >
                                <path d="M13 2 4 14h7l-1 8 10-12h-7l1-8Z" />
                            </svg>
                        </div>

                        <h2 className="max-w-sm text-4xl font-semibold leading-tight tracking-tight lg:text-5xl">
                            Good to see
                            <br />
                            <span className="text-[#B5FFCE]">you again.</span>
                        </h2>

                        <p className="mt-5 max-w-sm text-sm leading-7 text-white/60">
                            Your next charge is closer than you think. Get back on the road
                            with Voltreo.
                        </p>
                    </div>

                    <p className="relative z-10 text-xs text-white/40">
                        Find power. Find your way.
                    </p>
                </section>

                {/* Right panel: login form */}
                <section className="flex items-center px-6 py-12 sm:px-10 md:px-9 lg:px-14">
                    <div className="mx-auto w-full max-w-md">
                        <Link
                            href="/"
                            className="mb-10 inline-block text-2xl font-bold tracking-tight md:hidden"
                        >
                            volt<span className="text-[#B5FFCE]">reo</span>
                        </Link>

                        <div className="mb-8">
                            <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-[#B5FFCE]">
                                Welcome back
                            </p>

                            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                                Sign in to Voltreo
                            </h1>

                            <p className="mt-3 text-sm leading-6 text-white/50">
                                Enter your details to access your account.
                            </p>
                        </div>

                        <form className="space-y-5" onSubmit={handleLogin}>
                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm text-white/80"
                                >
                                    Email address
                                </label>

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    required
                                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#B5FFCE]/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-[#B5FFCE]/10"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <div className="mb-2 flex items-center justify-between gap-3">
                                    <label
                                        htmlFor="password"
                                        className="text-sm text-white/80"
                                    >
                                        Password
                                    </label>

                                    <button
                                        type="button"
                                        className="text-xs text-[#B5FFCE]/80 transition hover:text-[#B5FFCE]"
                                        onClick={() =>
                                            alert("Password reset will be added in a later step.")
                                        }
                                    >
                                        Forgot password?
                                    </button>
                                </div>

                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        required
                                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 pr-20 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#B5FFCE]/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-[#B5FFCE]/10"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/45 transition hover:text-[#B5FFCE]"
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </div>

                            {/* Login error */}
                            {error && (
                                <p
                                    role="alert"
                                    className="rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-300"
                                >
                                    {error}
                                </p>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#B5FFCE] px-4 py-3.5 text-sm font-semibold text-[#080D0B] transition hover:bg-[#d0ffdf] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? "Signing in..." : "Sign in"}
                                {!loading && <span aria-hidden="true">→</span>}
                            </button>
                        </form>

                        <p className="mt-7 text-center text-sm text-white/50">
                            New to Voltreo?{" "}
                            <Link
                                href="/register"
                                className="font-medium text-[#B5FFCE] transition hover:text-white"
                            >
                                Create an account
                            </Link>
                        </p>

                        <p className="mt-10 text-center text-xs leading-5 text-white/30">
                            By continuing, you agree to Voltreo’s Terms of Service and
                            Privacy Policy.
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}
