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
    years: [1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2015, 2018, 2021, 2023],
    totalAbundance: [11, 12, 12, 18, 19, 21, 32, 32, 35, 35, 34, 34, 39, 33, 34, 35, 36, 37],
    interactingPodsINT: [11, 12, 12, 13, 14, 15, 15, 15, 15, 15, 15, 15, 18, 18, 18, 18, 18, 18],
    births: [0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 2, 0, 4, 1, 2, 2, 1, 1]
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
        markers: [
            { lng: -5.6, lat: 35.98, label: "Strait of Gibraltar (14 km)", type: "geo" }
        ]
    },
    scene2: {
        center: [-5.68, 35.96],
        zoom: 9.6,
        pitch: 42,
        bearing: -15,
        markers: [
            { lng: -5.42, lat: 35.99, label: "Transect A", sublabel: "Along-Strait Section (W–E)", type: "transect-a", alwaysShow: true, anchor: "bottom" },
            { lng: -5.788, lat: 36.022, label: "Transect B", sublabel: "Camarinal Sill Section (S–N)", type: "transect-b", alwaysShow: true, anchor: "right" }
        ]
    },
    scene3: {
        center: [-42.5, 33.0],
        zoom: 2.3,
        pitch: 0,
        bearing: 0,
        markers: [
            { lng: -89.0, lat: 25.8, label: "Gulf of Mexico", sublabel: "W. Spawning Ground", type: "nature", alwaysShow: true, anchor: "right" },
            { lng: -58.0, lat: 40.6, label: "Grand Banks", sublabel: "Atlantic Foraging", type: "nature", alwaysShow: true, anchor: "bottom" },
            { lng: 4.60, lat: 38.45, label: "Balearic Sea", sublabel: "Med. Spawning", type: "nature", alwaysShow: true, anchor: "bottom" }
        ]
    },
    scene4: {
        center: [-6.2, 39.5],
        zoom: 5.2,
        pitch: 0,
        bearing: 0,
        markers: [
            { lng: -5.73, lat: 35.92, label: "Strait of Gibraltar & Las Bajas", sublabel: "Summer Core (Jul–Aug · All 6 communities)", type: "orca-core", alwaysShow: true, anchor: "top" },
            { lng: -6.28, lat: 36.28, label: "Gulf of Cádiz Shelf", sublabel: "Spring Core (Apr–Jun · Almadraba corridor)", type: "orca-core", alwaysShow: true, anchor: "right" },
            { lng: -9.15, lat: 37.05, label: "Algarve & SW Portugal", sublabel: "Summer–Autumn Range (Esteban et al., 2026)", type: "orca-range", alwaysShow: true, anchor: "right" },
            { lng: -9.65, lat: 39.05, label: "Central Portugal Shelf", sublabel: "Lisbon–Nazaré Transit Zone", type: "orca-range", alwaysShow: true, anchor: "right" },
            { lng: -9.45, lat: 42.85, label: "Galicia & Finisterre", sublabel: "Late-Summer Foraging Ground", type: "orca-range", alwaysShow: true, anchor: "right" },
            { lng: -4.20, lat: 43.85, label: "Cantabrian Sea & Biscay", sublabel: "Northern Autumn Range", type: "orca-range", alwaysShow: true, anchor: "bottom" }
        ]
    },
    scene5: {
        center: [-5.85, 36.13],
        zoom: 9.8,
        pitch: 45,
        bearing: -20,
        markers: [
            { lng: -6.092, lat: 36.289, type: "almadraba" },
            { lng: -5.926, lat: 36.19, type: "almadraba" },
            { lng: -5.862, lat: 36.14, type: "almadraba" },
            { lng: -5.62, lat: 36.02, type: "almadraba" }
        ]
    },
    scene6: {
        center: [-5.71, 35.90],
        zoom: 9.9,
        pitch: 16,
        bearing: 0,
        markers: [
            { lng: -5.73, lat: 35.92, label: "Las Bajas Bank (6.9 km²)", sublabel: "Pods A1 & A2 · 300+ m lines", type: "nature", alwaysShow: true, anchor: "bottom" }
        ]
    },
    closing: {
        center: [-6.092, 36.289],
        zoom: 9.6,
        pitch: 20,
        bearing: -10,
        markers: []
    }
};

/* Transect A: Along-Strait ODV Section (6.1°W Atlantic entrance to 5.2°W Western Alborán Sea) */
const alongStraitTransectCoordinates = [
    [-6.100, 35.885], // Atlantic entrance (6.1°W)
    [-5.970, 35.895], // Espartel Sill (358 m)
    [-5.860, 35.908], // Tangier Basin
    [-5.768, 35.928], // Camarinal Sill (~280 m)
    [-5.600, 35.962], // Tarifa Narrows (~585 m)
    [-5.400, 35.990], // Eastern Strait channel
    [-5.200, 36.015]  // Western Alborán Sea (5.2°W)
];

/* Transect B: Camarinal Sill S–N Transect across the Strait (Morocco to Spain) */
const camarinalTransectCoordinates = [
    [-5.765, 35.850],
    [-5.775, 35.905],
    [-5.768, 35.928], // Central submarine ridge
    [-5.755, 35.948],
    [-5.778, 36.012],
    [-5.798, 36.050]  // Spain coast
];

/* Real Camarinal Sill bathymetry cross-section (South to North: Morocco to Spain) */
const bathymetryProfile = [
    { lat: 35.850, depth: 0, label: "Morocco" },
    { lat: 35.858, depth: -40 },
    { lat: 35.870, depth: -110 },
    { lat: 35.885, depth: -200 },
    { lat: 35.905, depth: -290 },
    { lat: 35.918, depth: -240 },
    { lat: 35.928, depth: -180, label: "Crest", name: "Central Ridge (180 m)" },
    { lat: 35.938, depth: -230 },
    { lat: 35.948, depth: -290 },
    { lat: 35.962, depth: -190 },
    { lat: 35.978, depth: -120, label: "Ridge", name: "Submerged Ridge (120 m)" },
    { lat: 35.992, depth: -230 },
    { lat: 36.012, depth: -140 },
    { lat: 36.030, depth: -50 },
    { lat: 36.050, depth: 0, label: "Spain", name: "Spain" }
];

/* Documented Habitat & Sightings Zones of the Iberian Killer Whale Subpopulation
   Sources: Esteban et al. (2013, 2016a) Advances in Marine Biology;
            Esteban et al. (2022) IWC SC/68D/SM/03;
            Esteban et al. (2026) Marine Mammal Science (Fig. 1: Areas A, B & C) */
const iberianOrcaHabitatZones = {
    type: "FeatureCollection",
    features: [
        {
            type: "Feature",
            properties: {
                id: "strait-summer-core",
                name: "Strait of Gibraltar & Las Bajas (Summer Core · Jul–Aug)",
                tier: "core"
            },
            geometry: {
                type: "Polygon",
                coordinates: [[
                    [-5.88, 35.81],
                    [-5.50, 35.86],
                    [-5.46, 35.99],
                    [-5.62, 36.02],
                    [-5.82, 36.05],
                    [-5.92, 35.92],
                    [-5.88, 35.81]
                ]]
            }
        },
        {
            type: "Feature",
            properties: {
                id: "cadiz-spring-core",
                name: "Gulf of Cádiz Shelf (Spring Core · Apr–Jun)",
                tier: "core"
            },
            geometry: {
                type: "Polygon",
                coordinates: [[
                    [-6.58, 36.06],
                    [-5.82, 36.02],
                    [-5.85, 36.12],
                    [-6.05, 36.20],
                    [-6.22, 36.38],
                    [-6.42, 36.56],
                    [-6.78, 36.46],
                    [-6.58, 36.06]
                ]]
            }
        },
        {
            type: "Feature",
            properties: {
                id: "algarve-sw-portugal",
                name: "Southern & SW Portugal (Algarve – Cape St. Vincent – Sines)",
                tier: "range"
            },
            geometry: {
                type: "Polygon",
                coordinates: [[
                    [-9.42, 36.72],
                    [-7.65, 36.70],
                    [-7.72, 36.98],
                    [-8.95, 37.02],
                    [-8.90, 38.05],
                    [-9.38, 38.05],
                    [-9.42, 36.72]
                ]]
            }
        },
        {
            type: "Feature",
            properties: {
                id: "central-portugal",
                name: "Central-West Portugal (Lisbon – Cabo da Roca – Nazaré)",
                tier: "range"
            },
            geometry: {
                type: "Polygon",
                coordinates: [[
                    [-9.95, 38.45],
                    [-9.25, 38.45],
                    [-9.48, 38.80],
                    [-9.38, 39.38],
                    [-9.08, 39.68],
                    [-9.12, 40.25],
                    [-9.68, 40.25],
                    [-9.95, 38.90],
                    [-9.95, 38.45]
                ]]
            }
        },
        {
            type: "Feature",
            properties: {
                id: "galicia-shelf",
                name: "Galicia Shelf (Rías Baixas – Cape Finisterre – Ortegal)",
                tier: "range"
            },
            geometry: {
                type: "Polygon",
                coordinates: [[
                    [-9.82, 41.95],
                    [-8.92, 41.95],
                    [-9.30, 42.88],
                    [-8.45, 43.42],
                    [-7.55, 43.78],
                    [-7.55, 44.15],
                    [-8.95, 43.95],
                    [-9.85, 43.15],
                    [-9.82, 41.95]
                ]]
            }
        },
        {
            type: "Feature",
            properties: {
                id: "cantabrian-biscay",
                name: "Cantabrian Sea & SE Bay of Biscay",
                tier: "range"
            },
            geometry: {
                type: "Polygon",
                coordinates: [[
                    [-6.20, 43.58],
                    [-1.65, 43.42],
                    [-1.55, 44.35],
                    [-3.85, 44.15],
                    [-6.20, 44.08],
                    [-6.20, 43.58]
                ]]
            }
        }
    ]
};

/* Seasonal Atlantic–Strait Corridor linking the 3 Iberian Study Areas (Esteban et al., 2026) */
const iberianOrcaCorridorCoordinates = [
    [-5.68, 35.92],  // Strait of Gibraltar (Las Bajas)
    [-6.28, 36.24],  // Gulf of Cádiz
    [-7.90, 36.82],  // Off Algarve (Faro)
    [-9.22, 36.95],  // Off Cape St. Vincent
    [-9.25, 37.90],  // Off Sines
    [-9.68, 38.78],  // Off Cabo da Roca / Lisbon
    [-9.52, 39.65],  // Off Nazaré
    [-9.45, 41.20],  // Off Porto / Northern Portugal
    [-9.55, 42.88],  // Off Cape Finisterre (Galicia)
    [-8.65, 43.75],  // Off A Coruña / Ortegal
    [-6.00, 43.85],  // Off Asturias
    [-3.80, 43.82],  // Off Santander / Bilbao
    [-1.85, 43.75]   // SE Bay of Biscay
];
