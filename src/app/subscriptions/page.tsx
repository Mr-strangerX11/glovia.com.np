import Link from 'next/link';
import { Bell, Package, Repeat, Zap, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

const plans = [
  {
    icon: Bell,
    name: 'Notify Me',
    desc: 'Get an alert the moment your favourite product is back in stock or goes on sale.',
    features: ['Back-in-stock alerts', 'Price drop notifications', 'New arrival updates'],
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Repeat,
    name: 'Auto Replenish',
    desc: 'Never run out of your essentials. Set a delivery schedule and we'll ship automatically.',
    features: ['Monthly, bimonthly or custom schedule', 'Easy skip or pause', '5% replenishment discount'],
    color: 'from-violet-500 to-purple-600',
    highlight: true,
  },
  {
    icon: Package,
    name: 'Beauty Box',
    desc: 'Receive a curated box of beauty goodies tailored to your skin profile every month.',
    features: ['Personalised curation', 'Exclusive member prices', 'New brand discoveries'],
    color: 'from-rose-500 to-pink-600',
  },
];

export default function SubscriptionsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 pt-16 pb-28">
        <div className="pointer-events-none absolute -top-16 -right-16 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-48 w-48 rounded-full bg-white/8 blur-2xl" />
        <div className="container relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white/80 mb-5">
            <Sparkles className="h-3.5 w-3.5" /> Coming Soon
          </span>
          <h1 className="text-4xl font-bold text-white sm:text-5xl leading-tight">
            Subscribe & Save on Everything You Love
          </h1>
          <p className="mt-4 text-lg text-violet-100/80 leading-relaxed">
            Set it once and never worry about running out of your beauty essentials again.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-violet-700 shadow-lg hover:shadow-xl hover:bg-violet-50 transition-all"
          >
            Shop Now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Plans */}
      <section className="container -mt-12 pb-20">
        <div className="grid sm:grid-cols-3 gap-5">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={`bg-white rounded-2xl shadow-sm border ${plan.highlight ? 'border-violet-200 ring-2 ring-violet-100' : 'border-gray-100'} p-6 hover:shadow-md transition-shadow relative`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-violet-600 to-purple-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{plan.desc}</p>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-2xl px-6 py-4">
            <Zap className="w-5 h-5 text-indigo-500" />
            <p className="text-sm font-semibold text-indigo-700">
              Subscriptions are launching soon. We'll notify you when it's live!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
