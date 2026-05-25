'use client';

import { useState, useEffect } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { adminAPI } from '@/lib/api';
import {
  Plus, Loader2, Search, UserCheck, Eye, EyeOff,
  Users, ShieldCheck, Store, User, ArrowLeft, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

const VENDOR_TYPES = [
  'BEAUTY', 'PHARMACY', 'COSMETICS', 'SKINCARE',
  'FRAGRANCE', 'WELLNESS', 'ORGANIC', 'LUXURY', 'MEDICAL', 'OTHER',
];

const ROLE_TABS = [
  { value: '',           label: 'All',        icon: Users },
  { value: 'CUSTOMER',   label: 'Customers',  icon: User },
  { value: 'VENDOR',     label: 'Vendors',    icon: Store },
  { value: 'ADMIN',      label: 'Admins',     icon: ShieldCheck },
  { value: 'SUPER_ADMIN',label: 'Super Admin',icon: ShieldCheck },
];

const ROLE_COLORS: Record<string, string> = {
  CUSTOMER:   'bg-blue-100 text-blue-800',
  VENDOR:     'bg-purple-100 text-purple-800',
  ADMIN:      'bg-orange-100 text-orange-800',
  SUPER_ADMIN:'bg-red-100 text-red-800',
};

interface UserItem {
  id?: string;
  _id?: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  vendorType?: string;
  createdAt: string;
  _count?: { orders: number };
}

export default function AdminUsersPage() {
  const { user, isChecking } = useAuthGuard({ roles: ['ADMIN', 'SUPER_ADMIN'] });
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleTab, setRoleTab] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editingPermUser, setEditingPermUser] = useState<UserItem | null>(null);
  const [permsDraft, setPermsDraft] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    email: '', password: '', firstName: '', lastName: '',
    phone: '', role: 'CUSTOMER', vendorType: '',
  });

  const PERM_KEYS = [
    { key: 'canEditProducts',  label: 'Edit Products' },
    { key: 'canViewOrders',    label: 'View Orders' },
    { key: 'canManageUsers',   label: 'Manage Users' },
    { key: 'canManageBanners', label: 'Manage Banners' },
    { key: 'canViewAnalytics', label: 'View Analytics' },
    { key: 'canManagePromos',  label: 'Manage Promos' },
    { key: 'canViewAuditLogs', label: 'View Audit Logs' },
  ];

  const getId = (u: UserItem) => u.id || u._id || '';

  useEffect(() => {
    if (user) fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await adminAPI.getAllUsers({ page: 1, limit: 1000 });
      setUsers(data?.data || data || []);
    } catch (err: any) {
      const msg = err?.response?.status === 403
        ? 'Access denied (403) — your IP is not whitelisted or session expired. Try logging out and back in.'
        : 'Failed to load users';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminAPI.createUser(formData);
      toast.success('User created');
      setFormData({ email:'', password:'', firstName:'', lastName:'', phone:'', role:'CUSTOMER', vendorType:'' });
      setShowForm(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create user');
    }
  };

  const handleDelete = async (u: UserItem) => {
    if (!confirm(`Delete ${u.firstName} ${u.lastName}?`)) return;
    try {
      await adminAPI.deleteUser(getId(u));
      toast.success('User deleted');
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleRoleChange = async (u: UserItem, newRole: string) => {
    const prev = users;
    setUsers(us => us.map(x => getId(x) === getId(u) ? { ...x, role: newRole } : x));
    try {
      await adminAPI.updateUserRole(getId(u), newRole);
      toast.success('Role updated');
      fetchUsers();
    } catch (err: any) {
      setUsers(prev);
      toast.error(err?.response?.data?.message || 'Failed to update role');
    }
  };

  const handleVendorTypeChange = async (u: UserItem, vt: string) => {
    const prev = users;
    setUsers(us => us.map(x => getId(x) === getId(u) ? { ...x, vendorType: vt } : x));
    try {
      await adminAPI.updateUser(getId(u), { vendorType: vt });
      toast.success('Vendor type updated');
    } catch (err: any) {
      setUsers(prev);
      toast.error('Failed to update vendor type');
    }
  };

  const handleSavePerms = async () => {
    if (!editingPermUser) return;
    try {
      await adminAPI.updateUserPermissions(getId(editingPermUser), permsDraft);
      toast.success('Permissions updated');
      setEditingPermUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error('Failed to update permissions');
    }
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

  const filtered = users.filter(u => {
    const matchRole = !roleTab || u.role === roleTab;
    const q = search.toLowerCase();
    const matchSearch = !search ||
      u.email.toLowerCase().includes(q) ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
      (u.phone || '').includes(q);
    return matchRole && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 pt-10 pb-20">
        <div className="container">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div className="text-white">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-5 h-5 text-slate-300" />
                <span className="text-slate-300 text-sm font-medium">Admin</span>
              </div>
              <h1 className="text-3xl font-bold">Users & Roles</h1>
              <p className="text-slate-300 mt-1 text-sm">{users.length} total users</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => adminAPI.fixSuperAdminRole().then(() => { toast.success('Fixed'); fetchUsers(); }).catch(() => toast.error('Failed'))}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium px-3 py-2 rounded-xl transition-colors"
              >
                <UserCheck className="w-4 h-4" /> Fix SuperAdmin
              </button>
              <Link href="/dashboard/admin" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                <ArrowLeft className="w-4 h-4" /> Dashboard
              </Link>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 bg-white text-slate-900 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add User
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container -mt-10 pb-16 space-y-5">
        {/* Create User Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create New User</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { label: 'Email', field: 'email', type: 'email', required: true },
                  { label: 'First Name', field: 'firstName', type: 'text', required: true },
                  { label: 'Last Name', field: 'lastName', type: 'text', required: true },
                  { label: 'Phone', field: 'phone', type: 'tel', required: false },
                ].map(({ label, field, type, required }) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && ' *'}</label>
                    <input
                      type={type}
                      value={(formData as any)[field]}
                      onChange={e => setFormData({ ...formData, [field]: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300"
                      required={required}
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300"
                      required minLength={8}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value, vendorType: '' })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-200"
                    required
                  >
                    <option value="CUSTOMER">Customer</option>
                    <option value="VENDOR">Vendor</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
                {formData.role === 'VENDOR' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Type *</label>
                    <select
                      value={formData.vendorType}
                      onChange={e => setFormData({ ...formData, vendorType: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-200"
                      required
                    >
                      <option value="">— Select Type —</option>
                      {VENDOR_TYPES.map(t => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button type="submit" className="bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-900 transition-colors">Create User</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Search + Role Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email or phone…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {ROLE_TABS.map(tab => {
              const Icon = tab.icon;
              const count = tab.value ? users.filter(u => u.role === tab.value).length : users.length;
              return (
                <button
                  key={tab.value}
                  onClick={() => setRoleTab(tab.value)}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                    roleTab === tab.value
                      ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-slate-300 hover:text-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${roleTab === tab.value ? 'bg-white/20' : 'bg-gray-200 text-gray-600'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error state */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-700 text-sm">Failed to load users</p>
              <p className="text-red-600 text-xs mt-0.5">{error}</p>
              <button onClick={fetchUsers} className="mt-2 text-xs text-red-700 underline font-medium">Try again</button>
            </div>
          </div>
        )}

        {/* Users table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-16 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              <p className="text-sm text-gray-400 font-medium">Loading users…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-14 flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center">
                <Users className="w-7 h-7 text-gray-300" />
              </div>
              <p className="font-semibold text-gray-500">No users found</p>
              <p className="text-sm text-gray-400">{search || roleTab ? 'Try adjusting your search or filter' : 'Users will appear here'}</p>
            </div>
          ) : (
            <>
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-500">{filtered.length} {filtered.length === 1 ? 'user' : 'users'}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Orders</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map(u => (
                      <tr key={getId(u) || u.email} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-4 font-semibold text-gray-900">{u.firstName} {u.lastName}</td>
                        <td className="px-5 py-4 text-gray-600">{u.email}</td>
                        <td className="px-5 py-4 text-gray-500">{u.phone || '—'}</td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1.5">
                            <select
                              value={u.role}
                              onChange={e => handleRoleChange(u, e.target.value)}
                              className={`text-xs font-bold px-2 py-1 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-200 ${ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-800'}`}
                            >
                              <option value="CUSTOMER">Customer</option>
                              <option value="VENDOR">Vendor</option>
                              <option value="ADMIN">Admin</option>
                              <option value="SUPER_ADMIN">Super Admin</option>
                            </select>
                            {u.role === 'VENDOR' && (
                              <select
                                value={u.vendorType || ''}
                                onChange={e => handleVendorTypeChange(u, e.target.value)}
                                className="text-xs border border-purple-200 rounded-lg px-2 py-1 bg-purple-50 text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-200"
                              >
                                <option value="">— Vendor Type —</option>
                                {VENDOR_TYPES.map(t => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>)}
                              </select>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-600">{u._count?.orders ?? 0}</td>
                        <td className="px-5 py-4 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => { setEditingPermUser(u); setPermsDraft({ ...(u as any).permissions || {} }); }}
                              className="text-xs text-violet-600 hover:text-violet-800 font-medium underline"
                            >
                              Permissions
                            </button>
                            <button onClick={() => handleDelete(u)} className="text-xs text-red-600 hover:text-red-800 font-medium">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Permissions Modal */}
      {editingPermUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-base font-bold text-gray-900 mb-4">
              Permissions — {editingPermUser.firstName} {editingPermUser.lastName}
            </h3>
            <div className="space-y-2.5 mb-6">
              {PERM_KEYS.map(p => (
                <label key={p.key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!permsDraft[p.key]}
                    onChange={() => setPermsDraft(prev => ({ ...prev, [p.key]: !prev[p.key] }))}
                    className="w-4 h-4 rounded accent-violet-600"
                  />
                  <span className="text-sm text-gray-700">{p.label}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditingPermUser(null)} className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
              <button onClick={handleSavePerms} className="px-4 py-2 text-sm font-semibold bg-slate-800 text-white rounded-xl hover:bg-slate-900">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
