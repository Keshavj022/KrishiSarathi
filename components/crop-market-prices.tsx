"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CropMarketPricesProps {
  location: { lat: number; lng: number } | null;
  locationName: string;
}

interface MarketData {
  markets: Array<{
    name: string;
    distance: number;
    crops: Array<{
      name: string;
      price: number;
      unit: string;
      trend: "up" | "down" | "stable";
      changePercent: number;
    }>;
  }>;
}

export default function CropMarketPrices({ location, locationName }: CropMarketPricesProps) {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchMarketData() {
      if (!location) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/market-prices?lat=${location.lat}&lng=${location.lng}`);
        const data = await response.json();

        if (data.success) {
          setMarketData(data.marketData);
        } else {
          throw new Error(data.message || "Failed to fetch market data");
        }
      } catch (error) {
        console.error("Error fetching market data:", error);
        toast({
          title: "Market Data Error",
          description: "Failed to fetch crop market prices. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchMarketData();
  }, [location, toast]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Crop Market Prices</CardTitle>
          <CardDescription>Loading market data for your location...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[200px] w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!location) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Crop Market Prices</CardTitle>
          <CardDescription>Location data is required for market prices</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Location Required</AlertTitle>
            <AlertDescription>
              Please set your location using the "Change Location" button at the top of the page to view crop market
              prices.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!marketData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Crop Market Prices</CardTitle>
          <CardDescription>Unable to load market data</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Failed to load market data. Please try again later.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for chart
  const chartData: any = [];
  const cropNames = new Set<string>();

  marketData.markets.forEach((market) => {
    market.crops.forEach((crop) => {
      cropNames.add(crop.name);
    });
  });

  marketData.markets.forEach((market) => {
    const marketData: any = { market: market.name };

    market.crops.forEach((crop) => {
      marketData[crop.name] = crop.price;
    });

    chartData.push(marketData);
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Crop Market Prices</CardTitle>
          <CardDescription>Current market prices for crops near {locationName || "your location"}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 50, right: 30, left: 20, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="market" />
                <YAxis label={{ value: "Price (₹/unit)", angle: -90, position: "insideLeft" }} />
                <Tooltip
                  wrapperStyle={{
                    zIndex: 1000,
                    pointerEvents: "none",
                  }}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    transform: "translate(-100px, 260px)",
                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                  }}
                  cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
                />
                <Legend verticalAlign="top" height={36} />
                {Array.from(cropNames).map((crop, index) => (
                  <Bar key={crop} dataKey={crop} fill={`hsl(${index * 30}, 70%, 50%)`} name={crop} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {marketData.markets.map((market, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>{market.name}</CardTitle>
            <CardDescription>{market.distance.toFixed(1)} km from your location</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Crop</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Trend</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {market.crops.map((crop, cropIndex) => (
                  <TableRow key={cropIndex}>
                    <TableCell className="font-medium">{crop.name}</TableCell>
                    <TableCell>
                      ₹{crop.price}/{crop.unit}
                    </TableCell>
                    <TableCell>{getTrendIcon(crop.trend)}</TableCell>
                    <TableCell
                      className={`text-right ${
                        crop.trend === "up"
                          ? "text-green-600"
                          : crop.trend === "down"
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {crop.changePercent > 0 ? "+" : ""}
                      {crop.changePercent}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}