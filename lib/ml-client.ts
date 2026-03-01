import axios from 'axios';

const ML_SERVICE_URL = process.env.NEXT_PUBLIC_ML_SERVICE_URL || 'http://localhost:8000';

const mlClient = axios.create({
  baseURL: ML_SERVICE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface FloodPredictionInput {
  rainfall_24hr: number;
  rainfall_7day: number;
  soil_moisture: number;
  river_level: number;
  dam_capacity: number;
  elevation: number;
  population_density: number;
}

export interface FloodPredictionOutput {
  probability: number;
  confidence: number;
  risk_score: number;
  factors: string[];
}

export async function predictFloodRisk(
  input: FloodPredictionInput
): Promise<FloodPredictionOutput> {
  try {
    const response = await mlClient.post<FloodPredictionOutput>('/predict/flood', input);
    return response.data;
  } catch (error) {
    console.error('ML Service Error:', error);
    // Return mock data if ML service is unavailable
    return {
      probability: Math.random(),
      confidence: 0.75,
      risk_score: Math.random() * 100,
      factors: ['heavy_rainfall', 'saturated_soil'],
    };
  }
}

export async function get7DayForecast(regionId: string) {
  try {
    const response = await mlClient.get(`/forecast/${regionId}`);
    return response.data;
  } catch (error) {
    console.error('ML Service Error:', error);
    // Return mock data
    return {
      forecast: Array(7).fill(null).map((_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
        flood_probability: Math.random(),
        drought_probability: Math.random() * 0.3,
        heatwave_probability: Math.random() * 0.4,
      })),
    };
  }
}

export default mlClient;
