import { Landing3DScene } from "@/components/landing-3d-scene";
import { SignInWithGoogle } from "@/components/auth-buttons";
import { LandingInteractiveDemo } from "@/components/landing-interactive-demo";
import { LandingFaq } from "@/components/landing-faq";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  Sparkles, BrainCircuit, Workflow, Globe2, Shield, Zap,
  FileText, LayoutTemplate, Check, X, ArrowRight,
} from "lucide-react";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/app");

  return (
    <main className="bg-black text-white selection:bg-indigo-500/30 overflow-x-hidden">

      {/* ─── 1. HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <Landing3DScene />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-indigo-900/40 via-zinc-950/80 to-black z-0 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mt-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm text-indigo-200 font-medium tracking-wide">THINK. CONNECT. CREATE.</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40 mb-6 tracking-tighter">
            Think in{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
              Dimensions.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mb-12 font-light leading-relaxed">
            A hyper-fast, offline-first productivity workspace combining Notion-style block editing
            with Obsidian&apos;s 3D graph connections.
          </p>

          <SignInWithGoogle />
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-bounce text-white/30">
          <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-white/50 to-transparent mx-auto" />
        </div>
      </section>

      {/* ─── 2. STATS TICKER ─────────────────────────────────────────────────── */}
      <section className="relative border-y border-white/5 bg-white/2 overflow-hidden">
        <div className="flex items-center">
          {/* Marquee wrapper */}
          <div className="flex animate-[scroll_20s_linear_infinite] whitespace-nowrap">
            {[...Array(2)].map((_, rep) => (
              <div key={rep} className="flex items-center gap-0">
                {[
                  { value: "10,000+", label: "Notes Created" },
                  { value: "50ms", label: "Avg. Save Time" },
                  { value: "100%", label: "Offline Capable" },
                  { value: "WebRTC", label: "P2P Collaboration" },
                  { value: "0 bytes", label: "Server Lag" },
                  { value: "3D Graph", label: "Knowledge View" },
                  { value: "AI-Powered", label: "Semantic Search" },
                  { value: "Free", label: "Core Features" },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-8 px-10 py-4 border-r border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-indigo-400 font-black text-lg">{stat.value}</span>
                      <span className="text-white/40 text-sm">{stat.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. INTERACTIVE DEMO ─────────────────────────────────────────────── */}
      <section className="py-32 relative z-10 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-xs text-indigo-300 font-medium">Interactive Demo</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Experience the{" "}
            <span className="text-indigo-400">&ldquo;Aha!&rdquo;</span> Moment
          </h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Type <code className="text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded text-sm">[[Note Name]]</code>{" "}
            in the editor and watch the graph build itself in real-time.
          </p>
        </div>
        <LandingInteractiveDemo />
      </section>

      {/* ─── 4. HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="py-32 bg-zinc-950/60 border-y border-white/5 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">How the Magic Works</h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">No loading spinners. No waiting. Just pure speed.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: Globe2, color: "text-indigo-400", hoverBg: "group-hover:bg-indigo-500/20",
                step: "1", title: "Offline First",
                desc: "Your data is stored instantly in your browser's IndexedDB. Create, edit, and link notes even in airplane mode.",
              },
              {
                icon: Workflow, color: "text-purple-400", hoverBg: "group-hover:bg-purple-500/20",
                step: "2", title: "Bidirectional Links",
                desc: "As you type, our engine parses [[brackets]] and automatically generates graph edges — no setup required.",
              },
              {
                icon: BrainCircuit, color: "text-pink-400", hoverBg: "group-hover:bg-pink-500/20",
                step: "3", title: "Cloud Sync",
                desc: "When you're back online, your local graph silently syncs to a powerful Supabase Postgres backend.",
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center group">
                <div className={`w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 ${item.hoverBg} transition-colors border border-white/10 relative`}>
                  <item.icon className={`w-8 h-8 ${item.color}`} />
                  <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/50">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. FEATURE BENTO ────────────────────────────────────────────────── */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold mb-16 tracking-tight text-center">
          Everything you need.
          <br />
          <span className="text-zinc-500">Nothing you don&apos;t.</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-auto md:h-[600px]">
          <div className="md:col-span-2 md:row-span-2 rounded-3xl bg-gradient-to-br from-zinc-900 to-black border border-white/10 p-8 flex flex-col justify-end relative overflow-hidden group">
            <div className="absolute top-8 right-8 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-colors" />
            <LayoutTemplate className="w-10 h-10 text-white/50 mb-6" />
            <h3 className="text-3xl font-bold mb-2">Block-Based Freedom</h3>
            <p className="text-zinc-400 text-lg">
              Type &apos;/&apos; to trigger slash commands. Organize your thoughts in blocks — headings, bullets, code, images.
            </p>
          </div>

          <div className="md:col-span-2 md:row-span-1 rounded-3xl bg-zinc-900/50 border border-white/10 p-8 flex items-center gap-6 group hover:bg-zinc-900 transition-colors">
            <div className="p-4 rounded-full bg-white/5 border border-white/10 group-hover:scale-110 transition-transform flex-shrink-0">
              <Zap className="w-8 h-8 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
              <p className="text-zinc-400">Zero network latency means your keystrokes are registered immediately. Always.</p>
            </div>
          </div>

          <div className="md:col-span-1 md:row-span-1 rounded-3xl bg-zinc-900/50 border border-white/10 p-8 flex flex-col justify-center group hover:bg-zinc-900 transition-colors">
            <FileText className="w-8 h-8 text-blue-400 mb-4 group-hover:-translate-y-1 transition-transform" />
            <h3 className="text-lg font-bold mb-1">Markdown Native</h3>
            <p className="text-zinc-400 text-sm">Write freely with standard Markdown syntax.</p>
          </div>

          <div className="md:col-span-1 md:row-span-1 rounded-3xl bg-zinc-900/50 border border-white/10 p-8 flex flex-col justify-center group hover:bg-zinc-900 transition-colors relative overflow-hidden">
            <Shield className="w-8 h-8 text-green-400 mb-4 group-hover:-translate-y-1 transition-transform relative z-10" />
            <h3 className="text-lg font-bold mb-1 relative z-10">Private by Design</h3>
            <p className="text-zinc-400 text-sm relative z-10">Your data, your control. Always.</p>
          </div>
        </div>
      </section>


      {/* ─── 7. COMPARISON TABLE ─────────────────────────────────────────────── */}
      <section className="py-32 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            Why <span className="text-indigo-400">NOTERA</span>?
          </h2>
          <p className="text-xl text-zinc-400">The tools you love, the limitations removed.</p>
        </div>

        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-4 text-white/50 font-normal">Feature</th>
                <th className="px-6 py-4 font-bold text-indigo-300 text-center bg-indigo-500/5">NOTERA</th>
                <th className="px-6 py-4 text-white/50 font-normal text-center">Notion</th>
                <th className="px-6 py-4 text-white/50 font-normal text-center">Obsidian</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Offline First", true, false, true],
                ["3D Knowledge Graph", true, false, "Plugin"],
                ["Block-Based Editor", true, true, false],
                ["AI Chat on Notes", true, "Paid", "Plugin"],
                ["Bidirectional Links", true, false, true],
                ["P2P Collaboration", true, false, false],
                ["Free Core Features", true, "Partial", true],
                ["Open Source Friendly", true, false, true],
              ].map(([feature, notera, notion, obsidian], i) => (
                <tr key={i} className={`border-b border-white/5 ${i % 2 === 0 ? "bg-white/1" : ""}`}>
                  <td className="px-6 py-3.5 text-white/70 font-medium">{feature}</td>
                  {[notera, notion, obsidian].map((val, j) => (
                    <td key={j} className={`px-6 py-3.5 text-center ${j === 0 ? "bg-indigo-500/5" : ""}`}>
                      {val === true ? (
                        <Check className="w-4 h-4 text-green-400 mx-auto" />
                      ) : val === false ? (
                        <X className="w-4 h-4 text-white/20 mx-auto" />
                      ) : (
                        <span className="text-xs text-white/40">{val}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── 8. PRICING ──────────────────────────────────────────────────────── */}
      <section className="py-32 bg-zinc-950/60 border-y border-white/5">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
              Simple <span className="text-indigo-400">Pricing</span>
            </h2>
            <p className="text-xl text-zinc-400">Start free. Upgrade when you&apos;re ready.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free */}
            <div className="rounded-3xl border border-white/10 p-8 bg-white/3 flex flex-col">
              <div className="mb-6">
                <div className="text-lg font-bold mb-1">Free</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black">$0</span>
                  <span className="text-white/40">/month</span>
                </div>
                <p className="text-white/40 text-sm mt-2">Forever. No credit card needed.</p>
              </div>
              <ul className="space-y-3 flex-1">
                {["Unlimited Notes", "Offline-First Storage", "3D Knowledge Graph", "Bidirectional Links", "AI Chat (Semantic Search)", "P2P Collaboration", "Export to Markdown/TXT", "Note Templates"].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-white/70">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <SignInWithGoogle />
              </div>
            </div>

            {/* Pro */}
            <div className="rounded-3xl border border-indigo-500/30 p-8 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-xl tracking-widest">
                COMING SOON
              </div>
              <div className="mb-6">
                <div className="text-lg font-bold mb-1 text-indigo-300">Pro</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-indigo-300">$9</span>
                  <span className="text-white/40">/month</span>
                </div>
                <p className="text-white/40 text-sm mt-2">Billed annually. Cancel anytime.</p>
              </div>
              <ul className="space-y-3 flex-1">
                {["Everything in Free", "Cloud Backup & Sync", "Custom Themes", "Advanced AI Actions", "Priority Support", "Team Workspaces", "Version History (Unlimited)", "Custom Domain"].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-white/70">
                    <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button disabled className="mt-8 w-full py-3 rounded-xl bg-white/10 text-white/40 text-sm font-semibold cursor-not-allowed">
                Join Waitlist — Coming Soon
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 9. FAQ ──────────────────────────────────────────────────────────── */}
      <section className="py-32 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            Frequently <span className="text-indigo-400">Asked</span>
          </h2>
          <p className="text-xl text-zinc-400">Everything you need to know.</p>
        </div>
        <LandingFaq />
      </section>

      {/* ─── 10. FINAL CTA ───────────────────────────────────────────────────── */}
      <section className="py-32 relative text-center border-t border-white/5">
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/20 to-black z-0 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(99,102,241,0.08),_transparent_70%)] pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center px-6">
          <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter">
            Ready to build your{" "}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
              Second Brain?
            </span>
          </h2>
          <p className="text-xl text-zinc-400 mb-10 max-w-xl">
            Join NOTERA for free. No credit card. No signup friction. Just start thinking.
          </p>
          <SignInWithGoogle />
          <p className="mt-6 text-sm text-white/25 flex items-center gap-2">
            <ArrowRight className="w-4 h-4" /> Free forever · No credit card
          </p>
        </div>
      </section>

      {/* ─── 11. FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="py-12 border-t border-white/10 bg-black">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-black text-sm">N</span>
              </div>
              <div>
                <div className="font-bold text-white/90">NOTERA</div>
                <div className="text-xs text-white/30">Think in dimensions.</div>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/40">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Changelog</a>
              <a href="#" className="hover:text-white transition-colors">Blog</a>
              <a
                href="#"
                className="hover:text-white transition-colors flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a5.5 5.5 0 0 0-1.5-3.8 5.5 5.5 0 0 0-.1-3.8s-1.2-.4-3.9 1.4a13.4 13.4 0 0 0-7 0C6.2 3.8 5 4.2 5 4.2a5.5 5.5 0 0 0-.1 3.8A5.5 5.5 0 0 0 3 11.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4" />
                </svg>
                GitHub
              </a>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/25">
            <p>© 2026 NOTERA Inc. Built with Next.js, Supabase, and Three.js.</p>
            <p className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              All systems operational
            </p>
          </div>
        </div>
      </footer>


    </main>
  );
}
