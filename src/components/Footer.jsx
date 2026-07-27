export default function Footer() {
  return (
    <footer className="border-t border-white/15 bg-[#0f172a] px-4 py-12 md:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Main Footer */}
        <div className="grid gap-10 md:grid-cols-2">

          {/* Brand */}
          <div>
            <h2 className="text-xl font-bold text-white">
              RiskRadar
            </h2>

            <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
              Detect phishing before it detects you.
              Analyze suspicious content and make safer decisions online.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-300">
              Product
            </h3>

            <div className="mt-4 flex flex-col gap-3">
              <a
                href="#features"
                className="w-fit text-sm text-slate-400 transition hover:text-cyan-400"
              >
                Features
              </a>

              <a
                href="#how-it-works"
                className="w-fit text-sm text-slate-400 transition hover:text-violet-400"
              >
                How It Works
              </a>

              <a
                href="/login"
                className="w-fit text-sm text-slate-400 transition hover:text-emerald-400"
              >
                Get Started
              </a>
            </div>
          </div>

        </div>

        {/* Divider */}
        <div className="my-10 border-t border-white/10" />

        {/* Bottom Footer */}
        <div className="flex flex-col gap-3 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>
            © 2026 RiskRadar. All rights reserved.
          </p>

          <p>
            Built for a safer web.
          </p>
        </div>

      </div>
    </footer>
  );
}