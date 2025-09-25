# Weather Reader Application

A minimalistic weather reader application built with **Vue 3 + Nuxt 3 + TailwindCSS**.  
It allows users to search for cities and view real-time weather details in a modal interface.
This is my test task submission for Front-end developer position.

---

## Features

### Core
- **City search with autocomplete** using OpenWeatherMap `/find` API
- **Weather modal** with details:
  - City name + country code (e.g. *Riga, LV*)
  - Current day and date (e.g. *Monday, 12*)
  - Temperature (°C or °F)
  - Min / Max temperature
- Clean UI with smooth fade/slide transitions

---

## Setup

### 1. Clone repository
```bash
git clone https://github.com/theinabank/weather-application.git
cd weather-application
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure API Key
```bash
cp .env.example .env
```

You can get a free API key from OpenWeatherMap (https://openweathermap.org/)
Edit the .env file like so:
```bash
NUXT_PUBLIC_WEATHER_API_KEY=your_api_key_here
```

### 4. Run development server
```bash
npm run dev
```

### 5. Build for production
```bash
npm run build
npm run preview
```
