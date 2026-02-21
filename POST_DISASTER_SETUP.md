# Post-Disaster Damage Assessment Setup

## Overview
The post-disaster damage assessment system uses a ResNet50 deep learning model to analyze building damage from images and estimate compensation amounts (up to ₹5 lakh).

## Setup Instructions

### 1. Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Start the Damage Assessment API
```bash
cd backend
python damage_assessment_api.py
```
The API will run on `http://localhost:5001`

### 3. Start the Next.js Application
```bash
# In the root directory
npm install
npm run dev
```

### 4. Access the Post-Disaster Page
Navigate to: `http://localhost:3000/post-disaster`

## API Endpoints

### POST /api/assess-damage
Upload an image to assess damage and get compensation estimate.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: `image` (File)

**Response:**
```json
{
  "success": true,
  "result": {
    "damage_probability": 0.75,
    "damage_percentage": 75.0,
    "damage_level": "Severe",
    "damage_description": "Major structural damage, extensive reconstruction required",
    "compensation_amount": 375000,
    "confidence": 75.0
  }
}
```

### GET /health
Check API health status.

## Damage Levels

| Level | Damage % | Compensation Range | Description |
|-------|----------|-------------------|-------------|
| Minor | 0-30% | ₹0 - ₹1.5L | Minimal structural damage, cosmetic repairs |
| Moderate | 30-60% | ₹1.5L - ₹3L | Significant damage, repairs needed |
| Severe | 60-85% | ₹3L - ₹4.25L | Major structural damage, extensive reconstruction |
| Critical | 85-100% | ₹4.25L - ₹5L | Complete destruction, full reconstruction |

## Model Details
- **Architecture:** ResNet50 (pretrained on ImageNet)
- **Classes:** Damaged, Undamaged
- **Input Size:** 224x224 pixels
- **Max Compensation:** ₹5,00,000

## Features
- 🔍 AI-powered damage detection
- 📊 Severity percentage calculation
- 💰 Automatic compensation estimation
- 📸 Simple image upload interface
- ⚡ Fast inference (<2 seconds)

## Troubleshooting

### Model not found error
Ensure `damage_model.pth` exists in `backend/models/` directory.

### CORS errors
The Flask API has CORS enabled. Check that the API is running on port 5001.

### Image upload fails
- Check file size (max 10MB)
- Supported formats: JPG, JPEG, PNG
- Ensure proper image format

## Environment Variables
Create a `.env.local` file in the root directory:
```
DAMAGE_ASSESSMENT_API_URL=http://localhost:5001
```
