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

export const useWeather = () => {
  const cities = ref<CityWeather[]>([]);
  const cache = ref<{ [key: string]: CityWeather[] }>({});
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchCityWeather = async (city: string) => {
    if (cache.value[city]) {
      return cache.value[city];
    }

    try {
      loading.value = true;
      error.value = null;

      const config = useRuntimeConfig();
      const res = await $fetch<WeatherApiResponse>(`https://api.openweathermap.org/data/2.5/find`, {
        params: {
          q: city,
          appid: config.public.weatherApiKey,
          units: 'metric'
        }
      });

      const result = res.list || [];
      cache.value[city] = result;
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