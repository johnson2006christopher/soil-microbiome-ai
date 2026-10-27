// Human-readable names for model features and CNN classes shown in the UI.

const FEATURE_LABELS = {
  soilMoisture: 'Soil moisture',
  soilTemperature: 'Soil temperature',
  soilPh: 'Soil pH',
  electricalConductivity: 'Electrical conductivity (EC)',
  bulkDensity: 'Bulk density',
  organicMatter: 'Organic matter',
  nitrogenPpm: 'Nitrogen (N)',
  phosphorusPpm: 'Phosphorus (P)',
  potassiumPpm: 'Potassium (K)',
  calciumPpm: 'Calcium (Ca)',
  magnesiumPpm: 'Magnesium (Mg)',
  sulfurPpm: 'Sulfur (S)',
  microbialDiversityIndex: 'Microbial diversity',
  nitrogenFixingBacteriaRatio: 'Nitrogen-fixing bacteria',
  mycorrhizalFungiPresence: 'Mycorrhizal fungi',
  pathogenicFungiRatio: 'Pathogenic fungi',
  bacterialCountCfu: 'Bacterial count',
  rainfallMm: 'Rainfall',
  ambientTemperature: 'Air temperature',
  humidity: 'Humidity',
  fertilizerKgPerHa: 'Fertilizer applied',
  previousYieldTons: 'Previous yield',
  growingSeasonDays: 'Growing season length',
  cropTypeEncoded: 'Crop type',
};

export function featureLabel(key) {
  return FEATURE_LABELS[key] || key.replace(/([A-Z])/g, ' $1').trim();
}

// "Tomato___Late_blight" -> "Tomato › Late blight"; "Corn___Common_rust" -> "Corn › Common rust"
export function formatClassName(cls) {
  if (!cls) return '';
  return cls.split('___').map((part) => part.replace(/_/g, ' ').trim()).join(' › ');
}
