'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';

export function useAdmin() {
  const { user, isUserLoading } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If the main user loading is in progress, we also are loading.
    if (isUserLoading) {
      setIsLoading(true);
      return;
    }
    
    // If there is no user, they are not an admin.
    if (!user) {
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    // User is available, check their token for the admin claim.
    // forceRefresh to true is important to get latest claims.
    user.getIdTokenResult(true)
      .then(idTokenResult => {
        // The !! converts the value to a boolean.
        // If claims.admin is undefined, it becomes false.
        setIsAdmin(!!idTokenResult.claims.admin);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Gagal mendapatkan token admin:", error);
        setIsAdmin(false);
        setIsLoading(false);
      });

  }, [user, isUserLoading]);

  return { isAdmin, isLoading };
}
