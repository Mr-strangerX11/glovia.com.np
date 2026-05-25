'use client';

import { useState } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useOrders } from '@/hooks/useData';
import {
  Loader2, Search, Eye, ShoppingBag, Package,
  Clock, CheckCircle2, Truck, XCircle, ChevronRight, ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  PENDING:    { label: "Pending",    bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400" },
  CONFIRMED:  { label: "Confirmed",  bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-400" },
  PROCESSING: { label: "Processing", bg: "bg-violet-50",  text: "text-violet-700",  dot: "bg-violet-400" },
  SHIPPED:    { label: "Shipped",    bg: "bg-indigo-50",  text: "text-indigo-700",  dot: "bg-indigo-400" },
  DELIVERED:  { label: "Delivered",  bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  CANCELLED:  { label: "Cancelled",  bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-400" },
};

const FILTERS = [
  { value: '',           label: 'All',        icon: ShoppingBag },
  { value: 'PENDING',    label: 'Pending',    icon: Clock },
  { value: 'CONFIRMED',  label: 'Confirmed',  icon: CheckCircle2 },
  { value: 'SHIPPED',    label: 'Shipped',    icon: Truck },
  { value: 'DELIVERED',  label: 'Delivered',  icon: CheckCircle2 },
  { value: 'CANCELLED',  label: 'Cancelled',  icon: XCircle },
];

export default function VendorOrdersPage() {
  const { user, isChecking } = useAuthGuard({ roles: ['VENDOR'] });
  const { orders, isLoading } = useOrders();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  if (isChecking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 font-medium">Loading orders…</p>
        </div>
      </div>
    );
  }

  const getOrderId = (order: any) => order?.id || order?._id || '';

  const filtered = (orders || []).filter((o: any) => {
    const matchesSearch =
      !search ||
      o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      getOrderId(o).toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 pt-10 pb-20">
        <div className="container">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div className="text-white">
              <div className="flex items-center gap-2 mb-1">
                <ShoppingBag className="w-5 h-5 text-violet-200" />
                <span className="text-violet-200 text-sm font-medium">Vendor Portal</span>
              </div>
              <h1 className="text-3xl font-bold">Orders</h1>
              <p className="text-violet-100 mt-1 text-sm">Track and manage your customer orders</p>
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

      <div className="container -mt-10 pb-16 space-y-5">
        {/* Search + status filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order number…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const Icon = f.icon;
              const active = statusFilter === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                    active
                      ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-violet-200 hover:text-violet-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders list */}
        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            <p className="text-sm text-gray-400 font-medium">Loading orders…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-14 flex flex-col items-center gap-3">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center">
              <Package className="w-7 h-7 text-gray-300" />
            </div>
            <p className="font-semibold text-gray-500">No orders found</p>
            <p className="text-sm text-gray-400">
              {search || statusFilter ? 'Try adjusting your filters' : 'Orders from customers will appear here'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Summary */}
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-500">
                {filtered.length} {filtered.length === 1 ? 'order' : 'orders'}
              </p>
              <p className="text-sm font-bold text-gray-900">
                NPR {filtered.reduce((acc: number, o: any) => acc + (Number(o.total) || 0), 0).toLocaleString()} total
              </p>
            </div>

            <div className="divide-y divide-gray-50">
              {filtered.map((order: any) => {
                const id = getOrderId(order);
                const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
                return (
                  <Link
                    key={id || order.orderNumber}
                    href={id ? `/vendor/orders/${id}` : '/vendor/orders'}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/70 transition-colors group"
                  >
                    {/* Dot */}
                    <span className={`block w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`} />

                    {/* Order info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-gray-900 text-sm">
                          #{order.orderNumber || id.slice(-8).toUpperCase()}
                        </p>
                        <span className={`text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString()} · {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Amount + arrow */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <p className="text-sm font-bold text-gray-900">
                        NPR {Number(order.total).toLocaleString()}
                      </p>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
