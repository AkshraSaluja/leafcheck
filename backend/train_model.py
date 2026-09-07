import os
import json
import numpy as np
import tensorflow as tf

from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Dense, Dropout, GlobalAveragePooling2D


# -----------------------------
# Paths
# -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)

DATASET_PATH = os.path.join(PROJECT_ROOT, "train")
MODEL_PATH = os.path.join(BASE_DIR, "plant_disease_model.h5")
CLASS_NAMES_PATH = os.path.join(BASE_DIR, "class_names.json")


# -----------------------------
# Reproducibility
# -----------------------------
SEED = 42
np.random.seed(SEED)
tf.random.set_seed(SEED)


# -----------------------------
# Data Generators
# -----------------------------
data_gen = ImageDataGenerator(
    rescale=1.0 / 255,
    validation_split=0.1
)

train_generator = data_gen.flow_from_directory(
    DATASET_PATH,
    target_size=(128, 128),
    batch_size=64,
    class_mode="categorical",
    subset="training",
    seed=SEED
)

val_generator = data_gen.flow_from_directory(
    DATASET_PATH,
    target_size=(128, 128),
    batch_size=64,
    class_mode="categorical",
    subset="validation",
    seed=SEED
)


# -----------------------------
# Model
# -----------------------------
num_classes = len(train_generator.class_indices)

base_model = MobileNetV2(
    weights="imagenet",
    include_top=False,
    input_shape=(128, 128, 3)
)

base_model.trainable = False

x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dropout(0.4)(x)
x = Dense(128, activation="relu")(x)
x = Dropout(0.3)(x)

predictions = Dense(
    num_classes,
    activation="softmax"
)(x)

model_plant = Model(
    inputs=base_model.input,
    outputs=predictions
)

model_plant.compile(
    optimizer="adam",
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)


# -----------------------------
# Training
# -----------------------------
print("\nStarting model training...\n")

history = model_plant.fit(
    train_generator,
    epochs=60,
    validation_data=val_generator
)


# -----------------------------
# Evaluation
# -----------------------------
loss, accuracy = model_plant.evaluate(val_generator)

print(f"\nValidation Accuracy: {accuracy * 100:.2f}%")


# -----------------------------
# Save Model
# -----------------------------
model_plant.save(MODEL_PATH)

print("\nModel saved successfully:")
print(MODEL_PATH)


# -----------------------------
# Show detected class mapping
# -----------------------------
print("\nTraining class mapping:")
print(train_generator.class_indices)