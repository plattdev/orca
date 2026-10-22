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
        center: [-5.78, 36.05],
        zoom: 11,
        pitch: 50,
        bearing: 30,
        markers: [
            { lng: -5.798, lat: 36.065, label: "Punta Camarinal", type: "nature" },
            { lng: -5.75, lat: 35.933, label: "Camarinal Sill (~280m)", type: "bathymetry" },
            { lng: -5.853, lat: 36.136, label: "Zahara de los Atunes", type: "town" },
            { lng: -5.919, lat: 36.185, label: "Barbate", type: "town" },
            { lng: -6.088, lat: 36.277, label: "Conil de la Frontera", type: "town" },
            { lng: -5.605, lat: 36.013, label: "Tarifa", type: "town" }
        ]
    },
    scene4: {
        center: [-5.6, 35.92],
        zoom: 8.5,
        pitch: 30,
        bearing: -10,
        markers: []
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

/* Bathymetry cross-section data (approximate depths in meters) */
const bathymetryProfile = [
    { x: 0, depth: -300, label: "Atlantic" },
    { x: 40, depth: -700 },
    { x: 80, depth: -850 },
    { x: 120, depth: -900 },
    { x: 160, depth: -700 },
    { x: 200, depth: -280, label: "Camarinal Sill" },
    { x: 240, depth: -450 },
    { x: 280, depth: -600 },
    { x: 320, depth: -800 },
    { x: 360, depth: -700 },
    { x: 400, depth: -400, label: "Mediterranean" }
];
