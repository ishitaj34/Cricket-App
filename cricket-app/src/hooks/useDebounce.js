import { useState, useEffect } from 'react';

/**
 * Custom hook that debounces a value by a specified delay.
 * Useful for deferring API calls or expensive computations until
 * the user stops typing.
 *
 * @param {*} value - The value to debounce.
 * @param {number} delay - Delay in milliseconds.
 * @returns {*} The debounced value.
 */
export default function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
