/* ========================================================================
   ORCA STORYTELLING — Data Module
   All scientific datasets for the story.
   ======================================================================== */

const tunaCatchesAndSurvivalData = {
    years: [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010],
    tunaCatchesTons: [784, 271, 520, 761, 680, 88, 193, 129, 52, 144, 101],
    calfSurvivalRate: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    thresholdStable: 573,
    thresholdGrowth: 687
};

const orcaPopulationData = {
    years: [1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011],
    totalAbundance: [11, 12, 12, 18, 19, 21, 32, 32, 35, 35, 34, 34, 39],
    interactingPodsINT: [11, 12, 12, 13, 14, 15, 15, 15, 15, 15, 15, 15, 18],
    births: [0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 2, 0, 9]
};

const energyAndDepredationMetrics = {
    year2004GroupINT: {
        individuals: 14,
        dailyEnergyKcal: 1000000,
        activeHuntingTunaPerDay: "21–141 tuna/day (size 1.5m–0.8m)",
        activeHuntingYearlyTons: 539,
        depredationYearlyTonsSeason: 92,
        depredationFishPerDay: "Max 8 large tuna (2m) per day"
    },
    year2011TotalCommunity: {
        individuals: 39,
        dailyEnergyKcal: 3200000,
        activeHuntingYearlyTons: 1654
    },
    tarifaCaseStudy2004: {
        boats: 48,
        landedTons: 597,
        tunaDepredatedByOrcas: 42,
        tunaBitten: 6,
        totalTunaProvidedKg: 8648
    }
};

/* ========================================================================
   Geographic Scene Configurations
   ======================================================================== */

const sceneLocations = {
    scene1: {
        center: [-5.6, 35.9],
        zoom: 4.5,
        pitch: 0,
        bearing: 0,
        markers: []
    },
    scene2: {
        center: [-5.58, 35.96],
        zoom: 9.5,
        pitch: 40,
        bearing: -20,
        markers: [
            { lng: -5.6046, lat: 36.0117, label: "Punta de Tarifa", type: "geo" },
            { lng: -5.5167, lat: 35.9052, label: "Punta Cires", type: "geo" }
        ]
    },
    scene3: {
        center: [-5.77, 35.96],
        zoom: 10.4,
        pitch: 45,
        bearing: 20,
        markers: [
            { lng: -5.755, lat: 35.948, label: "CSN — North Channel (290 m)", type: "sill-channel", code: "CSN" },
            { lng: -5.775, lat: 35.905, label: "CSS — South Channel (290 m)", type: "sill-channel", code: "CSS" },
            { lng: -5.840, lat: 35.880, label: "TB — Tangier Basin (~430 m)", type: "basin", code: "TB" },
            { lng: -5.970, lat: 35.860, label: "ESP — Espartel Sill (~360 m)", type: "basin", code: "ESP" },
            { lng: -5.798, lat: 36.065, label: "Punta Camarinal", type: "nature" },
            { lng: -5.605, lat: 36.013, label: "Tarifa", type: "town" },
            { lng: -5.853, lat: 36.136, label: "Zahara de los Atunes", type: "town" },
            { lng: -5.919, lat: 36.185, label: "Barbate", type: "town" },
            { lng: -6.088, lat: 36.277, label: "Conil de la Frontera", type: "town" },
            { lng: -5.810, lat: 35.780, label: "Tangier", type: "town" }
        ]
    },
    scene4: {
        center: [-5.45, 35.95],
        zoom: 9.2,
        pitch: 38,
        bearing: -15,
        markers: [
            { lng: -5.353, lat: 36.140, label: "Gibraltar (LIW northern entry)", type: "town" },
            { lng: -5.316, lat: 35.889, label: "Ceuta (WMDW southern entry)", type: "town" },
            { lng: -5.605, lat: 36.013, label: "Tarifa", type: "town" },
            { lng: -5.755, lat: 35.948, label: "CSN — LIW Outflow", type: "sill-channel", code: "CSN" },
            { lng: -5.775, lat: 35.905, label: "CSS — WMDW Outflow", type: "sill-channel", code: "CSS" }
        ]
    },
    scene5: {
        center: [-5.68, 36.02],
        zoom: 10,
        pitch: 35,
        bearing: 15,
        markers: []
    },
    scene6: {
        center: [-5.85, 36.18],
        zoom: 10.5,
        pitch: 45,
        bearing: -25,
        markers: [
            { lng: -6.092, lat: 36.289, label: "Almadraba de Conil", type: "almadraba" },
            { lng: -5.862, lat: 36.14, label: "Almadraba de Zahara", type: "almadraba" },
            { lng: -5.926, lat: 36.19, label: "Almadraba de Barbate", type: "almadraba" },
            { lng: -5.62, lat: 36.02, label: "Almadraba de Tarifa", type: "almadraba" }
        ]
    }
};

/* Camarinal Sill (CS) Transect line across the Strait (Morocco to Spain) */
const camarinalTransectCoordinates = [
    [-5.765, 35.850],
    [-5.775, 35.905], // CSS site
    [-5.768, 35.928], // Central submarine ridge
    [-5.755, 35.948], // CSN site
    [-5.778, 36.012],
    [-5.798, 36.050]  // Punta Camarinal (Spain)
];

/* Real Camarinal Sill (CS) bathymetry cross-section (South to North: Morocco to Spain)
   Reference: CSN and CSS mooring stations and bathymetric profile from reference sketch */
const bathymetryProfile = [
    { lat: 35.850, depth: 0, label: "Morocco" },
    { lat: 35.858, depth: -40 },
    { lat: 35.870, depth: -110 },
    { lat: 35.885, depth: -200 },
    { lat: 35.905, depth: -290, label: "CSS", isMooring: true, name: "Camarinal Sill South (290 m)" },
    { lat: 35.918, depth: -240 },
    { lat: 35.928, depth: -180, label: "Crest", name: "Central Ridge (180 m)" },
    { lat: 35.938, depth: -230 },
    { lat: 35.948, depth: -290, label: "CSN", isMooring: true, name: "Camarinal Sill North (290 m)" },
    { lat: 35.962, depth: -190 },
    { lat: 35.978, depth: -120, label: "Ridge", name: "Submerged Ridge (120 m)" },
    { lat: 35.992, depth: -230 },
    { lat: 36.012, depth: -140 },
    { lat: 36.030, depth: -50 },
    { lat: 36.050, depth: 0, label: "Spain", name: "Punta Camarinal" }
];
