import { NextResponse } from "next/server";
import twilio from "twilio";

// Initialize Twilio client
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// Ensure the global subscribers set is initialized
if (!globalThis.weatherAlertSubscribers) {
  globalThis.weatherAlertSubscribers = new Set<string>();
}

interface HeavyRainfallDay {
  date: string;
  precipitation: number;
}

export async function GET(request: Request) {
  try {
    // Get location from query params (defaults to New Delhi if not provided)
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat") || "28.6139";
    const lng = searchParams.get("lng") || "77.209";

    // Fetch 15-day weather forecast
    const forecastResponse = await fetch(
      `http://api.weatherstack.com/forecast?access_key=a3edea42a13f4170356ec0d038dedd3a&query=${lat},${lng}&forecast_days=15&hourly=0&units=m`
    );

    const forecastData = await forecastResponse.json();

    if (forecastData.error) {
      console.error("WeatherStack API error in rainfall check:", forecastData.error);
      throw new Error(
        `WeatherStack API error: ${forecastData.error.info || JSON.stringify(forecastData.error)}`
      );
    }

    // Check for heavy rainfall in the forecast
    const heavyRainfallDays: HeavyRainfallDay[] = [];

    if (forecastData.forecast) {
      for (const [date, forecast] of Object.entries<any>(forecastData.forecast)) {
        // Check if precipitation is high (e.g., > 10mm)
        if (forecast.totalPrecip > 10) {
          heavyRainfallDays.push({
            date,
            precipitation: forecast.totalPrecip,
          });
        }
      }
    }

    // If heavy rainfall is detected, send alerts to subscribers
    let results: Array<any> = [];
    if (
      heavyRainfallDays.length > 0 &&
      globalThis.weatherAlertSubscribers &&
      globalThis.weatherAlertSubscribers.size > 0
    ) {
      const alertMessage = `WEATHER ALERT: Heavy rainfall expected on ${heavyRainfallDays
        .map((day) => day.date)
        .join(", ")}. Please take necessary precautions for your crops.`;

      // Send SMS to all subscribers
      const sendPromises = Array.from(globalThis.weatherAlertSubscribers).map(async (phoneNumber) => {
        if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
          try {
            await twilioClient.messages.create({
              body: alertMessage,
              from: TWILIO_PHONE_NUMBER,
              to: phoneNumber,
            });
            return { phoneNumber, success: true };
          } catch (error) {
            console.error(`Failed to send alert to ${phoneNumber}:`, error);
            return { phoneNumber, success: false, error };
          }
        } else {
          console.log(`[DEV MODE] Would send to ${phoneNumber}: ${alertMessage}`);
          return { phoneNumber, success: true, devMode: true };
        }
      });

      results = await Promise.all(sendPromises);
    }

    return NextResponse.json({
      success: true,
      heavyRainfallDays,
      alertsSent:
        heavyRainfallDays.length === 0
          ? "No alerts needed"
          : results.length > 0
          ? results
          : "No subscribers",
    });
  } catch (error) {
    console.error("Error checking rainfall alerts:", error);
    return NextResponse.json(
      { success: false, message: "Failed to check rainfall alerts" },
      { status: 500 }
    );
  }
}
