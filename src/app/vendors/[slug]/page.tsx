import axios from "axios";
import { notFound } from "next/navigation";
import type { Metadata } from 'next';
import VendorStoreContent from "./VendorStoreContent.client";
import { getServerErrorSummary } from "@/lib/serverError";

export const dynamic = "force-dynamic";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://backend.glovia.com.np/api/v1').replace(/\/+$/, '');

type Props = { params: { slug: string } };

async function fetchVendorProfile(vendorId: string) {
  const res = await axios.get(`${API_BASE}/vendors/${vendorId}/profile`);
  return res.data?.vendor ?? null;
}

async function fetchVendorProducts(vendorId: string) {
  const res = await axios.get(`${API_BASE}/products`, {
    params: { vendorId, limit: 100 },
  });
  // /products returns { data: [...], meta: {...} }
  return res.data?.data ?? res.data ?? [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const vendor = await fetchVendorProfile(params.slug);
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

  try {
    const [vendor, products] = await Promise.all([
      fetchVendorProfile(slug),
      fetchVendorProducts(slug),
    ]);

    if (!vendor) notFound();

    return (
      <VendorStoreContent
        vendor={vendor}
        products={products}
        slug={slug}
      />
    );
  } catch (err) {
    console.warn(`[VendorStore] Fetch failed (${getServerErrorSummary(err)})`);
    notFound();
  }
}
