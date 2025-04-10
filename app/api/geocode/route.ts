import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat")
  const lng = searchParams.get("lng")

  if (!lat || !lng) {
    return NextResponse.json({ success: false, message: "Latitude and longitude are required" }, { status: 400 })
  }

  try {
    // Make the actual API call to Google Maps Geocoding API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyCLbJqIkT7q0_QcTTuL6JIt8vwaMb4jjDg`,
    )
    const data = await response.json()

    if (data.status !== "OK") {
      console.error("Geocoding API error:", data.status, data.error_message)
      throw new Error(`Geocoding API error: ${data.status} - ${data.error_message || ""}`)
    }

    // Extract the most relevant address component (usually the locality or administrative area)
    const locationName = data.results[0]?.formatted_address || "Unknown location"

    console.log("Location name fetched successfully:", locationName)

    return NextResponse.json({
      success: true,
      locationName,
    })
  } catch (error) {
    console.error("Error in geocoding:", error)
    return NextResponse.json({ success: false, message: "Failed to get location name" }, { status: 500 })
  }
}

// Remove or comment out the simulateGeocoding function and its call
// Simulate geocoding for demo purposes
// function simulateGeocoding(lat: number, lng: number): string {
//   // This is a very simplified simulation
//   // In a real app, you would use the Google Maps Geocoding API

//   // Some example locations based on coordinates
//   const locations = [
//     { lat: 37.7749, lng: -122.4194, name: "San Francisco, CA" },
//     { lat: 40.7128, lng: -74.006, name: "New York, NY" },
//     { lat: 34.0522, lng: -118.2437, name: "Los Angeles, CA" },
//     { lat: 41.8781, lng: -87.6298, name: "Chicago, IL" },
//     { lat: 29.7604, lng: -95.3698, name: "Houston, TX" },
//     { lat: 28.5383, lng: 77.209, name: "New Delhi, India" },
//     { lat: 19.076, lng: 72.8777, name: "Mumbai, India" },
//     { lat: 12.9716, lng: 77.5946, name: "Bangalore, India" },
//     { lat: 17.385, lng: 78.4867, name: "Hyderabad, India" },
//     { lat: 22.5726, lng: 88.3639, name: "Kolkata, India" },
//   ]

//   // Find the closest location
//   let closestLocation = locations[0]
//   let minDistance = calculateDistance(lat, lng, locations[0].lat, locations[0].lng)

//   for (let i = 1; i < locations.length; i++) {
//     const distance = calculateDistance(lat, lng, locations[i].lat, locations[i].lng)
//     if (distance < minDistance) {
//       minDistance = distance
//       closestLocation = locations[i]
//     }
//   }

//   return closestLocation.name
// }

// Calculate distance between two points using Haversine formula
// function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
//   const R = 6371 // Radius of the earth in km
//   const dLat = deg2rad(lat2 - lat1)
//   const dLon = deg2rad(lon2 - lon1)
//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
//   const distance = R * c // Distance in km
//   return distance
// }

// function deg2rad(deg: number): number {
//   return deg * (Math.PI / 180)
// }
