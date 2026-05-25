import axios from "axios";
import { notFound } from "next/navigation";
import type { Metadata } from 'next';
import VendorStoreContent from "./VendorStoreContent.client";
import { getServerErrorSummary } from "@/lib/serverError";

export const dynamic = "force-dynamic";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://backend.glovia.com.np/api/v1').replace(/\/+$/, '');
const TIMEOUT = 12000;

type Props = { params: { slug: string } };

// Re-throw Next.js internal errors (notFound, redirect) so they are never swallowed
function isNextInternalError(err: unknown) {
  const digest = (err as any)?.digest ?? '';
  return typeof digest === 'string' && digest.startsWith('NEXT_');
}

// Resolve vendor by name slug ("kashi-chaudhary") or _id — calls GET /vendors/store/:slug
async function fetchVendorBySlug(slug: string) {
  const res = await axios.get(`${API_BASE}/vendors/store/${slug}`, { timeout: TIMEOUT });
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

  // Step 1: resolve vendor by name slug — 404 if not found
  let vendor: any = null;
  try {
    vendor = await fetchVendorBySlug(slug);
  } catch (err) {
    if (isNextInternalError(err)) throw err;
    console.warn(`[VendorStore] Profile fetch failed (${getServerErrorSummary(err)})`);
    notFound();
  }

  if (!vendor) notFound();

  // Step 2: fetch products using the vendor's actual _id — empty store on error, never 404
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
