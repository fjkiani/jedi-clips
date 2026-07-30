import Link from 'next/link';
import {
  Scissors,
  Sparkles,
  Captions,
  Download,
  Crop,
  Layers,
  CalendarClock,
  ChevronRight,
  Check,
  Zap,
  Video,
  BarChart3,
  ArrowRight,
  Play,
  Star,
  Clock,
  Shield,
  Globe,
  Cloud,
  Users,
  Film,
  TrendingUp,
  MousePointerClick,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

/* ── tiny helpers ── */
function GradientText({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-gradient-to-r from-primary via-teal-400 to-accent bg-clip-text text-transparent">
      {children}
    </span>
  );
}

function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
      {children}
    </div>
  );
}

/* ──────────────────────────────────────────── */
export default function Home() {
  return (
    <div className="flex flex-col">

      {/* ═══════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* mesh gradient bg */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10
            bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(13,148,136,0.15),transparent)]
            dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(45,212,191,0.08),transparent)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10
            bg-[radial-gradient(ellipse_60%_40%_at_80%_0%,rgba(245,158,11,0.10),transparent)]
            dark:bg-[radial-gradient(ellipse_60%_40%_at_80%_0%,rgba(251,191,36,0.06),transparent)]"
        />

        <div className="flex flex-col items-center text-center gap-6 pt-16 md:pt-28 pb-12">
          <SectionBadge>
            <Zap className="h-4 w-4" />
            Powered by Jedi Labs
          </SectionBadge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl leading-[1.1]">
            Transform Long Videos into{' '}
            <GradientText>Viral Shorts</GradientText>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            AI-powered scene detection, auto captions, and one-click export.
            Turn any long video into scroll-stopping short content in seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2 text-base px-8 h-12 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
                Get Started Free
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="gap-2 text-base px-8 h-12">
              <Play className="h-4 w-4" />
              Watch Demo
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            No credit card required. Free tier available.
          </p>

          {/* ── Hero mock UI ── */}
          <div className="mt-8 w-full max-w-5xl mx-auto">
            <div className="relative rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-2xl shadow-primary/5 overflow-hidden">
              {/* window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
                <div className="h-3 w-3 rounded-full bg-red-400/60" />
                <div className="h-3 w-3 rounded-full bg-yellow-400/60" />
                <div className="h-3 w-3 rounded-full bg-green-400/60" />
                <span className="ml-3 text-xs text-muted-foreground font-mono">jediclip.jedilabs.org/dashboard</span>
              </div>
              {/* mock content */}
              <div className="grid grid-cols-12 gap-0">
                {/* sidebar */}
                <div className="col-span-3 border-r border-border/30 p-4 space-y-3 hidden md:block">
                  {['Dashboard', 'My Videos', 'Schedule', 'Connections', 'Settings'].map((item, i) => (
                    <div key={item} className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${i === 0 ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground'}`}>
                      {i === 0 && <Film className="h-4 w-4" />}
                      {i === 1 && <Video className="h-4 w-4" />}
                      {i === 2 && <CalendarClock className="h-4 w-4" />}
                      {i === 3 && <Globe className="h-4 w-4" />}
                      {i === 4 && <Shield className="h-4 w-4" />}
                      {item}
                    </div>
                  ))}
                </div>
                {/* main area */}
                <div className="col-span-12 md:col-span-9 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Your Videos</h3>
                    <div className="h-8 w-32 rounded-md bg-primary text-primary-foreground text-xs flex items-center justify-center gap-1">
                      <Video className="h-3 w-3" /> Upload Video
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { title: 'Product Demo v2', clips: 5, status: 'Ready' },
                      { title: 'Podcast Ep. 47', clips: 4, status: 'Processing' },
                      { title: 'Webinar Q1', clips: 5, status: 'Ready' },
                    ].map((v) => (
                      <div key={v.title} className="rounded-lg border border-border/40 p-3 space-y-2">
                        <div className="h-20 rounded-md bg-muted/50 flex items-center justify-center">
                          <Film className="h-6 w-6 text-muted-foreground/40" />
                        </div>
                        <p className="text-xs font-medium truncate">{v.title}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground">{v.clips} clips</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${v.status === 'Ready' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
                            {v.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SOCIAL PROOF / STATS
      ═══════════════════════════════════════════ */}
      <section className="border-y border-border/40 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '10K+', label: 'Videos Processed', icon: Video },
              { value: '45K+', label: 'Clips Generated', icon: Film },
              { value: '9', label: 'Caption Styles', icon: Captions },
              { value: '15+', label: 'Social Platforms', icon: Globe },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1">
                <stat.icon className="h-5 w-5 text-primary mb-1" />
                <span className="text-2xl md:text-3xl font-bold">{stat.value}</span>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURES
      ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col items-center gap-12">
          <div className="text-center max-w-2xl">
            <SectionBadge>
              <Sparkles className="h-4 w-4" />
              Features
            </SectionBadge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-4">
              Everything you need to go viral
            </h2>
            <p className="text-muted-foreground mt-3 text-lg">
              JediClip uses cutting-edge AI to find the best moments in your
              long-form content and turn them into platform-ready shorts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {[
              {
                icon: Sparkles,
                title: 'AI Scene Detection',
                desc: 'Gemini AI analyzes your transcript and picks the highest-engagement moments automatically.',
                gradient: 'from-teal-500/20 to-emerald-500/20',
              },
              {
                icon: Captions,
                title: 'Auto Captions',
                desc: 'Deepgram generates word-level captions synced to audio. Choose from 9 caption styles.',
                gradient: 'from-amber-500/20 to-orange-500/20',
              },
              {
                icon: Download,
                title: 'One-Click Export',
                desc: 'Render and download shorts in seconds. Cloud-powered rendering via Remotion Lambda.',
                gradient: 'from-violet-500/20 to-purple-500/20',
              },
              {
                icon: Crop,
                title: 'Smart Cropping',
                desc: 'Videos are automatically framed for vertical short-form formats (9:16).',
                gradient: 'from-rose-500/20 to-pink-500/20',
              },
              {
                icon: Layers,
                title: 'Batch Processing',
                desc: 'Generate 4-5 short clips from a single long video in one AI analysis pass.',
                gradient: 'from-sky-500/20 to-blue-500/20',
              },
              {
                icon: CalendarClock,
                title: 'Auto Scheduling',
                desc: 'Schedule posts across 15+ social platforms via Ayrshare. One API, zero app reviews.',
                gradient: 'from-lime-500/20 to-green-500/20',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group relative rounded-xl border border-border/50 bg-card p-6 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              >
                {/* hover glow */}
                <div aria-hidden className={`absolute inset-0 rounded-xl bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl`} />

                <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-muted/30 border-y border-border/40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col items-center gap-12">
          <div className="text-center max-w-2xl">
            <SectionBadge>
              <MousePointerClick className="h-4 w-4" />
              How It Works
            </SectionBadge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-4">
              Three steps to viral shorts
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full relative">
            {/* connector line (desktop) */}
            <div aria-hidden className="hidden md:block absolute top-16 left-[16.7%] right-[16.7%] h-px bg-gradient-to-r from-primary/40 via-accent/40 to-primary/40" />

            {[
              {
                step: '01',
                title: 'Upload',
                desc: 'Drag and drop your long video. It uploads securely to Cloudflare R2 with zero egress fees.',
                icon: Video,
                color: 'text-primary',
                ring: 'ring-primary/20',
              },
              {
                step: '02',
                title: 'Analyze',
                desc: 'AI transcribes, detects the best moments, generates captions, and creates 4-5 short clips.',
                icon: Sparkles,
                color: 'text-accent',
                ring: 'ring-accent/20',
              },
              {
                step: '03',
                title: 'Export & Schedule',
                desc: 'Preview clips, edit caption styles, render, download, or schedule across social platforms.',
                icon: TrendingUp,
                color: 'text-primary',
                ring: 'ring-primary/20',
              },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center gap-4 p-6">
                <div className={`h-14 w-14 rounded-full ring-2 ${s.ring} bg-background flex items-center justify-center relative z-10`}>
                  <s.icon className={`h-6 w-6 ${s.color}`} />
                </div>
                <span className="font-mono text-sm font-bold text-muted-foreground/60">
                  STEP {s.step}
                </span>
                <h3 className="font-semibold text-xl">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PIPELINE DEEP DIVE
      ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col items-center gap-12">
          <div className="text-center max-w-2xl">
            <SectionBadge>
              <Layers className="h-4 w-4" />
              Under the Hood
            </SectionBadge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-4">
              Production-grade pipeline
            </h2>
            <p className="text-muted-foreground mt-3">
              Every step is automated, scalable, and built on battle-tested infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {[
              {
                icon: Shield,
                title: 'Clerk Auth + Arcjet Security',
                desc: 'Enterprise-grade authentication with bot detection, rate limiting, and AI prompt injection shielding on every endpoint.',
              },
              {
                icon: Cloud,
                title: 'Cloudflare R2 Storage',
                desc: 'Zero egress fees. Presigned URL uploads. Videos and renders stored with S3-compatible API at Cloudflare edge.',
              },
              {
                icon: Sparkles,
                title: 'Gemini + Deepgram AI',
                desc: 'Gemini 2.0 Flash for highlight detection. Deepgram Nova-3 for word-level transcription with SRT generation.',
              },
              {
                icon: Film,
                title: 'Remotion Lambda Rendering',
                desc: 'Cloud-native video rendering on AWS Lambda. 9 caption styles, 1080x1920 @ 30fps, auto-discovered S3 buckets.',
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 p-6 rounded-xl border border-border/50 bg-card hover:border-primary/30 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PRICING
      ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-muted/30 border-y border-border/40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col items-center gap-12">
          <div className="text-center max-w-2xl">
            <SectionBadge>
              <Star className="h-4 w-4" />
              Pricing
            </SectionBadge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-4">
              Simple, transparent pricing
            </h2>
            <p className="text-muted-foreground mt-3">
              Start free. Scale when you&apos;re ready.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
            {[
              {
                name: 'Free',
                price: '$0',
                period: '/mo',
                features: [
                  '3 videos per month',
                  '4-5 shorts per video',
                  '9 caption styles',
                  '720p export',
                ],
                cta: 'Get Started',
                highlight: false,
              },
              {
                name: 'Pro',
                price: '$29',
                period: '/mo',
                features: [
                  'Unlimited videos',
                  '4-5 shorts per video',
                  '9 caption styles',
                  '1080p export',
                  'Social scheduling',
                  'Priority rendering',
                ],
                cta: 'Start Pro Trial',
                highlight: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                period: '',
                features: [
                  'Unlimited everything',
                  'Custom AI models',
                  'API access',
                  'Dedicated support',
                  'SLA guarantee',
                ],
                cta: 'Contact Sales',
                highlight: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-xl border p-6 flex flex-col gap-4 transition-shadow ${
                  plan.highlight
                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10 hover:shadow-primary/20'
                    : 'border-border/50 bg-card hover:shadow-md'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="font-semibold text-lg">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  )}
                </div>
                <ul className="flex flex-col gap-2.5 text-sm flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/sign-up">
                  <Button
                    variant={plan.highlight ? 'default' : 'outline'}
                    className="w-full h-10"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FAQ
      ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 md:px-8 flex flex-col items-center gap-10 w-full">
          <div className="text-center">
            <SectionBadge>
              <Clock className="h-4 w-4" />
              FAQ
            </SectionBadge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-4">
              Frequently asked questions
            </h2>
          </div>

          <Accordion className="w-full">
            {[
              {
                q: 'How long can my source video be?',
                a: 'JediClip handles videos up to 2 hours long. The AI analyzes the full transcript and picks the best 30-90 second moments.',
              },
              {
                q: 'What video formats are supported?',
                a: 'We support MP4, MOV, AVI, MKV, and WebM. Uploads go directly to Cloudflare R2 with zero egress fees.',
              },
              {
                q: 'How does the AI pick the best moments?',
                a: 'We use Google Gemini 2.0 Flash to analyze the full transcript and identify segments with the highest engagement potential. Each clip gets an SEO score and reasoning.',
              },
              {
                q: 'Can I edit the captions?',
                a: 'Yes. Choose from 9 caption styles in the Edit Style modal. Styles update in real-time via the Remotion Player preview.',
              },
              {
                q: 'How does social scheduling work?',
                a: 'JediClip integrates with Ayrshare to post across 15+ platforms (Instagram, TikTok, YouTube, Twitter, LinkedIn, etc.) without app review processes.',
              },
              {
                q: 'Is my video data secure?',
                a: 'Videos are stored on Cloudflare R2 with presigned URL access. Arcjet provides bot protection, rate limiting, and AI prompt injection detection.',
              },
              {
                q: 'What happens after I upload a video?',
                a: 'An Inngest background pipeline kicks off: Deepgram transcribes, Gemini picks highlights, and each highlight gets a Remotion render job. You get notified when clips are ready.',
              },
              {
                q: 'Can I self-host JediClip?',
                a: 'Enterprise customers can deploy on their own infrastructure. Contact sales for a self-hosted license.',
              },
            ].map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden border-t border-border/40">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10
            bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(13,148,136,0.08),transparent)]"
        />
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28 flex flex-col items-center text-center gap-6">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight max-w-3xl">
            Ready to turn your content into{' '}
            <GradientText>viral clips</GradientText>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl">
            Join thousands of creators who use JediClip to repurpose their
            long-form content. Start free, no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Link href="/sign-up">
              <Button size="lg" className="gap-2 text-base px-8 h-12 shadow-lg shadow-primary/25">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
