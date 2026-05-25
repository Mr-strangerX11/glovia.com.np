'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { adminAPI } from '@/lib/api';
import {
  Store, Search, Star, StarOff, Package, Mail, Phone,
  Loader2, Shield, ShieldOff, ExternalLink, ChevronDown, Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Vendor {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  profileImage?: string;
  vendorLogo?: string;
  vendorDescription?: string;
  vendorType?: string;
  isFeatured: boolean;
  isFrozen?: boolean;
  isEmailVerified?: boolean;
  productCount: number;
  createdAt?: string;
}

const VENDOR_TYPE_LABELS: Record<string, string> = {
  individual: 'Individual',
  business: 'Business',
  brand: 'Brand',
};

export default function AdminVendorsPage() {
  const { user, isChecking } = useAuthGuard({ roles: ['ADMIN', 'SUPER_ADMIN'] });
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'featured' | 'frozen' | 'active'>('all');
  const [actionId, setActionId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchVendors();
  }, [user]);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getAllVendors();
      setVendors(data?.data || []);
    } catch {
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let list = vendors;
    if (filter === 'featured') list = list.filter((v) => v.isFeatured);
    if (filter === 'frozen') list = list.filter((v) => v.isFrozen);
    if (filter === 'active') list = list.filter((v) => !v.isFrozen);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (v) =>
          (v.firstName || '').toLowerCase().includes(q) ||
          (v.lastName || '').toLowerCase().includes(q) ||
          v.email.toLowerCase().includes(q) ||
          (v.phone || '').includes(q)
      );
    }
    return list;
  }, [vendors, filter, search]);

  const handleToggleFeatured = async (v: Vendor) => {
    setActionId(v._id);
    try {
      await adminAPI.toggleVendorFeatured(v._id);
      setVendors((prev) =>
        prev.map((x) => (x._id === v._id ? { ...x, isFeatured: !x.isFeatured } : x))
      );
      toast.success(v.isFeatured ? 'Removed from featured' : 'Marked as featured');
    } catch {
      toast.error('Action failed');
    } finally {
      setActionId(null);
      setOpenMenuId(null);
    }
  };

  const handleFreeze = async (v: Vendor) => {
    if (!confirm(`Freeze ${v.email}? They won't be able to log in.`)) return;
    setActionId(v._id);
    try {
      await adminAPI.freezeVendor(v._id, 'Frozen by admin');
      setVendors((prev) => prev.map((x) => (x._id === v._id ? { ...x, isFrozen: true } : x)));
      toast.success('Vendor frozen');
    } catch {
      toast.error('Failed to freeze');
    } finally {
      setActionId(null);
      setOpenMenuId(null);
    }
  };

  const handleUnfreeze = async (v: Vendor) => {
    setActionId(v._id);
    try {
      await adminAPI.unfreezeVendor(v._id);
      setVendors((prev) => prev.map((x) => (x._id === v._id ? { ...x, isFrozen: false } : x)));
      toast.success('Vendor unfrozen');
    } catch {
      toast.error('Failed to unfreeze');
    } finally {
      setActionId(null);
      setOpenMenuId(null);
    }
  };

  const vendorSlug = (v: Vendor) => v._id;

  const vendorName = (v: Vendor) =>
    [v.firstName, v.lastName].filter(Boolean).join(' ') || v.email;

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="text-white">
              <p className="text-violet-200 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-300 inline-block" />
                Admin Panel
              </p>
              <h1 className="text-2xl font-black flex items-center gap-2">
                <Store className="w-6 h-6" /> Vendor Management
              </h1>
              <p className="text-violet-200 text-sm mt-1">{vendors.length} vendors in database</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/vendors/featured"
                className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-semibold px-4 py-2 rounded-lg border border-white/20 transition text-sm"
              >
                <Star className="w-4 h-4" /> Featured
              </Link>
              <Link
                href="/admin/users"
                className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-semibold px-4 py-2 rounded-lg border border-white/20 transition text-sm"
              >
                <Users className="w-4 h-4" /> All Users
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: vendors.length, color: 'violet' },
            { label: 'Featured', value: vendors.filter((v) => v.isFeatured).length, color: 'amber' },
            { label: 'Active', value: vendors.filter((v) => !v.isFrozen).length, color: 'emerald' },
            { label: 'Frozen', value: vendors.filter((v) => v.isFrozen).length, color: 'red' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
              <p className={`text-2xl font-black mt-1 text-${color}-600`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'active', 'featured', 'frozen'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                  filter === f
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 ml-auto">{filtered.length} shown</p>
        </div>

        {/* Vendor Table */}
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-center py-24">
            <div className="text-center space-y-3">
              <Loader2 className="w-10 h-10 animate-spin text-violet-500 mx-auto" />
              <p className="text-sm text-gray-400">Loading vendors…</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm text-center py-20">
            <Store className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold">No vendors found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Vendor</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Contact</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Type</th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Products</th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Joined</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((v) => (
                    <tr key={v._id} className={`hover:bg-gray-50 transition ${v.isFrozen ? 'opacity-60' : ''}`}>
                      {/* Vendor name + logo */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-violet-100 to-purple-200 flex-shrink-0 flex items-center justify-center">
                            {v.vendorLogo || v.profileImage ? (
                              <img
                                src={v.vendorLogo || v.profileImage}
                                alt={vendorName(v)}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <span className="text-violet-700 font-black text-lg">
                                {(v.firstName?.[0] || v.email[0]).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{vendorName(v)}</p>
                            {v.isFeatured && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                                <Star className="w-2.5 h-2.5 fill-amber-500" /> Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <p className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            {v.email}
                          </p>
                          {v.phone && (
                            <p className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                              {v.phone}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                          {VENDOR_TYPE_LABELS[v.vendorType || ''] || v.vendorType || 'N/A'}
                        </span>
                      </td>

                      {/* Products */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Package className="w-3.5 h-3.5 text-violet-400" />
                          <span className="font-bold text-gray-700">{v.productCount}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full ${
                          v.isFrozen
                            ? 'bg-red-100 text-red-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {v.isFrozen ? (
                            <><ShieldOff className="w-3 h-3" /> Frozen</>
                          ) : (
                            <><Shield className="w-3 h-3" /> Active</>
                          )}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {v.createdAt ? new Date(v.createdAt).toLocaleDateString('en-NP', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === v._id ? null : v._id)}
                            disabled={actionId === v._id}
                            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-semibold text-gray-700 transition disabled:opacity-50"
                          >
                            {actionId === v._id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <>Actions <ChevronDown className="w-3.5 h-3.5" /></>
                            )}
                          </button>

                          {openMenuId === v._id && (
                            <div className="absolute right-0 top-full mt-1 z-30 w-48 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
                              <Link
                                href={`/vendors/${vendorSlug(v)}`}
                                target="_blank"
                                className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                                onClick={() => setOpenMenuId(null)}
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-violet-500" /> View Store
                              </Link>

                              <button
                                onClick={() => handleToggleFeatured(v)}
                                className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition w-full text-left"
                              >
                                {v.isFeatured ? (
                                  <><StarOff className="w-3.5 h-3.5 text-amber-400" /> Remove Featured</>
                                ) : (
                                  <><Star className="w-3.5 h-3.5 text-amber-400" /> Mark Featured</>
                                )}
                              </button>

                              <div className="border-t border-gray-100" />

                              {v.isFrozen ? (
                                <button
                                  onClick={() => handleUnfreeze(v)}
                                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition w-full text-left"
                                >
                                  <Shield className="w-3.5 h-3.5" /> Unfreeze Account
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleFreeze(v)}
                                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition w-full text-left"
                                >
                                  <ShieldOff className="w-3.5 h-3.5" /> Freeze Account
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Close dropdown on outside click */}
      {openMenuId && (
        <div className="fixed inset-0 z-20" onClick={() => setOpenMenuId(null)} />
      )}
    </div>
  );
}
