"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { User } from "@/types";

interface Options {
  roles?: User["role"][];
  redirectTo?: string;
}

export function useAuthGuard(options?: Options) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, hydrate } = useAuthStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      await hydrate();
      if (active) setChecked(true);
    })();
    return () => {
      active = false;
    };
  }, [hydrate]);

  useEffect(() => {
    if (!checked) return;

    const redirectTarget = options?.redirectTo || "/auth/login";

    if (!isAuthenticated) {
      if (pathname !== redirectTarget) {
        router.replace(redirectTarget);
      }
      return;
    }

    if (options?.roles && user && !options.roles.includes(user.role)) {
      if (pathname !== "/dashboard") {
        router.replace("/dashboard");
      }
    }
  }, [checked, isAuthenticated, pathname, options?.roles, options?.redirectTo, router, user]);

  return {
    user,
    isChecking: isLoading || !checked,
  };
}
