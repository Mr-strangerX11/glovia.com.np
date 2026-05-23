"use client";

import { useEffect, useState } from "react";

const ANNOUNCEMENT_KEY = "announcement.dismissed";

const DEFAULT_ANNOUNCEMENT = {
  icon: '🚚',
  text: 'Express Delivery: We deliver within 60 minutes!',
  backgroundColor: '#0066CC',
  isActive: true,
};

export default function AnnouncementBar() {
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [announcement, setAnnouncement] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const val = typeof window !== "undefined" ? localStorage.getItem(ANNOUNCEMENT_KEY) : null;
    setDismissed(val === "1");
  }, []);

  useEffect(() => {
    fetchAnnouncement();
  }, []);

  const fetchAnnouncement = async () => {
    try {
      const res = await fetch('/api/announcement');
      if (res.ok) {
        const data = await res.json();
        setAnnouncement(data);
      } else {
        setAnnouncement(DEFAULT_ANNOUNCEMENT);
      }
    } catch {
      setAnnouncement(DEFAULT_ANNOUNCEMENT);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDismissed(true);
    try {
      localStorage.setItem(ANNOUNCEMENT_KEY, "1");
    } catch {}
  };

  if (loading || dismissed || !announcement || !announcement.isActive) {
    return null;
  }

  return (
    <div className="w-full text-white" style={{ backgroundColor: announcement.backgroundColor }}>
      <div className="container py-2.5 text-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="text-base leading-none">{announcement.icon}</span>
          <p className="leading-none">
            <span className="font-semibold">{announcement.text}</span>
          </p>
        </div>
        <button
          type="button"
          aria-label="Dismiss announcement"
          onClick={handleClose}
          className="inline-flex items-center justify-center rounded-md hover:bg-white/10 transition-colors p-1.5 flex-shrink-0"
        >
          <span aria-hidden="true" className="text-base leading-none">×</span>
        </button>
      </div>
    </div>
  );
}
