import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query")

  if (!query) {
    return NextResponse.json({ success: false, message: "Search query is required" }, { status: 400 })
  }

  try {
    // Make the API call to Google Maps Geocoding API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=AIzaSyCLbJqIkT7q0_QcTTuL6JIt8vwaMb4jjDg`,
    )
    const data = await response.json()

    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      console.error("Geocoding search API error:", data.status, data.error_message)
      throw new Error("Location not found")
    }

    const result = data.results[0]
    const location = {
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
    }
    const locationName = result.formatted_address

    console.log("Location search successful:", locationName, location)

    return NextResponse.json({
      success: true,
      location,
      locationName,
    })
  } catch (error) {
    console.error("Error in geocoding search:", error)
    return NextResponse.json({ success: false, message: "Failed to find location" }, { status: 500 })
  }
}

// Simulate geocoding search for demo purposes
function simulateGeocodingSearch(query: string) {
  // This is a very simplified simulation
  // In a real app, you would use the Google Maps Geocoding API

  // Some example locations
  const locations = [
    { name: "new delhi", locationName: "New Delhi, India", location: { lat: 28.6139, lng: 77.209 } },
    { name: "mumbai", locationName: "Mumbai, India", location: { lat: 19.076, lng: 72.8777 } },
    { name: "bangalore", locationName: "Bangalore, India", location: { lat: 12.9716, lng: 77.5946 } },
    { name: "hyderabad", locationName: "Hyderabad, India", location: { lat: 17.385, lng: 78.4867 } },
    { name: "kolkata", locationName: "Kolkata, India", location: { lat: 22.5726, lng: 88.3639 } },
    { name: "chennai", locationName: "Chennai, India", location: { lat: 13.0827, lng: 80.2707 } },
    { name: "san francisco", locationName: "San Francisco, CA, USA", location: { lat: 37.7749, lng: -122.4194 } },
    { name: "new york", locationName: "New York, NY, USA", location: { lat: 40.7128, lng: -74.006 } },
    { name: "london", locationName: "London, UK", location: { lat: 51.5074, lng: -0.1278 } },
    { name: "tokyo", locationName: "Tokyo, Japan", location: { lat: 35.6762, lng: 139.6503 } },
  ]

  // Find a matching location (case-insensitive)
  const queryLower = query.toLowerCase()
  const matchedLocation = locations.find(
    (loc) =>
      loc.name.includes(queryLower) ||
      queryLower.includes(loc.name) ||
      loc.locationName.toLowerCase().includes(queryLower),
  )

  if (matchedLocation) {
    return {
      location: matchedLocation.location,
      locationName: matchedLocation.locationName,
    }
  }

  // If no match found, return a default location
  return {
    location: { lat: 28.6139, lng: 77.209 },
    locationName: "New Delhi, India",
  }
}
