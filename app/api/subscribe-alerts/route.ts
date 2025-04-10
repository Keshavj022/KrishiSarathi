import { NextResponse } from "next/server"

// In a real app, use a database to store subscribers
// This is just for demonstration
declare global {
  var weatherAlertSubscribers: Set<string>
}

// Initialize global subscribers set if it doesn't exist
if (!global.weatherAlertSubscribers) {
  global.weatherAlertSubscribers = new Set()
}

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json()

    if (!phoneNumber) {
      return NextResponse.json({ success: false, message: "Phone number is required" }, { status: 400 })
    }

    // Add phone number to subscribers
    global.weatherAlertSubscribers.add(phoneNumber)

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to weather alerts",
    })
  } catch (error) {
    console.error("Error in subscribe-alerts API:", error)
    return NextResponse.json({ success: false, message: "An unexpected error occurred" }, { status: 500 })
  }
}
