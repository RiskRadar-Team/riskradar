import { Globe, MailWarning, MessageSquareWarning } from "lucide-react";

export default function Features() {
  return (
    <section
      id="features"
      className="w-full px-4 py-22 md:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold text-white md:text-4xl">
          What Can RiskRadar Analyze?
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-center text-slate-400">
          Analyze suspicious content across multiple channels and identify
          potential phishing threats before interacting with them.
        </p>

        <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl border border-white/20 bg-[#0d1321]">
          <div className="flex gap-5 p-6 md:p-8">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-400/10 text-cyan-400">
              <Globe size={24} strokeWidth={1.8} />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white">
                URL Scanning
              </h3>

              <p className="mt-2 leading-relaxed text-slate-400">
                Analyze suspicious URLs and identify potential phishing threats
                before you visit them.
              </p>
            </div>
          </div>

          <div className="border-t border-white/20" />

          <div className="flex gap-5 p-6 md:p-8">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-violet-400/30 bg-violet-400/10 text-violet-400">
              <MailWarning size={24} strokeWidth={1.8} />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white">
                Email Analysis
              </h3>

              <p className="mt-2 leading-relaxed text-slate-400">
                Detect suspicious patterns in emails that may indicate phishing
                or other malicious activity.
              </p>
            </div>
          </div>

          <div className="border-t border-white/20" />

          <div className="flex gap-5 p-6 md:p-8">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">
              <MessageSquareWarning size={24} strokeWidth={1.8} />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white">
                Message Analysis
              </h3>

              <p className="mt-2 leading-relaxed text-slate-400">
                Check suspicious messages for common phishing indicators and
                stay safer online.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}