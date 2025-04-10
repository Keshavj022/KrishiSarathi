"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { AlertTriangle, Droplets, Thermometer, Waves, Leaf, Sprout, BarChart3 } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface IoTDashboardProps {
  location: { lat: number; lng: number } | null
}

interface SensorData {
  soilMoisture: Array<{ timestamp: string; value: number }>
  soilTemperature: Array<{ timestamp: string; value: number }>
  soilPH: Array<{ timestamp: string; value: number }>
  soilNutrients: {
    nitrogen: number
    phosphorus: number
    potassium: number
  }
  lastUpdated: string
}

interface CropRecommendation {
  crops: Array<{
    name: string
    suitabilityScore: number
    description: string
    waterRequirement: string
    growthDuration: string
    expectedYield: string
  }>
}

export default function IoTDashboard({ location }: IoTDashboardProps) {
  const [sensorData, setSensorData] = useState<SensorData | null>(null)
  const [cropRecommendations, setCropRecommendations] = useState<CropRecommendation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchSensorData()
  }, [location])

  const fetchSensorData = async () => {
    if (!location) {
      setIsLoading(false)
      return
    }

    try {
      setIsRefreshing(true)
      const response = await fetch(`/api/sensor-data?lat=${location.lat}&lng=${location.lng}`)
      const data = await response.json()

      if (data.success) {
        setSensorData(data.sensorData)

        // After getting sensor data, fetch crop recommendations
        const recResponse = await fetch("/api/crop-recommendations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sensorData: data.sensorData,
            location: { lat: location.lat, lng: location.lng },
          }),
        })

        const recData = await recResponse.json()
        if (recData.success) {
          setCropRecommendations(recData.recommendations)
        }
      } else {
        throw new Error(data.message || "Failed to fetch sensor data")
      }
    } catch (error) {
      console.error("Error fetching IoT data:", error)
      toast({
        title: "IoT Data Error",
        description: "Failed to fetch sensor data. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>IoT Dashboard & Crop Recommendations</CardTitle>
          <CardDescription>Loading sensor data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-[300px] w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-[100px] w-full" />
              <Skeleton className="h-[100px] w-full" />
              <Skeleton className="h-[100px] w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!location) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>IoT Dashboard & Crop Recommendations</CardTitle>
          <CardDescription>Location data is required for IoT integration</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Location Required</AlertTitle>
            <AlertDescription>
              Please set your location using the "Change Location" button at the top of the page to view IoT data and
              crop recommendations.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!sensorData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>IoT Dashboard & Crop Recommendations</CardTitle>
          <CardDescription>Unable to load sensor data</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load sensor data. Please check your IoT device connection or try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const nutrientData = [
    { name: "Nitrogen", value: sensorData.soilNutrients.nitrogen },
    { name: "Phosphorus", value: sensorData.soilNutrients.phosphorus },
    { name: "Potassium", value: sensorData.soilNutrients.potassium },
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">IoT Sensor Dashboard</h2>
        <Button variant="outline" onClick={fetchSensorData} disabled={isRefreshing} className="flex items-center">
          {isRefreshing ? "Refreshing..." : "Refresh Data"}
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">Last updated: {sensorData.lastUpdated}</div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Droplets className="h-5 w-5 mr-2 text-blue-500" />
              Soil Moisture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {sensorData.soilMoisture[sensorData.soilMoisture.length - 1].value}%
            </div>
            <p className="text-sm text-muted-foreground">
              {sensorData.soilMoisture[sensorData.soilMoisture.length - 1].value < 30
                ? "Low moisture - Consider irrigation"
                : sensorData.soilMoisture[sensorData.soilMoisture.length - 1].value > 70
                  ? "High moisture - Reduce irrigation"
                  : "Optimal moisture level"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Thermometer className="h-5 w-5 mr-2 text-red-500" />
              Soil Temperature
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {sensorData.soilTemperature[sensorData.soilTemperature.length - 1].value}°C
            </div>
            <p className="text-sm text-muted-foreground">
              {sensorData.soilTemperature[sensorData.soilTemperature.length - 1].value < 15
                ? "Low temperature - May slow growth"
                : sensorData.soilTemperature[sensorData.soilTemperature.length - 1].value > 30
                  ? "High temperature - Monitor water needs"
                  : "Optimal temperature range"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Waves className="h-5 w-5 mr-2 text-purple-500" />
              Soil pH
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{sensorData.soilPH[sensorData.soilPH.length - 1].value.toFixed(1)}</div>
            <p className="text-sm text-muted-foreground">
              {sensorData.soilPH[sensorData.soilPH.length - 1].value < 6
                ? "Acidic soil - Consider lime application"
                : sensorData.soilPH[sensorData.soilPH.length - 1].value > 7.5
                  ? "Alkaline soil - Consider sulfur application"
                  : "Neutral pH - Optimal for most crops"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="moisture" className="space-y-4">
        <TabsList className="grid grid-cols-3 md:w-[400px]">
          <TabsTrigger value="moisture">Moisture</TabsTrigger>
          <TabsTrigger value="temperature">Temperature</TabsTrigger>
          <TabsTrigger value="ph">pH</TabsTrigger>
        </TabsList>

        <TabsContent value="moisture">
          <Card>
            <CardHeader>
              <CardTitle>Soil Moisture Trends</CardTitle>
              <CardDescription>24-hour soil moisture data from IoT sensors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sensorData.soilMoisture}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis domain={[0, 100]} label={{ value: "Moisture (%)", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#0088FE" name="Soil Moisture %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="temperature">
          <Card>
            <CardHeader>
              <CardTitle>Soil Temperature Trends</CardTitle>
              <CardDescription>24-hour soil temperature data from IoT sensors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sensorData.soilTemperature}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis domain={[0, 40]} label={{ value: "Temperature (°C)", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#FF8042" name="Soil Temperature °C" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ph">
          <Card>
            <CardHeader>
              <CardTitle>Soil pH Trends</CardTitle>
              <CardDescription>24-hour soil pH data from IoT sensors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sensorData.soilPH}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis domain={[0, 14]} label={{ value: "pH Level", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" name="Soil pH" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-green-500" />
            Soil Nutrient Composition
          </CardTitle>
          <CardDescription>Current NPK (Nitrogen, Phosphorus, Potassium) levels in soil</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={nutrientData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {nutrientData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-col justify-center">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nutrient</TableHead>
                    <TableHead>Value (mg/kg)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Nitrogen (N)</TableCell>
                    <TableCell>{sensorData.soilNutrients.nitrogen}</TableCell>
                    <TableCell>
                      {sensorData.soilNutrients.nitrogen < 150 ? (
                        <span className="text-red-500">Low</span>
                      ) : sensorData.soilNutrients.nitrogen < 300 ? (
                        <span className="text-yellow-500">Medium</span>
                      ) : (
                        <span className="text-green-500">High</span>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Phosphorus (P)</TableCell>
                    <TableCell>{sensorData.soilNutrients.phosphorus}</TableCell>
                    <TableCell>
                      {sensorData.soilNutrients.phosphorus < 10 ? (
                        <span className="text-red-500">Low</span>
                      ) : sensorData.soilNutrients.phosphorus < 25 ? (
                        <span className="text-yellow-500">Medium</span>
                      ) : (
                        <span className="text-green-500">High</span>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Potassium (K)</TableCell>
                    <TableCell>{sensorData.soilNutrients.potassium}</TableCell>
                    <TableCell>
                      {sensorData.soilNutrients.potassium < 150 ? (
                        <span className="text-red-500">Low</span>
                      ) : sensorData.soilNutrients.potassium < 250 ? (
                        <span className="text-yellow-500">Medium</span>
                      ) : (
                        <span className="text-green-500">High</span>
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {cropRecommendations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sprout className="h-5 w-5 mr-2 text-green-500" />
              Crop Recommendations
            </CardTitle>
            <CardDescription>Based on soil conditions, weather patterns, and IoT sensor data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {cropRecommendations.crops.map((crop, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <Leaf
                        className={`h-5 w-5 mr-2 ${
                          crop.suitabilityScore > 80
                            ? "text-green-500"
                            : crop.suitabilityScore > 60
                              ? "text-yellow-500"
                              : "text-orange-500"
                        }`}
                      />
                      <h3 className="text-lg font-semibold">{crop.name}</h3>
                    </div>
                    <div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium">
                      {crop.suitabilityScore}% Suitable
                    </div>
                  </div>

                  <p className="mt-2 text-sm text-muted-foreground">{crop.description}</p>

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Water Requirement</span>
                      <span className="font-medium">{crop.waterRequirement}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Growth Duration</span>
                      <span className="font-medium">{crop.growthDuration}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Expected Yield</span>
                      <span className="font-medium">{crop.expectedYield}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-800">Model Integration Point</h3>
            <p className="text-sm text-yellow-700">
              To integrate your custom prediction model, replace the placeholder implementation in{" "}
              <code>/api/crop-recommendations.ts</code> with your model path. The API is designed to accept sensor data
              and location information, then return crop recommendations based on your model's predictions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
