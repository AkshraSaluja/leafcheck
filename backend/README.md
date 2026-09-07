# LeafLens AI Backend

Flask backend API for the LeafLens AI plant disease detection application.

The backend accepts a leaf image, preprocesses it, runs it through the trained plant disease classification model, and returns the predicted crop, disease, health status, and confidence score.

## Model

- Architecture: MobileNetV2
- Input size: 128 x 128 pixels
- Input format: RGB image
- Normalization: pixel values scaled from 0-255 to 0-1
- Model file: `plant_disease_model.h5`
- Class mapping: `class_names.json`

## API Endpoints

### Health Check

`GET /health`

Response:

```json
{
  "status": "ok"
}
```

### Predict Plant Disease

`POST /predict`

Request type:

`multipart/form-data`

Image field name:

`image`

Example successful response:

```json
{
  "crop": "Tomato",
  "disease": "Early blight",
  "healthy": false,
  "confidence": 94.21
}
```

## Run Locally

Activate the virtual environment:

```bash
source venv/bin/activate
```

Start the Flask server:

```bash
python3 app.py
```

The API will run at:

`http://127.0.0.1:5000`

## Test Health Endpoint

```bash
curl http://127.0.0.1:5000/health
```

## Test Prediction Endpoint

```bash
curl -X POST \
  -F "image=@/path/to/leaf.jpg" \
  http://127.0.0.1:5000/predict
```

## Error Handling

The API returns JSON error responses for:

- Missing image
- Empty image selection
- Invalid image files
- Images larger than 10 MB
- Prediction failures
- Model unavailable