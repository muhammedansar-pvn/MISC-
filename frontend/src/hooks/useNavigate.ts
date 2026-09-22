'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export interface NavigateOptions {
  replace?: boolean;
  scroll?: boolean;
}

export const useNavigate = () => {
  const router = useRouter();

  return useCallback(
    (to: string | number, options?: NavigateOptions) => {
      if (typeof to === 'number') {
        if (to === -1) {
          router.back();
        } else if (to === 1) {
          router.forward();
        }
        return;
      }

      if (options?.replace) {
        router.replace(to, { scroll: options?.scroll ?? true });
      } else {
        router.push(to, { scroll: options?.scroll ?? true });
      }
    },
    [router]
  );
};

export default useNavigate;
