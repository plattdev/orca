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
        geo: '#6d9dc5',
        nature: '#8fb8d6',
        bathymetry: '#c97a74',
        town: '#d4b27c',
        almadraba: '#dfc18b',
        'sill-channel': '#c97a74',
        basin: '#8c7aa8'
    };

    function createMarkerElement(mk) {
        const type = mk.type;
        const label = mk.label;
        const el = document.createElement('div');
        el.className = 'map-marker';
        
        let customStyles = `
            width: 11px;
            height: 11px;
            border-radius: 50%;
            background: ${markerColors[type] || '#fff'};
            border: 2px solid rgba(255,255,255,0.88);
            box-shadow: 0 0 10px ${markerColors[type] || '#fff'}80;
            cursor: default;
            transition: transform 0.3s ease;
        `;

        if (type === 'sill-channel') {
            customStyles = `
                width: 14px;
                height: 14px;
                border-radius: 50%;
                background: #c97a74;
                border: 2px solid #ffffff;
                box-shadow: 0 0 0 2px rgba(201, 122, 116, 0.55), 0 0 12px rgba(201, 122, 116, 0.75);
                cursor: default;
                transition: transform 0.3s ease;
            `;
        } else if (type === 'basin') {
            customStyles = `
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #8c7aa8;
                border: 2px solid rgba(255,255,255,0.9);
                box-shadow: 0 0 10px rgba(140, 122, 168, 0.65);
                cursor: default;
                transition: transform 0.3s ease;
            `;
        }

        el.style.cssText = customStyles;

        if (mk.alwaysShow) {
            const callout = document.createElement('div');
            callout.className = `map-callout map-callout--${mk.anchor || 'bottom'}`;
            const titleSpan = document.createElement('span');
            titleSpan.className = 'map-callout__title';
            titleSpan.textContent = label;
            callout.appendChild(titleSpan);

            if (mk.sublabel) {
                const subSpan = document.createElement('span');
                subSpan.className = 'map-callout__sub';
                subSpan.textContent = mk.sublabel;
                callout.appendChild(subSpan);
            }
            el.appendChild(callout);
            return el;
        }

        // Hover tooltip fallback for secondary markers
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
            font-size: 0.8125rem;
            font-weight: 500;
            color: #e6f1ff;
            background: rgba(10, 25, 47, 0.94);
            backdrop-filter: blur(8px);
            padding: 5px 10px;
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
            el.style.transform = 'scale(1.3)';
            tooltip.style.opacity = '1';
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'scale(1)';
            tooltip.style.opacity = '0';
        });

        return el;
    }

    /* ── Clear / Set Markers & Contextual Map Key ─────────────────────── */

    function clearMarkers() {
        markersOnMap.forEach(m => m.remove());
        markersOnMap = [];
    }

    function setMarkersForScene(sceneKey) {
        clearMarkers();
        const loc = sceneLocations[sceneKey];
        if (!loc || !loc.markers || loc.markers.length === 0) return;

        loc.markers.forEach(mk => {
            const el = createMarkerElement(mk);
            const marker = new maplibregl.Marker({ element: el })
                .setLngLat([mk.lng, mk.lat])
                .addTo(map);
            markersOnMap.push(marker);
        });
    }

    function getMapPadding(mode) {
        const isDesktop = window.innerWidth > 960;
        if (!isDesktop) {
            return {
                top: 20,
                bottom: mode === 'cohunting' ? 78 : 24,
                left: 20,
                right: 32
            };
        }

        const mapWidth = map ? map.getContainer().clientWidth : Math.round(window.innerWidth * 0.4);
        if (mode === 'transatlantic') {
            return {
                top: 48,
                bottom: 48,
                left: 28,
                right: Math.min(182, Math.round(mapWidth * 0.36))
            };
        }
        if (mode === 'cohunting') {
            return {
                top: 52,
                bottom: 118,
                left: 34,
                right: Math.min(148, Math.round(mapWidth * 0.30))
            };
        }
        return {
            top: 36,
            bottom: 36,
            left: 24,
            right: Math.min(142, Math.round(mapWidth * 0.28))
        };
    }

    function updateMapLegend(sceneKey) {
        const legendEl = document.getElementById('map-legend');
        if (!legendEl) return;

        if (sceneKey === 'scene6') {
            legendEl.innerHTML = `
                <div class="map-legend__title">Co-Hunting Arena · July–August</div>
                <div class="map-legend__items">
                    <div class="map-legend__item">
                        <span class="map-legend__swatch map-legend__swatch--arena"></span>
                        <span><strong>Las Bajas Bank</strong> — Orca patrol (2–50 m)</span>
                    </div>
                    <div class="map-legend__item">
                        <span class="map-legend__swatch map-legend__swatch--fleet"></span>
                        <span><strong>Artisanal fleets</strong> — Tarifa &amp; Tangier boats</span>
                    </div>
                    <div class="map-legend__item">
                        <span class="map-legend__swatch map-legend__swatch--tuna"></span>
                        <span><strong>Tuna exit</strong> — Med → Atlantic (300+ m)</span>
                    </div>
                </div>
            `;
            legendEl.classList.add('is-visible');
        } else {
            legendEl.classList.remove('is-visible');
        }
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
                'line-color': '#8fb8d6',
                'line-width': 8,
                'line-opacity': 0.22,
                'line-blur': 4
            }
        });

        map.addLayer({
            id: 'camarinal-transect-line',
            type: 'line',
            source: 'camarinal-transect-src',
            paint: {
                'line-color': '#9bc5d9',
                'line-width': 2.5,
                'line-opacity': 0.9
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

        // Spring inbound: Gulf of Mexico → Florida Straits → North Atlantic → Strait → Balearic Sea (100% open water)
        map.addSource('tuna-spring-src', {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: [
                        [-89.0, 25.8],   // Central Gulf of Mexico spawning grounds
                        [-86.2, 24.4],   // SE Gulf basin
                        [-83.2, 23.85],  // South of Dry Tortugas (mid-channel)
                        [-80.85, 23.95], // Straits of Florida axis
                        [-79.72, 24.80], // Between Florida Keys & Great Bahama Bank
                        [-79.68, 26.00], // North Florida Straits channel
                        [-79.45, 28.20], // Gulf Stream offshore Florida
                        [-77.10, 31.40], // Blake Plateau
                        [-73.10, 34.80], // Offshore Cape Hatteras
                        [-63.50, 38.50], // Sargasso / Gulf Stream extension
                        [-50.00, 41.00], // South of Grand Banks
                        [-36.50, 41.60], // Mid-Atlantic Ridge
                        [-27.50, 41.30], // North of Azores archipelago
                        [-17.80, 38.40], // Iberia Abyssal Plain
                        [-11.40, 36.05], // Offshore Cape St. Vincent
                        [-7.40, 35.94],  // Central Gulf of Cádiz
                        [-5.60, 35.962], // Strait of Gibraltar mid-channel
                        [-4.10, 35.98],  // Central Alborán Sea
                        [-2.00, 36.02],  // East Alborán basin (80 km S of Cabo de Gata)
                        [0.20, 36.75],   // Algerian–Balearic basin
                        [2.10, 37.85],   // South of Ibiza (107 km offshore)
                        [4.60, 38.45]    // Balearic Sea spawning ground (S of Menorca/Mallorca)
                    ]
                }
            }
        });

        map.addLayer({
            id: 'tuna-spring-inbound-glow',
            type: 'line',
            source: 'tuna-spring-src',
            paint: {
                'line-color': '#c97a74',
                'line-width': ['interpolate', ['linear'], ['zoom'], 1.5, 4, 4.5, 7],
                'line-opacity': 0.16,
                'line-blur': 3
            }
        });

        map.addLayer({
            id: 'tuna-spring-inbound',
            type: 'line',
            source: 'tuna-spring-src',
            paint: {
                'line-color': '#c97a74',
                'line-width': ['interpolate', ['linear'], ['zoom'], 1.5, 2.0, 4.5, 2.7],
                'line-opacity': 0.88,
                'line-dasharray': [5, 3.5]
            }
        });

        // Directional arrowheads pointing along Spring Inbound path (east towards Med)
        map.addLayer({
            id: 'tuna-spring-arrows',
            type: 'symbol',
            source: 'tuna-spring-src',
            layout: {
                'symbol-placement': 'line',
                'symbol-spacing': 95,
                'text-field': '▶',
                'text-size': 11,
                'text-keep-upright': false,
                'text-allow-overlap': true,
                'text-ignore-placement': true
            },
            paint: {
                'text-color': '#dfa09a'
            }
        });

        // Summer return: Balearic Sea → Strait → North Atlantic foraging grounds (deeper, 290–500 m, 100% open water)
        map.addSource('tuna-summer-src', {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: [
                        [4.60, 38.15],   // Balearic post-spawning basin
                        [1.90, 37.35],   // Algerian basin (148 km S of Ibiza)
                        [-0.50, 36.35],  // Off Oran–Cartagena deep channel
                        [-2.40, 35.90],  // Southern Alborán basin
                        [-4.20, 35.93],  // Western Alborán Sea
                        [-5.60, 35.948], // Strait of Gibraltar deep outflow (290–500 m)
                        [-6.35, 35.89],  // West of Spartel Sill
                        [-7.90, 35.52],  // Outer Gulf of Cádiz
                        [-13.20, 34.85], // Ampere / Horseshoe Abyssal Plain
                        [-23.00, 35.10], // South of Azores (91 km clearance)
                        [-37.00, 36.60], // Central North Atlantic
                        [-50.00, 38.70], // Southeast of Grand Banks
                        [-58.00, 40.60], // Grand Banks / Slope Sea foraging
                        [-65.50, 38.80], // Offshore Georges Bank (350 km SE of Cape Cod)
                        [-72.00, 36.20]  // Offshore Mid-Atlantic Slope Sea
                    ]
                }
            }
        });

        map.addLayer({
            id: 'tuna-summer-return-glow',
            type: 'line',
            source: 'tuna-summer-src',
            paint: {
                'line-color': '#6d9dc5',
                'line-width': ['interpolate', ['linear'], ['zoom'], 1.5, 4, 4.5, 7],
                'line-opacity': 0.16,
                'line-blur': 3
            }
        });

        map.addLayer({
            id: 'tuna-summer-return',
            type: 'line',
            source: 'tuna-summer-src',
            paint: {
                'line-color': '#6d9dc5',
                'line-width': ['interpolate', ['linear'], ['zoom'], 1.5, 2.0, 4.5, 2.7],
                'line-opacity': 0.88,
                'line-dasharray': [4.5, 3.5]
            }
        });

        // Directional arrowheads pointing along Summer Return path (west into Atlantic)
        map.addLayer({
            id: 'tuna-summer-arrows',
            type: 'symbol',
            source: 'tuna-summer-src',
            layout: {
                'symbol-placement': 'line',
                'symbol-spacing': 95,
                'text-field': '▶',
                'text-size': 11,
                'text-keep-upright': false,
                'text-allow-overlap': true,
                'text-ignore-placement': true
            },
            paint: {
                'text-color': '#95bddb'
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

    /* ── Las Bajas Underwater Plateau Arena (Scenes 4 & 6) ──────────── */
    /* ~3.7 km × 1.9 km (6.9 km²) submarine shoal midway between Tarifa and Tangier
       oriented WSW–ENE along the Camarinal–Majuan sill axis */

    let lasBajasAdded = false;

    function buildShoalContour(centerLng, centerLat, rx, ry, rotDeg, steps) {
        const rad = (rotDeg * Math.PI) / 180;
        const cosR = Math.cos(rad);
        const sinR = Math.sin(rad);
        const pts = [];
        for (let i = 0; i <= steps; i++) {
            const t = (i / steps) * Math.PI * 2;
            // Subtle bathymetric irregularity so it reads as a natural submarine bank
            const mod = 1 + 0.08 * Math.sin(3 * t + 0.6) - 0.05 * Math.cos(2 * t);
            const dx = rx * mod * Math.cos(t);
            const dy = ry * mod * Math.sin(t);
            const lng = centerLng + dx * cosR - dy * sinR;
            const lat = centerLat + dx * sinR + dy * cosR;
            pts.push([Number(lng.toFixed(5)), Number(lat.toFixed(5))]);
        }
        return pts;
    }

    function addLasBajasArena() {
        if (lasBajasAdded) {
            ['las-bajas-outer', 'las-bajas-fill', 'las-bajas-outline', 'las-bajas-glow'].forEach(id => {
                try { map.setLayoutProperty(id, 'visibility', 'visible'); } catch (e) { }
            });
            return;
        }

        const innerRing = buildShoalContour(-5.730, 35.920, 0.024, 0.0105, 16, 24);
        const outerRing = buildShoalContour(-5.730, 35.920, 0.035, 0.016, 16, 24);

        map.addSource('las-bajas-src', {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: [innerRing]
                },
                properties: {
                    name: 'Las Bajas Bank (6.9 km²)'
                }
            }
        });

        map.addSource('las-bajas-outer-src', {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: [outerRing]
                }
            }
        });

        map.addLayer({
            id: 'las-bajas-outer',
            type: 'line',
            source: 'las-bajas-outer-src',
            paint: {
                'line-color': '#6d9dc5',
                'line-width': 1.2,
                'line-opacity': 0.35,
                'line-dasharray': [2, 3]
            }
        });

        map.addLayer({
            id: 'las-bajas-fill',
            type: 'fill',
            source: 'las-bajas-src',
            paint: {
                'fill-color': '#8fb8d6',
                'fill-opacity': 0.22
            }
        });

        map.addLayer({
            id: 'las-bajas-glow',
            type: 'line',
            source: 'las-bajas-src',
            paint: {
                'line-color': '#8fb8d6',
                'line-width': 7,
                'line-opacity': 0.24,
                'line-blur': 4
            }
        });

        map.addLayer({
            id: 'las-bajas-outline',
            type: 'line',
            source: 'las-bajas-src',
            paint: {
                'line-color': '#b8dcf0',
                'line-width': 2,
                'line-opacity': 0.9,
                'line-dasharray': [4, 2.5]
            }
        });

        lasBajasAdded = true;
    }

    function hideLasBajasArena() {
        if (!lasBajasAdded) return;
        try {
            ['las-bajas-outer', 'las-bajas-fill', 'las-bajas-outline', 'las-bajas-glow'].forEach(id => {
                map.setLayoutProperty(id, 'visibility', 'none');
            });
        } catch (e) { /* */ }
    }

    /* ── Co-Hunting Spatial Overlays (Scene 6) ───────────────────────── */
    /* Shows:
       1. Post-spawning summer tuna deep exit (Med → Atlantic, 300+ m) across Las Bajas
       2. Artisanal drop-line boat routes converging from Tarifa (Spain) & Tangier (Morocco) */

    let coHuntingAdded = false;

    function addCoHuntingOverlays() {
        if (coHuntingAdded) {
            ['cohunting-tuna-glow', 'cohunting-tuna-line', 'cohunting-tuna-arrows',
             'cohunting-fleets-glow', 'cohunting-fleets-line', 'cohunting-fleets-arrows'].forEach(id => {
                try { map.setLayoutProperty(id, 'visibility', 'visible'); } catch (e) { }
            });
            return;
        }

        // 1. Westward post-spawning tuna outflow at 300+ m across Las Bajas
        map.addSource('cohunting-tuna-src', {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: [
                        [-5.44, 35.958],
                        [-5.58, 35.942],
                        [-5.73, 35.920], // Crosses Las Bajas plateau
                        [-5.87, 35.898],
                        [-6.01, 35.875]
                    ]
                }
            }
        });

        map.addLayer({
            id: 'cohunting-tuna-glow',
            type: 'line',
            source: 'cohunting-tuna-src',
            paint: {
                'line-color': '#6d9dc5',
                'line-width': 8,
                'line-opacity': 0.2,
                'line-blur': 4
            }
        });

        map.addLayer({
            id: 'cohunting-tuna-line',
            type: 'line',
            source: 'cohunting-tuna-src',
            paint: {
                'line-color': '#6d9dc5',
                'line-width': 2.8,
                'line-opacity': 0.9,
                'line-dasharray': [5, 3.5]
            }
        });

        map.addLayer({
            id: 'cohunting-tuna-arrows',
            type: 'symbol',
            source: 'cohunting-tuna-src',
            layout: {
                'symbol-placement': 'line',
                'symbol-spacing': 85,
                'text-field': '▶',
                'text-size': 12,
                'text-keep-upright': false,
                'text-allow-overlap': true,
                'text-ignore-placement': true
            },
            paint: {
                'text-color': '#a8cde8'
            }
        });

        // 2. Artisanal drop-line fleets from Tarifa Port (Spain) & Tangier Port (Morocco)
        map.addSource('cohunting-fleets-src', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        properties: { port: 'Tarifa' },
                        geometry: {
                            type: 'LineString',
                            coordinates: [
                                [-5.606, 36.011], // Tarifa Port
                                [-5.658, 35.968],
                                [-5.716, 35.926]  // NE rim of Las Bajas
                            ]
                        }
                    },
                    {
                        type: 'Feature',
                        properties: { port: 'Tangier' },
                        geometry: {
                            type: 'LineString',
                            coordinates: [
                                [-5.805, 35.789], // Tangier Port
                                [-5.772, 35.852],
                                [-5.736, 35.912]  // SW rim of Las Bajas
                            ]
                        }
                    }
                ]
            }
        });

        map.addLayer({
            id: 'cohunting-fleets-glow',
            type: 'line',
            source: 'cohunting-fleets-src',
            paint: {
                'line-color': '#d4b27c',
                'line-width': 6,
                'line-opacity': 0.18,
                'line-blur': 3
            }
        });

        map.addLayer({
            id: 'cohunting-fleets-line',
            type: 'line',
            source: 'cohunting-fleets-src',
            paint: {
                'line-color': '#d4b27c',
                'line-width': 2.2,
                'line-opacity': 0.92,
                'line-dasharray': [2, 2.5]
            }
        });

        map.addLayer({
            id: 'cohunting-fleets-arrows',
            type: 'symbol',
            source: 'cohunting-fleets-src',
            layout: {
                'symbol-placement': 'line',
                'symbol-spacing': 70,
                'text-field': '▶',
                'text-size': 10,
                'text-keep-upright': false,
                'text-allow-overlap': true,
                'text-ignore-placement': true
            },
            paint: {
                'text-color': '#e5c998'
            }
        });

        coHuntingAdded = true;
    }

    function hideCoHuntingOverlays() {
        if (!coHuntingAdded) return;
        try {
            ['cohunting-tuna-glow', 'cohunting-tuna-line', 'cohunting-tuna-arrows',
             'cohunting-fleets-glow', 'cohunting-fleets-line', 'cohunting-fleets-arrows'].forEach(id => {
                map.setLayoutProperty(id, 'visibility', 'none');
            });
        } catch (e) { /* */ }
    }

    /* ── Local Spring Tuna Route through the Strait (Scenes 4 & 5) ───── */

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
                        [-7.0, 35.82],
                        [-6.35, 35.89],
                        [-5.90, 35.93],
                        [-5.73, 35.92],
                        [-5.58, 35.955],
                        [-5.30, 35.98],
                        [-4.80, 36.04],
                        [-4.10, 36.15]
                    ]
                }
            }
        });

        map.addLayer({
            id: 'tuna-route-glow',
            type: 'line',
            source: 'tuna-route-src',
            paint: {
                'line-color': '#c97a74',
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
                'line-color': '#c97a74',
                'line-width': 2.4,
                'line-opacity': 0.72,
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
                'circle-color': 'rgba(212, 178, 124, 0.18)',
                'circle-stroke-color': '#d4b27c',
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

        if (sceneKey === 'scene3') {
            map.fitBounds([[-90.5, 22.2], [5.8, 42.8]], {
                padding: getMapPadding('transatlantic'),
                pitch: 0,
                bearing: 0,
                duration: 1800,
                essential: true
            });
        } else if (sceneKey === 'scene6') {
            map.fitBounds([[-5.87, 35.76], [-5.54, 36.04]], {
                padding: getMapPadding('cohunting'),
                pitch: 16,
                bearing: 0,
                duration: 1600,
                essential: true
            });
        } else if (!isNaN(lng) && !isNaN(lat) && !isNaN(zoom)) {
            map.flyTo({
                center: [lng, lat],
                zoom: zoom,
                pitch: pitch,
                bearing: bearing,
                padding: getMapPadding('default'),
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
                padding: getMapPadding('default'),
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
        hideCoHuntingOverlays();
        updateMapLegend(sceneKey);

        setMarkersForScene(sceneKey);

        switch (sceneKey) {
            case 'scene2':
                addCamarinalTransect();
                break;
            case 'scene3':
                addTransatlanticMigration();
                break;
            case 'scene4':
                addLasBajasArena();
                addMigrationRoute();
                setTimeout(() => Charts.redraw(), 450);
                break;
            case 'scene5':
                addAlmadrabaZones();
                addMigrationRoute();
                break;
            case 'scene6':
                addLasBajasArena();
                addCoHuntingOverlays();
                setTimeout(() => Charts.redraw(), 450);
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
                    if (map) {
                        map.resize();
                        if (currentScene === 2) {
                            map.fitBounds([[-90.5, 22.2], [5.8, 42.8]], {
                                padding: getMapPadding('transatlantic'),
                                pitch: 0,
                                bearing: 0,
                                duration: 400
                            });
                        } else if (currentScene === 5) {
                            map.fitBounds([[-5.87, 35.76], [-5.54, 36.04]], {
                                padding: getMapPadding('cohunting'),
                                pitch: 16,
                                bearing: 0,
                                duration: 400
                            });
                        }
                    }
                }, 250);
            });
        });

        map.on('error', (e) => {
            console.warn('Map error:', e);
            // Still hide loader on error so the story is readable
            document.getElementById('loader').classList.add('is-hidden');
        });
    }

    /* ── Lazy Media Fallback (IntersectionObserver) ───────────────────── */

    function initLazyMedia() {
        const supportsLazyMedia = Object.hasOwn(HTMLMediaElement.prototype, 'loading');
        if (supportsLazyMedia) return;

        const lazyMediaElements = document.querySelectorAll(
            'video[loading="lazy"], audio[loading="lazy"][controls]'
        );

        const mediaObserver = new IntersectionObserver(
            (entries, observer) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;
                    const media = entry.target;

                    if (media.dataset.poster) {
                        media.poster = media.dataset.poster;
                        delete media.dataset.poster;
                    }
                    if (media.dataset.preload) {
                        media.preload = media.dataset.preload;
                        delete media.dataset.preload;
                    }
                    media.load();
                    observer.unobserve(media);
                }
            },
            { rootMargin: '200px 0px' }
        );

        for (const media of lazyMediaElements) {
            if (media.hasAttribute('poster')) {
                media.dataset.poster = media.getAttribute('poster');
                media.removeAttribute('poster');
            }
            if (media.hasAttribute('preload') && media.getAttribute('preload') !== 'none') {
                media.dataset.preload = media.getAttribute('preload');
            }
            media.preload = 'none';
            mediaObserver.observe(media);
        }
    }

    /* ── Boot ─────────────────────────────────────────────────────────── */

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initLazyMedia();
            init();
        });
    } else {
        initLazyMedia();
        init();
    }

})();
