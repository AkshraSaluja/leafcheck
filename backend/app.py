import os
import json
import numpy as np

from PIL import Image, UnidentifiedImageError
from flask import Flask, jsonify, request
from flask_cors import CORS
from tensorflow.keras.models import load_model


# -----------------------------
# File paths
# -----------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "plant_disease_model.h5")
CLASS_NAMES_PATH = os.path.join(BASE_DIR, "class_names.json")


# -----------------------------
# Flask app
# -----------------------------

app = Flask(__name__)
CORS(app)

# Maximum uploaded image size = 10 MB
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024


# -----------------------------
# Load class names
# -----------------------------

with open(CLASS_NAMES_PATH, "r") as f:
    class_names = json.load(f)


# -----------------------------
# Load trained ML model
# -----------------------------

model = None

if os.path.exists(MODEL_PATH):
    model = load_model(MODEL_PATH)
    print("Plant disease model loaded successfully.")
else:
    print("Model file not found yet. Waiting for training to finish.")


# -----------------------------
# Helper function
# -----------------------------

def parse_label(label):

    crop_raw, disease_raw = label.split("___", 1)

    if crop_raw == "Pepper,_bell":
        crop = "Pepper"
    else:
        crop = crop_raw.replace("_", " ")

    disease = disease_raw.replace("_", " ")

    healthy = disease_raw.lower() == "healthy"

    if healthy:
        disease = "Healthy"

    return crop, disease, healthy


# -----------------------------
# Health endpoint
# -----------------------------

@app.route("/health", methods=["GET"])
def health():

    return jsonify({
        "status": "ok"
    }), 200


# -----------------------------
# Prediction endpoint
# -----------------------------

@app.route("/predict", methods=["POST"])
def predict():

    # Model must be available
    if model is None:
        return jsonify({
            "error": "Model is not available yet."
        }), 503

    # Check whether image field exists
    if "image" not in request.files:
        return jsonify({
            "error": "No image file provided. Use form field 'image'."
        }), 400

    file = request.files["image"]

    # Check whether a file was actually selected
    if not file or file.filename == "":
        return jsonify({
            "error": "No image selected."
        }), 400

    try:

        # Open image and convert to RGB
        image = Image.open(file.stream).convert("RGB")

        # Same size used during model training
        image = image.resize((128, 128))

        # Convert image to numpy array
        image_array = np.asarray(
            image,
            dtype=np.float32
        )

        # Normalize pixel values from 0-255 to 0-1
        image_array = image_array / 255.0

        # Add batch dimension
        image_array = np.expand_dims(
            image_array,
            axis=0
        )

        # Run prediction
        predictions = model.predict(
            image_array,
            verbose=0
        )[0]

        # Highest probability class
        predicted_index = int(
            np.argmax(predictions)
        )

        # Confidence percentage
        confidence = float(
            predictions[predicted_index] * 100
        )

        # Convert index to disease label
        label = class_names[
            str(predicted_index)
        ]

        # Split label into API fields
        crop, disease, healthy = parse_label(label)

        # Return final result
        return jsonify({
            "crop": crop,
            "disease": disease,
            "healthy": healthy,
            "confidence": round(confidence, 2)
        }), 200

    except (UnidentifiedImageError, OSError, ValueError):

        return jsonify({
            "error": "Invalid image file."
        }), 400

    except Exception:

        app.logger.exception("Prediction failed")

        return jsonify({
            "error": "Prediction failed."
        }), 500


# -----------------------------
# File too large error
# -----------------------------

@app.errorhandler(413)
def file_too_large(error):

    return jsonify({
        "error": "Image file is too large."
    }), 413


# -----------------------------
# Run Flask server
# -----------------------------

if __name__ == "__main__":
    app.run(
        debug=True,
        port=5000,
        use_reloader=False
    )