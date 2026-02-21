import { useState, useEffect, useCallback } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number | null;
  error: string | null;
  loading: boolean;
  permission: 'granted' | 'denied' | 'prompt' | null;
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watch?: boolean; // Continuous tracking
}

/**
 * Reusable geolocation hook for the entire application
 * Handles permissions, errors, and continuous tracking
 * 
 * @example
 * // One-time location fetch
 * const { latitude, longitude, error, loading, getLocation } = useGeolocation();
 * 
 * @example
 * // Continuous tracking (for on-duty field teams)
 * const { latitude, longitude, heading, speed } = useGeolocation({ watch: true });
 */
export function useGeolocation(options: GeolocationOptions = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
    watch = false,
  } = options;

  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    heading: null,
    speed: null,
    timestamp: null,
    error: null,
    loading: false,
    permission: null,
  });

  const [watchId, setWatchId] = useState<number | null>(null);

  // Handle position update
  const handlePosition = useCallback((position: GeolocationPosition) => {
    setState({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      heading: position.coords.heading,
      speed: position.coords.speed,
      timestamp: position.timestamp,
      error: null,
      loading: false,
      permission: 'granted',
    });
  }, []);

  // Handle errors
  const handleError = useCallback((error: GeolocationPositionError) => {
    let errorMessage = 'Unable to get location';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
        setState(prev => ({ ...prev, permission: 'denied', error: errorMessage, loading: false }));
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information unavailable. Please check your device settings.';
        setState(prev => ({ ...prev, error: errorMessage, loading: false }));
        break;
      case error.TIMEOUT:
        errorMessage = 'Location request timed out. Please try again.';
        setState(prev => ({ ...prev, error: errorMessage, loading: false }));
        break;
      default:
        setState(prev => ({ ...prev, error: errorMessage, loading: false }));
    }
  }, []);

  // Get current position once
  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        loading: false,
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      handlePosition,
      handleError,
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    );
  }, [enableHighAccuracy, timeout, maximumAge, handlePosition, handleError]);

  // Start continuous tracking
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
      }));
      return;
    }

    // Stop existing watch if any
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    const id = navigator.geolocation.watchPosition(
      handlePosition,
      handleError,
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    );

    setWatchId(id);
  }, [enableHighAccuracy, timeout, maximumAge, handlePosition, handleError, watchId]);

  // Stop continuous tracking
  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);

  // Auto-start tracking if watch option is enabled
  useEffect(() => {
    if (watch) {
      startTracking();
    }

    // Cleanup on unmount
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watch]); // Only run on mount/unmount

  // Check permission status
  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setState(prev => ({ ...prev, permission: result.state as any }));
      });
    }
  }, []);

  return {
    ...state,
    getLocation,
    startTracking,
    stopTracking,
    isTracking: watchId !== null,
  };
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(lat: number | null, lng: number | null): string {
  if (lat === null || lng === null) return 'Unknown';
  return `${lat.toFixed(6)}° N, ${lng.toFixed(6)}° E`;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Get Google Maps navigation URL
 */
export function getNavigationUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

/**
 * Share location via Web Share API or copy to clipboard
 */
export async function shareLocation(
  lat: number,
  lng: number,
  title: string = 'My Location'
): Promise<{ success: boolean; method: 'share' | 'clipboard' | null; error?: string }> {
  const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
  const shareText = `${title}\n${formatCoordinates(lat, lng)}\n${mapsUrl}`;

  // Try Web Share API first (mobile devices)
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text: shareText,
        url: mapsUrl,
      });
      return { success: true, method: 'share' };
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
    }
  }

  // Fallback to clipboard
  try {
    await navigator.clipboard.writeText(shareText);
    return { success: true, method: 'clipboard' };
  } catch (error) {
    return { 
      success: false, 
      method: null, 
      error: 'Failed to share location. Please copy manually.' 
    };
  }
}
