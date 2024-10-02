export interface CurrentWeatherInfo {
  startTime: Date | null;
  endTime: Date | null;
  windDirection: number;
  windSpeed: number;
  cloudRate: number;
  temperature: number;
  dewPoint: number;
  pressure: number;
  precipitation: number;
  visibility: number;
  gggg: string;
}

export interface WeatherForecastInfo {
  startTime: Date | null;
  endTime: Date | null;
  windDirection: number;
  windSpeed: number;
  cloudRate: number;
  precipitation: number;
}
