import Link from 'next/link';
import { Gift, Users, Percent, ArrowRight, Sparkles, Star, Heart } from 'lucide-react';

const steps = [
  { icon: Users, title: 'Invite Friends',   desc: 'Share your unique referral link with friends and family.' },
  { icon: Star,  title: 'They Shop',        desc: 'Your friend signs up and places their first order on Glovia.' },
  { icon: Gift,  title: 'Both Get Rewards', desc: 'You earn loyalty points; your friend gets a discount on their first order.' },
];

const perks = [
  { icon: Percent, label: 'Up to 20% off',      desc: "Discount for your friend's first order" },
  { icon: Gift,    label: '500 Loyalty Points',  desc: 'Credited to you for every successful referral' },
  { icon: Heart,   label: 'No Limit',            desc: 'Refer as many friends as you like' },
];

export default function ReferralPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-500 via-pink-600 to-fuchsia-600 pt-16 pb-28">
        <div className="pointer-events-none absolute -top-16 -right-16 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-12 h-48 w-48 rounded-full bg-white/8 blur-2xl" />
        <div className="container relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white/80 mb-5">
            <Sparkles className="h-3.5 w-3.5" /> Coming Soon
          </span>
          <h1 className="text-4xl font-bold text-white sm:text-5xl leading-tight">
            Share the Glow, Earn Rewards
          </h1>
          <p className="mt-4 text-lg text-pink-100/80 leading-relaxed">
            Our referral program rewards you and your friends every time someone joins the Glovia community.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-rose-600 shadow-lg hover:shadow-xl hover:bg-rose-50 transition-all"
          >
            Start Shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="container -mt-12 pb-10">
        <div className="grid sm:grid-cols-3 gap-5">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative">
                <div className="absolute -top-3 -right-3 w-7 h-7 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full text-white text-xs font-black flex items-center justify-center shadow">
                  {i + 1}
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Perks */}
      <section className="container pb-20">
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">What You'll Earn</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {perks.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.label} className="bg-white rounded-xl p-5 text-center shadow-sm border border-rose-100/50">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-5 h-5 text-rose-600" />
                  </div>
                  <p className="font-bold text-gray-900 text-sm">{p.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{p.desc}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm font-semibold text-rose-600 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              Referral program launching very soon — stay tuned!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
