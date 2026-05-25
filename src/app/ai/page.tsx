import Link from 'next/link';
import { Sparkles, Bot, Wand2, Scan, Star, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: Scan,
    title: 'Skin Analysis',
    desc: 'Upload a selfie and get a detailed analysis of your skin type, concerns, and personalised product recommendations.',
  },
  {
    icon: Wand2,
    title: 'Smart Recommendations',
    desc: 'AI learns your preferences over time and curates a unique product feed tailored just for you.',
  },
  {
    icon: Bot,
    title: 'Beauty Assistant',
    desc: 'Ask our AI chatbot anything — ingredients, routines, product comparisons — and get instant expert answers.',
  },
  {
    icon: Star,
    title: 'Routine Builder',
    desc: 'Build your perfect AM/PM skincare or beauty routine with AI-guided step-by-step curation.',
  },
];

export default function AIPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 pt-16 pb-28">
        <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-16 h-56 w-56 rounded-full bg-white/8 blur-2xl" />
        <div className="container relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white/80 mb-5">
            <Sparkles className="h-3.5 w-3.5" /> Coming Soon
          </span>
          <h1 className="text-4xl font-bold text-white sm:text-5xl leading-tight">
            AI-Powered Beauty Intelligence
          </h1>
          <p className="mt-4 text-lg text-fuchsia-100/80 leading-relaxed">
            The smartest way to discover, shop, and build your perfect beauty routine — powered by Glovia AI.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-violet-700 shadow-lg hover:shadow-xl hover:bg-violet-50 transition-all"
          >
            Back to Shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container -mt-12 pb-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-2xl px-6 py-4">
            <Sparkles className="w-5 h-5 text-violet-500" />
            <p className="text-sm font-semibold text-violet-700">
              We're building something amazing. Stay tuned!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
