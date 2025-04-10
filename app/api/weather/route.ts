import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat")
  const lng = searchParams.get("lng")

  if (!lat || !lng) {
    return NextResponse.json({ success: false, message: "Latitude and longitude are required" }, { status: 400 })
  }

  try {
    // Replace the commented-out code with the actual API call
    // In a real application, you would use WeatherStack or another weather API

    try {
      // Make the actual API call to WeatherStack
      const response = await fetch(
        `http://api.weatherstack.com/current?access_key=a3edea42a13f4170356ec0d038dedd3a&query=${lat},${lng}&forecast_days=5&units=m`,
      )
      const data = await response.json()

      if (data.error) {
        console.error("WeatherStack API error:", data.error)
        throw new Error(`WeatherStack API error: ${data.error.info || JSON.stringify(data.error)}`)
      }

      // Transform the WeatherStack response to match our application's format
      const weatherData = {
        current: {
          temperature: data.current?.temperature || 0,
          humidity: data.current?.humidity || 0,
          windSpeed: data.current?.wind_speed || 0,
          condition: data.current?.weather_descriptions?.[0] || "Unknown",
          icon: data.current?.weather_icons?.[0] || "",
        },
        forecast: [], // WeatherStack forecast data needs to be processed here
        alerts: [], // WeatherStack doesn't provide alerts in the free tier
      }

      // Generate simulated forecast since WeatherStack free tier doesn't include forecast
      weatherData.forecast = generateSimulatedForecast(weatherData.current.temperature)

      console.log("Weather data fetched successfully:", JSON.stringify(weatherData))

      return NextResponse.json({
        success: true,
        weather: weatherData,
      })
    } catch (error) {
      console.error("Error fetching weather data:", error)
      return NextResponse.json({ success: false, message: "Failed to fetch weather data" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error fetching weather data:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch weather data" }, { status: 500 })
  }
}

// Add this function to generate simulated forecast if WeatherStack doesn't provide it
function generateSimulatedForecast(currentTemp: number) {
  const forecast = []
  const currentDate = new Date()

  for (let i = 0; i < 5; i++) {
    const forecastDate = new Date()
    forecastDate.setDate(currentDate.getDate() + i + 1)

    const tempVariation = Math.random() * 8 - 4
    const forecastTemp = currentTemp + tempVariation

    const conditions = ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Clear"]
    const forecastCondition = conditions[Math.floor(Math.random() * conditions.length)]

    forecast.push({
      date: forecastDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      temperature: Math.round(forecastTemp),
      humidity: Math.round(40 + Math.random() * 40),
      condition: forecastCondition,
    })
  }

  return forecast
}

// Generate simulated weather data for demo purposes
function generateWeatherData(lat: number, lng: number) {
  const currentDate = new Date()
  const isNorthernHemisphere = lat > 0
  const month = currentDate.getMonth() // 0-11

  // Determine season based on hemisphere and month
  let season
  if (isNorthernHemisphere) {
    if (month >= 2 && month <= 4) season = "spring"
    else if (month >= 5 && month <= 7) season = "summer"
    else if (month >= 8 && month <= 10) season = "autumn"
    else season = "winter"
  } else {
    if (month >= 2 && month <= 4) season = "autumn"
    else if (month >= 5 && month <= 7) season = "winter"
    else if (month >= 8 && month <= 10) season = "spring"
    else season = "summer"
  }

  // Base temperature on season and add some randomness
  let baseTemp
  let conditions
  const alerts = []

  switch (season) {
    case "winter":
      baseTemp = isNorthernHemisphere ? 5 : 15
      conditions = ["Cloudy", "Partly Cloudy", "Light Snow", "Clear", "Overcast"]
      if (Math.random() < 0.3) {
        alerts.push({
          title: "Frost Warning",
          description: "Temperatures expected to drop below freezing overnight. Protect sensitive crops.",
          severity: "medium",
        })
      }
      break
    case "spring":
      baseTemp = 18
      conditions = ["Partly Cloudy", "Light Rain", "Sunny", "Overcast", "Scattered Showers"]
      if (Math.random() < 0.4) {
        alerts.push({
          title: "Heavy Rain Alert",
          description:
            "Heavy rainfall expected in the next 48 hours. Consider delaying planting or fertilizer application.",
          severity: "medium",
        })
      }
      break
    case "summer":
      baseTemp = 28
      conditions = ["Sunny", "Clear", "Partly Cloudy", "Scattered Thunderstorms", "Hot"]
      if (Math.random() < 0.3) {
        alerts.push({
          title: "Heat Wave Warning",
          description:
            "Temperatures expected to exceed 35°C for the next 3 days. Increase irrigation to prevent crop stress.",
          severity: "high",
        })
      }
      break
    case "autumn":
      baseTemp = 15
      conditions = ["Partly Cloudy", "Cloudy", "Light Rain", "Foggy", "Clear"]
      if (Math.random() < 0.2) {
        alerts.push({
          title: "Early Frost Alert",
          description: "Early frost possible in the coming week. Prepare to harvest sensitive crops.",
          severity: "low",
        })
      }
      break
  }

  // Add some randomness to temperature
  const currentTemp = baseTemp + (Math.random() * 10 - 5)

  // Randomly select a condition
  const currentCondition = conditions[Math.floor(Math.random() * conditions.length)]

  // Generate forecast data
  const forecast = []
  for (let i = 0; i < 5; i++) {
    const forecastDate = new Date()
    forecastDate.setDate(currentDate.getDate() + i + 1)

    const tempVariation = Math.random() * 8 - 4
    const forecastTemp = baseTemp + tempVariation

    const forecastCondition = conditions[Math.floor(Math.random() * conditions.length)]

    forecast.push({
      date: forecastDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      temperature: Math.round(forecastTemp),
      humidity: Math.round(40 + Math.random() * 40),
      condition: forecastCondition,
    })
  }

  return {
    current: {
      temperature: Math.round(currentTemp),
      humidity: Math.round(40 + Math.random() * 40),
      windSpeed: Math.round(5 + Math.random() * 20),
      condition: currentCondition,
      icon: getWeatherIcon(currentCondition),
    },
    forecast,
    alerts,
  }
}

// Helper function to get weather icon based on condition
function getWeatherIcon(condition: string) {
  const conditionLower = condition.toLowerCase()

  if (conditionLower.includes("rain") || conditionLower.includes("shower")) {
    return "rain"
  } else if (conditionLower.includes("snow")) {
    return "snow"
  } else if (conditionLower.includes("cloud")) {
    return "cloudy"
  } else if (conditionLower.includes("sun") || conditionLower.includes("clear")) {
    return "sunny"
  } else if (conditionLower.includes("fog")) {
    return "fog"
  } else if (conditionLower.includes("thunder")) {
    return "thunderstorm"
  } else {
    return "partly-cloudy"
  }
}
