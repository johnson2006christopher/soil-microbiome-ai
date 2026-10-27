// Realistic random reading for demos without hardware — always stored as SIMULATED
function generateSimulatedReading() {
  return {
    soilMoisture: parseFloat((Math.random() * 40 + 35).toFixed(1)),
    soilTemperature: parseFloat((Math.random() * 15 + 18).toFixed(1)),
    soilPh: parseFloat((Math.random() * 2 + 5.5).toFixed(2)),
    electricalConductivity: parseFloat((Math.random() * 1.5 + 0.3).toFixed(2)),
    bulkDensity: parseFloat((Math.random() * 0.4 + 1.0).toFixed(2)),
    organicMatter: parseFloat((Math.random() * 4 + 1.5).toFixed(1)),
    nitrogenPpm: parseFloat((Math.random() * 40 + 15).toFixed(1)),
    phosphorusPpm: parseFloat((Math.random() * 30 + 10).toFixed(1)),
    potassiumPpm: parseFloat((Math.random() * 200 + 80).toFixed(0)),
    calciumPpm: parseFloat((Math.random() * 1200 + 400).toFixed(0)),
    magnesiumPpm: parseFloat((Math.random() * 150 + 40).toFixed(0)),
    sulfurPpm: parseFloat((Math.random() * 35 + 8).toFixed(1)),
    microbialDiversityIndex: parseFloat((Math.random() * 4 + 2.5).toFixed(2)),
    nitrogenFixingBacteriaRatio: parseFloat((Math.random() * 25 + 10).toFixed(1)),
    mycorrhizalFungiPresence: Math.random() > 0.4,
    pathogenicFungiRatio: parseFloat((Math.random() * 8 + 0.5).toFixed(1)),
    bacterialCountCfu: parseFloat((Math.random() * 80 + 10).toFixed(1)),
    rainfallMm: parseFloat((Math.random() * 35).toFixed(1)),
    ambientTemperature: parseFloat((Math.random() * 14 + 20).toFixed(1)),
    humidity: parseFloat((Math.random() * 40 + 45).toFixed(1)),
    fertilizerKgPerHa: parseFloat((Math.random() * 250 + 100).toFixed(0)),
    previousYieldTons: parseFloat((Math.random() * 5 + 3).toFixed(2)),
    growingSeasonDays: Math.floor(Math.random() * 60) + 90,
  };
}

module.exports = { generateSimulatedReading };
