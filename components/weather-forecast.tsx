"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Cloud, CloudRain, Droplets, Sun, Wind, AlertTriangle } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface WeatherForecastProps {
  location: { lat: number; lng: number } | null
}

interface WeatherData {
  current: {
    temperature: number
    humidity: number
    windSpeed: number
    condition: string
    icon: string
  }
  forecast: Array<{
    date: string
    temperature: number
    humidity: number
    condition: string
  }>
  alerts: Array<{
    title: string
    description: string
    severity: "low" | "medium" | "high"
  }>
}

export default function WeatherForecast({ location }: WeatherForecastProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchWeatherData() {
      if (!location) {
        setIsLoading(false)
        return
      }

      try {
        console.log("Fetching weather data for:", location)
        const response = await fetch(`/api/weather?lat=${location.lat}&lng=${location.lng}`)
        const data = await response.json()

        console.log("Weather API response:", data)

        if (data.success) {
          setWeatherData(data.weather)
        } else {
          console.error("Weather API error:", data.message)
          throw new Error(data.message || "Failed to fetch weather data")
        }
      } catch (error) {
        console.error("Error fetching weather data:", error)
        toast({
          title: "Weather Data Error",
          description: "Failed to fetch weather forecast. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchWeatherData()
  }, [location, toast])

  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition.toLowerCase()
    if (conditionLower.includes("rain") || conditionLower.includes("drizzle")) {
      return <CloudRain className="h-6 w-6 text-blue-500" />
    } else if (conditionLower.includes("cloud")) {
      return <Cloud className="h-6 w-6 text-gray-500" />
    } else if (conditionLower.includes("sun") || conditionLower.includes("clear")) {
      return <Sun className="h-6 w-6 text-yellow-500" />
    } else if (conditionLower.includes("wind")) {
      return <Wind className="h-6 w-6 text-gray-400" />
    } else {
      return <Droplets className="h-6 w-6 text-blue-400" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "low":
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weather Forecast</CardTitle>
          <CardDescription>Loading weather data for your location...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-[200px] w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-[100px] w-full" />
              <Skeleton className="h-[100px] w-full" />
              <Skeleton className="h-[100px] w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!location) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weather Forecast</CardTitle>
          <CardDescription>Location data is required for weather forecasts</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Location Required</AlertTitle>
            <AlertDescription>
              Please set your location using the "Change Location" button at the top of the page to view weather
              forecasts.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!weatherData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weather Forecast</CardTitle>
          <CardDescription>Unable to load weather data</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Failed to load weather data. Please try again later.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const chartData = weatherData.forecast.map((day) => ({
    date: day.date,
    temperature: day.temperature,
    humidity: day.humidity,
  }))

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Current Weather</CardTitle>
          <CardDescription>Real-time weather conditions for your location</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              {getWeatherIcon(weatherData.current.condition)}
              <div>
                <h3 className="text-3xl font-bold">{weatherData.current.temperature}°C</h3>
                <p className="text-muted-foreground">{weatherData.current.condition}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Droplets className="h-5 w-5 text-blue-500" />
                <span>{weatherData.current.humidity}% Humidity</span>
              </div>
              <div className="flex items-center space-x-2">
                <Wind className="h-5 w-5 text-gray-500" />
                <span>{weatherData.current.windSpeed} km/h Wind</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {weatherData.alerts && weatherData.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
              Weather Alerts
            </CardTitle>
            <CardDescription>Important weather alerts for your area</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weatherData.alerts.map((alert, index) => (
                <Alert key={index} className={getSeverityColor(alert.severity)}>
                  <AlertTitle className="font-semibold">{alert.title}</AlertTitle>
                  <AlertDescription>{alert.description}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>5-Day Forecast</CardTitle>
          <CardDescription>Weather forecast for the next 5 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#8884d8" name="Temperature (°C)" />
                <Line yAxisId="right" type="monotone" dataKey="humidity" stroke="#82ca9d" name="Humidity (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-4">
            {weatherData.forecast.map((day, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="p-3">
                  <CardTitle className="text-sm font-medium">{day.date}</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="flex flex-col items-center">
                    {getWeatherIcon(day.condition)}
                    <p className="text-lg font-semibold mt-1">{day.temperature}°C</p>
                    <p className="text-xs text-muted-foreground">{day.condition}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
