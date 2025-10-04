import React from "react";
import heroIllustration from "/src/pictures/complaint-hero.svg";

/* Small icon components (keeps things local and simple) */
const IconComplaint = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="3" y="6" width="18" height="12" rx="2" stroke="#CBD5E1" strokeWidth="1.5" />
    <path d="M8 10h8" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8 13h5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const IconTrack = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="9" stroke="#CBD5E1" strokeWidth="1.5" />
    <path d="M7 12h5l2 3" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconAnalytics = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="3" y="6" width="4" height="12" rx="1" stroke="#CBD5E1" strokeWidth="1.5"/>
    <rect x="10" y="4" width="4" height="14" rx="1" stroke="#CBD5E1" strokeWidth="1.5"/>
    <rect x="17" y="9" width="4" height="9" rx="1" stroke="#CBD5E1" strokeWidth="1.5"/>
  </svg>
);

/* Illustration URL (you can swap with your asset) */

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      {/* NAV */}
      <header className="px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-md bg-primary/10">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M3 12 L12 4 L21 12 L3 12 Z" fill="#5b6bf7"/>
              <rect x="6" y="12" width="12" height="7" rx="1" fill="#5b6bf7"/>
            </svg>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-primary">TattleTent</h1>
        </div>

        <nav className="flex items-center gap-4">
          <a href="#features" className="text-sm text-slate-600 hover:text-slate-800">Features</a>
          <a href="#transparency" className="text-sm text-slate-600 hover:text-slate-800">Transparency</a>

          <div className="flex items-center gap-3 ml-6">
            <button className="hidden md:inline px-4 py-2 rounded-md text-sm border border-slate-200">Login</button>
            <button className="px-4 py-2 rounded-md text-sm bg-primary text-white shadow hover:bg-primaryDark">Signup</button>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-12 grid md:grid-cols-2 gap-8 items-center">
          {/* Left: text */}
          <div>
            <h2 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-slate-900">
              Report. Track. <span className="text-primary">Resolve.</span>
            </h2>

            <p className="mt-6 text-lg text-slate-600 max-w-xl">
              TattleTent helps citizens of the traveling circus report issues like broken roads, water leaks,
              or garbage piles — and track their resolution in real time. Submit a complaint in minutes and follow progress at every step.
            </p>

            <div className="mt-8 flex items-center gap-4">
              <a href="#get-started" className="inline-flex items-center px-6 py-3 rounded-xl bg-primary text-white font-medium shadow hover:bg-primaryDark">Get Started</a>
              <a href="#learn" className="inline-flex items-center px-5 py-3 rounded-xl border border-primary text-primary">Learn More</a>
            </div>

            <div className="mt-10 flex gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-md bg-primary/10">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M12 2v6" stroke="#5b6bf7" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M5 8h14" stroke="#5b6bf7" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold">Quick reports</div>
                  <div className="text-xs text-slate-500">Add photos & location</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-md bg-slate-100">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M3 12h18" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M12 3v18" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold">Transparent</div>
                  <div className="text-xs text-slate-500">Public stats & heatmaps</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: illustration */}
          <div className="flex justify-center md:justify-end">
            <div className="relative w-full max-w-md hero-blob p-6 rounded-2xl">
              <img src={heroIllustration} alt="Citizens reporting complaints" className="w-full h-auto" />
            </div>
          </div>

          {/* FEATURES */}
          <section id="features" className="bg-white py-16 w-full">
            <div className="w-full max-w-6xl mx-auto px-6 lg:px-8 text-center">
              <h3 className="text-3xl font-bold mb-12">Key Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <article className="p-8 border rounded-2xl shadow-sm flex flex-col items-center">
                  <div className="p-4 rounded-full bg-slate-50 mb-4">
                    <IconComplaint />
                  </div>
                  <h4 className="font-semibold text-lg">Easy Complaint Submission</h4>
                  <p className="text-sm text-slate-500 mt-2 max-w-xs">
                    Report issues quickly with photos and location.
                  </p>
                </article>

                <article className="p-8 border rounded-2xl shadow-sm flex flex-col items-center">
                  <div className="p-4 rounded-full bg-slate-50 mb-4">
                    <IconTrack />
                  </div>
                  <h4 className="font-semibold text-lg">Track Status</h4>
                  <p className="text-sm text-slate-500 mt-2 max-w-xs">
                    Follow complaints from New → In Progress → Resolved.
                  </p>
                </article>

                <article className="p-8 border rounded-2xl shadow-sm flex flex-col items-center">
                  <div className="p-4 rounded-full bg-slate-50 mb-4">
                    <IconAnalytics />
                  </div>
                  <h4 className="font-semibold text-lg">Transparent Analytics</h4>
                  <p className="text-sm text-slate-500 mt-2 max-w-xs">
                    See city-wide stats and identify hotspots with heatmaps.
                  </p>
                </article>
              </div>
            </div>
          </section>

            

        {/* TRANSPARENCY (small showcase) */}
        <section id="transparency" className="py-12 bg-slate-50">
          <div className="max-w-6xl mx-auto px-6 lg:px-8 grid md:grid-cols-3 gap-6 items-center">
            <div className="col-span-2">
              <h4 className="text-2xl font-semibold">Transparency Portal</h4>
              <p className="mt-3 text-slate-600">Open data on complaints and resolutions: public metrics, top problem categories, and a live heatmap so citizens can see how issues are being handled.</p>
            </div>

            <div className="flex gap-4 justify-center md:justify-end">
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <div className="text-2xl font-bold">1,248</div>
                <div className="text-sm text-slate-500">Total complaints</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <div className="text-2xl font-bold">88%</div>
                <div className="text-sm text-slate-500">Resolved rate</div>
              </div>
            </div>
          </div>
        </section>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-600">© {new Date().getFullYear()} TattleTent · All rights reserved</div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <a href="#" className="hover:text-slate-700">Privacy</a>
            <a href="#" className="hover:text-slate-700">Terms</a>
            <a href="#" className="hover:text-slate-700">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
