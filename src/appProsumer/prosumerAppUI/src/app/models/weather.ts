export interface Root {
    latitude: number
    longitude: number
    generationtime_ms: number
    utc_offset_seconds: number
    timezone: string
    timezone_abbreviation: string
    elevation: number
    current_weather: CurrentWeather
    hourly_units: HourlyUnits
    hourly: Hourly
    daily_units: DailyUnits
    daily: Daily
  }
  
  export interface CurrentWeather {
    temperature: number
    windspeed: number
    winddirection: number
    weathercode: number
    is_day: number
    time: string
  }
  
  export interface HourlyUnits {
    time: string
    temperature_2m: string
    relativehumidity_2m: string
  }
  
  export interface Hourly {
    time: string[]
    temperature_2m: number[]
    relativehumidity_2m: number[]
  }
  
  export interface DailyUnits {
    time: string
    temperature_2m_max: string
    temperature_2m_min: string
  }
  
  export interface Daily {
    time: string[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
  }
  