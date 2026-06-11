import * as React from 'react'
import { motion } from 'motion/react'
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bot,
  BriefcaseBusiness,
  CalendarCheck,
  Check,
  Download,
  FileSearch,
  MailCheck,
  MessageSquareText,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react'

const WINDOWS_INSTALLER_PATH = './downloads/jobraker-recruiter-win32-x64-0.1.0.zip'

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}

function GlowCard({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      variants={fadeUp}
      className={`group relative overflow-hidden rounded-[2rem] border border-[#35ff1f]/15 bg-[#07090a]/85 shadow-[0_0_80px_rgba(29,255,0,0.06)] ${className}`}
    >
      <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_30%_0%,rgba(53,255,31,0.14),transparent_42%)]" />
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  )
}

function DownloadButton({ location }: { location: 'nav' | 'hero' | 'final' }) {
  return (
    <a
      href={WINDOWS_INSTALLER_PATH}
      download
      data-cta-location={location}
      className="inline-flex h-12 items-center justify-center gap-2 rounded-none border border-[#35ff1f] bg-[#35ff1f] px-5 text-sm font-black uppercase tracking-[0.18em] text-black transition hover:shadow-[0_0_28px_rgba(53,255,31,0.45)]"
    >
      <Download className="size-4" />
      Download for Windows
    </a>
  )
}

function RecruiterDashboardMock() {
  const candidates = [
    ['Teni Ogunleye', 'Senior Product Designer', '96%'],
    ['Femi Okoro', 'Product Designer', '92%'],
    ['Chinaza Uche', 'UX/UI Designer', '89%'],
  ]

  return (
    <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-[1.75rem] border border-[#35ff1f]/20 bg-black/70 shadow-[0_0_90px_rgba(53,255,31,0.14)]">
      <div className="flex h-11 items-center gap-2 border-b border-[#35ff1f]/10 bg-white/[0.025] px-4">
        <span className="size-3 rounded-full border border-[#35ff1f]/50 bg-[#35ff1f]/20" />
        <span className="size-3 rounded-full border border-[#35ff1f]/30 bg-[#35ff1f]/10" />
        <span className="size-3 rounded-full border border-[#35ff1f]/20 bg-[#35ff1f]/5" />
        <span className="ml-4 flex-1 rounded-md border border-white/5 bg-black/40 px-3 py-1 text-[10px] text-zinc-500">
          Jobraker Recruiter / Command Center
        </span>
      </div>

      <div className="grid gap-3 p-3 md:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-3">
          <div className="rounded-2xl border border-white/8 bg-[#080b0c] p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-bold">
              <span>AI Recruiter</span>
              <span className="rounded-full border border-[#35ff1f]/30 bg-[#35ff1f]/10 px-2 py-0.5 text-[10px] text-[#35ff1f]">
                Command Center
              </span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#101316] p-4 text-sm text-zinc-500">
              Find senior product designers in Lagos with startup experience
              <span className="float-right inline-flex size-9 items-center justify-center rounded-full bg-[#35ff1f] text-black">
                <ArrowRight className="size-4" />
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                ['Source', Users],
                ['Draft', MailCheck],
                ['Screen', FileSearch],
                ['Schedule', CalendarCheck],
              ].map(([label, Icon]) => (
                <div key={label as string} className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                  <Icon className="mb-3 size-5 text-[#35ff1f]" />
                  <div className="text-sm font-semibold">{label as string}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {[
              ['Open Roles', '12', BriefcaseBusiness],
              ['Active Searches', '8', Search],
              ['Response Rate', '24.6%', Zap],
            ].map(([label, value, Icon]) => (
              <div key={label as string} className="rounded-2xl border border-white/8 bg-[#080b0c] p-4">
                <Icon className="mb-5 size-6 text-[#35ff1f]" />
                <div className="text-xs text-zinc-500">{label as string}</div>
                <div className="mt-1 text-3xl font-bold">{value as string}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-[#080b0c] p-5">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-bold">Top Matches</h3>
            <span className="text-xs text-zinc-500">Evidence-backed</span>
          </div>
          <div className="space-y-5">
            {candidates.map(([name, title, score]) => (
              <div key={name} className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/10 text-xs font-black">
                  {name.split(' ').map((part) => part[0]).join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold">{name}</div>
                  <div className="truncate text-xs text-zinc-500">{title}</div>
                </div>
                <div className="flex size-12 items-center justify-center rounded-full border border-[#35ff1f] text-xs font-black text-[#35ff1f]">
                  {score}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function RecruiterDownloadLanding() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-black font-sans text-white selection:bg-[#35ff1f] selection:text-black">
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(to_right,rgba(53,255,31,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(53,255,31,0.055)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_55%_at_50%_0%,#000_58%,transparent_100%)]" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_75%_10%,rgba(53,255,31,0.16),transparent_28%),radial-gradient(circle_at_8%_18%,rgba(11,255,209,0.08),transparent_25%)]" />

      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-[#35ff1f]/15 bg-black/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#top" className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl border border-[#35ff1f]/30 bg-[#35ff1f]/10 shadow-[0_0_30px_rgba(53,255,31,0.2)]">
              <Bot className="size-5 text-[#35ff1f]" />
            </span>
            <span className="text-lg font-black tracking-tight">
              Jobraker <span className="text-[#35ff1f]">Recruiter</span>
            </span>
          </a>
          <div className="hidden items-center gap-7 text-xs font-bold uppercase tracking-[0.22em] text-zinc-500 md:flex">
            <a href="#features" className="transition hover:text-[#35ff1f]">Features</a>
            <a href="#workflow" className="transition hover:text-[#35ff1f]">Workflow</a>
            <a href="#proof" className="transition hover:text-[#35ff1f]">Proof</a>
          </div>
          <DownloadButton location="nav" />
        </div>
      </nav>

      <main id="top" className="relative z-10">
        <section className="mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-4 pb-20 pt-28 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="text-center lg:text-left"
          >
            <motion.div
              variants={fadeUp}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#35ff1f]/30 bg-[#35ff1f]/5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-[#35ff1f]"
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#35ff1f] opacity-70" />
                <span className="relative inline-flex size-2 rounded-full bg-[#35ff1f]" />
              </span>
              Windows desktop agent ready
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl font-black leading-[0.88] tracking-[-0.08em] sm:text-6xl lg:text-7xl">
              Hire like your best recruiter
              <span className="block bg-gradient-to-r from-[#35ff1f] via-[#a4ff57] to-white bg-clip-text text-transparent">
                never sleeps.
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="mx-auto mt-7 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg lg:mx-0">
              Jobraker Recruiter is a local-first AI recruiting command center for teams that need qualified candidates, warmer outreach, and interview-ready evidence without adding another coordinator.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
              <DownloadButton location="hero" />
              <a href="#workflow" className="inline-flex h-12 items-center justify-center gap-2 border border-white/10 px-5 text-sm font-bold uppercase tracking-[0.18em] text-zinc-200 transition hover:border-[#35ff1f]/50 hover:text-[#35ff1f]">
                See how it works
                <ArrowRight className="size-4" />
              </a>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-9 grid gap-3 text-left sm:grid-cols-3">
              {[
                ['Review-first', 'Approve every meaningful move'],
                ['Local data', 'Candidates stay in your workspace'],
                ['Agentic', 'Search, screen, draft, schedule'],
              ].map(([label, text]) => (
                <div key={label} className="border-l border-[#35ff1f]/30 pl-4">
                  <div className="text-sm font-black text-[#35ff1f]">{label}</div>
                  <div className="mt-1 text-xs leading-5 text-zinc-500">{text}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 36, rotateX: 14 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="absolute -inset-12 rounded-full bg-[#35ff1f]/10 blur-[110px]" />
            <RecruiterDashboardMock />
          </motion.div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-120px' }}
            variants={stagger}
            className="mb-14 max-w-3xl"
          >
            <motion.div variants={fadeUp} className="mb-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-[#35ff1f]">
              <Sparkles className="size-4" />
              Built for recruiter leverage
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl font-black tracking-[-0.06em] sm:text-6xl">
              Fewer tabs. Better matches. Cleaner decisions.
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-120px' }}
            variants={stagger}
            className="grid gap-5 md:grid-cols-3"
          >
            <GlowCard className="md:col-span-2">
              <div className="p-7">
                <FileSearch className="mb-8 size-8 text-[#35ff1f]" />
                <h3 className="text-2xl font-black tracking-tight">Evidence-backed matching</h3>
                <p className="mt-3 max-w-xl text-sm leading-7 text-zinc-400">
                  Ask for “n8n developer, web scraper, Enugu, startup-ready” and get ranked candidates with the reason behind each score, not just a pile of profiles.
                </p>
                <div className="mt-7 rounded-2xl border border-white/8 bg-black/45 p-4 font-mono text-xs text-zinc-400">
                  <span className="text-[#35ff1f]">match</span>: skills + location + stage + notes + prior signals
                </div>
              </div>
            </GlowCard>

            <GlowCard>
              <div className="p-7">
                <MailCheck className="mb-8 size-8 text-[#35ff1f]" />
                <h3 className="text-xl font-black">Outreach that remembers</h3>
                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  Draft warm, role-specific messages using candidate evidence, then keep follow-ups moving from the same workspace.
                </p>
              </div>
            </GlowCard>

            {[
              [Users, 'Candidate CRUD', 'Add, edit, shortlist, move stages, and keep the UI synced from a local JSON database.'],
              [BarChart3, 'Pipeline analytics', 'See response rate, source quality, time-to-fill, and bottlenecks without rebuilding a spreadsheet.'],
              [ShieldCheck, 'Human-controlled automation', 'Use agents for speed while keeping approvals, browser logins, and sensitive actions in your hands.'],
            ].map(([Icon, title, body]) => (
              <GlowCard key={title as string}>
                <div className="p-7">
                  <Icon className="mb-8 size-8 text-[#35ff1f]" />
                  <h3 className="text-xl font-black">{title as string}</h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">{body as string}</p>
                </div>
              </GlowCard>
            ))}
          </motion.div>
        </section>

        <section id="workflow" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <motion.h2 variants={fadeUp} className="text-4xl font-black tracking-[-0.06em] sm:text-6xl">
                From search brief to interview loop in one desktop app.
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-5 text-base leading-8 text-zinc-400">
                The desktop app sits next to your browser, inbox, calendar, notes, and candidate database. It can navigate the product, update records, retrieve Elastic evidence, and hand back control whenever credentials or judgment matter.
              </motion.p>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="space-y-4">
              {[
                ['01', 'Source', 'Search candidates across workspace data, Elastic indices, knowledge notes, and live web context.'],
                ['02', 'Screen', 'Rank candidates with explicit evidence: skills, location, startup fit, notes, and role requirements.'],
                ['03', 'Outreach', 'Generate personalized messages and follow-ups that reflect the candidate’s actual signal.'],
                ['04', 'Schedule', 'Move candidates through pipeline stages and prep interview notes without losing the thread.'],
              ].map(([num, title, body]) => (
                <motion.div key={num} variants={fadeUp} className="flex gap-5 rounded-2xl border border-white/8 bg-white/[0.025] p-5">
                  <div className="font-mono text-sm font-black text-[#35ff1f]">{num}</div>
                  <div>
                    <h3 className="font-black">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-zinc-500">{body}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section id="proof" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-[#35ff1f]/20 bg-[#35ff1f]/[0.035] p-8 sm:p-12">
            <div className="grid gap-8 md:grid-cols-3">
              {[
                [BadgeCheck, 'For lean teams', 'Built for founders, hiring managers, and recruiting teams who need leverage before headcount.'],
                [MessageSquareText, 'For real conversations', 'Turns email, notes, meetings, and candidate context into practical next steps.'],
                [Check, 'For hackathon demos', 'Shows a working agent that plans, acts, navigates, writes data, and produces evidence-backed matches.'],
              ].map(([Icon, title, body]) => (
                <div key={title as string}>
                  <Icon className="mb-5 size-7 text-[#35ff1f]" />
                  <h3 className="text-xl font-black">{title as string}</h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">{body as string}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <h2 className="text-4xl font-black uppercase leading-[0.92] tracking-[-0.07em] sm:text-6xl">
            Your next hire should not depend on another spreadsheet.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-zinc-400">
            Download the Windows desktop app, connect your workspace, and let Jobraker Recruiter start turning scattered recruiting work into a pipeline you can actually trust.
          </p>
          <div className="mt-8">
            <DownloadButton location="final" />
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/8 px-4 py-10 text-center text-xs text-zinc-600">
        Jobraker Recruiter. Local-first AI recruiting command center for Windows.
      </footer>
    </div>
  )
}
