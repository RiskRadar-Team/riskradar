import { Globe } from "lucide-react";

export default function HowItWorks() {
  return (
      <section
        id="how-it-works"
        className="w-full bg-[#0a0f1a] px-4 pt-32 pb-20 md:px-8"
      >
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold md:text-4xl">
          How It Works
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600">
          See how RiskRadar helps you identify potential phishing threats
          in three simple steps.
        </p>

        <div className="mt-16 space-y-12">

          {/* Step 1 */}
          <div className="grid items-center gap-8 md:grid-cols-2">
            {/* Step 1 Box */}
            <div className="w-full max-w-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium uppercase tracking-widest text-cyan-400">
                  01 — Submit
                </p>

                <span className="h-2 w-2 rounded-full bg-cyan-400" />
              </div>

              <div className="mt-6 rounded-lg border border-white/10 bg-[#0f172a] p-4">
                <div className="flex items-center gap-3">
                  <Globe
                    size={20}
                    strokeWidth={1.8}
                    className="text-cyan-400"
                  />

                  <span className="truncate text-sm text-slate-300">
                    suspicious-site.com
                  </span>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <span className="rounded-md bg-cyan-400/10 px-3 py-1.5 text-xs font-medium text-cyan-400">
                  Ready to Analyze
                </span>
              </div>
            </div>

            {/* Step 1 Explanation */}
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-cyan-400">
                Enter Your Content
              </p>

              <h3 className="mt-3 text-2xl font-semibold text-white">
                Start with what you want to check
              </h3>

              <p className="mt-4 leading-relaxed text-slate-400">
                Enter a suspicious URL, email, or message that you want
                RiskRadar to analyze for potential phishing threats.
              </p>
            </div>
          </div>


          {/* Step 2 - reversed on desktop */}
          <div className="grid items-center gap-8 md:grid-cols-2">
            {/* Step 2 Explanation */}
            <div className="md:order-1">
              <p className="text-sm font-medium uppercase tracking-widest text-violet-400">
                Analyze the Threat
              </p>

              <h3 className="mt-3 text-2xl font-semibold text-white">
                RiskRadar examines the content
              </h3>

              <p className="mt-4 leading-relaxed text-slate-400">
                RiskRadar analyzes the content and identifies suspicious
                patterns, signals, and indicators that may be associated
                with phishing or malicious activity.
              </p>
            </div>

            {/* Step 2 Box */}
            <div className="flex min-h-52 items-center justify-center rounded-2xl border border-violet-400/30 bg-[#0d1321] p-8 md:order-2">
              <div className="w-full max-w-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium uppercase tracking-widest text-violet-400">
                    02 — Analyze
                  </p>

                  <span className="h-2 w-2 rounded-full bg-violet-400" />
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0f172a] p-3">
                    <span className="text-sm text-slate-300">
                      Domain Reputation
                    </span>

                    <span className="text-xs text-violet-400">
                      Checking
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0f172a] p-3">
                    <span className="text-sm text-slate-300">
                      Threat Indicators
                    </span>

                    <span className="text-xs text-violet-400">
                      Checking
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0f172a] p-3">
                    <span className="text-sm text-slate-300">
                      Risk Assessment
                    </span>

                    <span className="text-xs text-violet-400">
                      Analyzing
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* Step 3 */}
         <div className="grid items-center gap-8 md:grid-cols-2">
            {/* Step 3 Box */}
            <div className="flex min-h-52 items-center justify-center rounded-2xl border border-emerald-400/30 bg-[#0d1321] p-8">
              <div className="w-full max-w-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium uppercase tracking-widest text-emerald-400">
                    03 — Protect
                  </p>

                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                </div>

                <div className="mt-6 rounded-lg border border-rose-400/20 bg-[#0f172a] p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-500">
                        Threat Level
                      </p>

                      <p className="mt-2 text-xl font-bold text-rose-400">
                        High Risk
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">
                        87
                      </p>

                      <p className="text-xs text-slate-500">
                        / 100
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[87%] rounded-full bg-rose-400" />
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-emerald-400">
                  <span>✓</span>
                  <span>Risk identified — stay alert</span>
                </div>
              </div>
            </div>

            {/* Step 3 Explanation */}
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-emerald-400">
                Make Safer Decisions
              </p>

              <h3 className="mt-3 text-2xl font-semibold text-white">
                Understand the risk before you act
              </h3>

              <p className="mt-4 leading-relaxed text-slate-400">
                Review the analysis results and use the information provided
                by RiskRadar to make safer decisions before interacting with
                suspicious content.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}