
"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("user");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (event) => {
        event.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    role,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Registration failed. Please try again."
                );
            }

            window.location.href = "/login";
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

            <Link
                href="/"
                className="absolute left-6 top-6 text-sm text-white/60 transition hover:text-[#B5FFCE] sm:left-10 sm:top-8"
            >
                ← Back to home
            </Link>

            <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#101813]/80 shadow-2xl shadow-black/30 backdrop-blur-xl md:grid-cols-2">
                {/* Left panel */}

                {/* Left panel */}
                <section className="relative hidden min-h-[700px] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#14251B] via-[#0D1711] to-[#080D0B] p-10 md:flex lg:p-14">

                    {/* Subtle ambient glow */}
                    <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#B5FFCE]/[0.06] blur-[90px]" />

                    {/* Minimal orbital illustration */}
                    <div className="pointer-events-none absolute -right-12 top-24 h-52 w-52">
                        <div className="absolute inset-0 rounded-full border border-[#B5FFCE]/10" />

                        <div className="absolute inset-7 rounded-full border border-[#B5FFCE]/15" />

                        <div className="absolute inset-14 rounded-full border border-[#B5FFCE]/20" />

                        {/* Outer orbiting dot */}
                        <div className="absolute inset-0 animate-[spin_18s_linear_infinite] rounded-full">
                            <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#B5FFCE] shadow-[0_0_12px_3px_rgba(181,255,206,0.5)]" />
                        </div>

                        {/* Inner orbiting dot */}
                        <div className="absolute inset-7 animate-[spin_12s_linear_infinite_reverse] rounded-full">
                            <span className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 translate-x-1/2 rounded-full bg-[#B5FFCE]/80 shadow-[0_0_10px_2px_rgba(181,255,206,0.4)]" />
                        </div>
                    </div>

                    {/* Brand */}
                    <Link
                        href="/"
                        className="relative z-10 text-2xl font-bold tracking-tight"
                    >
                        volt<span className="text-[#B5FFCE]">reo</span>
                    </Link>

                    {/* Main copy */}
                    <div className="relative z-10 -mt-4">
                        <p className="mb-5 text-xs font-medium uppercase tracking-[0.25em] text-[#B5FFCE]/80">
                            Your journey starts here
                        </p>

                        <h2 className="max-w-sm text-4xl font-semibold leading-[1.15] tracking-tight lg:text-5xl">
                            Make room for
                            <br />
                            <span className="text-[#B5FFCE]">better journeys.</span>
                        </h2>

                        <p className="mt-6 max-w-xs text-sm leading-7 text-white/55">
                            Discover charging possibilities, connect with hosts, and keep your
                            electric journey moving.
                        </p>

                        {/* Small decorative accent */}
                        <div className="mt-8 flex items-center gap-3">
                            <span className="h-px w-10 bg-[#B5FFCE]/60" />
                            <span className="text-xs tracking-wide text-white/40">
                                Find power. Find your way.
                            </span>
                        </div>
                    </div>

                    <p className="relative z-10 text-xs text-white/30">
                        A smarter way to charge.
                    </p>
                </section>


                {/* Right panel: registration form */}
                <section className="flex items-center px-6 py-12 sm:px-10 md:px-9 lg:px-14">
                    <div className="mx-auto w-full max-w-md">
                        <Link
                            href="/"
                            className="mb-8 inline-block text-2xl font-bold tracking-tight md:hidden"
                        >
                            volt<span className="text-[#B5FFCE]">reo</span>
                        </Link>

                        <div className="mb-7">
                            <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-[#B5FFCE]">
                                Get started
                            </p>

                            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                                Create your account
                            </h1>

                            <p className="mt-3 text-sm leading-6 text-white/50">
                                A few details and you’re ready to go.
                            </p>
                        </div>

                        <form className="space-y-4" onSubmit={handleRegister}>
                            {/* Full name */}
                            <div>
                                <label
                                    htmlFor="name"
                                    className="mb-2 block text-sm text-white/80"
                                >
                                    Full name
                                </label>

                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    autoComplete="name"
                                    placeholder="Your full name"
                                    required
                                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#B5FFCE]/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-[#B5FFCE]/10"
                                />
                            </div>

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
                                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#B5FFCE]/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-[#B5FFCE]/10"
                                />
                            </div>

                            {/* Account type */}
                            <div>
                                <label
                                    htmlFor="role"
                                    className="mb-2 block text-sm text-white/80"
                                >
                                    I want to
                                </label>

                                <select
                                    id="role"
                                    name="role"
                                    defaultValue="user"
                                    value={role}
                                    onChange={(event) => setRole(event.target.value)}
                                    className="w-full rounded-xl border border-white/10 bg-[#111A14] px-4 py-3 text-sm text-white outline-none transition focus:border-[#B5FFCE]/60 focus:ring-2 focus:ring-[#B5FFCE]/10"
                                >
                                    <option value="user">Find EV charging stations</option>
                                    <option value="host">Host my charging station</option>
                                </select>
                            </div>

                            {/* Password */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-2 block text-sm text-white/80"
                                >
                                    Password
                                </label>

                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        placeholder="Create a password"
                                        required
                                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 pr-20 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#B5FFCE]/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-[#B5FFCE]/10"
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

                            {/* Confirm password */}
                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="mb-2 block text-sm text-white/80"
                                >
                                    Confirm password
                                </label>

                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(event) => setConfirmPassword(event.target.value)}
                                        type={showConfirmPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        placeholder="Re-enter your password"
                                        required
                                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 pr-20 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#B5FFCE]/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-[#B5FFCE]/10"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(!showConfirmPassword)
                                        }
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/45 transition hover:text-[#B5FFCE]"
                                    >
                                        {showConfirmPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </div>
                            {error && (
                                <p
                                    role="alert"
                                    className="rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-300"
                                >
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#B5FFCE] px-4 py-3.5 text-sm font-semibold text-[#080D0B] transition hover:bg-[#d0ffdf] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? "Creating account..." : "Create account"}
                                {!loading && <span aria-hidden="true">→</span>}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm text-white/50">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="font-medium text-[#B5FFCE] transition hover:text-white"
                            >
                                Sign in
                            </Link>
                        </p>

                        <p className="mt-7 text-center text-xs leading-5 text-white/30">
                            By creating an account, you agree to Voltreo’s Terms of Service
                            and Privacy Policy.
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}
