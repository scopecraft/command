import { useCallback } from 'react';
import { useLocation } from 'wouter';

/**
 * Custom hook to work with URL query parameters.
 * Provides functions to get and set query parameters while updating the URL.
 */
export function useQueryParams() {
  const [location, setLocation] = useLocation();
  
  // Get all current query params
  const getParams = useCallback(() => {
    const url = new URL(window.location.href);
    return new URLSearchParams(url.search);
  }, []);
  
  // Set a single query param
  const setParam = useCallback((key: string, value: string | null) => {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    
    if (value === null || value === undefined || value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    
    // Get the path without the query string
    const path = location.split('?')[0];
    const newQueryString = params.toString();
    const newLocation = newQueryString 
      ? `${path}?${newQueryString}` 
      : path;
    
    setLocation(newLocation);
  }, [location, setLocation]);
  
  // Get a single query param
  const getParam = useCallback((key: string) => {
    return getParams().get(key);
  }, [getParams]);
  
  // Set multiple params at once
  const setParams = useCallback((paramMap: Record<string, string | null>) => {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    
    Object.entries(paramMap).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    
    // Get the path without the query string
    const path = location.split('?')[0];
    const newQueryString = params.toString();
    const newLocation = newQueryString 
      ? `${path}?${newQueryString}` 
      : path;
    
    setLocation(newLocation);
  }, [location, setLocation]);
  
  // Clear all params
  const clearParams = useCallback(() => {
    const path = location.split('?')[0];
    setLocation(path);
  }, [location, setLocation]);
  
  return { 
    getParams, 
    setParam, 
    getParam, 
    setParams,
    clearParams 
  };
}