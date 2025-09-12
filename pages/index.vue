<template>
  <div>
    <CityInput @citySelected="openModal"></CityInput>

    <transition name="fade">
      <div
        v-if="selectedCity"
        class="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
      ></div>
    </transition>

    <transition name="fade-scale">
      <WeatherModal
        v-if="selectedCity"
        :city="selectedCity"
        class="z-50"
        @close="closeModal"
        @copyLink="copyLink"
      ></WeatherModal>
    </transition>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import CityInput from '~/components/CityInput.vue';
  import WeatherModal from '~/components/WeatherModal.vue';
  import type { CityWeather } from '~/composables/useWeather'
  import { useWeather } from '~/composables/useWeather';

  const selectedCity = ref<CityWeather | null>(null);
  const { cities, fetchCityWeather } = useWeather();

  const route = useRoute();
  const router = useRouter();

  const openModal = (city: CityWeather | null) => {
    if (!city || !city.name) {
      console.warn('Invalid city data; modal not opened');

      return;
    }

    selectedCity.value = city;
    router.replace({ query: { ...route.query, cityName: city.name } });
  };

  const closeModal = () => {
    clearCityNameFromQuery();
  };

  const clearCityNameFromQuery = () => {
    const q = { ...route.query };
    delete q.cityName;
    router.replace({ query: q });
    selectedCity.value = null;
  };

  const copyLink = () => {
    if (!selectedCity.value) {
      return;
    }

    const url = `${window.location.origin}${window.location.pathname}?cityName=${selectedCity.value.name}`;
    navigator.clipboard.writeText(url);

    alert('Link copied to clipboard!');
  };

  const checkCityName = (city: CityWeather, cityName: string) => {
    return city.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "") === cityName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
  }

  watch(() =>
    route.query.cityName,
    async (cityName) => {
      if (!cityName) {
        selectedCity.value = null;

        return;
      }

      const cachedCity = cities.value.find(c => checkCityName(c, String(cityName)));
      if (cachedCity) {
        selectedCity.value = cachedCity;

        return;
      }

      try {
        const res = await fetchCityWeather(String(cityName));
        const city = res.find(c => checkCityName(c, String(cityName)));

        if (city) {
          selectedCity.value = city;
        } else {
          clearCityNameFromQuery();
        }
      } catch {
        clearCityNameFromQuery();
      }
    },
    { immediate: true }
  );

  const detectUserCity = async () => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        const config = useRuntimeConfig();
        const res = await $fetch<WeatherApiResponse>(`https://api.openweathermap.org/data/2.5/find`, {
          params: {
            lat,
            lon,
            appid: config.public.weatherApiKey,
            units: 'metric',
          },
        });

        const cityList = res?.list;
        if (cityList?.length > 0) {
          selectedCity.value = cityList[0];
        }
      },
      (error) => {
        console.warn('Geolocation not available or permission denied:', error);
      }
    );
  };

  onMounted(() => {
    const config = useRuntimeConfig();

    if (!config.public.weatherApiKey) {
      console.error('API key is missing.');

      return;
    }
    
    if (!route.query.cityName) {
      detectUserCity();
    }
  });
</script>

<style scoped>
  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from, .fade-leave-to {
    opacity: 0;
  }

  .fade-enter-to, .fade-leave-from {
    opacity: 1;
  }

  .fade-scale-enter-active, .fade-scale-leave-active {
    transition: all 0.3s ease;
  }

  .fade-scale-enter-from, .fade-scale-leave-to {
    opacity: 0;
    transform: scale(0.95);
  }

  .fade-scale-enter-to, .fade-scale-leave-from {
    opacity: 1;
    transform: scale(1);
  }
</style>
