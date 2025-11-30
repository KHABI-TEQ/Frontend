/** @format */

import { useEffect, RefObject } from 'react';

/**
 * Hook to handle clicks outside of a referenced element.
 * @param ref - The ref of the element to detect outside clicks for.
 * @param callback - The function to execute when an outside click is detected.
 *
 * @usage - useClickOutside(ref, () => closeMenu?.(null));
 * @returns void
 */
const useClickOutside = (
  ref: RefObject<HTMLElement | null>,
  callback: (event: MouseEvent) => void
) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback(event);
      }
    };

    // Add event listener when the component mounts
    document.addEventListener('mousedown', handleClickOutside);

    // Clean up event listener on component unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback]);
};

export default useClickOutside;
