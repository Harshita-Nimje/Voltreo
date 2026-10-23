// "use client";
// import Link from "next/link";

// const features = [
//   {
//     number: "01",
//     icon: "⌖",
//     title: "Find your charge",
//     description:
//       "Discover charging spots around you, from private driveways to dedicated EV stations.",
//   },
//   {
//     number: "02",
//     icon: "◷",
//     title: "Book on your terms",
//     description:
//       "Choose a time slot, check the hourly price, and reserve your charging session.",
//   },
//   {
//     number: "03",
//     icon: "↗",
//     title: "Keep moving",
//     description:
//       "Spend less time searching for a plug and more time getting where you need to go.",
//   },
// ];

// export default function Home() {
//   return (
//     <main className="min-h-screen overflow-hidden bg-[#080d0b] text-white">
//       <style jsx>{`
//         @keyframes float {
//           0%, 100% { transform: translateY(0); }
//           50% { transform: translateY(-13px); }
//         }
//         @keyframes orbit {
//           from { transform: rotate(0deg); }
//           to { transform: rotate(360deg); }
//         }
//         @keyframes pulse {
//           0%, 100% { opacity: .35; transform: scale(.92); }
//           50% { opacity: .85; transform: scale(1.06); }
//         }
//         @keyframes energy {
//           0% { transform: translateY(90px); opacity: 0; }
//           35% { opacity: 1; }
//           100% { transform: translateY(-90px); opacity: 0; }
//         }
//         @keyframes reveal {
//           from { opacity: 0; transform: translateY(18px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         .float-art { animation: float 5s ease-in-out infinite; }
//         .orbit-art { animation: orbit 28s linear infinite; transform-origin: center; }
//         .pulse-art { animation: pulse 3.5s ease-in-out infinite; }
//         .energy-art { animation: energy 2.3s ease-in-out infinite; }
//         .reveal-art { animation: reveal .8s ease-out both; }
//         .delay-one { animation-delay: .12s; }
//         .delay-two { animation-delay: .24s; }
//         .delay-three { animation-delay: .36s; }
//         .glass-panel {
//           background: rgba(16, 27, 22, .78);
//           border: 1px solid rgba(190, 255, 216, .12);
//           backdrop-filter: blur(18px);
//         }
//         .green-text {
//           background: linear-gradient(100deg, #e0ffe9 0%, #61f5a1 48%, #a6ffd0 100%);
//           -webkit-background-clip: text;
//           background-clip: text;
//           color: transparent;
//         }
//         @media (prefers-reduced-motion: reduce) {
//           .float-art, .orbit-art, .pulse-art, .energy-art, .reveal-art {
//             animation: none !important;
//           }
//         }
//       `}</style>

//       {/* Navigation */}
//       <header className="relative z-20 border-b border-white/[0.07]">
//         <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
//           <Link href="/" className="flex items-center gap-3">
//             <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#b5ffce] text-xl font-black text-[#07130b] shadow-[0_0_28px_rgba(112,255,165,0.15)]">
//               V
//             </span>
//             <span className="text-xl font-bold tracking-tight">
//               volt<span className="text-[#9bf5b8]">reo</span>
//             </span>
//           </Link>

//           <div className="hidden items-center gap-9 text-sm text-white/65 md:flex">
//             <a href="#how-it-works" className="transition hover:text-white">
//               How it works
//             </a>
//             <a href="#hosts" className="transition hover:text-white">
//               For hosts
//             </a>
//             <a href="#benefits" className="transition hover:text-white">
//               Why Voltreo
//             </a>
//           </div>

//           <div className="flex items-center gap-3">
//             <Link
//               href="/login"
//               className="hidden rounded-full px-4 py-2.5 text-sm text-white/80 transition hover:text-white sm:inline-flex"
//             >
//               Log in
//             </Link>
//             <Link
//               href="/register"
//               className="rounded-full bg-[#b5ffce] px-4 py-2.5 text-sm font-semibold text-[#07130b] transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_0_28px_rgba(133,255,174,0.2)] sm:px-5"
//             >
//               Get started <span className="ml-1">↗</span>
//             </Link>
//           </div>
//         </nav>
//       </header>

//       {/* Hero */}
//       <section className="relative isolate">
//         <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-emerald-500/[0.08] blur-[110px]" />
//         <div className="pointer-events-none absolute right-0 top-20 h-96 w-96 rounded-full bg-lime-300/[0.06] blur-[120px]" />

//         <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 pb-20 pt-14 sm:px-8 sm:pt-20 lg:grid-cols-[1fr_0.95fr] lg:gap-4 lg:px-12 lg:pb-28 lg:pt-20">
//           <div className="relative z-10 reveal-art">
//             <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-200/15 bg-emerald-100/[0.04] px-3.5 py-2 text-xs font-medium tracking-wide text-emerald-100/80">
//               <span className="h-2 w-2 rounded-full bg-[#83ffad] shadow-[0_0_12px_#83ffad]" />
//               THE NEXT WAY TO CHARGE
//             </div>

//             <h1 className="max-w-2xl text-5xl font-semibold leading-[1.04] tracking-[-0.055em] sm:text-6xl lg:text-[76px]">
//               Your next
//               <br />
//               charge is
//               <br />
//               <span className="green-text">closer than</span>
//               <br />
//               you think.
//             </h1>

//             <p className="mt-7 max-w-lg text-base leading-7 text-white/55 sm:text-lg sm:leading-8">
//               Discover EV chargers near you. Book a time that works.
//               Or turn your own charging point into an opportunity.
//             </p>

//             <div className="mt-9 flex flex-wrap items-center gap-3">
//               <Link
//                 href="/register?role=user"
//                 className="group inline-flex items-center gap-3 rounded-full bg-[#b5ffce] px-6 py-4 text-sm font-bold text-[#07130b] transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_12px_40px_rgba(121,255,167,0.14)]"
//               >
//                 Find a charger
//                 <span className="transition-transform group-hover:translate-x-1">↗</span>
//               </Link>
//               <Link
//                 href="/register?role=host"
//                 className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-4 text-sm font-medium text-white/85 transition hover:border-emerald-200/50 hover:bg-white/[0.04]"
//               >
//                 Become a host <span>→</span>
//               </Link>
//             </div>

//             <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-white/[0.09] pt-7">
//               <div>
//                 <p className="text-2xl font-semibold tracking-tight">One place</p>
//                 <p className="mt-1 text-xs text-white/40">To find your next charge</p>
//               </div>
//               <div className="h-9 w-px bg-white/10" />
//               <div>
//                 <p className="text-2xl font-semibold tracking-tight">Your time</p>
//                 <p className="mt-1 text-xs text-white/40">Bookings that fit your day</p>
//               </div>
//               <div className="h-9 w-px bg-white/10" />
//               <div>
//                 <p className="text-2xl font-semibold tracking-tight">More access</p>
//                 <p className="mt-1 text-xs text-white/40">More ways to plug in</p>
//               </div>
//             </div>
//           </div>

//           {/* Animated charger illustration */}
//           <div className="relative mx-auto flex min-h-[440px] w-full max-w-[560px] items-center justify-center sm:min-h-[540px]">
//             <div className="pulse-art absolute h-[310px] w-[310px] rounded-full bg-emerald-300/[0.07] blur-[55px] sm:h-[390px] sm:w-[390px]" />

//             <svg
//               className="orbit-art absolute h-[400px] w-[400px] max-w-full opacity-60 sm:h-[510px] sm:w-[510px]"
//               viewBox="0 0 500 500"
//               fill="none"
//               aria-hidden="true"
//             >
//               <circle cx="250" cy="250" r="190" stroke="#9cf8b8" strokeOpacity=".18" strokeDasharray="2 10" />
//               <circle cx="250" cy="250" r="150" stroke="#9cf8b8" strokeOpacity=".12" />
//               <path d="M250 60 A190 190 0 0 1 410 148" stroke="#9cf8b8" strokeWidth="2" strokeLinecap="round" />
//               <circle cx="410" cy="148" r="4" fill="#b5ffce" />
//               <circle cx="94" cy="318" r="3" fill="#b5ffce" />
//             </svg>

//             <div className="float-art relative z-10 w-[230px] sm:w-[275px]">
//               {/* Charger glow */}
//               <div className="absolute -inset-8 rounded-[50px] bg-emerald-300/[0.08] blur-2xl" />

//               {/* Charger body */}
//               <div className="relative rounded-[34px] border border-emerald-100/20 bg-gradient-to-br from-[#263a2e] via-[#15251c] to-[#0b130e] p-3 shadow-[0_30px_100px_rgba(0,0,0,0.6)]">
//                 <div className="rounded-[26px] border border-white/[0.06] bg-[#0b130e] px-5 pb-6 pt-5">
//                   <div className="flex items-center justify-between">
//                     <span className="text-xs font-bold tracking-[0.22em] text-white/80">VOLTREO</span>
//                     <span className="h-2 w-2 rounded-full bg-[#8bffb1] shadow-[0_0_12px_#8bffb1]" />
//                   </div>

//                   <div className="relative mx-auto mt-7 flex h-[152px] w-[152px] items-center justify-center rounded-full border border-emerald-100/10 bg-[#101d15]">
//                     <div className="absolute inset-2 rounded-full border border-emerald-200/10" />
//                     <div className="pulse-art absolute inset-4 rounded-full border border-[#9affb6]/30 shadow-[0_0_30px_rgba(114,255,162,0.12)]" />
//                     <svg viewBox="0 0 100 100" className="relative z-10 h-[94px] w-[94px]" fill="none" aria-label="Electric charge symbol">
//                       <path d="M56 8 27 53h21l-5 39 31-49H53L56 8Z" fill="#a5ffc0" />
//                       <path d="M56 8 27 53h21l-5 39 31-49H53L56 8Z" fill="#a5ffc0" fillOpacity=".2" stroke="#d7ffe2" strokeWidth="1.5" />
//                     </svg>
//                   </div>

//                   <div className="mt-6 text-center">
//                     <p className="text-[10px] uppercase tracking-[0.24em] text-white/35">Charging station</p>
//                     <p className="mt-2 text-3xl font-semibold tracking-tight text-white">22 <span className="text-base text-emerald-200">kW</span></p>
//                     <div className="mx-auto mt-4 flex max-w-[155px] items-center justify-center gap-2 rounded-full border border-emerald-200/15 bg-emerald-200/[0.06] py-2 text-[10px] font-medium text-emerald-100/80">
//                       <span className="h-1.5 w-1.5 rounded-full bg-[#8bffb1]" />
//                       READY TO CONNECT
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Charging cable */}
//               <svg className="absolute -right-[50px] top-[112px] h-[175px] w-[85px] overflow-visible sm:-right-[64px]" viewBox="0 0 100 190" fill="none" aria-hidden="true">
//                 <path d="M4 5 C65 5 68 38 68 74 L68 114 C68 144 88 144 88 164" stroke="#050906" strokeWidth="17" strokeLinecap="round" />
//                 <path d="M4 5 C65 5 68 38 68 74 L68 114 C68 144 88 144 88 164" stroke="#4a7558" strokeWidth="10" strokeLinecap="round" />
//                 <path d="M88 158 L88 176" stroke="#c5ffd4" strokeWidth="5" strokeLinecap="round" />
//                 <rect x="76" y="170" width="24" height="17" rx="5" fill="#b5ffce" />
//               </svg>

//               {/* Moving energy particle */}
//               <div className="energy-art absolute -right-[37px] top-[205px] z-20 h-3 w-3 rounded-full bg-[#b5ffce] shadow-[0_0_18px_5px_rgba(133,255,174,0.55)]" />
//             </div>

//             {/* Floating info panels */}
//             <div className="glass-panel reveal-art delay-one absolute left-0 top-[12%] z-20 rounded-2xl p-4 shadow-2xl sm:left-2">
//               <div className="flex items-center gap-3">
//                 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-200/10 text-xl text-emerald-200">⌖</div>
//                 <div>
//                   <p className="text-xs text-white/45">Your next stop</p>
//                   <p className="mt-1 text-sm font-semibold">Closer than you think</p>
//                 </div>
//               </div>
//             </div>

//             <div className="glass-panel reveal-art delay-two absolute bottom-[13%] right-0 z-20 rounded-2xl p-4 shadow-2xl sm:right-1">
//               <div className="flex items-center gap-3">
//                 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#b5ffce] text-lg font-bold text-[#07130b]">↗</div>
//                 <div>
//                   <p className="text-xs text-white/45">For EV owners</p>
//                   <p className="mt-1 text-sm font-semibold">Your charge, your way</p>
//                 </div>
//               </div>
//             </div>

//             <div className="absolute bottom-2 left-1/2 h-px w-[85%] -translate-x-1/2 bg-gradient-to-r from-transparent via-emerald-200/30 to-transparent" />
//           </div>
//         </div>
//       </section>

//       {/* Feature strip */}
//       <section id="benefits" className="border-y border-white/[0.07] bg-white/[0.018]">
//         <div className="mx-auto grid max-w-7xl gap-0 px-5 sm:px-8 md:grid-cols-3 lg:px-12">
//           {features.map((feature, index) => (
//             <article
//               key={feature.number}
//               className={`reveal-art py-9 md:px-7 md:py-11 ${index !== 0 ? "border-t border-white/[0.08] md:border-l md:border-t-0" : ""
//                 } ${index === 1 ? "delay-one" : index === 2 ? "delay-two" : ""}`}
//             >
//               <div className="flex items-center justify-between">
//                 <span className="text-xs tracking-[0.2em] text-emerald-200/60">{feature.number}</span>
//                 <span className="text-2xl text-[#a8ffc1]">{feature.icon}</span>
//               </div>
//               <h2 className="mt-6 text-xl font-semibold tracking-tight">{feature.title}</h2>
//               <p className="mt-3 max-w-sm text-sm leading-6 text-white/45">{feature.description}</p>
//             </article>
//           ))}
//         </div>
//       </section>

//       {/* How it works */}
//       <section id="how-it-works" className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
//         <div className="pointer-events-none absolute right-12 top-16 h-64 w-64 rounded-full bg-emerald-400/[0.04] blur-[100px]" />
//         <div className="relative grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
//           <div>
//             <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200/70">Simple by design</p>
//             <h2 className="mt-5 max-w-lg text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
//               Charging should be the easy part.
//             </h2>
//             <p className="mt-5 max-w-md leading-7 text-white/50">
//               One simple flow to discover a station, reserve your slot, and get back on the road.
//             </p>
//           </div>

//           <div className="space-y-3">
//             {[
//               ["01", "Discover", "Explore available chargers and compare their details."],
//               ["02", "Reserve", "Pick your charging time and submit your booking."],
//               ["03", "Plug in", "Head to your reserved charger and get moving."],
//             ].map(([number, title, description]) => (
//               <div key={number} className="group flex gap-5 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition duration-300 hover:border-emerald-200/25 hover:bg-emerald-100/[0.035] sm:p-6">
//                 <span className="pt-1 text-sm font-medium text-emerald-200/60">{number}</span>
//                 <div className="flex-1">
//                   <h3 className="font-semibold">{title}</h3>
//                   <p className="mt-2 text-sm leading-6 text-white/45">{description}</p>
//                 </div>
//                 <span className="pt-1 text-white/30 transition group-hover:translate-x-1 group-hover:text-emerald-200">↗</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Host call to action */}
//       <section id="hosts" className="px-5 pb-20 sm:px-8 lg:px-12 lg:pb-28">
//         <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[30px] border border-emerald-100/15 bg-gradient-to-br from-[#1a3323] via-[#102017] to-[#0c130e] p-8 sm:p-12 lg:p-16">
//           <div className="pointer-events-none absolute -right-16 -top-28 h-80 w-80 rounded-full border border-emerald-100/10" />
//           <div className="pointer-events-none absolute -right-4 -top-16 h-64 w-64 rounded-full border border-emerald-100/[0.08]" />
//           <div className="pointer-events-none absolute right-24 top-12 h-52 w-52 rounded-full bg-emerald-300/[0.08] blur-[75px]" />

//           <div className="relative z-10 flex flex-col justify-between gap-9 md:flex-row md:items-end">
//             <div className="max-w-2xl">
//               <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200/70">For charger owners</p>
//               <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
//                 Your charger could take someone further.
//               </h2>
//               <p className="mt-5 max-w-xl leading-7 text-white/55">
//                 List your charging point, manage booking requests, and make your charger available to EV drivers.
//               </p>
//             </div>
//             <Link
//               href="/register?role=host"
//               className="inline-flex shrink-0 items-center justify-center gap-3 self-start rounded-full bg-[#b5ffce] px-6 py-4 text-sm font-bold text-[#07130b] transition hover:-translate-y-1 hover:bg-white md:self-auto"
//             >
//               Become a host <span>↗</span>
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="border-t border-white/[0.08]">
//         <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm text-white/40 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
//           <Link href="/" className="flex items-center gap-2 text-base font-bold text-white/85">
//             <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#b5ffce] font-black text-[#07130b]">V</span>
//             volt<span className="text-emerald-200">reo</span>
//           </Link>
//           <p>Find your charge. Keep moving.</p>
//           <p>© {new Date().getFullYear()} Voltreo</p>
//         </div>
//       </footer>
//     </main>
//   );
// }



"use client";

import Link from "next/link";

const features = [
  {
    number: "01",
    icon: "⌖",
    title: "Find your next charge.",
    description:
      "Discover approved charging spots and find one that fits your journey.",
    className: "md:col-span-2",
  },
  {
    number: "02",
    icon: "◷",
    title: "Your time, your slot.",
    description:
      "Choose a convenient time and book your charging session.",
    className: "md:col-span-1",
  },
  {
    number: "03",
    icon: "↗",
    title: "Make your charger count.",
    description:
      "List your charging point and welcome EV drivers to your space.",
    className: "md:col-span-1",
  },
  {
    number: "04",
    icon: "ϟ",
    title: "A smarter way forward.",
    description:
      "One platform for discovering chargers, managing bookings, and keeping your journey moving.",
    className: "md:col-span-2",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#080D0B] text-[#F4F8F4]">
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes glow {
          0%, 100% { opacity: .35; }
          50% { opacity: .8; }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .charger-float {
          animation: float 5s ease-in-out infinite;
        }

        .charger-glow {
          animation: glow 3s ease-in-out infinite;
        }

        .charger-orbit {
          animation: spin 30s linear infinite;
        }

        html {
  scroll-behavior: smooth;
  scroll-padding-top: 90px;
}

.glass {
  background: rgba(255,255,255,.045);
  border: 1px solid rgba(255,255,255,.10);
  backdrop-filter: blur(18px);
}

.nav-link {
  position: relative;
  display: inline-block;
  transition: color .25s ease, transform .25s ease;
}

.nav-link::after {
  content: "";
  position: absolute;
  bottom: -7px;
  left: 0;
  width: 100%;
  height: 2px;
  border-radius: 999px;
  background: #B5FFCE;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform .3s ease;
}

.nav-link:hover {
  color: #B5FFCE;
  transform: translateY(-2px);
}

.nav-link:hover::after {
  transform: scaleX(1);
}

.nav-link:active {
  transform: translateY(0) scale(.96);
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  .nav-link,
  .nav-link::after {
    transition: none;
  }
}
        .mint-text {
          background: linear-gradient(110deg, #F0FFF4, #9BFFC0 55%, #C9FFDA);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .bento-card {
          transition: transform .25s ease, border-color .25s ease,
            background .25s ease;
        }

        .bento-card:hover {
          transform: translateY(-4px);
          border-color: rgba(181,255,206,.28);
          background-color: rgba(181,255,206,.045);
        }

        @media (prefers-reduced-motion: reduce) {
          .charger-float, .charger-glow, .charger-orbit {
            animation: none !important;
          }

          .bento-card {
            transition: none;
          }
        }
      `}</style>

      {/* NAVIGATION */}
      <header className="relative z-20 border-b border-white/[0.07]">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#B5FFCE] text-xl font-black text-[#080D0B]">
              V
            </span>
            <span className="text-xl font-bold tracking-tight">
              volt<span className="text-[#B5FFCE]">reo</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 text-sm text-white/55 md:flex">
            <a href="#explore" className="nav-link">
              Explore
            </a>

            <a href="#how-it-works" className="nav-link">
              How it works
            </a>

            <a href="#hosts" className="nav-link">
              For hosts
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden px-3 py-2 text-sm text-white/70 hover:text-white sm:block"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-[#B5FFCE] px-5 py-3 text-sm font-semibold text-[#080D0B] transition hover:bg-white"
            >
              Get started ↗
            </Link>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section className="relative">
        <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-emerald-400/[0.08] blur-[120px]" />
        <div className="pointer-events-none absolute right-0 top-20 h-96 w-96 rounded-full bg-green-300/[0.06] blur-[120px]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-8 lg:px-12 lg:py-24">
          <div className="relative z-10">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#B5FFCE]/15 bg-[#B5FFCE]/[0.05] px-4 py-2 text-xs tracking-wider text-[#B5FFCE]">
              <span className="h-2 w-2 rounded-full bg-[#B5FFCE]" />
              ELECTRIC MOBILITY, REIMAGINED
            </div>

            <h1 className="max-w-2xl text-5xl font-semibold leading-[1.05] tracking-[-0.055em] sm:text-6xl lg:text-[76px]">
              A better way to
              <br />

              <span className="mint-text">power every mile.</span>
            </h1>

            <p className="mt-7 max-w-lg text-base leading-8 text-white/55 sm:text-lg">
              Discover EV chargers, reserve your time, and get back on the
              road. A smarter charging experience starts here.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/register?role=user"
                className="rounded-full bg-[#B5FFCE] px-6 py-4 text-sm font-bold text-[#080D0B] transition hover:-translate-y-1 hover:bg-white"
              >
                Find a charger <span className="ml-2">↗</span>
              </Link>
              <Link
                href="#hosts"
                className="rounded-full border border-white/15 px-6 py-4 text-sm font-medium text-white/85 transition hover:border-[#B5FFCE]/40 hover:bg-white/[0.04]"
              >
                I'm a charger host
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-4 border-t border-white/[0.08] pt-6">
              <div className="flex -space-x-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#080D0B] bg-[#263C2D] text-sm">ϟ</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#080D0B] bg-[#34483A] text-sm">⌖</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#080D0B] bg-[#536B57] text-sm">↗</span>
              </div>
              <p className="text-xs leading-5 text-white/45">
                Discover charging options.
                <br />
                Book on your schedule.
              </p>
            </div>
          </div>

          {/* CUSTOM ANIMATED CHARGER */}
          <div className="relative mx-auto flex min-h-[410px] w-full max-w-[520px] items-center justify-center sm:min-h-[500px]">
            <div className="charger-glow absolute h-72 w-72 rounded-full bg-emerald-300/10 blur-[80px] sm:h-96 sm:w-96" />

            <svg
              viewBox="0 0 440 440"
              className="charger-orbit absolute h-full max-h-[480px] w-full opacity-60"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="220" cy="220" r="180" stroke="#B5FFCE" strokeOpacity=".15" strokeDasharray="3 9" />
              <circle cx="220" cy="220" r="140" stroke="#B5FFCE" strokeOpacity=".12" />
              <circle cx="220" cy="40" r="4" fill="#B5FFCE" />
              <circle cx="40" cy="220" r="3" fill="#B5FFCE" />
            </svg>

            <div className="charger-float relative z-10 w-[215px] rounded-[32px] border border-[#B5FFCE]/20 bg-gradient-to-br from-[#263D2E] via-[#14241A] to-[#0B120D] p-3 shadow-[0_30px_100px_rgba(0,0,0,.6)] sm:w-[250px]">
              <div className="rounded-[24px] border border-white/[0.06] bg-[#0B120D] px-5 pb-6 pt-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold tracking-[.22em]">VOLTREO</span>
                  <span className="h-2 w-2 rounded-full bg-[#B5FFCE] shadow-[0_0_12px_#B5FFCE]" />
                </div>

                <div className="relative mx-auto mt-8 flex h-36 w-36 items-center justify-center rounded-full border border-[#B5FFCE]/15 bg-[#122017]">
                  <div className="charger-glow absolute inset-3 rounded-full border border-[#B5FFCE]/30" />
                  <svg viewBox="0 0 100 100" className="relative h-24 w-24" aria-label="Electric charging symbol">
                    <path d="M57 5 27 54h22l-6 41 32-52H53L57 5Z" fill="#B5FFCE" />
                  </svg>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-[10px] uppercase tracking-[.22em] text-white/40">
                    EV charging
                  </p>
                  <p className="mt-2 text-3xl font-semibold">
                    22 <span className="text-sm text-[#B5FFCE]">kW</span>
                  </p>
                  <div className="mt-4 rounded-full border border-[#B5FFCE]/15 bg-[#B5FFCE]/[0.06] py-2 text-[10px] tracking-wider text-[#B5FFCE]">
                    READY TO CONNECT
                  </div>
                </div>
              </div>
            </div>

            <div className="glass absolute left-0 top-[13%] z-20 rounded-2xl p-4 shadow-xl sm:left-1">
              <p className="text-[10px] uppercase tracking-wider text-white/40">Your next stop</p>
              <p className="mt-2 text-sm font-semibold">A charge away ↗</p>
            </div>

            <div className="glass absolute bottom-[12%] right-0 z-20 rounded-2xl p-4 shadow-xl sm:right-0">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#B5FFCE] text-lg font-bold text-[#080D0B]">ϟ</span>
                <div>
                  <p className="text-[10px] text-white/40">Power up</p>
                  <p className="mt-1 text-sm font-semibold">Keep moving.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENTO GRID */}
      <section id="explore" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.23em] text-[#B5FFCE]/70">
              A better way to plug in
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Everything connects.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-white/45">
            Designed around the way EV drivers and charger owners actually use charging.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {features.map((feature, index) => (
            <article
              key={feature.number}
              className={`bento-card group relative overflow-hidden rounded-[26px] border border-white/[0.09] bg-[#101713] p-6 sm:p-8 ${feature.className} ${index === 0 ? "min-h-[245px] md:min-h-[280px]" : "min-h-[220px]"
                }`}
            >
              {index === 0 && (
                <div className="pointer-events-none absolute -right-4 -top-10 h-48 w-48 rounded-full border border-[#B5FFCE]/10">
                  <div className="absolute inset-5 rounded-full border border-[#B5FFCE]/10" />
                  <div className="absolute inset-10 rounded-full bg-[#B5FFCE]/[0.06] blur-xl" />
                </div>
              )}

              {index === 3 && (
                <div className="pointer-events-none absolute -bottom-16 -right-5 text-[190px] font-light leading-none text-[#B5FFCE]/[0.035]">
                  ϟ
                </div>
              )}

              <div className="relative flex items-start justify-between">
                <span className="text-xs tracking-[.2em] text-white/35">{feature.number}</span>
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#B5FFCE]/15 bg-[#B5FFCE]/[0.06] text-2xl text-[#B5FFCE] transition group-hover:bg-[#B5FFCE]/10">
                  {feature.icon}
                </span>
              </div>

              <div className="relative mt-10">
                <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  {feature.title}
                </h3>
                <p className="mt-3 max-w-md text-sm leading-6 text-white/45">
                  {feature.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="border-y border-white/[0.07] bg-white/[0.015]">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:px-12 lg:py-24">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.23em] text-[#B5FFCE]/70">
              Three steps. Less friction.
            </p>
            <h2 className="mt-5 max-w-lg text-4xl font-semibold leading-tight tracking-[-.04em] sm:text-5xl">
              Get there.
              <br />
              Plug in.
              <br />
              <span className="mint-text">Move forward.</span>
            </h2>
          </div>

          <div className="space-y-3">
            {[
              ["01", "Explore", "Find an approved charger for your journey."],
              ["02", "Reserve", "Select your slot and submit your booking."],
              ["03", "Charge", "Visit the charger and power up."],
            ].map(([number, title, description]) => (
              <div key={number} className="bento-card flex gap-5 rounded-2xl border border-white/[0.08] bg-[#0B110D] p-5 sm:p-6">
                <span className="pt-1 text-sm text-[#B5FFCE]/65">{number}</span>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/45">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOST CTA */}
      <section id="hosts" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="relative overflow-hidden rounded-[30px] border border-[#B5FFCE]/15 bg-gradient-to-br from-[#1C3525] to-[#0E1711] p-8 sm:p-12 lg:p-16">
          <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full border border-[#B5FFCE]/10" />
          <div className="pointer-events-none absolute -right-4 -top-12 h-64 w-64 rounded-full bg-[#B5FFCE]/[0.06] blur-[70px]" />

          <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[.22em] text-[#B5FFCE]/75">
                The host opportunity
              </p>
              <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-[-.04em] sm:text-5xl">
                Your charger.
                <br />
                A new possibility.
              </h2>
              <p className="mt-5 max-w-lg text-sm leading-7 text-white/55 sm:text-base">
                Make your charging point available to EV drivers. Manage your listing and booking requests from one place.
              </p>
            </div>

            <Link
              href="/register?role=host"
              className="inline-flex shrink-0 items-center justify-center gap-3 self-start rounded-full bg-[#B5FFCE] px-6 py-4 text-sm font-bold text-[#080D0B] transition hover:-translate-y-1 hover:bg-white md:self-auto"
            >
              Become a host <span>↗</span>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.07]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm text-white/40 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <Link href="/" className="text-lg font-bold text-white">
            volt<span className="text-[#B5FFCE]">reo</span>
          </Link>
          <p>Find your charge. Keep moving.</p>
          <p>© {new Date().getFullYear()} Voltreo</p>
        </div>
      </footer>
    </main>
  );
}
