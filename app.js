/* ========================================================================
   ORCA STORYTELLING — Main Application
   MapLibre GL JS + Scrollama integration with scene transitions.
   ======================================================================== */

(function () {
    'use strict';

    /* ── State ────────────────────────────────────────────────────────── */

    let map;
    let scroller;
    let currentScene = -1;
    let markersOnMap = [];

    /* ── Map Tile Sources ─────────────────────────────────────────────── */

    // Use a beautiful dark basemap style
    const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

    /* ── Marker Styles ────────────────────────────────────────────────── */

    const markerColors = {
        geo: '#4a8fe7',
        nature: '#06d6a0',
        bathymetry: '#e63946',
        town: '#f4a261',
        almadraba: '#e9c46a',
        'sill-channel': '#e63946',
        basin: '#9d4edd'
    };

    function createMarkerElement(type, label) {
        const el = document.createElement('div');
        el.className = 'map-marker';
        
        let customStyles = `
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: ${markerColors[type] || '#fff'};
            border: 2px solid rgba(255,255,255,0.85);
            box-shadow: 0 0 12px ${markerColors[type] || '#fff'}80;
            cursor: pointer;
            transition: transform 0.3s ease;
        `;

        if (type === 'sill-channel') {
            customStyles = `
                width: 15px;
                height: 15px;
                border-radius: 50%;
                background: #e63946;
                border: 2px solid #ffffff;
                box-shadow: 0 0 0 2px rgba(230, 57, 70, 0.6), 0 0 14px rgba(230, 57, 70, 0.9);
                cursor: pointer;
                transition: transform 0.3s ease;
            `;
        } else if (type === 'basin') {
            customStyles = `
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #9d4edd;
                border: 2px solid rgba(255,255,255,0.9);
                box-shadow: 0 0 10px rgba(157, 78, 221, 0.7);
                cursor: pointer;
                transition: transform 0.3s ease;
            `;
        }

        el.style.cssText = customStyles;

        // Tooltip label
        const tooltip = document.createElement('div');
        tooltip.className = 'map-marker-label';
        tooltip.textContent = label;
        tooltip.style.cssText = `
            position: absolute;
            bottom: calc(100% + 8px);
            left: 50%;
            transform: translateX(-50%);
            white-space: nowrap;
            font-family: 'Inter', sans-serif;
            font-size: 11px;
            font-weight: 500;
            color: #e6f1ff;
            background: rgba(10, 25, 47, 0.92);
            backdrop-filter: blur(8px);
            padding: 4px 10px;
            border-radius: 6px;
            border: 1px solid rgba(100, 181, 246, 0.25);
            box-shadow: 0 4px 16px rgba(0,0,0,0.4);
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
            z-index: 10;
        `;

        el.appendChild(tooltip);

        el.addEventListener('mouseenter', () => {
            el.style.transform = 'scale(1.4)';
            tooltip.style.opacity = '1';
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'scale(1)';
            tooltip.style.opacity = '0';
        });

        return el;
    }

    /* ── Clear / Set Markers ──────────────────────────────────────────── */

    function clearMarkers() {
        markersOnMap.forEach(m => m.remove());
        markersOnMap = [];
    }

    function setMarkersForScene(sceneKey) {
        clearMarkers();
        const loc = sceneLocations[sceneKey];
        if (!loc || !loc.markers || loc.markers.length === 0) return;

        loc.markers.forEach(mk => {
            const el = createMarkerElement(mk.type, mk.label);
            const marker = new maplibregl.Marker({ element: el })
                .setLngLat([mk.lng, mk.lat])
                .addTo(map);
            markersOnMap.push(marker);
        });
    }

    /* ── Camarinal Sill Transect (Scene 3 & 4) ────────────────────────── */

    let camarinalLineAdded = false;

    function addCamarinalTransect() {
        if (camarinalLineAdded) {
            map.setLayoutProperty('camarinal-transect-line', 'visibility', 'visible');
            map.setLayoutProperty('camarinal-transect-glow', 'visibility', 'visible');
            return;
        }

        map.addSource('camarinal-transect-src', {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: camarinalTransectCoordinates
                }
            }
        });

        map.addLayer({
            id: 'camarinal-transect-glow',
            type: 'line',
            source: 'camarinal-transect-src',
            paint: {
                'line-color': '#06d6a0',
                'line-width': 8,
                'line-opacity': 0.25,
                'line-blur': 4
            }
        });

        map.addLayer({
            id: 'camarinal-transect-line',
            type: 'line',
            source: 'camarinal-transect-src',
            paint: {
                'line-color': '#06d6a0',
                'line-width': 2.5,
                'line-opacity': 0.95
            }
        });

        camarinalLineAdded = true;
    }

    function hideCamarinalTransect() {
        if (!camarinalLineAdded) return;
        try {
            map.setLayoutProperty('camarinal-transect-line', 'visibility', 'none');
            map.setLayoutProperty('camarinal-transect-glow', 'visibility', 'none');
        } catch (e) { }
    }

    /* ── Current Circulation: Atlantic, LIW & WMDW (Scene 4) ──────────── */

    let currentLinesAdded = false;

    function addCurrentArrows() {
        if (currentLinesAdded) {
            map.setLayoutProperty('atlantic-current', 'visibility', 'visible');
            map.setLayoutProperty('liw-current', 'visibility', 'visible');
            map.setLayoutProperty('liw-current-glow', 'visibility', 'visible');
            map.setLayoutProperty('wmdw-current', 'visibility', 'visible');
            map.setLayoutProperty('wmdw-current-glow', 'visibility', 'visible');
            return;
        }

        // 1. Atlantic Surface Current (East-flowing: Gulf of Cadiz -> Alboran Sea)
        map.addSource('atlantic-current-src', {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: [
                        [-6.30, 35.96],
                        [-5.95, 35.98],
                        [-5.65, 35.97],
                        [-5.35, 35.94],
                        [-5.00, 35.92],
                        [-4.60, 35.88]
                    ]
                }
            }
        });

        map.addLayer({
            id: 'atlantic-current',
            type: 'line',
            source: 'atlantic-current-src',
            paint: {
                'line-color': '#4a8fe7',
                'line-width': 3.5,
                'line-opacity': 0.8,
                'line-dasharray': [3, 2]
            }
        });

        // 2. LIW — Levantine Intermediate Water (West-flowing: along Spanish slope past Gibraltar/Tarifa into CSN)
        map.addSource('liw-current-src', {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: [
                        [-4.70, 36.26],
                        [-5.00, 36.20],
                        [-5.25, 36.16],
                        [-5.36, 36.13],
                        [-5.48, 36.08],
                        [-5.60, 36.01],
                        [-5.755, 35.948], // Enters CSN (Camarinal Sill North)
                        [-5.84, 35.91],
                        [-6.02, 35.88]
                    ]
                }
            }
        });

        map.addLayer({
            id: 'liw-current-glow',
            type: 'line',
            source: 'liw-current-src',
            paint: {
                'line-color': '#ffb703',
                'line-width': 8,
                'line-opacity': 0.25,
                'line-blur': 4
            }
        });

        map.addLayer({
            id: 'liw-current',
            type: 'line',
            source: 'liw-current-src',
            paint: {
                'line-color': '#ffb703',
                'line-width': 3,
                'line-opacity': 0.95,
                'line-dasharray': [4, 2]
            }
        });

        // 3. WMDW — Western Mediterranean Deep Water (West-flowing: along Moroccan slope past Ceuta into CSS & Tangier Basin)
        map.addSource('wmdw-current-src', {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: [
                        [-4.60, 35.84],
                        [-4.90, 35.87],
                        [-5.15, 35.90],
                        [-5.316, 35.889], // Past Ceuta
                        [-5.50, 35.88],
                        [-5.65, 35.885],
                        [-5.775, 35.905], // Enters CSS (Camarinal Sill South)
                        [-5.84, 35.88],   // Tangier Basin (TB)
                        [-5.97, 35.86],   // Espartel Sill (ESP)
                        [-6.18, 35.83]
                    ]
                }
            }
        });

        map.addLayer({
            id: 'wmdw-current-glow',
            type: 'line',
            source: 'wmdw-current-src',
            paint: {
                'line-color': '#2979ff',
                'line-width': 8,
                'line-opacity': 0.25,
                'line-blur': 4
            }
        });

        map.addLayer({
            id: 'wmdw-current',
            type: 'line',
            source: 'wmdw-current-src',
            paint: {
                'line-color': '#2979ff',
                'line-width': 3.5,
                'line-opacity': 0.95,
                'line-dasharray': [4, 2]
            }
        });

        currentLinesAdded = true;
    }

    function hideCurrentArrows() {
        if (!currentLinesAdded) return;
        try {
            map.setLayoutProperty('atlantic-current', 'visibility', 'none');
            map.setLayoutProperty('liw-current', 'visibility', 'none');
            map.setLayoutProperty('liw-current-glow', 'visibility', 'none');
            map.setLayoutProperty('wmdw-current', 'visibility', 'none');
            map.setLayoutProperty('wmdw-current-glow', 'visibility', 'none');
        } catch (e) { }
    }

    /* ── Tuna Transatlantic Migration (Scene 3 — zoomed out) ────────── */
    /* Based on electronic tagging tracks from Block et al. (2005) Nature
       and Rooker et al. (2008) Science. Spring inbound (Atlantic → Med)
       and summer outbound (Med → Atlantic) routes. */

    let transatlanticRouteAdded = false;

    function addTransatlanticMigration() {
        if (transatlanticRouteAdded) {
            ['tuna-spring-inbound', 'tuna-spring-inbound-glow', 'tuna-spring-arrows',
             'tuna-summer-return', 'tuna-summer-return-glow', 'tuna-summer-arrows'].forEach(id => {
                try { map.setLayoutProperty(id, 'visibility', 'visible'); } catch (e) { }
            });
            return;
        }

        // Spring inbound: Gulf of Mexico → Atlantic → Strait → Mediterranean
        map.addSource('tuna-spring-src', {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: [
                        [-88.0, 26.0],   // Gulf of Mexico spawning grounds
                        [-85.0, 27.5],   // Northern Gulf
                        [-80.0, 30.0],   // Florida Straits exit
                        [-75.0, 34.0],   // Cape Hatteras / Gulf Stream
                        [-65.0, 38.0],   // Grand Banks foraging
                        [-50.0, 40.0],   // Mid-Atlantic crossing
                        [-35.0, 38.0],   // Central North Atlantic
                        [-20.0, 36.0],   // Azores / Eastern Atlantic
                        [-12.0, 35.5],   // Approaching Iberia
                        [-7.0, 35.8],    // Gulf of Cádiz
                        [-5.6, 36.0],    // Strait of Gibraltar
                        [-3.0, 37.0],    // Alborán Sea
                        [1.0, 38.5],     // Balearic Sea spawning
                        [6.0, 39.0],     // Sardinia / Tyrrhenian
                        [12.0, 38.0]     // Central Mediterranean spawning
                    ]
                }
            }
        });

        map.addLayer({
            id: 'tuna-spring-inbound-glow',
            type: 'line',
            source: 'tuna-spring-src',
            paint: {
                'line-color': '#e63946',
                'line-width': 8,
                'line-opacity': 0.2,
                'line-blur': 5
            }
        });

        map.addLayer({
            id: 'tuna-spring-inbound',
            type: 'line',
            source: 'tuna-spring-src',
            paint: {
                'line-color': '#e63946',
                'line-width': 2.8,
                'line-opacity': 0.85,
                'line-dasharray': [6, 4]
            }
        });

        // Directional arrowheads pointing along Spring Inbound path (east towards Med)
        map.addLayer({
            id: 'tuna-spring-arrows',
            type: 'symbol',
            source: 'tuna-spring-src',
            layout: {
                'symbol-placement': 'line',
                'symbol-spacing': 110,
                'text-field': '▶',
                'text-size': 12,
                'text-keep-upright': false,
                'text-allow-overlap': true,
                'text-ignore-placement': true
            },
            paint: {
                'text-color': '#ff6b6b'
            }
        });

        // Summer return: Mediterranean → Strait → Atlantic (deeper, 290–500 m)
        map.addSource('tuna-summer-src', {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: [
                        [12.0, 38.0],    // Central Med post-spawning
                        [6.0, 38.5],     // Sardinia exit
                        [1.0, 38.0],     // Balearic Sea
                        [-3.0, 36.5],    // Alborán Sea
                        [-5.6, 35.95],   // Strait of Gibraltar (deep outflow 290–500 m)
                        [-7.5, 35.6],    // Gulf of Cádiz
                        [-12.0, 35.0],   // Off Portugal
                        [-20.0, 35.5],   // Eastern Atlantic
                        [-35.0, 37.0],   // Mid-Atlantic
                        [-50.0, 39.0],   // Western Atlantic foraging
                        [-65.0, 42.0],   // Gulf of Maine / Grand Banks
                        [-75.0, 38.0]    // North American shelf
                    ]
                }
            }
        });

        map.addLayer({
            id: 'tuna-summer-return-glow',
            type: 'line',
            source: 'tuna-summer-src',
            paint: {
                'line-color': '#4a8fe7',
                'line-width': 8,
                'line-opacity': 0.2,
                'line-blur': 5
            }
        });

        map.addLayer({
            id: 'tuna-summer-return',
            type: 'line',
            source: 'tuna-summer-src',
            paint: {
                'line-color': '#4a8fe7',
                'line-width': 2.8,
                'line-opacity': 0.85,
                'line-dasharray': [5, 4]
            }
        });

        // Directional arrowheads pointing along Summer Return path (west into Atlantic)
        map.addLayer({
            id: 'tuna-summer-arrows',
            type: 'symbol',
            source: 'tuna-summer-src',
            layout: {
                'symbol-placement': 'line',
                'symbol-spacing': 110,
                'text-field': '▶',
                'text-size': 12,
                'text-keep-upright': false,
                'text-allow-overlap': true,
                'text-ignore-placement': true
            },
            paint: {
                'text-color': '#64b5f6'
            }
        });

        transatlanticRouteAdded = true;
    }

    function hideTransatlanticMigration() {
        if (!transatlanticRouteAdded) return;
        try {
            ['tuna-spring-inbound', 'tuna-spring-inbound-glow', 'tuna-spring-arrows',
             'tuna-summer-return', 'tuna-summer-return-glow', 'tuna-summer-arrows'].forEach(id => {
                map.setLayoutProperty(id, 'visibility', 'none');
            });
        } catch (e) { /* */ }
    }

    /* ── Las Bajas Underwater Plateau Arena (Scenes 4, 5, 6) ────────── */
    /* 2 nautical miles × 1 nautical mile (6.9 km²) plateau located
       midway between Tarifa and Tangier where tidal upwelling concentrates fish */

    let lasBajasAdded = false;

    function addLasBajasArena() {
        if (lasBajasAdded) {
            ['las-bajas-fill', 'las-bajas-outline', 'las-bajas-glow'].forEach(id => {
                try { map.setLayoutProperty(id, 'visibility', 'visible'); } catch (e) { }
            });
            return;
        }

        map.addSource('las-bajas-src', {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: [[
                        [-5.751, 35.912],
                        [-5.709, 35.912],
                        [-5.709, 35.928],
                        [-5.751, 35.928],
                        [-5.751, 35.912]
                    ]]
                },
                properties: {
                    name: 'Las Bajas Plateau (6.9 km²)'
                }
            }
        });

        map.addLayer({
            id: 'las-bajas-fill',
            type: 'fill',
            source: 'las-bajas-src',
            paint: {
                'fill-color': '#06d6a0',
                'fill-opacity': 0.15
            }
        });

        map.addLayer({
            id: 'las-bajas-glow',
            type: 'line',
            source: 'las-bajas-src',
            paint: {
                'line-color': '#06d6a0',
                'line-width': 8,
                'line-opacity': 0.25,
                'line-blur': 5
            }
        });

        map.addLayer({
            id: 'las-bajas-outline',
            type: 'line',
            source: 'las-bajas-src',
            paint: {
                'line-color': '#06d6a0',
                'line-width': 2,
                'line-opacity': 0.85,
                'line-dasharray': [4, 3]
            }
        });

        lasBajasAdded = true;
    }

    function hideLasBajasArena() {
        if (!lasBajasAdded) return;
        try {
            ['las-bajas-fill', 'las-bajas-outline', 'las-bajas-glow'].forEach(id => {
                map.setLayoutProperty(id, 'visibility', 'none');
            });
        } catch (e) { /* */ }
    }

    /* ── Local Tuna Route through the Strait (Scene 5/6) ─────────────── */

    let migrationRouteAdded = false;

    function addMigrationRoute() {
        if (migrationRouteAdded) {
            map.setLayoutProperty('tuna-route', 'visibility', 'visible');
            map.setLayoutProperty('tuna-route-glow', 'visibility', 'visible');
            return;
        }

        map.addSource('tuna-route-src', {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: [
                        [-7.0, 35.7],
                        [-6.3, 35.85],
                        [-5.9, 35.95],
                        [-5.6, 36.0],
                        [-5.35, 36.05],
                        [-5.1, 36.1],
                        [-4.5, 36.3],
                        [-3.8, 36.5]
                    ]
                }
            }
        });

        map.addLayer({
            id: 'tuna-route-glow',
            type: 'line',
            source: 'tuna-route-src',
            paint: {
                'line-color': '#e63946',
                'line-width': 8,
                'line-opacity': 0.15,
                'line-blur': 6
            }
        });

        map.addLayer({
            id: 'tuna-route',
            type: 'line',
            source: 'tuna-route-src',
            paint: {
                'line-color': '#e63946',
                'line-width': 2.5,
                'line-opacity': 0.7,
                'line-dasharray': [4, 3]
            }
        });

        migrationRouteAdded = true;
    }

    function hideMigrationRoute() {
        if (!migrationRouteAdded) return;
        try {
            map.setLayoutProperty('tuna-route', 'visibility', 'none');
            map.setLayoutProperty('tuna-route-glow', 'visibility', 'none');
        } catch (e) { /* */ }
    }

    /* ── Almadraba Zones (Scene 6) ───────────────────────────────────── */

    let almadrabaAdded = false;

    function addAlmadrabaZones() {
        if (almadrabaAdded) {
            map.setLayoutProperty('almadraba-zones', 'visibility', 'visible');
            return;
        }

        const almadrabaPoints = [
            [-6.092, 36.289],
            [-5.862, 36.14],
            [-5.926, 36.19],
            [-5.62, 36.02]
        ];

        map.addSource('almadraba-src', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: almadrabaPoints.map(coord => ({
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: coord }
                }))
            }
        });

        map.addLayer({
            id: 'almadraba-zones',
            type: 'circle',
            source: 'almadraba-src',
            paint: {
                'circle-radius': 14,
                'circle-color': 'rgba(233, 196, 106, 0.2)',
                'circle-stroke-color': '#e9c46a',
                'circle-stroke-width': 2,
                'circle-blur': 0.4
            }
        });

        almadrabaAdded = true;
    }

    function hideAlmadrabaZones() {
        if (!almadrabaAdded) return;
        try {
            map.setLayoutProperty('almadraba-zones', 'visibility', 'none');
        } catch (e) { /* */ }
    }

    /* ── Scene Transition Handler ─────────────────────────────────────── */

    function onSceneEnter(response) {
        const el = response.element;
        const idx = response.index;

        // Update active card styling
        document.querySelectorAll('.step').forEach(s => s.classList.remove('is-active'));
        el.classList.add('is-active');

        // Update navigation dots
        document.querySelectorAll('.scene-nav__dot').forEach((dot, i) => {
            dot.classList.toggle('is-active', i === idx);
        });

        currentScene = idx;

        // Read map camera from data attributes
        const lng = parseFloat(el.dataset.lng);
        const lat = parseFloat(el.dataset.lat);
        const zoom = parseFloat(el.dataset.zoom);
        const pitch = parseFloat(el.dataset.pitch || 0);
        const bearing = parseFloat(el.dataset.bearing || 0);
        const speed = parseFloat(el.dataset.speed || 0.8);

        const sceneKeys = ['scene1', 'scene2', 'scene3', 'scene4', 'scene5', 'scene6', 'closing'];
        const sceneKey = sceneKeys[idx] || '';

        if (!isNaN(lng) && !isNaN(lat) && !isNaN(zoom)) {
            map.flyTo({
                center: [lng, lat],
                zoom: zoom,
                pitch: pitch,
                bearing: bearing,
                speed: speed,
                curve: 1.42,
                essential: true
            });
        } else if (sceneLocations[sceneKey]) {
            const loc = sceneLocations[sceneKey];
            map.flyTo({
                center: loc.center,
                zoom: loc.zoom,
                pitch: loc.pitch || 0,
                bearing: loc.bearing || 0,
                speed: speed,
                curve: 1.42,
                essential: true
            });
        }

        // Scene-specific overlays
        hideCamarinalTransect();
        hideCurrentArrows();
        hideMigrationRoute();
        hideTransatlanticMigration();
        hideAlmadrabaZones();
        hideLasBajasArena();

        setMarkersForScene(sceneKey);

        switch (sceneKey) {
            case 'scene2':
                addCamarinalTransect();
                addCurrentArrows();
                break;
            case 'scene3':
                addTransatlanticMigration();
                break;
            case 'scene4':
                addLasBajasArena();
                addMigrationRoute();
                // Redraw charts when they become visible
                setTimeout(() => Charts.redraw(), 600);
                break;
            case 'scene5':
                addAlmadrabaZones();
                addLasBajasArena();
                addMigrationRoute();
                break;
            case 'scene6':
                addLasBajasArena();
                addMigrationRoute();
                break;
            case 'closing':
                break;
        }
    }

    /* ── Progress Bar ─────────────────────────────────────────────────── */

    function updateProgress() {
        const scrollTop = window.scrollY;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const progress = Math.min(scrollTop / docHeight * 100, 100);
        document.getElementById('progress-fill').style.width = progress + '%';
    }

    /* ── Init ─────────────────────────────────────────────────────────── */

    function init() {
        // Initialise MapLibre map
        map = new maplibregl.Map({
            container: 'map',
            style: MAP_STYLE,
            center: [-5.6, 35.9],
            zoom: 3.5,
            pitch: 0,
            bearing: 0,
            interactive: false,
            attributionControl: false,
            fadeDuration: 0
        });

        map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

        map.on('load', () => {
            // Hide loader
            document.getElementById('loader').classList.add('is-hidden');

            // Show scene nav
            document.getElementById('scene-nav').classList.add('is-visible');

            // Draw all charts
            Charts.initAll();

            // Init Scrollama
            scroller = scrollama();
            scroller
                .setup({
                    step: '#story .step',
                    offset: 0.5,
                    debug: false
                })
                .onStepEnter(onSceneEnter);

            // Scroll progress
            window.addEventListener('scroll', updateProgress, { passive: true });

            // Scene nav dot clicks
            document.querySelectorAll('.scene-nav__dot').forEach(dot => {
                dot.addEventListener('click', () => {
                    const sceneIdx = parseInt(dot.dataset.scene, 10);
                    const target = document.querySelectorAll('.step')[sceneIdx];
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                });
            });

            // Resize handler
            let resizeTimer;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => {
                    scroller.resize();
                    Charts.redraw();
                    if (map) map.resize();
                }, 250);
            });
        });

        map.on('error', (e) => {
            console.warn('Map error:', e);
            // Still hide loader on error so the story is readable
            document.getElementById('loader').classList.add('is-hidden');
        });
    }

    /* ── Boot ─────────────────────────────────────────────────────────── */

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
