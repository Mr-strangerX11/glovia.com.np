"use client";

import Link from "next/link";
import { useOrders } from "@/hooks/useData";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import {
  MapPin, Heart, UserCircle2, ShoppingBag, Clock3, CheckCircle2,
  ChevronRight, Package, Star, TrendingUp, ArrowRight, Gift,
  Truck, RotateCcw, ShieldCheck, Sparkles,
} from "lucide-react";
import ProfileAvatar from "@/components/ProfileAvatar";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; dot: string; text: string }> = {
    PENDING:    { bg: "bg-amber-50",   dot: "bg-amber-400",   text: "text-amber-700" },
    CONFIRMED:  { bg: "bg-blue-50",   dot: "bg-blue-400",    text: "text-blue-700" },
    PROCESSING: { bg: "bg-violet-50", dot: "bg-violet-400",  text: "text-violet-700" },
    SHIPPED:    { bg: "bg-indigo-50", dot: "bg-indigo-400",  text: "text-indigo-700" },
    DELIVERED:  { bg: "bg-emerald-50",dot: "bg-emerald-400", text: "text-emerald-700" },
    CANCELLED:  { bg: "bg-red-50",    dot: "bg-red-400",     text: "text-red-700" },
  };
  const s = map[status] || { bg: "bg-gray-50", dot: "bg-gray-400", text: "text-gray-600" };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

export default function CustomerDashboardPage() {
  const { user, isChecking } = useAuthGuard({ roles: ["CUSTOMER", "ADMIN", "SUPER_ADMIN", "VENDOR"] });
  const { orders, isLoading } = useOrders();

  const totalOrders     = orders?.length || 0;
  const activeOrders    = orders?.filter((o) => !["DELIVERED", "CANCELLED"].includes(o.status)).length || 0;
  const completedOrders = orders?.filter((o) => o.status === "DELIVERED").length || 0;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  if (isChecking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 font-medium">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const quickActions = [
    { label: "My Profile",  desc: "Update personal details",    href: "/account",           icon: UserCircle2, color: "text-pink-600",   bg: "bg-pink-100",   ring: "ring-pink-200" },
    { label: "Addresses",   desc: "Manage delivery locations",  href: "/account/addresses", icon: MapPin,      color: "text-violet-600", bg: "bg-violet-100", ring: "ring-violet-200" },
    { label: "Wishlist",    desc: "View & manage saved items",  href: "/wishlist",          icon: Heart,       color: "text-rose-600",   bg: "bg-rose-100",   ring: "ring-rose-200" },
    { label: "All Orders",  desc: "Track every purchase",       href: "/account/orders",    icon: Package,     color: "text-blue-600",   bg: "bg-blue-100",   ring: "ring-blue-200" },
  ];

  const shopCategories = [
    { label: "Skincare",     href: "/products?category=skincare",  emoji: "✨", color: "from-pink-50 to-rose-50",     border: "border-pink-100",   hover: "hover:border-pink-300" },
    { label: "Makeup",       href: "/products?category=makeup",    emoji: "💄", color: "from-red-50 to-pink-50",      border: "border-red-100",    hover: "hover:border-red-300" },
    { label: "Haircare",     href: "/products?category=haircare",  emoji: "💆", color: "from-amber-50 to-orange-50",  border: "border-amber-100",  hover: "hover:border-amber-300" },
    { label: "Fragrance",    href: "/products?category=fragrance", emoji: "🌸", color: "from-purple-50 to-pink-50",   border: "border-purple-100", hover: "hover:border-purple-300" },
    { label: "Wellness",     href: "/products?category=wellness",  emoji: "🌿", color: "from-green-50 to-emerald-50", border: "border-green-100",  hover: "hover:border-green-300" },
    { label: "All Products", href: "/products",                    emoji: "🛍️", color: "from-indigo-50 to-blue-50",   border: "border-indigo-100", hover: "hover:border-indigo-300" },
  ];

  const perks = [
    { icon: Truck,       label: "Free Delivery",  desc: "Orders above NPR 2,999",          color: "text-blue-500",    bg: "bg-blue-50" },
    { icon: RotateCcw,   label: "Easy Returns",   desc: "7-day hassle-free returns",        color: "text-violet-500",  bg: "bg-violet-50" },
    { icon: ShieldCheck, label: "100% Authentic", desc: "Genuine products guaranteed",      color: "text-emerald-500", bg: "bg-emerald-50" },
    { icon: Gift,        label: "Loyalty Points", desc: `${user.loyaltyPoints ?? 0} pts earned`, color: "text-rose-500",    bg: "bg-rose-50" },
  ];

  return (
    <div className="min-h-screen bg-[#f7f8fa]">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-r from-rose-500 to-pink-600 pt-12 pb-10">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute top-4 left-1/3 w-64 h-64 rounded-full bg-pink-400/20 blur-3xl" />
        </div>

        <div className="container relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="text-white">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 mb-4">
              <span className="text-sm">👋</span>
              <span className="text-white/90 text-xs font-semibold uppercase tracking-widest">{greeting}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black capitalize leading-tight tracking-tight">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-pink-100 mt-3 text-sm max-w-sm leading-relaxed">
              {totalOrders === 0
                ? "Welcome! Start shopping — your first order awaits."
                : activeOrders > 0
                ? `You have ${activeOrders} active order${activeOrders > 1 ? "s" : ""} in progress.`
                : "All caught up! Ready to discover something new?"}
            </p>
          </div>

          <Link
            href="/account"
            className="inline-flex items-center gap-2.5 bg-white text-pink-600 font-bold px-5 py-3 rounded-2xl shadow-md hover:shadow-lg hover:bg-pink-50 transition-all flex-shrink-0 w-fit text-sm"
          >
            <ProfileAvatar
              src={user.profileImage}
              firstName={user.firstName}
              lastName={user.lastName}
              size="sm"
              ringColor="ring-pink-100"
            />
            My Account
          </Link>
        </div>
      </div>

      <div className="container py-8 pb-24 space-y-6">

        {/* ── Stat cards ───────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Orders",  value: totalOrders,     icon: ShoppingBag,  from: "from-blue-500",    to: "to-blue-600" },
            { label: "Active Orders", value: activeOrders,    icon: Clock3,       from: "from-amber-400",   to: "to-orange-500" },
            { label: "Delivered",     value: completedOrders, icon: CheckCircle2, from: "from-emerald-400", to: "to-teal-500" },
          ].map(({ label, value, icon: Icon, from, to }) => (
            <div
              key={label}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${from} ${to} flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">{label}</p>
                <p className="text-4xl font-black text-gray-900 mt-1 leading-none tabular-nums">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Recent Orders + Quick Actions ──────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-5">

          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 flex items-center justify-between border-b border-gray-50">
              <div>
                <h2 className="text-base font-bold text-gray-900">Recent Orders</h2>
                <p className="text-xs text-gray-400 mt-0.5">Your latest purchases</p>
              </div>
              <Link
                href="/account/orders"
                className="text-xs font-semibold text-pink-500 hover:text-pink-600 flex items-center gap-1 transition-colors group"
              >
                View all
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {isLoading ? (
              <div className="py-16 flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-3 border-pink-100 border-t-pink-400 rounded-full animate-spin" />
                <p className="text-sm text-gray-400">Loading orders…</p>
              </div>
            ) : !orders || orders.length === 0 ? (
              <div className="py-14 px-6 flex flex-col items-center text-center">
                <div className="relative mb-5">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center">
                    <ShoppingBag className="w-9 h-9 text-pink-400" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center">
                    <Star className="w-3 h-3 text-white fill-white" />
                  </div>
                </div>
                <p className="font-bold text-gray-800 text-base">No orders yet</p>
                <p className="text-sm text-gray-400 mt-1 mb-6 max-w-xs">
                  Discover Nepal&apos;s premium beauty products and place your first order.
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-pink-200 hover:shadow-lg hover:shadow-pink-200"
                >
                  <Sparkles className="w-4 h-4" /> Browse Products
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {orders.slice(0, 5).map((order) => (
                  <Link
                    key={order.id || order.orderNumber}
                    href={`/account/orders/${order.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/70 transition-colors group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <ShoppingBag className="w-4.5 h-4.5 text-pink-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">#{order.orderNumber}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={order.status} />
                      <p className="text-sm font-bold text-gray-800 hidden sm:block w-24 text-right">
                        NPR {Number(order.total).toLocaleString()}
                      </p>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50">
              <h2 className="text-base font-bold text-gray-900">Quick Actions</h2>
              <p className="text-xs text-gray-400 mt-0.5">Jump to any section</p>
            </div>
            <div className="p-4 space-y-1.5">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center gap-3.5 p-3.5 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className={`${action.bg} ring-1 ${action.ring} rounded-xl p-2.5 flex-shrink-0`}>
                      <Icon className={`w-4.5 h-4.5 ${action.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{action.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{action.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Shop by Category ──────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">Shop by Category</h2>
              <p className="text-xs text-gray-400 mt-0.5">Explore what&apos;s trending in Nepal</p>
            </div>
            <Link
              href="/products"
              className="text-xs font-semibold text-pink-500 hover:text-pink-600 flex items-center gap-1 transition-colors group"
            >
              All products
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="p-5 grid grid-cols-3 sm:grid-cols-6 gap-3">
            {shopCategories.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-gradient-to-b ${cat.color} border ${cat.border} ${cat.hover} transition-all group`}
              >
                <span className="text-3xl leading-none group-hover:scale-110 transition-transform">{cat.emoji}</span>
                <span className="text-[11px] font-semibold text-gray-600 text-center leading-tight">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Perks row ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {perks.map(({ icon: Icon, label, desc, color, bg }) => (
            <div
              key={label}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-3.5"
            >
              <div className={`${bg} rounded-xl p-3 flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-800 leading-tight">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-tight">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Promo banner ───────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-8 left-1/4 w-40 h-40 bg-indigo-400/20 rounded-full blur-2xl" />
          </div>
          <div className="relative z-10">
            <span className="inline-block bg-white/20 text-white/90 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-3">
              Limited Time
            </span>
            <p className="text-white text-2xl sm:text-3xl font-black leading-tight">
              Free Delivery on NPR 2,999+
            </p>
            <p className="text-indigo-200 text-sm mt-1.5">Shop more and save on every order.</p>
          </div>
          <Link
            href="/products"
            className="relative z-10 flex-shrink-0 inline-flex items-center justify-center gap-2 bg-white text-indigo-700 font-bold text-sm px-7 py-3 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg w-full sm:w-auto"
          >
            <TrendingUp className="w-4 h-4" />
            Shop Now
          </Link>
        </div>

      </div>
    </div>
  );
}
