from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import transforms, models
import io
import os

app = Flask(__name__)
CORS(app)

# Configuration
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "damage_model.pth")
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
MAX_COMPENSATION = 500000  # ₹5 lakh

# Image transformation
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# Load model
model = models.resnet50(weights=None)
model.fc = nn.Linear(model.fc.in_features, 2)
model = model.to(DEVICE)

# Load trained weights
if os.path.exists(MODEL_PATH):
    model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
    model.eval()
    print(f"✅ Model loaded from {MODEL_PATH}")
else:
    print(f"⚠️  Warning: Model file not found at {MODEL_PATH}")

# Classes
CLASSES = ["Damaged", "Undamaged"]


def predict_and_calculate(image_bytes):
    """
    Predict damage probability and calculate compensation
    """
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img_tensor = transform(img).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        output = model(img_tensor)
        probs = F.softmax(output, dim=1)

    # Get probability of Damaged class
    damaged_index = CLASSES.index("Damaged")
    damage_probability = probs[0][damaged_index].item()

    # Compensation scaling (0 to 5 lakh)
    compensation = damage_probability * MAX_COMPENSATION

    # Determine damage level
    if damage_probability < 0.3:
        damage_level = "Minor"
        description = "Minimal structural damage, mostly cosmetic repairs needed"
    elif damage_probability < 0.6:
        damage_level = "Moderate"
        description = "Significant damage requiring repairs and partial reconstruction"
    elif damage_probability < 0.85:
        damage_level = "Severe"
        description = "Major structural damage, extensive reconstruction required"
    else:
        damage_level = "Critical"
        description = "Complete or near-complete destruction, full reconstruction needed"

    return {
        "damage_probability": damage_probability,
        "damage_percentage": round(damage_probability * 100, 2),
        "damage_level": damage_level,
        "damage_description": description,
        "compensation_amount": int(compensation),
        "confidence": round(damage_probability * 100, 2)
    }


@app.route('/api/assess-damage', methods=['POST'])
def assess_damage():
    """
    API endpoint to assess damage from uploaded image
    """
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    image_file = request.files['image']

    if image_file.filename == '':
        return jsonify({"error": "No image selected"}), 400

    try:
        # Read image bytes
        image_bytes = image_file.read()

        # Get prediction and compensation
        result = predict_and_calculate(image_bytes)

        return jsonify({
            "success": True,
            "result": result
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_loaded": os.path.exists(MODEL_PATH),
        "device": str(DEVICE)
    }), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
