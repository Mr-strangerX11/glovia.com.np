import { notFound } from "next/navigation";
import type { Metadata } from 'next';
import VendorStoreContent from "./VendorStoreContent.client";

export const dynamic = "force-dynamic";

const API = (process.env.NEXT_PUBLIC_API_URL || 'https://backend.glovia.com.np/api/v1').replace(/\/+$/, '');

type Props = { params: { slug: string } };

async function resolveVendor(slug: string) {
  // 1. Try name-slug endpoint: GET /vendors/store/:slug
  try {
    const r = await fetch(`${API}/vendors/store/${encodeURIComponent(slug)}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });
    if (r.ok) {
      const d = await r.json();
      if (d?.vendor) return d.vendor;
    }
  } catch { /* fall through */ }

  // 2. Try _id profile endpoint: GET /vendors/:slug/profile (works when slug is a MongoDB ObjectId)
  try {
    const r = await fetch(`${API}/vendors/${encodeURIComponent(slug)}/profile`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });
    if (r.ok) {
      const d = await r.json();
      if (d?.vendor) return d.vendor;
    }
  } catch { /* fall through */ }

  return null;
}

async function resolveProducts(vendorId: string): Promise<any[]> {
  try {
    const r = await fetch(
      `${API}/products?vendorId=${encodeURIComponent(vendorId)}&limit=100`,
      { cache: 'no-store', signal: AbortSignal.timeout(10000) }
    );
    if (!r.ok) return [];
    const d = await r.json();
    return Array.isArray(d?.data) ? d.data : Array.isArray(d) ? d : [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const vendor = await resolveVendor(params.slug).catch(() => null);
  if (vendor) {
    const name = `${vendor.firstName || ''} ${vendor.lastName || ''}`.trim() || vendor.email;
    return {
      title: `${name} — Glovia Marketplace`,
      description: vendor.vendorDescription || `Shop products from ${name} on Glovia Marketplace Nepal.`,
    };
  }
  return { title: 'Vendor Store — Glovia Marketplace' };
}

export default async function VendorStorePage({ params }: Props) {
  const { slug } = params;

  const vendor = await resolveVendor(slug);
  if (!vendor) notFound();

  const vendorId = String(vendor._id || vendor.id || slug);
  const products = await resolveProducts(vendorId);

  return <VendorStoreContent vendor={vendor} products={products} slug={slug} />;
}
