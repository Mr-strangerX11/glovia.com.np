'use client';

import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useOrders } from '@/hooks/useData';
import {
  Loader2, TrendingUp, Package, DollarSign, ShoppingBag,
  CheckCircle2, XCircle, Clock, Truck, ArrowLeft, BarChart2,
  ArrowUp, ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; bar: string }> = {
  PENDING:    { label: "Pending",    color: "text-amber-700",   bg: "bg-amber-50",   bar: "bg-amber-400" },
  CONFIRMED:  { label: "Confirmed",  color: "text-blue-700",    bg: "bg-blue-50",    bar: "bg-blue-400" },
  PROCESSING: { label: "Processing", color: "text-violet-700",  bg: "bg-violet-50",  bar: "bg-violet-400" },
  SHIPPED:    { label: "Shipped",    color: "text-indigo-700",  bg: "bg-indigo-50",  bar: "bg-indigo-400" },
  DELIVERED:  { label: "Delivered",  color: "text-emerald-700", bg: "bg-emerald-50", bar: "bg-emerald-500" },
  CANCELLED:  { label: "Cancelled",  color: "text-red-700",     bg: "bg-red-50",     bar: "bg-red-400" },
};

export default function VendorAnalyticsPage() {
  const { user, isChecking } = useAuthGuard({ roles: ['VENDOR'] });
  const { orders, isLoading } = useOrders();

  if (isChecking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 font-medium">Loading analytics…</p>
        </div>
      </div>
    );
  }

  const totalOrders    = orders?.length || 0;
  const totalRevenue   = orders?.reduce((acc: number, o: any) => acc + (Number(o.total) || 0), 0) || 0;
  const deliveredOrders = orders?.filter((o: any) => o.status === 'DELIVERED').length || 0;
  const pendingOrders  = orders?.filter((o: any) => o.status === 'PENDING').length || 0;
  const cancelledOrders = orders?.filter((o: any) => o.status === 'CANCELLED').length || 0;
  const avgOrderValue  = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const statusCounts = Object.keys(STATUS_CONFIG).map((status) => ({
    status,
    count: orders?.filter((o: any) => o.status === status).length || 0,
    ...STATUS_CONFIG[status],
  }));

  const maxStatusCount = Math.max(...statusCounts.map((s) => s.count), 1);

  const metrics = [
    {
      label: "Total Orders",
      value: totalOrders,
      icon: ShoppingBag,
      gradient: "from-blue-500 to-cyan-500",
      sub: `${pendingOrders} pending`,
    },
    {
      label: "Total Revenue",
      value: `NPR ${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      gradient: "from-emerald-500 to-teal-500",
      sub: `Avg NPR ${avgOrderValue.toLocaleString()} / order`,
    },
    {
      label: "Delivered",
      value: deliveredOrders,
      icon: CheckCircle2,
      gradient: "from-violet-500 to-purple-500",
      sub: totalOrders > 0 ? `${Math.round((deliveredOrders / totalOrders) * 100)}% success rate` : "—",
    },
    {
      label: "Cancelled",
      value: cancelledOrders,
      icon: XCircle,
      gradient: "from-rose-500 to-pink-500",
      sub: totalOrders > 0 ? `${Math.round((cancelledOrders / totalOrders) * 100)}% cancel rate` : "—",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 pt-10 pb-20">
        <div className="container">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div className="text-white">
              <div className="flex items-center gap-2 mb-1">
                <BarChart2 className="w-5 h-5 text-violet-200" />
                <span className="text-violet-200 text-sm font-medium">Vendor Portal</span>
              </div>
              <h1 className="text-3xl font-bold">Analytics</h1>
              <p className="text-violet-100 mt-1 text-sm">Track your performance and sales</p>
            </div>
            <Link
              href="/dashboard/vendor"
              className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="container -mt-10 pb-16 space-y-6">
        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            <p className="text-sm text-gray-400 font-medium">Loading your data…</p>
          </div>
        ) : (
          <>
            {/* Metric cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {metrics.map((m) => {
                const Icon = m.icon;
                return (
                  <div key={m.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${m.gradient} flex items-center justify-center mb-4`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{m.label}</p>
                    <p className="text-2xl font-black text-gray-900 mt-0.5 leading-none">{m.value}</p>
                    <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                      <ArrowUp className="w-3 h-3 text-emerald-400" />
                      {m.sub}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Order Status Breakdown */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900">Order Status Breakdown</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Distribution across all statuses</p>
                </div>
                <div className="p-6 space-y-4">
                  {statusCounts.map((item) => (
                    <div key={item.status}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.bg} ${item.color}`}>
                          {item.label}
                        </span>
                        <span className="text-sm font-bold text-gray-700">{item.count}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.bar} transition-all duration-700`}
                          style={{ width: `${(item.count / maxStatusCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">Recent Orders</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Last 5 transactions</p>
                  </div>
                  <Link
                    href="/vendor/orders"
                    className="text-xs font-semibold text-violet-500 hover:text-violet-600 flex items-center gap-1 transition-colors"
                  >
                    View all <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="divide-y divide-gray-50">
                  {orders && orders.length > 0 ? (
                    orders.slice(0, 5).map((order: any) => {
                      const orderId = order?.id || order?._id || '';
                      const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                      return (
                        <div key={orderId} className="px-6 py-3.5 flex items-center justify-between hover:bg-gray-50/60 transition-colors">
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              #{order.orderNumber || orderId.slice(-8).toUpperCase()}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                              {cfg.label}
                            </span>
                            <p className="text-sm font-bold text-gray-900">
                              NPR {Number(order.total).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-6 py-10 text-center">
                      <Package className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">No orders yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick links */}
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: "Manage Products", desc: "View and edit your store catalog", href: "/vendor/products", icon: Package, color: "from-violet-500 to-purple-600" },
                { label: "View Orders",     desc: "Process and fulfill customer orders", href: "/vendor/orders",   icon: Truck,       color: "from-blue-500 to-cyan-600" },
                { label: "Your Dashboard",  desc: "Back to the main overview",          href: "/dashboard/vendor", icon: TrendingUp,  color: "from-emerald-500 to-teal-600" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all group"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{item.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 ml-auto transition-colors" />
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
