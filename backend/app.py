import os
import json
import numpy as np
from PIL import Image, UnidentifiedImageError
from flask import Flask, jsonify, request
from flask_cors import CORS
try:
    from tf_keras.models import load_model
except ImportError:
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

        # Check for optional crop filter
        requested_crop = (request.form.get("crop") or request.args.get("crop") or "").strip().lower()

        crop_prefix = None
        if requested_crop in ["potato", "potatoes"]:
            crop_prefix = "Potato___"
        elif requested_crop in ["tomato", "tomatoes"]:
            crop_prefix = "Tomato___"
        elif requested_crop in ["capsicum", "pepper", "peppers", "bell_pepper"]:
            crop_prefix = "Pepper,_bell___"

        if crop_prefix:
            candidate_indices = [
                int(idx) for idx, name in class_names.items()
                if name.startswith(crop_prefix)
            ]
        else:
            candidate_indices = [int(idx) for idx in class_names.keys()]

        # Filter predictions to candidate classes
        candidate_probs = [float(predictions[i]) for i in candidate_indices]
        best_candidate_sub_index = int(np.argmax(candidate_probs))
        predicted_index = candidate_indices[best_candidate_sub_index]

        # Confidence percentage (normalized among candidate classes if filtered)
        if crop_prefix and sum(candidate_probs) > 0:
            confidence = float((candidate_probs[best_candidate_sub_index] / sum(candidate_probs)) * 100)
        else:
            confidence = float(predictions[predicted_index] * 100)

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
    port = int(os.environ.get("PORT", 5000))
    app.run(
        host="0.0.0.0",
        port=port,
        debug=False,
        use_reloader=False
    )