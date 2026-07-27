export default function CTA() {
  return (
    <section id="cta"
     className="w-full bg-[#080b14] px-4 py-20 md:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold text-white md:text-4xl">
          Don&apos;t Let Suspicious Content
          <span className="block text-cyan-400">
            Make the Decision for You.
          </span>
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-center leading-relaxed text-slate-400">
          Take control before you click. Use RiskRadar to analyze suspicious
          URLs, emails, and messages and make safer decisions online.
        </p>

        <div className="mt-8 flex justify-center">
          <button className="rounded-lg cursor-pointer bg-cyan-400 px-6 py-3 font-medium text-slate-950 transition hover:bg-cyan-300">
            Get Started
          </button>
        </div>
      </div>
    </section>
  );
}