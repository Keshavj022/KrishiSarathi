import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat")
  const lng = searchParams.get("lng")

  if (!lat || !lng) {
    return NextResponse.json({ success: false, message: "Latitude and longitude are required" }, { status: 400 })
  }

  try {
    // In a real application, you would use an agricultural market API
    // For demo purposes, we'll simulate market data
    const marketData = generateMarketData(Number.parseFloat(lat), Number.parseFloat(lng))

    return NextResponse.json({
      success: true,
      marketData,
    })
  } catch (error) {
    console.error("Error fetching market data:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch market data" }, { status: 500 })
  }
}

// Generate simulated market data for demo purposes
function generateMarketData(lat: number, lng: number) {
  // Common crops in India
  const crops = ["Rice", "Wheat", "Maize", "Soybean", "Cotton", "Sugarcane", "Potato", "Tomato", "Onion", "Chili"]

  // Generate 3-5 nearby markets
  const numMarkets = 3 + Math.floor(Math.random() * 3)
  const markets = []

  for (let i = 0; i < numMarkets; i++) {
    // Generate a random distance (1-30 km)
    const distance = 1 + Math.random() * 29

    // Generate a random market name
    const marketName = `${getRandomMarketPrefix()} ${getRandomMarketSuffix()}`

    // Generate crop prices for this market
    const marketCrops = []
    const numCrops = 5 + Math.floor(Math.random() * 6) // 5-10 crops per market

    // Randomly select crops for this market
    const selectedCrops = [...crops].sort(() => 0.5 - Math.random()).slice(0, numCrops)

    for (const crop of selectedCrops) {
      // Generate a base price based on the crop
      const basePrice = getBasePriceForCrop(crop)

      // Add some randomness to the price
      const priceVariation = (Math.random() * 0.4 - 0.2) * basePrice // ±20%
      const price = Math.round((basePrice + priceVariation) * 100) / 100

      // Determine price trend
      const trend = Math.random() < 0.33 ? "down" : Math.random() < 0.66 ? "up" : "stable"

      // Generate change percentage
      const changePercent =
        trend === "stable"
          ? 0
          : trend === "up"
            ? Math.round(Math.random() * 10 * 10) / 10
            : -Math.round(Math.random() * 10 * 10) / 10

      // Determine unit
      const unit =
        crop === "Rice" || crop === "Wheat" || crop === "Maize" || crop === "Soybean"
          ? "quintal"
          : crop === "Sugarcane"
            ? "ton"
            : "kg"

      marketCrops.push({
        name: crop,
        price,
        unit,
        trend,
        changePercent,
      })
    }

    markets.push({
      name: marketName,
      distance,
      crops: marketCrops,
    })
  }

  // Sort markets by distance
  markets.sort((a, b) => a.distance - b.distance)

  return { markets }
}

// Helper functions for generating market data
function getRandomMarketPrefix() {
  const prefixes = [
    "Central",
    "City",
    "District",
    "Regional",
    "Rural",
    "Urban",
    "Farmers",
    "Agricultural",
    "Community",
    "Wholesale",
  ]
  return prefixes[Math.floor(Math.random() * prefixes.length)]
}

function getRandomMarketSuffix() {
  const suffixes = [
    "Market",
    "Mandi",
    "Trading Center",
    "Bazaar",
    "Marketplace",
    "Farmers Market",
    "Agricultural Market",
    "Produce Market",
    "Trading Hub",
    "Exchange",
  ]
  return suffixes[Math.floor(Math.random() * suffixes.length)]
}

function getBasePriceForCrop(crop: string) {
  // Base prices in Indian Rupees
  const basePrices: Record<string, number> = {
    Rice: 2000, // per quintal
    Wheat: 1950, // per quintal
    Maize: 1850, // per quintal
    Soybean: 3800, // per quintal
    Cotton: 6000, // per quintal
    Sugarcane: 3000, // per ton
    Potato: 25, // per kg
    Tomato: 35, // per kg
    Onion: 30, // per kg
    Chili: 80, // per kg  25, // per kg
    Tomato: 35, // per kg
    Onion: 30, // per kg
    Chili: 80, // per kg
  }

  return basePrices[crop] || 50 // Default price if crop not found
}
