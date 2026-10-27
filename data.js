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
        zoom: 4.8,
        pitch: 0,
        bearing: 0,
        markers: [
            { lng: -5.6, lat: 35.98, label: "Strait of Gibraltar (14 km)", type: "geo" }
        ]
    },
    scene2: {
        center: [-5.68, 35.96],
        zoom: 9.8,
        pitch: 42,
        bearing: -15,
        markers: [
            { lng: -5.755, lat: 35.948, label: "CSN — North Channel (290 m)", type: "sill-channel", code: "CSN" },
            { lng: -5.775, lat: 35.905, label: "CSS — South Channel (290 m)", type: "sill-channel", code: "CSS" },
            { lng: -5.798, lat: 36.065, label: "Punta Camarinal", type: "nature" },
            { lng: -5.6046, lat: 36.0117, label: "Punta de Tarifa", type: "geo" },
            { lng: -5.5167, lat: 35.9052, label: "Punta Cires", type: "geo" }
        ]
    },
    scene3: {
        center: [-38, 32],
        zoom: 2.8,
        pitch: 0,
        bearing: 0,
        markers: [
            { lng: -88.0, lat: 26.0, label: "Gulf of Mexico — W. Spawning Ground", type: "nature" },
            { lng: -5.6, lat: 36.0, label: "Strait of Gibraltar — Gateway (187 kg avg)", type: "geo" },
            { lng: 6.0, lat: 39.0, label: "Mediterranean — E. Spawning Ground", type: "nature" },
            { lng: -65.0, lat: 42.0, label: "Grand Banks — Atlantic Foraging", type: "nature" }
        ]
    },
    scene4: {
        center: [-5.73, 35.95],
        zoom: 10.4,
        pitch: 35,
        bearing: 15,
        markers: [
            { lng: -5.73, lat: 35.92, label: "Las Bajas — Orca Arena (6.9 km², 6-h tide)", type: "nature" },
            { lng: -5.605, lat: 36.013, label: "Tarifa", type: "town" },
            { lng: -5.810, lat: 35.780, label: "Tangier", type: "town" }
        ]
    },
    scene5: {
        center: [-5.82, 36.08],
        zoom: 10.2,
        pitch: 45,
        bearing: -20,
        markers: [
            { lng: -5.73, lat: 35.92, label: "Las Bajas — Stone Fishing Ground (8.7 lines/km²)", type: "nature" },
            { lng: -6.092, lat: 36.289, label: "Almadraba de Conil", type: "almadraba" },
            { lng: -5.862, lat: 36.14, label: "Almadraba de Zahara", type: "almadraba" },
            { lng: -5.926, lat: 36.19, label: "Almadraba de Barbate", type: "almadraba" },
            { lng: -5.62, lat: 36.02, label: "Almadraba de Tarifa", type: "almadraba" }
        ]
    },
    scene6: {
        center: [-5.73, 35.93],
        zoom: 11.2,
        pitch: 42,
        bearing: 10,
        markers: [
            { lng: -5.73, lat: 35.92, label: "Las Bajas — Depredation Zone (Pods A1 & A2)", type: "nature" },
            { lng: -5.605, lat: 36.013, label: "Tarifa (Artisanal Fleet)", type: "town" }
        ]
    },
    closing: {
        center: [-5.6, 35.95],
        zoom: 6.2,
        pitch: 0,
        bearing: 0,
        markers: []
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
