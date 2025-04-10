import { NextResponse } from "next/server"

// Access the OTP store (in a real app, use a database)
// This is just for demonstration - in production use a proper database
declare global {
  var otpStore: Map<string, { otp: string; expires: number }>
}

// Initialize global OTP store if it doesn't exist
if (!global.otpStore) {
  global.otpStore = new Map()
}

export async function POST(request: Request) {
  try {
    const { phoneNumber, otp } = await request.json()

    if (!phoneNumber || !otp) {
      return NextResponse.json({ success: false, message: "Phone number and OTP are required" }, { status: 400 })
    }

    // Get stored OTP
    const storedData = global.otpStore.get(phoneNumber)

    if (!storedData) {
      return NextResponse.json(
        { success: false, message: "No OTP found for this phone number. Please request a new one." },
        { status: 400 },
      )
    }

    // Check if OTP has expired
    if (Date.now() > storedData.expires) {
      global.otpStore.delete(phoneNumber)
      return NextResponse.json(
        { success: false, message: "OTP has expired. Please request a new one." },
        { status: 400 },
      )
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      return NextResponse.json({ success: false, message: "Invalid OTP. Please try again." }, { status: 400 })
    }

    // OTP verified successfully, remove it from store
    global.otpStore.delete(phoneNumber)

    return NextResponse.json({
      success: true,
      message: "Phone number verified successfully",
    })
  } catch (error) {
    console.error("Error in verify-otp API:", error)
    return NextResponse.json({ success: false, message: "An unexpected error occurred" }, { status: 500 })
  }
}
