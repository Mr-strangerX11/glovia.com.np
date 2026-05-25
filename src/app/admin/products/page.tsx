'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { adminAPI, productsAPI } from '@/lib/api';
import {
  Plus, Edit2, Trash2, Loader2, Search, Upload,
  Package, CheckCircle2, XCircle, Star, ArrowLeft, AlertCircle, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id?: string;
  _id?: string;
  name: string;
  slug: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  categoryId: string;
  images?: { url: string }[];
}

const STATUS_TABS = [
  { value: '',         label: 'All',      icon: Package },
  { value: 'active',   label: 'Active',   icon: CheckCircle2 },
  { value: 'inactive', label: 'Inactive', icon: XCircle },
  { value: 'featured', label: 'Featured', icon: Star },
];

function extractRows(payload: any): { rows: Product[]; totalPages: number } {
  if (Array.isArray(payload)) return { rows: payload, totalPages: 0 };
  if (Array.isArray(payload?.data)) return { rows: payload.data, totalPages: Number(payload?.meta?.totalPages || 0) };
  if (Array.isArray(payload?.data?.data)) return { rows: payload.data.data, totalPages: Number(payload?.data?.meta?.totalPages || 0) };
  return { rows: [], totalPages: 0 };
}

export default function AdminProductsPage() {
  const { user, isChecking } = useAuthGuard({ roles: ['ADMIN', 'SUPER_ADMIN'] });
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const selectAllRef = useRef<HTMLInputElement>(null);

  const getId = (p: Product) => p.id || p._id || '';

  const fetchAllPages = async (req: (p: { page: number; limit: number }) => Promise<{ data: any }>) => {
    const size = 100;
    let page = 1;
    let totalPages = 1;
    const all: Product[] = [];
    while (page <= totalPages && page <= 200) {
      const { data } = await req({ page, limit: size });
      const { rows, totalPages: tp } = extractRows(data);
      all.push(...rows);
      totalPages = tp > 0 ? tp : rows.length < size ? page : page + 1;
      page++;
    }
    const seen = new Set<string>();
    return all.filter(p => { const id = getId(p); if (!id || seen.has(id)) return false; seen.add(id); return true; });
  };

  useEffect(() => { if (user) fetchData(); }, [user]);

  useEffect(() => {
    if (selectAllRef.current) {
      const vis = filtered;
      selectAllRef.current.indeterminate = selected.size > 0 && selected.size < vis.length;
    }
  });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      let rows: Product[] = [];
      try {
        rows = await fetchAllPages(params => adminAPI.getAllProducts(params));
      } catch {
        rows = await fetchAllPages(params => productsAPI.getAll(params));
      }
      setProducts(rows);
    } catch (err: any) {
      const msg = err?.response?.status === 403
        ? 'Access denied (403) — your IP is not whitelisted or session expired. Try logging out and back in.'
        : 'Failed to load products';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (p: Product) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    try {
      await adminAPI.deleteProduct(getId(p));
      toast.success('Product deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const handleBulkDelete = async () => {
    if (!selected.size) return;
    if (!confirm(`Delete ${selected.size} product(s)? This cannot be undone.`)) return;
    setIsDeleting(true);
    try {
      const results = await Promise.all(
        Array.from(selected).map(id => adminAPI.deleteProduct(id).catch(() => null))
      );
      const ok = results.filter(Boolean).length;
      if (ok) toast.success(`${ok} product(s) deleted`);
      if (ok < selected.size) toast.error(`${selected.size - ok} failed`);
      setSelected(new Set());
      fetchData();
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };

  if (isChecking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 font-medium">Loading…</p>
        </div>
      </div>
    );
  }

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !search || p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
    const matchStatus =
      !statusTab ? true :
      statusTab === 'active'   ? p.isActive :
      statusTab === 'inactive' ? !p.isActive :
      statusTab === 'featured' ? p.isFeatured : true;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 pt-10 pb-20">
        <div className="container">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div className="text-white">
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-5 h-5 text-violet-200" />
                <span className="text-violet-200 text-sm font-medium">Admin</span>
              </div>
              <h1 className="text-3xl font-bold">Product Management</h1>
              <p className="text-violet-100 mt-1 text-sm">{products.length} products total</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link href="/dashboard/admin" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium px-3 py-2 rounded-xl transition-colors">
                <ArrowLeft className="w-4 h-4" /> Dashboard
              </Link>
              <Link href="/admin/products/bulk" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium px-3 py-2 rounded-xl transition-colors">
                <Upload className="w-4 h-4" /> Bulk Upload
              </Link>
              <Link href="/admin/products/new" className="inline-flex items-center gap-2 bg-white text-violet-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-violet-50 transition-colors">
                <Plus className="w-4 h-4" /> Add Product
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container -mt-10 pb-16 space-y-5">
        {/* Search + filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
          <div className="flex gap-3 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or slug…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300"
              />
            </div>
            <button
              onClick={fetchData}
              className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {selected.size > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete ({selected.size})
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_TABS.map(tab => {
              const Icon = tab.icon;
              const count =
                tab.value === ''         ? products.length :
                tab.value === 'active'   ? products.filter(p => p.isActive).length :
                tab.value === 'inactive' ? products.filter(p => !p.isActive).length :
                tab.value === 'featured' ? products.filter(p => p.isFeatured).length : 0;
              return (
                <button
                  key={tab.value}
                  onClick={() => setStatusTab(tab.value)}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                    statusTab === tab.value
                      ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-violet-200 hover:text-violet-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${statusTab === tab.value ? 'bg-white/20' : 'bg-gray-200 text-gray-600'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-700 text-sm">Failed to load products</p>
              <p className="text-red-600 text-xs mt-0.5">{error}</p>
              <button onClick={fetchData} className="mt-2 text-xs text-red-700 underline font-medium">Try again</button>
            </div>
          </div>
        )}

        {/* Products table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-16 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
              <p className="text-sm text-gray-400 font-medium">Loading products…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-14 flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center">
                <Package className="w-7 h-7 text-gray-300" />
              </div>
              <p className="font-semibold text-gray-500">No products found</p>
              <p className="text-sm text-gray-400">{search || statusTab ? 'Try adjusting your search or filter' : 'Add your first product to get started'}</p>
              {!search && !statusTab && (
                <Link href="/admin/products/new" className="mt-2 inline-flex items-center gap-2 bg-violet-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-violet-700 transition-colors">
                  <Plus className="w-4 h-4" /> Add Product
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-500">
                  {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
                  {search && ` matching "${search}"`}
                </p>
                {selected.size > 0 && (
                  <p className="text-xs text-violet-600 font-semibold">{selected.size} selected</p>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="px-4 py-3 w-10">
                        <input
                          ref={selectAllRef}
                          type="checkbox"
                          checked={selected.size === filtered.length && filtered.length > 0}
                          onChange={e => {
                            if (e.target.checked) setSelected(new Set(filtered.map(getId).filter(Boolean)));
                            else setSelected(new Set());
                          }}
                          className="w-4 h-4 rounded accent-violet-600"
                        />
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map(p => {
                      const id = getId(p);
                      const sel = selected.has(id);
                      return (
                        <tr key={id || p.slug} className={`hover:bg-gray-50/50 transition-colors ${sel ? 'bg-violet-50/40' : ''}`}>
                          <td className="px-4 py-4">
                            <input type="checkbox" checked={sel} onChange={() => toggleSelect(id)} className="w-4 h-4 rounded accent-violet-600" />
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              {p.images?.[0] ? (
                                <Image src={p.images[0].url} alt={p.name} width={40} height={40} sizes="40px"
                                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                  <Package className="w-5 h-5 text-gray-300" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900 truncate max-w-[200px]">{p.name}</p>
                                <p className="text-xs text-gray-400 truncate max-w-[200px]">{p.slug}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 font-semibold text-gray-900">NPR {p.price?.toLocaleString()}</td>
                          <td className="px-5 py-4 text-gray-600">{p.stockQuantity}</td>
                          <td className="px-5 py-4">
                            <div className="flex flex-col gap-1">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full w-fit ${p.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                {p.isActive ? 'Active' : 'Inactive'}
                              </span>
                              {p.isFeatured && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 w-fit">
                                  <Star className="w-2.5 h-2.5" /> Featured
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-3">
                              <Link href={id ? `/admin/products/${id}` : '/admin/products'} className="text-violet-600 hover:text-violet-800 transition-colors" title="Edit">
                                <Edit2 className="w-4 h-4" />
                              </Link>
                              <button onClick={() => handleDelete(p)} className="text-red-500 hover:text-red-700 transition-colors" title="Delete">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
