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
        almadraba: '#e9c46a'
    };

    function createMarkerElement(type, label) {
        const el = document.createElement('div');
        el.className = 'map-marker';
        el.style.cssText = `
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: ${markerColors[type] || '#fff'};
            border: 2px solid rgba(255,255,255,0.8);
            box-shadow: 0 0 12px ${markerColors[type] || '#fff'}80;
            cursor: pointer;
            transition: transform 0.3s ease;
        `;

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
            background: rgba(10, 25, 47, 0.9);
            backdrop-filter: blur(8px);
            padding: 4px 10px;
            border-radius: 6px;
            border: 1px solid rgba(100, 181, 246, 0.2);
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
        `;

        el.appendChild(tooltip);

        el.addEventListener('mouseenter', () => {
            el.style.transform = 'scale(1.5)';
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

    /* ── Current Arrows (Scene 4) ────────────────────────────────────── */

    let currentLinesAdded = false;

    function addCurrentArrows() {
        if (currentLinesAdded) {
            map.setLayoutProperty('atlantic-current', 'visibility', 'visible');
            map.setLayoutProperty('med-current', 'visibility', 'visible');
            return;
        }

        // Atlantic surface current path (east-flowing)
        map.addSource('atlantic-current-src', {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: [
                        [-6.2, 35.95],
                        [-5.9, 35.98],
                        [-5.6, 35.96],
                        [-5.3, 35.92],
                        [-5.0, 35.88]
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
                'line-width': 3,
                'line-opacity': 0.7,
                'line-dasharray': [2, 2]
            }
        });

        // Mediterranean deep outflow (west-flowing)
        map.addSource('med-current-src', {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: [
                        [-5.0, 35.82],
                        [-5.3, 35.84],
                        [-5.6, 35.87],
                        [-5.9, 35.90],
                        [-6.2, 35.88]
                    ]
                }
            }
        });

        map.addLayer({
            id: 'med-current',
            type: 'line',
            source: 'med-current-src',
            paint: {
                'line-color': '#e63946',
                'line-width': 2.5,
                'line-opacity': 0.6,
                'line-dasharray': [3, 3]
            }
        });

        currentLinesAdded = true;
    }

    function hideCurrentArrows() {
        if (!currentLinesAdded) return;
        try {
            map.setLayoutProperty('atlantic-current', 'visibility', 'none');
            map.setLayoutProperty('med-current', 'visibility', 'none');
        } catch (e) { /* layer may not exist yet */ }
    }

    /* ── Tuna Migration Route (Scene 5) ──────────────────────────────── */

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
        }

        // Scene-specific overlays
        hideCurrentArrows();
        hideMigrationRoute();
        hideAlmadrabaZones();

        const sceneKeys = ['scene1', 'scene2', 'scene3', 'scene4', 'scene5', 'scene6', 'closing'];
        const sceneKey = sceneKeys[idx] || '';

        setMarkersForScene(sceneKey);

        switch (sceneKey) {
            case 'scene4':
                addCurrentArrows();
                break;
            case 'scene5':
                addMigrationRoute();
                // Redraw charts when they become visible
                setTimeout(() => Charts.redraw(), 600);
                break;
            case 'scene6':
                addAlmadrabaZones();
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
