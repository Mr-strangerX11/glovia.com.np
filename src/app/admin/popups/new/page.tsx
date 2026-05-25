"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { adminAPI } from "@/lib/api";
import ImageUploadField from "@/components/ImageUploadField";

const NewPopupPage = () => {
  const router = useRouter();
  const { isChecking } = useAuthGuard({ roles: ["ADMIN", "SUPER_ADMIN"] });

  const [form, setForm] = useState({
    title: "",
    content: "",
    image: "",
    link: "",
    isActive: true,
    showOnce: false,
    expiresAt: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await adminAPI.createPopup({
        ...form,
        expiresAt: form.expiresAt ? new Date(form.expiresAt) : undefined,
      });
      setSuccess(true);
      setTimeout(() => router.push("/admin/popups"), 1500);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to create popup. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
        >
          ← Back
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Add New Pop-up Offer</h2>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          Popup created successfully! Redirecting...
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            name="title"
            placeholder="Popup Title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            name="content"
            placeholder="Popup Content"
            value={form.content}
            onChange={handleChange}
            rows={4}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image
          </label>
          <ImageUploadField
            images={form.image ? [form.image] : []}
            onImagesChange={(urls) =>
              setForm({ ...form, image: urls[0] || "" })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Link (optional)
          </label>
          <input
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            name="link"
            placeholder="https://..."
            value={form.link}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expiry Date (optional)
          </label>
          <input
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            name="expiresAt"
            type="date"
            value={form.expiresAt}
            onChange={handleChange}
          />
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm({ ...form, isActive: e.target.checked })
              }
              className="w-4 h-4 accent-blue-600"
            />
            <span className="text-sm text-gray-700">Active</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.showOnce}
              onChange={(e) =>
                setForm({ ...form, showOnce: e.target.checked })
              }
              className="w-4 h-4 accent-blue-600"
            />
            <span className="text-sm text-gray-700">Show Once Per User</span>
          </label>
        </div>

        <button
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium p-2.5 rounded-lg transition-colors"
          type="submit"
          disabled={submitting || success}
        >
          {submitting ? "Creating..." : "Add Pop-up"}
        </button>
      </form>
    </div>
  );
};

export default NewPopupPage;
