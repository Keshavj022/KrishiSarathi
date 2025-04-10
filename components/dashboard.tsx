"use client";

import Chatbot from "@/components/chatbot"; // Import Chatbot component
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Bell, BellRing, Loader2, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import CropHealthAnalysis from "./crop-health-analysis";
import CropMarketPrices from "./crop-market-prices";
import IoTDashboard from "./iot-dashboard";
import WeatherForecast from "./weather-forecast";
import Image from "next/image";

export default function Dashboard() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [locationName, setLocationName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [manualLocation, setManualLocation] = useState("");
  const [heavyRainfallAlert, setHeavyRainfallAlert] = useState<any>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  // Default location (fallback) - New Delhi, India
  const defaultLocation = { lat: 28.6139, lng: 77.209 };

  useEffect(() => {
    // Check if user is subscribed to alerts
    const storedVerified = localStorage.getItem("isVerified");
    if (storedVerified === "true") {
      setIsSubscribed(true);
    }

    // Set loading state
    setIsLoading(true);

    // Try to get user's location using Google Maps Geolocation API
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Got user location:", latitude, longitude);
          setLocation({ lat: latitude, lng: longitude });

          // Hide the dialog since we got the location automatically
          setShowLocationDialog(false);

          // Reverse geocode to get location name using Google Maps API
          try {
            const response = await fetch(
              `/api/geocode?lat=${latitude}&lng=${longitude}`
            );
            const data = await response.json();
            console.log("Geocode API response:", data);

            if (data.success) {
              setLocationName(data.locationName);
            } else {
              console.error("Geocode API error:", data.message);
              throw new Error(data.message || "Failed to get location name");
            }
          } catch (error) {
            console.error("Error fetching location name:", error);
            toast({
              title: "Location Name Error",
              description:
                "Failed to get your location name. You can set it manually.",
              variant: "destructive",
            });
          }

          setIsLoading(false);

          // Check for rainfall alerts
          checkRainfallAlerts(latitude, longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Use default location but keep the dialog open for manual entry
          setLocation(defaultLocation);
          fetchLocationName(defaultLocation.lat, defaultLocation.lng);
          setIsLoading(false);

          // Check for rainfall alerts with default location
          checkRainfallAlerts(defaultLocation.lat, defaultLocation.lng);

          // Only show a toast for errors other than permission denied
          if (error.code !== 1) {
            // 1 is PERMISSION_DENIED
            toast({
              title: "Location Error",
              description:
                "Could not access your location. You can set it manually.",
              variant: "destructive",
            });
          }
        },
        { timeout: 10000, enableHighAccuracy: false }
      );
    } else {
      toast({
        title: "Geolocation Not Supported",
        description:
          "Your browser does not support geolocation. Please enter your location manually.",
      });
      setLocation(defaultLocation);
      fetchLocationName(defaultLocation.lat, defaultLocation.lng);
      setIsLoading(false);

      // Check for rainfall alerts with default location
      checkRainfallAlerts(defaultLocation.lat, defaultLocation.lng);
    }
  }, [toast]);

  const fetchLocationName = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`);
      const data = await response.json();
      if (data.success) {
        setLocationName(data.locationName);
      }
    } catch (error) {
      console.error("Error fetching location name:", error);
    }
  };

  const checkRainfallAlerts = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `/api/check-rainfall-alerts?lat=${lat}&lng=${lng}`
      );
      const data = await response.json();

      if (
        data.success &&
        data.heavyRainfallDays &&
        data.heavyRainfallDays.length > 0
      ) {
        setHeavyRainfallAlert(data.heavyRainfallDays);
      }
    } catch (error) {
      console.error("Error checking rainfall alerts:", error);
    }
  };

  const handleManualLocationSubmit = async () => {
    if (!manualLocation.trim()) return;

    setIsLoading(true);

    try {
      // Use Google Maps Geocoding API to convert location name to coordinates
      const response = await fetch(
        `/api/geocode-search?query=${encodeURIComponent(manualLocation)}`
      );
      const data = await response.json();

      if (data.success) {
        setLocation(data.location);
        setLocationName(data.locationName);
        setShowLocationDialog(false);

        // Check for rainfall alerts with new location
        checkRainfallAlerts(data.location.lat, data.location.lng);
      } else {
        toast({
          title: "Location Not Found",
          description:
            "Could not find the location you entered. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error searching location:", error);
      toast({
        title: "Error",
        description: "Failed to search for location. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading your agricultural dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col space-y-4 md:space-y-6">
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-10 aspect-square rounded-full bg-green-600 overflow-hidden">
                <Image 
                  src={"/logo.png"}  
                  alt="logo"
                  width={150}
                  height={150}
                  quality={90}
                />
              </div>
              <h1 className="text-2xl text-gray-700 font-bold tracking-tight">
                Krishi Sarathi
              </h1>
            </div>
            <div className="flex gap-2">
              {!isSubscribed && (
                <Button variant="outline" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Enable Alerts
                </Button>
              )}
              <Dialog
                open={showLocationDialog}
                onOpenChange={setShowLocationDialog}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Change Location
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogDescription className=" flex flex-wrap">
                      <p className="text-muted-foreground flex items-center text-xs flex-wrap">
                        {/* <MapPin className="h-4 w-4 mr-1" /> */}
                        {locationName ? (
                          <>
                            Your location: {locationName}
                            {/* <Button
                              variant="link"
                              className="p-0 h-auto ml-2"
                              onClick={() => setShowLocationDialog(true)}
                            >
                              Change
                            </Button> */}
                          </>
                        ) : (
                          <>
                            Location not set
                            <Button
                              variant="link"
                              className="p-0 h-auto ml-2"
                              onClick={() => setShowLocationDialog(true)}
                            >
                              Set location
                            </Button>
                          </>
                        )}
                      </p>
                    </DialogDescription>
                    <DialogTitle>Enter Your Location</DialogTitle>
                    <DialogDescription>
                      Please enter your city or region to get localized
                      agricultural information.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="location" className="text-right">
                        Location
                      </Label>
                      <Input
                        id="location"
                        placeholder="e.g., New Delhi, India"
                        className="col-span-3"
                        value={manualLocation}
                        onChange={(e) => setManualLocation(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleManualLocationSubmit}>
                      Save Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {heavyRainfallAlert && (
          <Alert className="bg-blue-50 border-blue-200">
            <BellRing className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">
              Heavy Rainfall Alert
            </AlertTitle>
            <AlertDescription className="text-blue-700">
              Heavy rainfall expected on{" "}
              {heavyRainfallAlert.map((day: any) => day.date).join(", ")}.
              {!isSubscribed &&
                " Register for SMS alerts to get timely notifications."}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="assistant" className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 mx-auto">
            <TabsTrigger value="assistant">Chatbot</TabsTrigger>
            <TabsTrigger value="weather">Weather</TabsTrigger>
            <TabsTrigger value="market">Market Prices</TabsTrigger>
            <TabsTrigger value="health">Crop Health</TabsTrigger>
            <TabsTrigger value="iot">IoT & Predictions</TabsTrigger>
          </TabsList>

          <TabsContent value="assistant" className="space-y-4">
            <div className="flex justify-center">
              <div className="w-full max-w-5xl h-[80vh]">
                <Chatbot />
              </div>
            </div>{" "}
            {/* Replace VoiceAssistant with Chatbot */}
          </TabsContent>

          <TabsContent value="weather" className="space-y-4">
            <WeatherForecast location={location} />
          </TabsContent>

          <TabsContent value="market" className="space-y-4">
            <CropMarketPrices location={location} locationName={locationName} />
          </TabsContent>

          <TabsContent value="health" className="space-y-4">
            <CropHealthAnalysis />
          </TabsContent>

          <TabsContent value="iot" className="space-y-4">
            <IoTDashboard location={location} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
