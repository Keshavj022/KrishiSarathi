import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat")
  const lng = searchParams.get("lng")

  if (!lat || !lng) {
    return NextResponse.json({ success: false, message: "Latitude and longitude are required" }, { status: 400 })
  }

  try {
    // In a real application, you would fetch data from your IoT devices
    // For demo purposes, we'll simulate sensor data
    const sensorData = generateSensorData()

    return NextResponse.json({
      success: true,
      sensorData,
    })
  } catch (error) {
    console.error("Error fetching sensor data:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch sensor data" }, { status: 500 })
  }
}

// Generate simulated sensor data for demo purposes
function generateSensorData() {
  const now = new Date()
  const soilMoisture = []
  const soilTemperature = []
  const soilPH = []

  // Generate 24 hours of data points (one per hour)
  for (let i = 23; i >= 0; i--) {
    const timestamp = new Date(now)
    timestamp.setHours(now.getHours() - i)
    const timeString = timestamp.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })

    // Generate soil moisture data (30-70%)
    // Add some patterns: moisture decreases during day, increases at night
    const hourOfDay = timestamp.getHours()
    let baseMoisture = 50 // base value

    if (hourOfDay >= 10 && hourOfDay <= 16) {
      // Daytime - lower moisture due to evaporation
      baseMoisture -= 10
    } else if (hourOfDay >= 18 || hourOfDay <= 5) {
      // Night - higher moisture due to dew/less evaporation
      baseMoisture += 5
    }

    // Add some randomness
    const moistureValue = Math.max(30, Math.min(70, baseMoisture + (Math.random() * 10 - 5)))

    soilMoisture.push({
      timestamp: timeString,
      value: Math.round(moistureValue),
    })

    // Generate soil temperature data (15-35°C)
    // Temperature follows daily patterns
    let baseTemp = 25 // base value

    if (hourOfDay >= 12 && hourOfDay <= 16) {
      // Afternoon - higher temperature
      baseTemp += 5
    } else if (hourOfDay >= 0 && hourOfDay <= 5) {
      // Early morning - lower temperature
      baseTemp -= 5
    }

    // Add some randomness
    const tempValue = Math.max(15, Math.min(35, baseTemp + (Math.random() * 4 - 2)))

    soilTemperature.push({
      timestamp: timeString,
      value: Math.round(tempValue * 10) / 10,
    })

    // Generate soil pH data (5.5-7.5)
    // pH is relatively stable but has small fluctuations
    const basePhValue = 6.5
    const phValue = Math.max(5.5, Math.min(7.5, basePhValue + (Math.random() * 0.4 - 0.2)))

    soilPH.push({
      timestamp: timeString,
      value: Math.round(phValue * 10) / 10,
    })
  }

  // Generate soil nutrient data (NPK values)
  const soilNutrients = {
    nitrogen: Math.round(150 + Math.random() * 200), // 150-350 mg/kg
    phosphorus: Math.round(10 + Math.random() * 30), // 10-40 mg/kg
    potassium: Math.round(150 + Math.random() * 150), // 150-300 mg/kg
  }

  return {
    soilMoisture,
    soilTemperature,
    soilPH,
    soilNutrients,
    lastUpdated: now.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }),
  }
}
