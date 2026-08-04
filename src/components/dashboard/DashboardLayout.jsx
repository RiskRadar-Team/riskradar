export default function DashboardLayout({
  sidebar,
  navbar,
  children,
  rightPanel,
}) {
  return (
    <main className="min-h-screen bg-[#030712] text-white">

      <div className="grid min-h-screen grid-cols-[240px_1fr_340px]">

        {/* Sidebar */}

        <aside className="border-r border-cyan-500/10">

          {sidebar}

        </aside>

        {/* Main */}

        <section className="flex flex-col">

          {navbar}

          <div className="flex-1 overflow-y-auto">

            {children}

          </div>

        </section>

        {/* Right Panel */}

        <aside className="border-l border-cyan-500/10">

          {rightPanel}

        </aside>

      </div>

    </main>
  );
}