"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface AssessmentResult {
  damage_probability: number;
  damage_percentage: number;
  damage_level: string;
  damage_description: string;
  compensation_amount: number;
  confidence: number;
}

export default function PostDisasterAnalysis() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedImage);

      const response = await fetch("/api/damage-assessment", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.result);
      } else {
        setError(data.error || "Failed to assess damage");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during assessment");
    } finally {
      setLoading(false);
    }
  };

  const getDamageLevelColor = (level: string) => {
    switch (level) {
      case "Minor":
        return "text-green-600 bg-green-100";
      case "Moderate":
        return "text-yellow-600 bg-yellow-100";
      case "Severe":
        return "text-orange-600 bg-orange-100";
      case "Critical":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Post-Disaster Damage Assessment
          </h1>
          <p className="text-gray-600">
            Upload building images to assess damage level and estimate compensation
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Upload Damaged Building Image
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div>
                <label
                  htmlFor="image-upload"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Building Image
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-red-400 transition cursor-pointer">
                  <div className="space-y-1 text-center">
                    {previewUrl ? (
                      <div className="relative w-full h-64">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="mx-auto h-64 w-auto object-contain rounded-lg"
                        />
                      </div>
                    ) : (
                      <>
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="text-sm text-gray-600">
                          <label
                            htmlFor="image-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-red-600 hover:text-red-500"
                          >
                            <span>Upload a file</span>
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, JPEG up to 10MB
                        </p>
                      </>
                    )}
                    <input
                      id="image-upload"
                      name="image-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageSelect}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!selectedImage || loading}
                className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Assessing Damage..." : "Assess Damage"}
              </button>
            </form>

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">⚠️ {error}</p>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Assessment Results
            </h2>

            {!result && !loading && (
              <div className="flex items-center justify-center h-64 text-gray-400">
                <div className="text-center">
                  <p className="text-lg">No assessment yet</p>
                  <p className="text-sm mt-2">Upload an image to begin</p>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Analyzing damage...</p>
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                {/* Damage Level Badge */}
                <div>
                  <span
                    className={`inline-block px-6 py-3 rounded-full text-lg font-bold ${getDamageLevelColor(
                      result.damage_level
                    )}`}
                  >
                    {result.damage_level} Damage
                  </span>
                </div>

                {/* Damage Percentage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Damage Severity
                  </label>
                  <div className="relative pt-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {result.damage_percentage}%
                      </span>
                      <span className="text-sm text-gray-600">
                        Confidence: {result.confidence}%
                      </span>
                    </div>
                    <div className="overflow-hidden h-4 text-xs flex rounded-full bg-gray-200">
                      <div
                        style={{ width: `${result.damage_percentage}%` }}
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                          result.damage_level === "Minor"
                            ? "bg-green-500"
                            : result.damage_level === "Moderate"
                            ? "bg-yellow-500"
                            : result.damage_level === "Severe"
                            ? "bg-orange-500"
                            : "bg-red-500"
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Compensation Amount */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Compensation
                  </label>
                  <div className="text-4xl font-bold text-green-700">
                    ₹{result.compensation_amount.toLocaleString("en-IN")}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Based on {result.damage_percentage}% damage severity
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assessment Details
                  </label>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {result.damage_description}
                  </p>
                </div>

                {/* Additional Info */}
                <div className="border-t pt-4">
                  <p className="text-xs text-gray-500">
                    ⚠️ This is an AI-generated estimate. Final compensation will be
                    determined by official assessment teams and government policies.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* How it Works */}
        <div className="mt-12 bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📸</span>
              </div>
              <h3 className="font-bold mb-2">1. Upload Image</h3>
              <p className="text-sm text-gray-600">
                Take a photo of the damaged building
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="font-bold mb-2">2. AI Analysis</h3>
              <p className="text-sm text-gray-600">
                Our ResNet50 model analyzes structural damage
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="font-bold mb-2">3. Get Assessment</h3>
              <p className="text-sm text-gray-600">
                Receive damage level and severity percentage
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="font-bold mb-2">4. Compensation</h3>
              <p className="text-sm text-gray-600">
                Get estimated compensation amount (up to ₹5 lakh)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
