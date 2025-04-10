import { NextResponse } from "next/server";

// --- Type Definitions ---
interface SensorReading {
  value: number;
}

interface SoilNutrients {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
}

interface SensorData {
  soilMoisture: SensorReading[];
  soilTemperature: SensorReading[];
  soilPH: SensorReading[];
  soilNutrients: SoilNutrients;
}

interface Location {
  lat: number;
  lng: number;
}

interface CropRecommendation {
  name: string;
  suitabilityScore: number;
  description: string;
  waterRequirement: string;
  growthDuration: string;
  expectedYield: string;
}

// --- Main API Handler ---
export async function POST(request: Request) {
  try {
    // Parse JSON from the request body
    const { sensorData, location } = await request.json() as {
      sensorData: SensorData;
      location: Location;
    };

    if (!sensorData || !location) {
      return NextResponse.json(
        { success: false, message: "Sensor data and location are required" },
        { status: 400 }
      );
    }

    // In a real application, you would integrate your ML model here.
    // For demo purposes, we simulate crop recommendations.
    try {
      // Example: Prepare input data for your model
      const inputData = [
        sensorData.soilMoisture[sensorData.soilMoisture.length - 1].value,
        sensorData.soilTemperature[sensorData.soilTemperature.length - 1].value,
        sensorData.soilPH[sensorData.soilPH.length - 1].value,
        sensorData.soilNutrients.nitrogen,
        sensorData.soilNutrients.phosphorus,
        sensorData.soilNutrients.potassium,
        location.lat,
        location.lng,
      ];

      // MODEL INTEGRATION POINT (e.g., using TensorFlow.js)
      // const tf = require('@tensorflow/tfjs-node');
      // const model = await tf.loadLayersModel(modelPath);
      // const tensorData = tf.tensor2d([inputData]);
      // const prediction = await model.predict(tensorData);
      // const predictionData = await prediction.array();
      // tensorData.dispose();
      // const recommendations = processPredictionResults(predictionData[0]);

      // For now, until your model is integrated, use simulated recommendations
      const recommendations = generateCropRecommendations(sensorData);

      return NextResponse.json({
        success: true,
        recommendations,
      });
    } catch (error) {
      console.error("Error in model prediction:", error);
      // Fallback to simulated recommendations if model prediction fails
      const recommendations = generateCropRecommendations(sensorData);

      return NextResponse.json({
        success: true,
        recommendations,
        modelError: "Model prediction failed, using simulated data instead",
      });
    }
  } catch (error) {
    console.error("Error generating crop recommendations:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate crop recommendations" },
      { status: 500 }
    );
  }
}

// --- Helper Functions ---

// Processes raw model output to structured crop recommendations.
// (This function can be modified based on your model's output format.)
function processPredictionResults(predictions: number[]) {
  const cropNames = [
    "Rice",
    "Wheat",
    "Maize",
    "Soybean",
    "Cotton",
    "Sugarcane",
    "Potato",
    "Tomato",
  ];

  const cropData = predictions
    .map((score, index) => {
      if (index >= cropNames.length) return null;

      return {
        name: cropNames[index],
        suitabilityScore: Math.round(score * 100), // Assuming score is between 0 and 1
        description: getCropDescription(cropNames[index]),
        waterRequirement: getCropWaterRequirement(cropNames[index]),
        growthDuration: getCropGrowthDuration(cropNames[index]),
        expectedYield: getCropExpectedYield(cropNames[index]),
      } as CropRecommendation;
    })
    .filter((crop): crop is CropRecommendation => crop !== null);

  cropData.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

  // Return top 4 recommendations
  return {
    crops: cropData.slice(0, 4),
  };
}

// Generates simulated crop recommendations based on sensor data.
function generateCropRecommendations(sensorData: SensorData) {
  const currentMoisture = sensorData.soilMoisture[sensorData.soilMoisture.length - 1].value;
  const currentTemperature = sensorData.soilTemperature[sensorData.soilTemperature.length - 1].value;
  const currentPH = sensorData.soilPH[sensorData.soilPH.length - 1].value;
  const { nitrogen, phosphorus, potassium } = sensorData.soilNutrients;

  // Define crop requirements with optimal ranges and other data
  const cropRequirements = [
    {
      name: "Rice",
      moistureRange: [60, 90] as [number, number],
      temperatureRange: [20, 35] as [number, number],
      phRange: [5.5, 6.5] as [number, number],
      nitrogenRange: [120, 300] as [number, number],
      phosphorusRange: [20, 40] as [number, number],
      potassiumRange: [150, 300] as [number, number],
      waterRequirement: "High",
      growthDuration: "90-120 days",
      expectedYield: "4-6 tons/hectare",
      description: "A staple food crop that thrives in wet conditions with good nitrogen levels.",
    },
    {
      name: "Wheat",
      moistureRange: [45, 65] as [number, number],
      temperatureRange: [15, 25] as [number, number],
      phRange: [6.0, 7.5] as [number, number],
      nitrogenRange: [100, 250] as [number, number],
      phosphorusRange: [15, 35] as [number, number],
      potassiumRange: [100, 250] as [number, number],
      waterRequirement: "Medium",
      growthDuration: "100-130 days",
      expectedYield: "3-5 tons/hectare",
      description: "A cool-season crop that performs well in well-drained soils with moderate fertility.",
    },
    {
      name: "Maize (Corn)",
      moistureRange: [50, 75] as [number, number],
      temperatureRange: [18, 32] as [number, number],
      phRange: [5.8, 7.0] as [number, number],
      nitrogenRange: [150, 300] as [number, number],
      phosphorusRange: [20, 40] as [number, number],
      potassiumRange: [150, 300] as [number, number],
      waterRequirement: "Medium-High",
      growthDuration: "80-110 days",
      expectedYield: "5-8 tons/hectare",
      description: "A versatile crop that requires good nitrogen levels and moderate water.",
    },
    {
      name: "Soybean",
      moistureRange: [50, 70] as [number, number],
      temperatureRange: [20, 30] as [number, number],
      phRange: [6.0, 7.0] as [number, number],
      nitrogenRange: [50, 200] as [number, number],
      phosphorusRange: [20, 40] as [number, number],
      potassiumRange: [150, 300] as [number, number],
      waterRequirement: "Medium",
      growthDuration: "90-120 days",
      expectedYield: "2-4 tons/hectare",
      description: "A legume that can fix nitrogen and performs well in well-drained soils.",
    },
    {
      name: "Cotton",
      moistureRange: [40, 60] as [number, number],
      temperatureRange: [20, 35] as [number, number],
      phRange: [5.8, 7.2] as [number, number],
      nitrogenRange: [100, 250] as [number, number],
      phosphorusRange: [15, 35] as [number, number],
      potassiumRange: [150, 300] as [number, number],
      waterRequirement: "Medium",
      growthDuration: "150-180 days",
      expectedYield: "2-3 tons/hectare",
      description: "A fiber crop that requires warm temperatures and moderate water.",
    },
    {
      name: "Tomato",
      moistureRange: [50, 70] as [number, number],
      temperatureRange: [20, 30] as [number, number],
      phRange: [6.0, 7.0] as [number, number],
      nitrogenRange: [100, 250] as [number, number],
      phosphorusRange: [20, 40] as [number, number],
      potassiumRange: [150, 300] as [number, number],
      waterRequirement: "Medium",
      growthDuration: "90-120 days",
      expectedYield: "40-60 tons/hectare",
      description: "A vegetable crop that requires balanced nutrients and consistent moisture.",
    },
    {
      name: "Potato",
      moistureRange: [60, 80] as [number, number],
      temperatureRange: [15, 25] as [number, number],
      phRange: [5.0, 6.5] as [number, number],
      nitrogenRange: [150, 300] as [number, number],
      phosphorusRange: [20, 40] as [number, number],
      potassiumRange: [200, 350] as [number, number],
      waterRequirement: "Medium-High",
      growthDuration: "90-120 days",
      expectedYield: "25-35 tons/hectare",
      description: "A tuber crop that performs well in loose, well-drained soils with good potassium levels.",
    },
    {
      name: "Sugarcane",
      moistureRange: [65, 85] as [number, number],
      temperatureRange: [25, 35] as [number, number],
      phRange: [6.0, 7.5] as [number, number],
      nitrogenRange: [150, 350] as [number, number],
      phosphorusRange: [15, 35] as [number, number],
      potassiumRange: [150, 300] as [number, number],
      waterRequirement: "High",
      growthDuration: "10-12 months",
      expectedYield: "70-100 tons/hectare",
      description: "A perennial crop that requires high moisture and good nitrogen levels.",
    },
  ];

  // Evaluate each crop's suitability score based on sensor readings
  const cropScores = cropRequirements.map((crop) => {
    const moistureScore = calculateParameterScore(currentMoisture, crop.moistureRange);
    const temperatureScore = calculateParameterScore(currentTemperature, crop.temperatureRange);
    const phScore = calculateParameterScore(currentPH, crop.phRange);
    const nitrogenScore = calculateParameterScore(nitrogen, crop.nitrogenRange);
    const phosphorusScore = calculateParameterScore(phosphorus, crop.phosphorusRange);
    const potassiumScore = calculateParameterScore(potassium, crop.potassiumRange);

    const overallScore = Math.round(
      moistureScore * 0.2 +
      temperatureScore * 0.2 +
      phScore * 0.15 +
      nitrogenScore * 0.15 +
      phosphorusScore * 0.15 +
      potassiumScore * 0.15
    );

    return {
      name: crop.name,
      suitabilityScore: overallScore,
      description: crop.description,
      waterRequirement: crop.waterRequirement,
      growthDuration: crop.growthDuration,
      expectedYield: crop.expectedYield,
    };
  });

  // Sort by highest suitability score
  cropScores.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

  // Return the top 4 crop recommendations
  return {
    crops: cropScores.slice(0, 4),
  };
}

// Calculates a parameter score based on how far the current value is from the optimal range.
function calculateParameterScore(currentValue: number, optimalRange: [number, number]): number {
  const [min, max] = optimalRange;
  if (currentValue >= min && currentValue <= max) {
    // Within optimal range
    return 100;
  } else if (currentValue < min) {
    // Below optimal range
    const distance = min - currentValue;
    const rangeSize = max - min;
    return Math.max(0, 100 - (distance / (rangeSize / 2)) * 100);
  } else {
    // Above optimal range
    const distance = currentValue - max;
    const rangeSize = max - min;
    return Math.max(0, 100 - (distance / (rangeSize / 2)) * 100);
  }
}
