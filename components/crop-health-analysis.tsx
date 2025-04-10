"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Camera, Upload, Leaf, Bug, Droplets, Pill, AlertTriangle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function CropHealthAnalysis() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [captureMode, setCaptureMode] = useState(false)
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isCropImage, setIsCropImage] = useState<boolean | null>(null)
  const { toast } = useToast()

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Clean up video stream when component unmounts
  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [videoStream])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid File",
          description: "Please select an image file.",
          variant: "destructive",
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const imageDataUrl = event.target?.result as string
        setSelectedImage(imageDataUrl)
        setAnalysisResult(null)
        setIsCropImage(null) // Reset crop validation
      }
      reader.readAsDataURL(file)
    }
  }

  const startCamera = async () => {
    setCameraError(null)
    try {
      // Request camera access with specific constraints for better mobile compatibility
      const constraints = {
        video: {
          facingMode: "environment", // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      setVideoStream(stream)
      setCaptureMode(true)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        // Ensure video is playing before capture
        videoRef.current.play().catch((err) => {
          console.error("Error playing video:", err)
          setCameraError("Failed to start video preview. Please try again.")
        })
      }
    } catch (error: any) {
      console.error("Error accessing camera:", error)
      setCameraError(error.message || "Unable to access your camera. Please check permissions.")
      toast({
        title: "Camera Error",
        description: error.message || "Unable to access your camera. Please check permissions.",
        variant: "destructive",
      })
    }
  }

  const captureImage = () => {
    if (videoRef.current && canvasRef.current && videoStream) {
      const video = videoRef.current
      const canvas = canvasRef.current

      // Make sure video dimensions are set
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        toast({
          title: "Camera Error",
          description: "Video stream not ready. Please try again.",
          variant: "destructive",
        })
        return
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw the video frame to the canvas
      const context = canvas.getContext("2d")
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        try {
          // Convert canvas to image data URL
          const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9)
          setSelectedImage(imageDataUrl)
          setAnalysisResult(null)
          setIsCropImage(null) // Reset crop validation
          stopCamera()
        } catch (err) {
          console.error("Error capturing image:", err)
          toast({
            title: "Capture Error",
            description: "Failed to capture image. Please try again.",
            variant: "destructive",
          })
        }
      }
    } else {
      toast({
        title: "Camera Error",
        description: "Camera not initialized properly. Please try again.",
        variant: "destructive",
      })
    }
  }

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop())
      setVideoStream(null)
    }
    setCaptureMode(false)
    setCameraError(null)
  }

  const validateCropImage = async (imageData: string) => {
    try {
      // Call API to validate if the image is of a crop
      const response = await fetch("/api/validate-crop-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageData }),
      })

      const data = await response.json()
      return data.isCrop
    } catch (error) {
      console.error("Error validating crop image:", error)
      return true // Default to true in case of error to allow analysis
    }
  }

  const analyzeImage = async () => {
    if (!selectedImage) return

    setIsAnalyzing(true)

    try {
      // First validate if it's a crop image
      const isCrop = await validateCropImage(selectedImage)
      setIsCropImage(isCrop)

      if (!isCrop) {
        toast({
          title: "Not a Crop",
          description: "Stop fooling around, it's not a crop! Please upload an image of a crop.",
          variant: "destructive",
        })
        setIsAnalyzing(false)
        return
      }

      // Convert base64 image to blob for upload
      const response = await fetch("/api/analyze-crop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: selectedImage }),
      })

      const data = await response.json()

      if (data.success) {
        setAnalysisResult(data.result)
        toast({
          title: "Analysis Complete",
          description: "Crop health analysis has been completed successfully.",
        })
      } else {
        throw new Error(data.message || "Analysis failed")
      }
    } catch (error: any) {
      console.error("Error analyzing image:", error)
      toast({
        title: "Analysis Error",
        description: error.message || "Failed to analyze the crop image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resetAnalysis = () => {
    setSelectedImage(null)
    setAnalysisResult(null)
    setIsCropImage(null)
    if (captureMode) {
      stopCamera()
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Crop Health Analysis</CardTitle>
          <CardDescription>
            Upload or take a photo of your crop to analyze its health and get recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!captureMode && !selectedImage && (
            <div className="flex flex-col space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary transition-colors cursor-pointer"
                  onClick={triggerFileInput}
                >
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <Label htmlFor="cropImage" className="cursor-pointer text-primary font-medium">
                    Upload Image
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">Upload a clear image of your crop</p>
                  <Input
                    id="cropImage"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                <div
                  className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary transition-colors cursor-pointer"
                  onClick={startCamera}
                >
                  <Camera className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-primary font-medium">Take Photo</p>
                  <p className="text-sm text-muted-foreground mt-1">Use your camera to take a photo</p>
                </div>
              </div>
            </div>
          )}

          {captureMode && (
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-full max-w-md mx-auto">
                {cameraError ? (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Camera Error</AlertTitle>
                    <AlertDescription>{cameraError}</AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg border border-gray-300" />
                    <canvas ref={canvasRef} className="hidden" />
                  </>
                )}
              </div>
              <div className="flex space-x-2">
                <Button onClick={captureImage} className="flex items-center" disabled={!!cameraError}>
                  <Camera className="h-4 w-4 mr-2" />
                  Capture
                </Button>
                <Button variant="outline" onClick={stopCamera}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {selectedImage && !analysisResult && (
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-full max-w-md mx-auto">
                <img
                  src={selectedImage || "/placeholder.svg"}
                  alt="Selected crop"
                  className="w-full rounded-lg border border-gray-300"
                />
              </div>

              {isCropImage === false && (
                <Alert variant="destructive" className="w-full max-w-md">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Not a Crop Image</AlertTitle>
                  <AlertDescription>
                    Stop fooling around, it's not a crop! Please upload an image of a crop.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex space-x-2">
                <Button onClick={analyzeImage} disabled={isAnalyzing || isCropImage === false}>
                  {isAnalyzing ? (
                    <>
                      <span className="mr-2">Analyzing...</span>
                      <Progress value={45} className="w-20" />
                    </>
                  ) : (
                    "Analyze Crop Health"
                  )}
                </Button>
                <Button variant="outline" onClick={resetAnalysis}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {analysisResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <img
                    src={selectedImage! || "/placeholder.svg"}
                    alt="Analyzed crop"
                    className="w-full rounded-lg border border-gray-300"
                  />
                </div>

                <div className="space-y-4">
                  <Tabs defaultValue="overview">
                    <TabsList className="grid grid-cols-3 w-full">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="disease">Disease</TabsTrigger>
                      <TabsTrigger value="treatment">Treatment</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Leaf
                          className={`h-5 w-5 ${
                            analysisResult.healthScore > 70
                              ? "text-green-500"
                              : analysisResult.healthScore > 40
                                ? "text-yellow-500"
                                : "text-red-500"
                          }`}
                        />
                        <h3 className="font-semibold">Health Score: {analysisResult.healthScore}%</h3>
                      </div>

                      <Progress
                        value={analysisResult.healthScore}
                        className={`h-2 ${
                          analysisResult.healthScore > 70
                            ? "bg-green-100"
                            : analysisResult.healthScore > 40
                              ? "bg-yellow-100"
                              : "bg-red-100"
                        }`}
                      />

                      <div>
                        <h4 className="font-medium mb-1">Crop Type</h4>
                        <p>{analysisResult.cropType}</p>
                      </div>

                      <div>
                        <h4 className="font-medium mb-1">Growth Stage</h4>
                        <p>{analysisResult.growthStage}</p>
                      </div>

                      <Alert
                        className={`${
                          analysisResult.healthStatus === "Healthy"
                            ? "bg-green-50 border-green-200"
                            : analysisResult.healthStatus === "Moderate Issues"
                              ? "bg-yellow-50 border-yellow-200"
                              : "bg-red-50 border-red-200"
                        }`}
                      >
                        <AlertTitle>{analysisResult.healthStatus}</AlertTitle>
                        <AlertDescription>{analysisResult.summary}</AlertDescription>
                      </Alert>
                    </TabsContent>

                    <TabsContent value="disease" className="space-y-4">
                      {analysisResult.diseases.length > 0 ? (
                        analysisResult.diseases.map((disease, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Bug className="h-5 w-5 text-red-500" />
                              <h3 className="font-semibold">{disease.name}</h3>
                            </div>
                            <p className="text-sm">{disease.description}</p>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium">Confidence:</span>
                              <Progress value={disease.confidence} className="h-2 w-24" />
                              <span className="text-sm">{disease.confidence}%</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <Alert className="bg-green-50 border-green-200">
                          <Leaf className="h-4 w-4 text-green-500" />
                          <AlertTitle>No Diseases Detected</AlertTitle>
                          <AlertDescription>Your crop appears to be free from common diseases.</AlertDescription>
                        </Alert>
                      )}
                    </TabsContent>

                    <TabsContent value="treatment" className="space-y-4">
                      {analysisResult.recommendations.map((rec, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-start space-x-2">
                            {rec.type === "fertilizer" ? (
                              <Pill className="h-5 w-5 text-blue-500 mt-0.5" />
                            ) : rec.type === "pesticide" ? (
                              <Bug className="h-5 w-5 text-red-500 mt-0.5" />
                            ) : (
                              <Droplets className="h-5 w-5 text-blue-500 mt-0.5" />
                            )}
                            <div>
                              <h3 className="font-semibold">{rec.title}</h3>
                              <p className="text-sm">{rec.description}</p>

                              {rec.products && rec.products.length > 0 && (
                                <div className="mt-2">
                                  <h4 className="text-sm font-medium mb-1">Recommended Products:</h4>
                                  <ul className="text-sm space-y-1">
                                    {rec.products.map((product, pidx) => (
                                      <li key={pidx}>
                                        {product.name} - {product.quantity}
                                        {product.storeInfo && (
                                          <span className="text-xs text-muted-foreground ml-1">
                                            (Available at {product.storeInfo})
                                          </span>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={resetAnalysis}>
                  Analyze Another Image
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
