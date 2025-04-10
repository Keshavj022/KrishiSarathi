import { NextResponse } from "next/server"
import twilio from "twilio"

// Initialize Twilio client
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

// Store OTPs temporarily (in a real app, use a database)
const otpStore = new Map<string, { otp: string; expires: number }>()

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json()

    if (!phoneNumber) {
      return NextResponse.json({ success: false, message: "Phone number is required" }, { status: 400 })
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Store OTP with 10-minute expiration
    otpStore.set(phoneNumber, {
      otp,
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes
    })

    try {
      // Send OTP via Twilio
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
        await twilioClient.messages.create({
          body: `Your AgriTech verification code is: ${otp}. Valid for 10 minutes.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phoneNumber,
        })
      } else {
        console.log(`[DEV MODE] OTP for ${phoneNumber}: ${otp}`)
      }

      return NextResponse.json({
        success: true,
        message: "OTP sent successfully",
      })
    } catch (error: any) {
      console.error("Error sending OTP via Twilio:", error)
      return NextResponse.json({ success: false, message: "Failed to send OTP. Please try again." }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in send-otp API:", error)
    return NextResponse.json({ success: false, message: "An unexpected error occurred" }, { status: 500 })
  }
}
