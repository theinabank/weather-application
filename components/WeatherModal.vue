<template>
  <div class="fixed inset-0 flex items-center justify-center">
    <div class="bg-white rounded-xl shadow-2xl w-11/12 md:max-w-md p-8 relative transform transition-all">
      <!-- Share and close Button -->
       <div class="absolute top-4 right-4 flex items-center gap-2">
        <button
          @click="$emit('copyLink')"
          title="Share"
          class="rounded-full p-2 hover:bg-gray-100 transition cursor-pointer w-10 h-10 flex items-center justify-center"
        >
          <img src="/svg/share.svg" alt="share" width="16" height="16">
        </button>
        <button
          @click="$emit('close')"
          title="Close"
          class="rounded-full p-2 hover:bg-gray-100 transition cursor-pointer w-10 h-10 flex items-center justify-center"
        >
          <img src="/svg/close.svg" alt="close" width="24" height="24">
        </button>
       </div>

      <!-- City Name & Date -->
      <h2 class="text-2xl font-bold">{{ city.name }}, {{ city.sys.country }}</h2>
      <p class="text-gray-500 mt-1">{{ weekday }}, {{ date }}</p>

      <!-- Error Message -->
      <div v-if="error" class="mt-6 text-red-500">{{ error }}</div>

      <!-- Weather Main Info -->
      <div v-else class="flex flex-col md:flex-row items-center justify-between mt-6">
        <img 
          :src="`https://openweathermap.org/img/wn/${city.weather[0].icon}@2x.png`"
          alt="weather icon"
          class="w-24 h-24"
        />
        <transition name="slide-fade" mode="out-in">
          <div class="text-center md:text-right" :key="unitLabel">
            <p class="text-4xl font-bold">{{ displayedTemp }}°{{ unitLabel }}</p>
            <p class="text-gray-500 mt-1">
              Min: {{ displayedTempMin }}°{{ unitLabel }}
              | Max: {{ displayedTempMax }}°{{ unitLabel }}</p>
          </div>
        </transition>
      </div>

      <!-- Unit Toggle -->
      <div class="mt-4 flex items-center justify-center md:justify-end gap-3">
        <!-- Celsius label -->
        <span
          :class="[
            'font-medium transition-colors duration-300',
            isFahrenheit ? 'text-gray-400' : 'text-black'
          ]"
        >°C</span>

        <!-- Toggle -->
        <label class="cursor-pointer">
          <input v-model="isFahrenheit" type="checkbox"  class="sr-only peer">
          <div class="relative w-11 h-6 bg-gray-300 rounded-full
              peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full
              peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5
              after:start-[2px] after:bg-white after:border-gray-300 after:border
              after:rounded-full after:h-5 after:w-5 after:transition-all"
          ></div>
        </label>

        <!-- Fahrenheit label -->
        <span
          :class="[
            'font-medium transition-colors duration-300',
            isFahrenheit ? 'text-black' : 'text-gray-400'
          ]"
        >°F</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, watch } from 'vue';
  import type { CityWeather } from '~/composables/useWeather';
  import { useWeather } from '~/composables/useWeather';

  interface Props {
    city: CityWeather,
  }

  const props = defineProps<Props>();
  
  const weekday = computed(() => new Date().toLocaleDateString('en-Us', { weekday: 'long' }));
  const date = computed(() => new Date().getDate());

  const isFahrenheit = ref(false);

  const unitLabel = computed(() => (isFahrenheit.value ? 'F' : 'C'));

  const convertTemp = (temp: number) => {
    return isFahrenheit.value ? Math.round((temp * 9) / 5 + 32) : temp;
  };

  const displayedTemp = computed(() => convertTemp(props.city.main.temp));
  const displayedTempMin = computed(() => convertTemp(props.city.main.temp_min));
  const displayedTempMax = computed(() => convertTemp(props.city.main.temp_max));

  const { error } = useWeather();
</script>

<style scoped>
  .slide-fade-enter-active,
  .slide-fade-leave-active {
    transition: all 0.3s ease;
  }

  .slide-fade-enter-from {
    opacity: 0;
    transform: translateX(20%);
  }

  .slide-fade-enter-to {
    opacity: 1;
    transform: translateX(0%);
  }

  .slide-fade-leave-from {
    opacity: 1;
    transform: translateX(0%);
  }

  .slide-fade-leave-to {
    opacity: 0;
    transform: translateX(20%);
  }
</style>