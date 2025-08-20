'use client';

import { useEffect } from 'react';
import { suppressReact19RefWarnings } from '@/lib/react19-compat';

export function React19Suppressor() {
  useEffect(() => {
    suppressReact19RefWarnings();
  }, []);
  
  return null;
}