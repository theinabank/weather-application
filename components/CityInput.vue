<template>
  <div class="flex flex-col items-center">
    <div class="w-full md:w-auto relative">
      <!-- Search Input -->
       <div class="relative">
        <img
          src="/svg/search.svg"
          alt="search"
          width="18"
          height="18"
          class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          v-model="query"
          id="city"
          type="text"
          placeholder="Search city..."
          class="w-full md:w-96 rounded-full border border-gray-300 pl-10 pr-4 py-2 
                shadow-sm transition-all duration-200
                focus:outline-none focus:shadow-md focus:shadow-gray-500/20"
        />
       </div>

      <!-- Results Dropdown -->
       <transition name="slide-fade" mode="out-in">
        <ul
          v-if="displayResults.length"
          class="absolute left-0 right-0 mt-2 border border-gray-200 rounded-lg 
                max-h-60 overflow-y-auto z-30 bg-white shadow-lg 
                divide-y divide-gray-100 overflow-x-hidden"
        >
          <li
            v-if="!query"
            class="px-3 py-2 text-sm text-gray-400 font-medium flex justify-between"
          >
            Searched Cities
            <span
              @click="clearHistory"
              class="cursor-pointer hover:text-black transition-colors duration-300"
            >Clear history</span>
          </li>
          <li
            v-for="city in displayResults"
            :key="city.id"
            @click="selectCity(city)"
            class="group p-3 cursor-pointer flex items-center justify-between
                  hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100
                  hover:scale-[1.01] transform-gpu origin-center
                  transition-all duration-200 ease-out"
          >
            <div class="flex items-center gap-2">
              <span class="font-medium">{{ city.name }}</span>
              <span class="text-sm text-gray-500">{{ city.sys.country }}</span>
            </div>
            <img
              src="/svg/arrow.svg"
              alt="arrow"
              width="20"
              height="20"
              class="opacity-0 -translate-x-2
                    group-hover:opacity-100 group-hover:translate-x-0
                    transition-all duration-300 ease-out"
              >
          </li>
        </ul>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
  import { useWeather, type CityWeather } from '~/composables/useWeather';

  const { fetchCityWeather } = useWeather();

  const query = ref('');
  const results = ref<CityWeather[]>([]);
  const lastSearchedCities = ref<CityWeather[]>([]);
  const minQueryLength = 2;

  onMounted(() => {
    const stored = localStorage.getItem('lastSearchedCities');

    if (stored) {
      lastSearchedCities.value = JSON.parse(stored);
    } 
  });

  const sortedResults = computed(
    () => results.value.sort((a, b) => a.name.localeCompare(b.name))
  );

  const displayResults = computed(() => {
    if (query.value.length > minQueryLength) {
      return sortedResults.value;
    }
    
    return lastSearchedCities.value;
  });

  const emit = defineEmits(['citySelected']);

  let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

  watch(query, (val) => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    if (val.length <= minQueryLength) {
      results.value = [];

      return;
    }

    debounceTimeout = setTimeout(async () => {
      results.value = await fetchCityWeather(val);
    }, 300);
  });

  onBeforeUnmount(() => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
  });

  const selectCity = (city: CityWeather) => {
    emit('citySelected', city);

    lastSearchedCities.value = [city, ...lastSearchedCities.value.filter(c => c.id !== city.id)].slice(0, 5);
    localStorage.setItem('lastSearchedCities', JSON.stringify(lastSearchedCities.value));

    results.value = [];
    query.value = '';
  };

  const clearHistory = () => {
    lastSearchedCities.value = [];
    localStorage.removeItem('lastSearchedCities');
  };
</script>

<style scoped>
  .slide-fade-enter-active {
    transition: all 0.3s ease;
  }

  .slide-fade-leave-active {
    transition: all 0.2s ease;
  }

  .slide-fade-enter-from {
    opacity: 0;
    transform: translateY(-10px);
  }

  .slide-fade-enter-to {
    opacity: 1;
    transform: translateY(0);
  }

  .slide-fade-leave-from {
    opacity: 1;
    transform: translateY(0);
  }

  .slide-fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }
</style>
