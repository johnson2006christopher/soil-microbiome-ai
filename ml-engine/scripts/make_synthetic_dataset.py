"""
Build a fully synthetic training set for the tabular yield model.

There is no real yield data yet. This takes a feature profile CSV (soil readings
without yields), lets generate_synthetic_supplement() produce rows whose yields
follow the agronomic rules in preprocessor.py, and keeps ONLY the synthetic rows.
Every output row is tagged source=synthetic.

Usage (from ml-engine/):
    python -m scripts.make_synthetic_dataset data/feature_profile.csv data/sensor_data.csv
"""

import sys

import numpy as np
import pandas as pd

from model.features import CROP_TYPE_ENCODING
from model.preprocessor import generate_synthetic_supplement


def main(profile_path: str, out_path: str, n: int = 1500):
    np.random.seed(42)
    profile = pd.read_csv(profile_path)
    if not pd.api.types.is_numeric_dtype(profile["cropTypeEncoded"]):
        profile["cropTypeEncoded"] = profile["cropTypeEncoded"].map(CROP_TYPE_ENCODING)

    combined = generate_synthetic_supplement(profile, n=n)
    synthetic = combined[combined["source"] == "synthetic"]
    synthetic.to_csv(out_path, index=False)
    print(f"Wrote {len(synthetic)} synthetic rows to {out_path}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
