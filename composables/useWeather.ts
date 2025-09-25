import { ref } from 'vue'

export interface CityWeather {
  id: number,
  name: string,
  sys: {
    country: string
  },
  main: {
    temp: number;
    temp_min: number;
    temp_max: number
  },
  weather: {
    main: string;
    icon: string
  }[]
}

export interface WeatherApiResponse {
  list: CityWeather[];
}

export type WeatherQuery = { city?: string; lat?: number; lon?: number };

export const useWeather = () => {
  const cities = ref<CityWeather[]>([]);
  const cache = ref<{ [key: string]: CityWeather[] }>({});
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchCityWeather = async (query: WeatherQuery) => {
    const config = useRuntimeConfig();
    let key = '';

    const params: Record<string, any> = {
      appid: config.public.weatherApiKey,
      units: 'metric'
    };

    if (query.city) {
      key = query.city.toLowerCase();
      params.q = query.city;
    } else if (query.lat !== undefined && query.lon !== undefined) {
      key = `${query.lat},${query.lon}`;
      params.lat = query.lat;
      params.lon = query.lon;
    } else {
      throw new Error('Invalid query: must provide city or lat/lon');
    }

    if (cache.value[key]) {
      return cache.value[key];
    }

    try {
      loading.value = true;
      error.value = null;

      const res = await $fetch<WeatherApiResponse>(`https://api.openweathermap.org/data/2.5/find`,
        { params }
      );

      const result = res.list || [];

      cache.value[key] = result;
      cities.value = result;

      return result;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch weather';

      return [];
    } finally {
      loading.value = false;
    }
  }

  return { cities, fetchCityWeather, loading, error };
}