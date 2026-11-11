// hooks/useResizeObserver.js
import { useEffect, useState } from 'react';

export const useResizeObserver = (ref, callback) => {
  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver((entries) => {
      callback(entries[0]);
    });

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, callback]);
};