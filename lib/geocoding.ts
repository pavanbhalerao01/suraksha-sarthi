/**
 * Geocoding utilities for emergency location input
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 */

export interface GeocodingResult {
  lat: number;
  lng: number;
  displayName: string;
  city?: string;
  state?: string;
}

/**
 * Convert landmark/address to coordinates
 * @param landmark - Address, landmark, or area name
 * @returns Coordinates and formatted address
 */
export async function geocodeLandmark(landmark: string): Promise<GeocodingResult | null> {
  try {
    // Add "Pune, Maharashtra, India" context for better results
    const searchQuery = landmark.includes('India') ? landmark : `${landmark}, Pune, Maharashtra, India`;
    const url = `https://nominatim.openstreetmap.org/search?` + new URLSearchParams({
      q: searchQuery,
      format: 'json',
      limit: '1',
      countrycodes: 'in', // Restrict to India
    });

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SurviveExe-DisasterManagement/1.0', // Required by Nominatim
      },
    });

    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        displayName: result.display_name,
        city: result.address?.city || result.address?.town,
        state: result.address?.state,
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Reverse geocode coordinates to address (for map marker)
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Formatted address
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?` + new URLSearchParams({
      lat: lat.toString(),
      lon: lng.toString(),
      format: 'json',
    });

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SurviveExe-DisasterManagement/1.0',
      },
    });

    const data = await response.json();
    
    if (data && data.display_name) {
      return data.display_name;
    }

    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}

/**
 * Get landmark suggestions as user types (autocomplete)
 * @param query - Partial landmark name
 * @returns Array of suggestions
 */
export async function getLandmarkSuggestions(query: string): Promise<GeocodingResult[]> {
  if (query.length < 2) return []; // Lower threshold to 2 characters

  try {
    // Try multiple search patterns for better results
    const searches = [
      `${query}, Pune, Maharashtra, India`, // Most specific
      `${query}, Pune, India`, // Broader
      `${query}, Maharashtra, India`, // Even broader (for state-wide landmarks)
    ];

    // Try the searches in order
    for (const searchQuery of searches) {
      const url = `https://nominatim.openstreetmap.org/search?` + new URLSearchParams({
        q: searchQuery,
        format: 'json',
        limit: '8', // Increased from 5 to 8
        countrycodes: 'in',
        addressdetails: '1',
      });

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'SurviveExe-DisasterManagement/1.0',
        },
      });

      const data = await response.json();
      
      if (data && data.length > 0) {
        // Filter to prioritize Pune results
        const results = data
          .map((item: any) => ({
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            displayName: item.display_name,
            city: item.address?.city || item.address?.town || item.address?.suburb,
            state: item.address?.state,
            importance: item.importance || 0,
          }))
          .sort((a: any, b: any) => {
            // Prioritize Pune and nearby areas
            const aPune = a.displayName.toLowerCase().includes('pune');
            const bPune = b.displayName.toLowerCase().includes('pune');
            if (aPune && !bPune) return -1;
            if (!aPune && bPune) return 1;
            // Then sort by importance
            return b.importance - a.importance;
          });
        
        if (results.length > 0) return results;
      }
    }

    return [];
  } catch (error) {
    console.error('Suggestions error:', error);
    return [];
  }
}

/**
 * Common Pune landmarks for quick selection
 */
export const PUNE_LANDMARKS = [
  { name: 'Sinhagad Road', lat: 18.4611, lng: 73.8067 },
  { name: 'Deccan Gymkhana', lat: 18.5074, lng: 73.8077 },
  { name: 'FC Road', lat: 18.5196, lng: 73.8553 },
  { name: 'Kothrud', lat: 18.5074, lng: 73.8077 },
  { name: 'Kondhwa', lat: 18.4682, lng: 73.8964 },
  { name: 'Hinjewadi', lat: 18.5912, lng: 73.7389 },
  { name: 'Baner', lat: 18.5595, lng: 73.7821 },
  { name: 'Wakad', lat: 18.5978, lng: 73.7614 },
  { name: 'Shivajinagar', lat: 18.5304, lng: 73.8567 },
  { name: 'Koregaon Park', lat: 18.5362, lng: 73.8922 },
  { name: 'Hadapsar', lat: 18.5089, lng: 73.9260 },
  { name: 'Katraj', lat: 18.4480, lng: 73.8671 },
  { name: 'Pimpri Chinchwad', lat: 18.6298, lng: 73.7997 },
  { name: 'Viman Nagar', lat: 18.5679, lng: 73.9142 },
  { name: 'Camp Area', lat: 18.5196, lng: 73.8850 },
];
