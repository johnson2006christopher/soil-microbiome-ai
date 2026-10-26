"""
Evaluate a trained CNN on its held-out test split (data/test/<crop>/).

The test images are never used for training or checkpoint selection, so this
is the accuracy to report. Preprocessing matches predict_image_from_bytes().
Results are stored under cnn_metrics.json -> <crop> -> "test".

Usage (from ml-engine/):
    python scripts/evaluate_cnn.py tomato
"""

import json
import os
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from model.cnn_trainer import CNN_ARTIFACTS_DIR  # noqa: E402


def main(crop: str, test_root: str = "data/test"):
    import tensorflow as tf
    from sklearn.metrics import classification_report, confusion_matrix
    from tensorflow.keras.applications.efficientnet import preprocess_input

    model = tf.keras.models.load_model(os.path.join(CNN_ARTIFACTS_DIR, f"{crop}_model.keras"))
    with open(os.path.join(CNN_ARTIFACTS_DIR, f"{crop}_classes.json")) as f:
        class_indices = json.load(f)
    labels = [name for name, _ in sorted(class_indices.items(), key=lambda kv: kv[1])]

    images, y_true = [], []
    for name, idx in class_indices.items():
        class_dir = os.path.join(test_root, crop, name)
        for file in sorted(os.listdir(class_dir)):
            img = Image.open(os.path.join(class_dir, file)).convert("RGB").resize((224, 224))
            images.append(np.array(img, dtype=np.float32))
            y_true.append(idx)

    x = preprocess_input(np.stack(images))
    y_pred = np.argmax(model.predict(x, batch_size=32, verbose=0), axis=1)
    y_true = np.array(y_true)

    report = classification_report(y_true, y_pred, target_names=labels, output_dict=True)
    test_metrics = {
        "accuracy": round(float(report["accuracy"]), 4),
        "samples": int(len(y_true)),
        "per_class": {
            name: {
                "precision": round(report[name]["precision"], 4),
                "recall": round(report[name]["recall"], 4),
                "f1_score": round(report[name]["f1-score"], 4),
                "support": int(report[name]["support"]),
            }
            for name in labels
        },
        "confusion_matrix": confusion_matrix(y_true, y_pred).tolist(),
        "labels": labels,
        "dataset": "PlantVillage (Mohanty et al., 2016), CC BY-SA 3.0 — held-out test split",
    }

    metrics_path = os.path.join(CNN_ARTIFACTS_DIR, "cnn_metrics.json")
    with open(metrics_path) as f:
        metrics = json.load(f)
    metrics.setdefault(crop, {})["test"] = test_metrics
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"{crop}: test accuracy {test_metrics['accuracy']:.4f} on {test_metrics['samples']} images")
    for name in labels:
        print(f"  {name:42} recall={test_metrics['per_class'][name]['recall']:.3f}")


if __name__ == "__main__":
    main(sys.argv[1])
