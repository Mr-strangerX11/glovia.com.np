"use client";

import { User } from "lucide-react";

interface ProfileAvatarProps {
  src?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  ringColor?: string;
}

const sizeMap = {
  sm:  { outer: "w-8 h-8",   icon: "w-4 h-4",  text: "text-xs" },
  md:  { outer: "w-10 h-10", icon: "w-5 h-5",  text: "text-sm" },
  lg:  { outer: "w-14 h-14", icon: "w-7 h-7",  text: "text-base" },
  xl:  { outer: "w-20 h-20", icon: "w-10 h-10", text: "text-xl" },
};

export default function ProfileAvatar({
  src,
  firstName,
  lastName,
  size = "md",
  className = "",
  ringColor = "ring-white",
}: ProfileAvatarProps) {
  const { outer, icon, text } = sizeMap[size];
  const initials =
    (firstName?.[0] ?? "") + (lastName?.[0] ?? "") || null;

  if (src) {
    return (
      <div className={`${outer} rounded-full overflow-hidden ring-2 ${ringColor} flex-shrink-0 ${className}`}>
        <img
          src={src}
          alt={`${firstName ?? ""} ${lastName ?? ""}`.trim() || "Profile"}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  if (initials) {
    return (
      <div
        className={`${outer} rounded-full bg-gradient-to-br from-pink-400 to-rose-500 ring-2 ${ringColor} flex items-center justify-center flex-shrink-0 ${className}`}
      >
        <span className={`${text} font-bold text-white uppercase`}>{initials}</span>
      </div>
    );
  }

  return (
    <div className={`${outer} rounded-full bg-gray-100 ring-2 ${ringColor} flex items-center justify-center flex-shrink-0 ${className}`}>
      <User className={`${icon} text-gray-400`} />
    </div>
  );
}
