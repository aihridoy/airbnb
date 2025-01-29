"use client";

import { useCallback, useRef } from 'react';

const useDebounce = (func, delay) => {
    const ref = useRef();
    return useCallback((...args) => {
        if (ref.current) {
            clearTimeout(ref.current);
        }
        ref.current = setTimeout(() => func(...args), delay);
    }, [func, delay]);
};

export default useDebounce;