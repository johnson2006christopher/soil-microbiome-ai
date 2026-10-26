"""
Build the tomato and corn CNN datasets from a PlantVillage checkout.

Source: https://github.com/spMohanty/PlantVillage-Dataset (raw/color).
Licence: CC BY-SA 3.0 — cite Mohanty, Hughes & Salathé (2016),
"Using deep learning for image-based plant disease detection",
Frontiers in Plant Science 7:1419. Images are never committed to this repo.

For each class it shuffles deterministically, holds out a TEST split the model
never sees during training (data/test/<crop>/...), and caps the training pool
(data/<crop>/...; the trainer further splits it 80/20 into train/val).
Folder names are renamed to the class keys the app's recommendations use.

Usage (from ml-engine/):
    python scripts/prepare_plantvillage.py <PlantVillage-Dataset>/raw/color
"""

import random
import shutil
import sys
from pathlib import Path

CLASS_MAP = {
    "tomato": {
        "Tomato___Bacterial_spot": "Tomato___Bacterial_spot",
        "Tomato___Early_blight": "Tomato___Early_blight",
        "Tomato___Late_blight": "Tomato___Late_blight",
        "Tomato___Leaf_Mold": "Tomato___Leaf_Mold",
        "Tomato___Septoria_leaf_spot": "Tomato___Septoria_leaf_spot",
        "Tomato___Spider_mites Two-spotted_spider_mite": "Tomato___Spider_mites",
        "Tomato___Target_Spot": "Tomato___Target_Spot",
        "Tomato___Tomato_Yellow_Leaf_Curl_Virus": "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
        "Tomato___Tomato_mosaic_virus": "Tomato___Tomato_mosaic_virus",
        "Tomato___healthy": "Tomato___healthy",
    },
    "corn": {
        "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": "Corn___Cercospora_leaf_spot",
        "Corn_(maize)___Common_rust_": "Corn___Common_rust",
        "Corn_(maize)___Northern_Leaf_Blight": "Corn___Northern_Leaf_Blight",
        "Corn_(maize)___healthy": "Corn___healthy",
    },
}

TEST_PER_CLASS = 150
TRAIN_PER_CLASS = 600
IMAGE_EXTS = {".jpg", ".jpeg", ".png"}


def main(source_root: str, out_root: str = "data", seed: int = 42):
    source = Path(source_root)
    out = Path(out_root)
    rng = random.Random(seed)

    for crop, classes in CLASS_MAP.items():
        for crop_dir in (out / crop, out / "test" / crop):
            if crop_dir.exists():
                shutil.rmtree(crop_dir)

        for source_name, class_key in classes.items():
            images = sorted(
                p for p in (source / source_name).iterdir() if p.suffix.lower() in IMAGE_EXTS
            )
            if not images:
                raise SystemExit(f"No images found in {source / source_name}")
            rng.shuffle(images)

            test = images[:TEST_PER_CLASS]
            train = images[TEST_PER_CLASS:TEST_PER_CLASS + TRAIN_PER_CLASS]

            for split, files in ((out / crop, train), (out / "test" / crop, test)):
                target = split / class_key
                target.mkdir(parents=True, exist_ok=True)
                for image in files:
                    shutil.copy2(image, target / image.name)

            print(f"{crop:6} {class_key:42} train+val={len(train):4} test={len(test)}")


if __name__ == "__main__":
    main(sys.argv[1])
