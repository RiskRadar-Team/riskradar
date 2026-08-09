import Link from "next/link";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative w-full overflow-hidden bg-[#080b14] px-4 py-24 md:px-8 md:py-32"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-16 md:grid-cols-2">

        {/* Left: Hero Content */}
        <div>
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">
            Intelligent Phishing Detection
          </p>

          <h1 className="max-w-2xl text-5xl font-bold leading-tight tracking-tight text-white md:text-7xl">
            Detect Phishing
            <span className="block text-slate-400">
              Before It Detects You
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
            Analyze suspicious URLs, emails, and messages before they become
            a threat. RiskRadar helps you understand the risks before you
            interact with suspicious content.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link href="/register" className="rounded-lg cursor-pointer bg-cyan-400 px-6 py-3 font-medium text-slate-950 transition hover:bg-cyan-300 text-center">
              Get Started
            </Link>

            <a href="#how-it-works" className="rounded-lg cursor-pointer border border-white/20 px-6 py-3 font-medium text-slate-200 transition hover:border-white/40 hover:bg-white/5 text-center">
              Learn How It Works
            </a>
          </div>
        </div>


        {/* Right: Risk Analysis Panel */}
        <div className="relative">

          <div className="rounded-2xl border border-white/10 bg-[#0d1321] p-6 shadow-2xl md:p-8">

            {/* Panel Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
                  Risk Analysis
                </p>

                <p className="mt-1 text-sm text-slate-300">
                  Live Threat Assessment
                </p>
              </div>

              <div className="h-2 w-2 rounded-full bg-cyan-400" />
            </div>


            {/* Suspicious URL */}
            <div className="mt-6 rounded-lg border border-white/10 bg-[#080b14] p-4">
              <p className="text-xs text-slate-500">
                Analyzing Content
              </p>

              <p className="mt-2 truncate text-sm text-slate-200">
                suspicious-site.com/login
              </p>
            </div>


            {/* Threat Level */}
            <div className="mt-6">
              <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
                Threat Level
              </p>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-2xl font-bold text-rose-400">
                  HIGH RISK
                </span>

                <span className="rounded-full border border-rose-400/30 bg-rose-400/10 px-3 py-1 text-xs text-rose-300">
                  87 / 100
                </span>
              </div>
            </div>


            {/* Risk Indicators */}
            <div className="mt-6 space-y-3">

              <div className="flex items-center gap-3 rounded-lg border border-rose-400/20 bg-rose-400/5 p-3">
                <span className="text-rose-400">⚠</span>

                <span className="text-sm text-slate-300">
                  Suspicious domain detected
                </span>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-amber-400/20 bg-amber-400/5 p-3">
                <span className="text-amber-400">⚠</span>

                <span className="text-sm text-slate-300">
                  Unknown reputation
                </span>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-violet-400/20 bg-violet-400/5 p-3">
                <span className="text-violet-400">⚠</span>

                <span className="text-sm text-slate-300">
                  Potential phishing indicators
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}