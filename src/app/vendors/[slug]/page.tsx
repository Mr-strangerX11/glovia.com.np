import axios from "axios";
import { notFound } from "next/navigation";
import type { Metadata } from 'next';
import VendorStoreContent from "./VendorStoreContent.client";
import { getServerErrorSummary } from "@/lib/serverError";

export const dynamic = "force-dynamic";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://backend.glovia.com.np/api/v1').replace(/\/+$/, '');
const TIMEOUT = 12000;

type Props = { params: { slug: string } };

function isNextInternalError(err: unknown) {
  const digest = (err as any)?.digest ?? '';
  return typeof digest === 'string' && digest.startsWith('NEXT_');
}

/**
 * Resolve vendor by slug — supports both:
 *   - name slug   "kashi-chaudhary"  → GET /vendors/store/:slug  (after backend update)
 *   - MongoDB _id "6a13f8..."        → GET /vendors/:id/profile  (current backend)
 * Tries store endpoint first, falls back to profile endpoint so both work.
 */
async function fetchVendorBySlug(slug: string) {
  // Try store endpoint (name slug lookup — works once backend is updated)
  try {
    const res = await axios.get(`${API_BASE}/vendors/store/${slug}`, { timeout: TIMEOUT });
    const vendor = res.data?.vendor;
    if (vendor) return vendor;
  } catch {
    // fall through to profile endpoint
  }

  // Fall back to profile endpoint with slug as _id (current backend supports this)
  const res = await axios.get(`${API_BASE}/vendors/${slug}/profile`, { timeout: TIMEOUT });
  return res.data?.vendor ?? null;
}

async function fetchVendorProducts(vendorId: string) {
  const res = await axios.get(`${API_BASE}/products`, {
    params: { vendorId, limit: 100 },
    timeout: TIMEOUT,
  });
  const raw = res.data?.data ?? res.data;
  return Array.isArray(raw) ? raw : [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const vendor = await fetchVendorBySlug(params.slug);
    if (vendor) {
      const name = `${vendor.firstName || ''} ${vendor.lastName || ''}`.trim() || vendor.email;
      return {
        title: `${name} — Glovia Marketplace`,
        description: vendor.vendorDescription || `Shop products from ${name} on Glovia Marketplace Nepal.`,
      };
    }
  } catch {
    // ignore
  }
  return { title: 'Vendor Store — Glovia Marketplace' };
}

export default async function VendorStorePage({ params }: Props) {
  const { slug } = params;

  // Step 1: resolve vendor — 404 if not found
  let vendor: any = null;
  try {
    vendor = await fetchVendorBySlug(slug);
  } catch (err) {
    if (isNextInternalError(err)) throw err;
    console.warn(`[VendorStore] Profile fetch failed (${getServerErrorSummary(err)})`);
    notFound();
  }

  if (!vendor) notFound();

  // Step 2: fetch products using the vendor's _id — show empty store on error, never 404
  const vendorId = String(vendor._id || vendor.id || slug);
  let products: any[] = [];
  try {
    products = await fetchVendorProducts(vendorId);
  } catch (err) {
    if (isNextInternalError(err)) throw err;
    console.warn(`[VendorStore] Products fetch failed (${getServerErrorSummary(err)})`);
  }

  return (
    <VendorStoreContent
      vendor={vendor}
      products={products}
      slug={slug}
    />
  );
}
