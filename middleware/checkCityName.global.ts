import { defineNuxtRouteMiddleware, navigateTo } from "#app";
import { useWeather } from "~/composables/useWeather";

export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.query.cityName) {
    return;
  }

  const cityName = String(to.query.cityName);
  const { cities, fetchCityWeather } = useWeather();

  const normalize = (str: string) =>
    str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  let city = cities.value.find((c) => normalize(c.name) === normalize(cityName));

  if (!city) {
    const res = await fetchCityWeather({ city: cityName });
    city = res.find((c) => normalize(c.name) === normalize(cityName));
  }

  if (!city) {
    const newQuery = { ...to.query };
    delete newQuery.cityName;

    return navigateTo(
      {
        path: to.path,
        query: newQuery,
      },
      { replace: true }
    );
  }
});