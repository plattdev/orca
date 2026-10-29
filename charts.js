/* ========================================================================
   ORCA STORYTELLING — Chart Module
   D3.js-based data visualisations embedded in the story.
   ======================================================================== */

const Charts = (() => {

    /* ── Muted Editorial Scientific Palette (matches CSS tokens) ─────── */
    const C = {
        ocean300: '#6d9dc5',
        ocean200: '#8fb8d6',
        ocean100: '#bfd6e8',
        orcaAccent: '#7fa8c4',
        tunaRed: '#c47d76',
        gold: '#d0ab76',
        ivory: '#e2c799',
        textPrimary: '#e6f1ff',
        textSecondary: '#a8b2d1',
        textDim: '#8892b0',
        gridLine: 'rgba(255,255,255,0.06)',
        thresholdLine: 'rgba(208,171,118,0.62)'
    };

    const fontMono = "'JetBrains Mono', monospace";
    const fontBody = "'Inter', sans-serif";

    /* ── Helpers ──────────────────────────────────────────────────────── */

    function responsiveDims(container) {
        const rect = container.getBoundingClientRect();
        const w = Math.max(rect.width, 200);
        const h = Math.max(rect.height, 150);
        return { w, h };
    }

    /* ── Bathymetry Cross-Section (SVG) ──────────────────────────────── */

    function drawBathymetry() {
        const svg = d3.select('#bathymetry-svg');
        if (svg.empty()) return;

        svg.selectAll('*').remove();

        const width = 400;
        const height = 210;
        const margin = { top: 22, right: 18, bottom: 32, left: 38 };
        const iw = width - margin.left - margin.right;
        const ih = height - margin.top - margin.bottom;

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Scales based on actual latitude and depth from reference sketch
        const x = d3.scaleLinear()
            .domain([35.845, 36.055])
            .range([0, iw]);

        const y = d3.scaleLinear()
            .domain([-350, 0])
            .range([ih, 0]);

        // Water surface
        g.append('line')
            .attr('x1', 0).attr('x2', iw)
            .attr('y1', y(0)).attr('y2', y(0))
            .attr('stroke', C.ocean300)
            .attr('stroke-width', 1.5)
            .attr('stroke-dasharray', '5,3')
            .attr('opacity', 0.8);

        g.append('text')
            .attr('x', iw).attr('y', y(0) - 6)
            .attr('text-anchor', 'end')
            .attr('fill', C.ocean200)
            .attr('font-size', '8px')
            .attr('font-family', fontMono)
            .text('Sea Level (0 m)');

        // Background terrain fill
        const area = d3.area()
            .x(d => x(d.lat))
            .y0(ih)
            .y1(d => y(d.depth))
            .curve(d3.curveMonotoneX);

        const defs = svg.append('defs');
        const gradient = defs.append('linearGradient')
            .attr('id', 'bath-gradient')
            .attr('x1', '0%').attr('y1', '0%')
            .attr('x2', '0%').attr('y2', '100%');
        gradient.append('stop').attr('offset', '0%').attr('stop-color', 'rgba(100, 181, 246, 0.35)');
        gradient.append('stop').attr('offset', '60%').attr('stop-color', 'rgba(10, 25, 47, 0.85)');
        gradient.append('stop').attr('offset', '100%').attr('stop-color', 'rgba(2, 12, 27, 0.98)');

        g.append('path')
            .datum(bathymetryProfile)
            .attr('d', area)
            .attr('fill', 'url(#bath-gradient)');

        // Sea bottom contour line
        const line = d3.line()
            .x(d => x(d.lat))
            .y(d => y(d.depth))
            .curve(d3.curveMonotoneX);

        g.append('path')
            .datum(bathymetryProfile)
            .attr('d', line)
            .attr('fill', 'none')
            .attr('stroke', C.ocean200)
            .attr('stroke-width', 2);

        // Depth grid lines & labels
        [-50, -100, -150, -200, -250, -300].forEach(d => {
            const yy = y(d);
            g.append('line')
                .attr('x1', 0).attr('x2', iw)
                .attr('y1', yy).attr('y2', yy)
                .attr('stroke', C.gridLine)
                .attr('stroke-width', 0.5);

            g.append('text')
                .attr('x', -6).attr('y', yy + 3)
                .attr('text-anchor', 'end')
                .attr('fill', C.textDim)
                .attr('font-size', '7.5px')
                .attr('font-family', fontMono)
                .text(`${Math.abs(d)}m`);
        });

        // Latitude grid lines & labels
        [35.85, 35.90, 35.95, 36.00, 36.05].forEach(lat => {
            const xx = x(lat);
            g.append('line')
                .attr('x1', xx).attr('x2', xx)
                .attr('y1', 0).attr('y2', ih)
                .attr('stroke', 'rgba(255,255,255,0.04)')
                .attr('stroke-width', 0.5);

            g.append('text')
                .attr('x', xx).attr('y', ih + 14)
                .attr('text-anchor', 'middle')
                .attr('fill', C.textDim)
                .attr('font-size', '7.5px')
                .attr('font-family', fontMono)
                .text(`${lat.toFixed(2)}°N`);
        });

        // Mooring stations from reference sketch: CSS and CSN
        const moorings = bathymetryProfile.filter(d => d.isMooring);
        moorings.forEach(m => {
            const mx = x(m.lat);
            const my = y(m.depth);

            // Vertical dashed mooring line
            g.append('line')
                .attr('x1', mx).attr('x2', mx)
                .attr('y1', y(0)).attr('y2', my)
                .attr('stroke', C.tunaRed)
                .attr('stroke-width', 1)
                .attr('stroke-dasharray', '3,2')
                .attr('opacity', 0.6);

            // Outer red target ring
            g.append('circle')
                .attr('cx', mx)
                .attr('cy', my)
                .attr('r', 6)
                .attr('fill', 'none')
                .attr('stroke', C.tunaRed)
                .attr('stroke-width', 1.5);

            // Inner red dot
            g.append('circle')
                .attr('cx', mx)
                .attr('cy', my)
                .attr('r', 2.5)
                .attr('fill', C.tunaRed);

            // Label tag (CSS / CSN)
            g.append('rect')
                .attr('x', mx - 14)
                .attr('y', my - 22)
                .attr('width', 28)
                .attr('height', 13)
                .attr('rx', 3)
                .attr('fill', 'rgba(196, 125, 118, 0.22)')
                .attr('stroke', C.tunaRed)
                .attr('stroke-width', 0.8);

            g.append('text')
                .attr('x', mx)
                .attr('y', my - 13)
                .attr('text-anchor', 'middle')
                .attr('fill', '#fff')
                .attr('font-size', '8px')
                .attr('font-weight', '700')
                .attr('font-family', fontMono)
                .text(m.label);

            // Depth tag
            g.append('text')
                .attr('x', mx)
                .attr('y', my + 13)
                .attr('text-anchor', 'middle')
                .attr('fill', C.tunaRed)
                .attr('font-size', '7px')
                .attr('font-weight', '600')
                .attr('font-family', fontMono)
                .text('290 m');
        });

        // Central ridge label (between CSS and CSN)
        const crest = bathymetryProfile.find(d => d.label === 'Crest');
        if (crest) {
            const cx = x(crest.lat);
            const cy = y(crest.depth);
            g.append('circle')
                .attr('cx', cx).attr('cy', cy)
                .attr('r', 2.5)
                .attr('fill', C.gold);

            g.append('text')
                .attr('x', cx).attr('y', cy - 8)
                .attr('text-anchor', 'middle')
                .attr('fill', C.gold)
                .attr('font-size', '6.5px')
                .attr('font-family', fontMono)
                .text('Ridge ~180m');
        }
    }

    /* ── Scene 4: Total Community Abundance Chart (1999–2011) ────────── */

    function drawPopulationChart() {
        const canvas = document.getElementById('canvas-population');
        if (!canvas) return;

        const container = canvas.parentElement;
        const { w, h } = responsiveDims(container);
        const dpr = window.devicePixelRatio || 1;

        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';

        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);

        const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        const fsAxis = Math.round(rootPx * 0.72);
        const fsNote = Math.round(rootPx * 0.70);
        const fsLegend = Math.round(rootPx * 0.75);

        const margin = { top: 26, right: 20, bottom: 32, left: 38 };
        const iw = w - margin.left - margin.right;
        const ih = h - margin.top - margin.bottom;

        const data = orcaPopulationData;

        const xScale = d3.scaleLinear()
            .domain(d3.extent(data.years))
            .range([0, iw]);

        const yScale = d3.scaleLinear()
            .domain([0, 45])
            .range([ih, 0]);

        ctx.save();
        ctx.translate(margin.left, margin.top);

        // Subtle horizontal grid
        ctx.strokeStyle = C.gridLine;
        ctx.lineWidth = 0.6;
        [0, 10, 20, 30, 40].forEach(v => {
            const yy = yScale(v);
            ctx.beginPath();
            ctx.moveTo(0, yy);
            ctx.lineTo(iw, yy);
            ctx.stroke();

            ctx.fillStyle = C.textSecondary;
            ctx.font = `${fsAxis}px ${fontMono}`;
            ctx.textAlign = 'right';
            ctx.fillText(v, -8, yy + 4);
        });

        // X labels
        ctx.fillStyle = C.textSecondary;
        ctx.font = `${fsAxis}px ${fontMono}`;
        ctx.textAlign = 'center';
        [2000, 2005, 2010, 2015, 2020, 2023].forEach(year => {
            ctx.fillText(year, xScale(year), ih + 20);
        });

        // Soft muted area fill - total community
        ctx.beginPath();
        ctx.moveTo(xScale(data.years[0]), ih);
        data.years.forEach((year, i) => {
            ctx.lineTo(xScale(year), yScale(data.totalAbundance[i]));
        });
        ctx.lineTo(xScale(data.years[data.years.length - 1]), ih);
        ctx.closePath();

        const areaGrad = ctx.createLinearGradient(0, 0, 0, ih);
        areaGrad.addColorStop(0, 'rgba(127, 168, 196, 0.20)');
        areaGrad.addColorStop(1, 'rgba(127, 168, 196, 0.01)');
        ctx.fillStyle = areaGrad;
        ctx.fill();

        // Total community line
        ctx.beginPath();
        ctx.strokeStyle = C.orcaAccent;
        ctx.lineWidth = 2.2;
        ctx.lineJoin = 'round';
        data.years.forEach((year, i) => {
            const px = xScale(year);
            const py = yScale(data.totalAbundance[i]);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        });
        ctx.stroke();

        // Data points (total community)
        data.years.forEach((year, i) => {
            const px = xScale(year);
            const py = yScale(data.totalAbundance[i]);
            ctx.beginPath();
            ctx.arc(px, py, 3.2, 0, Math.PI * 2);
            ctx.fillStyle = C.ocean100;
            ctx.fill();
            ctx.strokeStyle = '#071426';
            ctx.lineWidth = 1.4;
            ctx.stroke();
        });

        // Endpoints annotations (2011 and 2023 updates)
        ctx.fillStyle = C.textPrimary;
        ctx.font = `600 ${fsNote}px ${fontMono}`;
        ctx.textAlign = 'center';
        const idx2011 = data.years.indexOf(2011);
        if (idx2011 !== -1) {
            ctx.fillText('39 (2011)', xScale(2011), yScale(data.totalAbundance[idx2011]) - 10);
        }
        const lastIdx = data.years.length - 1;
        ctx.textAlign = 'right';
        ctx.fillText('37 whales (2023 · 6 communities)', xScale(data.years[lastIdx]), yScale(data.totalAbundance[lastIdx]) - 10);

        ctx.restore();
        const lx = margin.left;
        const ly = 11;
        ctx.font = `${fsLegend}px ${fontBody}`;
        ctx.fillStyle = C.orcaAccent;
        ctx.fillRect(lx, ly - 2, 14, 2.5);
        ctx.fillStyle = C.textSecondary;
        ctx.textAlign = 'left';
        ctx.fillText('Resident subpopulation abundance (Esteban et al., 2016, 2026)', lx + 20, ly + 3);
    }

    /* ── Scene 6: Interacting Pods (INT) vs. Total Community (1999–2011) ─ */

    function drawInteractingChart() {
        const canvas = document.getElementById('canvas-interacting');
        if (!canvas) return;

        const container = canvas.parentElement;
        const { w, h } = responsiveDims(container);
        const dpr = window.devicePixelRatio || 1;

        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';

        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);

        const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        const fsAxis = Math.round(rootPx * 0.72);
        const fsNote = Math.round(rootPx * 0.68);
        const fsLegend = Math.round(rootPx * 0.74);

        const margin = { top: 26, right: 18, bottom: 32, left: 36 };
        const iw = w - margin.left - margin.right;
        const ih = h - margin.top - margin.bottom;

        const data = orcaPopulationData;

        const xScale = d3.scaleLinear()
            .domain(d3.extent(data.years))
            .range([0, iw]);

        const yScale = d3.scaleLinear()
            .domain([0, 45])
            .range([ih, 0]);

        ctx.save();
        ctx.translate(margin.left, margin.top);

        // Shaded 2006–2010 calf mortality plateau window
        const x2005 = xScale(2005.5);
        const x2010 = xScale(2010.5);
        ctx.fillStyle = 'rgba(196, 125, 118, 0.08)';
        ctx.fillRect(x2005, 0, x2010 - x2005, ih);

        // Grid
        ctx.strokeStyle = C.gridLine;
        ctx.lineWidth = 0.6;
        [0, 10, 20, 30, 40].forEach(v => {
            const yy = yScale(v);
            ctx.beginPath();
            ctx.moveTo(0, yy);
            ctx.lineTo(iw, yy);
            ctx.stroke();

            ctx.fillStyle = C.textSecondary;
            ctx.font = `${fsAxis}px ${fontMono}`;
            ctx.textAlign = 'right';
            ctx.fillText(v, -6, yy + 4);
        });

        // X labels
        ctx.fillStyle = C.textSecondary;
        ctx.font = `${fsAxis}px ${fontMono}`;
        ctx.textAlign = 'center';
        data.years.filter((_, i) => i % 2 === 0).forEach(year => {
            ctx.fillText(year, xScale(year), ih + 20);
        });

        // Total community reference line (dashed muted stone + open squares)
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(189, 178, 158, 0.72)';
        ctx.lineWidth = 1.6;
        ctx.setLineDash([4, 3]);
        data.years.forEach((year, i) => {
            const px = xScale(year);
            const py = yScale(data.totalAbundance[i]);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        });
        ctx.stroke();
        ctx.setLineDash([]);

        data.years.forEach((year, i) => {
            const px = xScale(year);
            const py = yScale(data.totalAbundance[i]);
            ctx.fillStyle = '#071426';
            ctx.strokeStyle = 'rgba(208, 196, 174, 0.85)';
            ctx.lineWidth = 1.3;
            ctx.fillRect(px - 2.6, py - 2.6, 5.2, 5.2);
            ctx.strokeRect(px - 2.6, py - 2.6, 5.2, 5.2);
        });

        // Soft fill under Interacting pods (INT: A1 & A2 — muted ocean blue)
        ctx.beginPath();
        ctx.moveTo(xScale(data.years[0]), ih);
        data.years.forEach((year, i) => {
            ctx.lineTo(xScale(year), yScale(data.interactingPodsINT[i]));
        });
        ctx.lineTo(xScale(data.years[data.years.length - 1]), ih);
        ctx.closePath();
        const intGrad = ctx.createLinearGradient(0, yScale(20), 0, ih);
        intGrad.addColorStop(0, 'rgba(126, 176, 213, 0.24)');
        intGrad.addColorStop(1, 'rgba(126, 176, 213, 0.02)');
        ctx.fillStyle = intGrad;
        ctx.fill();

        // Interacting pods (INT) primary line (muted ocean blue + filled circles)
        ctx.beginPath();
        ctx.strokeStyle = C.ocean200;
        ctx.lineWidth = 2.4;
        ctx.lineJoin = 'round';
        data.years.forEach((year, i) => {
            const px = xScale(year);
            const py = yScale(data.interactingPodsINT[i]);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        });
        ctx.stroke();

        data.years.forEach((year, i) => {
            const px = xScale(year);
            const py = yScale(data.interactingPodsINT[i]);
            ctx.beginPath();
            ctx.arc(px, py, 3.2, 0, Math.PI * 2);
            ctx.fillStyle = C.ocean200;
            ctx.fill();
            ctx.strokeStyle = '#071426';
            ctx.lineWidth = 1.4;
            ctx.stroke();
        });

        // Endpoint callout for INT = 18
        const last = data.years.length - 1;
        ctx.fillStyle = C.ocean100;
        ctx.font = `600 ${fsNote}px ${fontMono}`;
        ctx.textAlign = 'right';
        ctx.fillText('18 INT (+3.9%/yr)', xScale(data.years[last]) - 4, yScale(data.interactingPodsINT[last]) - 9);

        ctx.restore();
        const lx = margin.left;
        const ly = 11;
        ctx.font = `${fsLegend}px ${fontBody}`;

        // Legend item 1: Interacting (filled circle + solid muted blue line)
        ctx.fillStyle = C.ocean200;
        ctx.fillRect(lx, ly - 2, 13, 2.5);
        ctx.beginPath();
        ctx.arc(lx + 6.5, ly - 0.8, 2.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = C.textPrimary;
        ctx.textAlign = 'left';
        ctx.fillText('Interacting (A1, A2)', lx + 17, ly + 3);

        // Legend item 2: Total (open square + dashed stone)
        const lx2 = lx + Math.min(iw * 0.56, 142);
        ctx.strokeStyle = 'rgba(208, 196, 174, 0.85)';
        ctx.lineWidth = 1.3;
        ctx.strokeRect(lx2, ly - 4, 6, 6);
        ctx.fillStyle = C.textSecondary;
        ctx.fillText('All 5 pods', lx2 + 10, ly + 3);
    }

    /* ── Scene 6: Drop-Line Tuna Catches & INT Calf Survival ─────────── */

    function drawTunaChart() {
        const canvas = document.getElementById('canvas-tuna');
        if (!canvas) return;

        const container = canvas.parentElement;
        const { w, h } = responsiveDims(container);
        const dpr = window.devicePixelRatio || 1;

        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';

        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);

        const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        const fsAxis = Math.round(rootPx * 0.72);
        const fsNote = Math.round(rootPx * 0.68);
        const fsLegend = Math.round(rootPx * 0.74);

        const margin = { top: 26, right: 38, bottom: 32, left: 38 };
        const iw = w - margin.left - margin.right;
        const ih = h - margin.top - margin.bottom;

        const data = tunaCatchesAndSurvivalData;

        const xScale = d3.scaleLinear()
            .domain(d3.extent(data.years))
            .range([0, iw]);

        const yScaleLeft = d3.scaleLinear()
            .domain([0, 860])
            .range([ih, 0]);

        const yScaleRight = d3.scaleLinear()
            .domain([0, 1])
            .range([ih, 0]);

        ctx.save();
        ctx.translate(margin.left, margin.top);

        // Grid
        ctx.strokeStyle = C.gridLine;
        ctx.lineWidth = 0.6;
        [200, 400, 600, 800].forEach(v => {
            const yy = yScaleLeft(v);
            ctx.beginPath();
            ctx.moveTo(0, yy);
            ctx.lineTo(iw, yy);
            ctx.stroke();

            ctx.fillStyle = C.textSecondary;
            ctx.font = `${fsAxis}px ${fontMono}`;
            ctx.textAlign = 'right';
            ctx.fillText(`${v}t`, -5, yy + 4);
        });

        // X labels
        ctx.fillStyle = C.textSecondary;
        ctx.font = `${fsAxis}px ${fontMono}`;
        ctx.textAlign = 'center';
        data.years.filter((_, i) => i % 2 === 0).forEach(year => {
            ctx.fillText(year, xScale(year), ih + 20);
        });

        // Muted bars for drop-line tuna catches
        const barWidth = Math.max(iw / data.years.length * 0.56, 5);
        data.years.forEach((year, i) => {
            const px = xScale(year) - barWidth / 2;
            const val = data.tunaCatchesTons[i];
            const py = yScaleLeft(val);

            const isAboveStable = val >= data.thresholdStable;
            ctx.fillStyle = isAboveStable
                ? 'rgba(127, 168, 196, 0.44)'
                : 'rgba(184, 128, 120, 0.34)';
            ctx.strokeStyle = isAboveStable
                ? 'rgba(155, 194, 219, 0.65)'
                : 'rgba(196, 145, 136, 0.52)';
            ctx.lineWidth = 1;

            const r = 2;
            ctx.beginPath();
            ctx.moveTo(px + r, py);
            ctx.lineTo(px + barWidth - r, py);
            ctx.quadraticCurveTo(px + barWidth, py, px + barWidth, py + r);
            ctx.lineTo(px + barWidth, ih);
            ctx.lineTo(px, ih);
            ctx.lineTo(px, py + r);
            ctx.quadraticCurveTo(px, py, px + r, py);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        });

        // Single clean threshold line: 573t minimum catch for stable INT calf survival (Esteban et al., 2016)
        const yyThresh = yScaleLeft(data.thresholdStable);
        ctx.beginPath();
        ctx.strokeStyle = C.thresholdLine;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 3]);
        ctx.moveTo(0, yyThresh);
        ctx.lineTo(iw, yyThresh);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = C.ivory;
        ctx.font = `${fsNote}px ${fontMono}`;
        ctx.textAlign = 'right';
        ctx.fillText(`Min. viable catch (${data.thresholdStable}t)`, iw - 2, yyThresh - 5);

        // INT Calf survival rate line (right axis — 1-yr lag response)
        ctx.beginPath();
        ctx.strokeStyle = C.ivory;
        ctx.lineWidth = 2.1;
        ctx.lineJoin = 'round';
        data.years.forEach((year, i) => {
            const px = xScale(year);
            const py = yScaleRight(data.calfSurvivalRate[i]);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        });
        ctx.stroke();

        // Survival markers: filled circle when 100%, hollow ring when 0% (shape + color accessibility)
        data.years.forEach((year, i) => {
            const px = xScale(year);
            const py = yScaleRight(data.calfSurvivalRate[i]);
            const survived = data.calfSurvivalRate[i] > 0;
            ctx.beginPath();
            ctx.arc(px, py, 3.3, 0, Math.PI * 2);
            if (survived) {
                ctx.fillStyle = C.ivory;
                ctx.fill();
                ctx.strokeStyle = '#071426';
                ctx.lineWidth = 1.4;
                ctx.stroke();
            } else {
                ctx.fillStyle = '#071426';
                ctx.fill();
                ctx.strokeStyle = C.tunaRed;
                ctx.lineWidth = 1.7;
                ctx.stroke();
            }
        });

        // Right axis labels
        ctx.fillStyle = C.textSecondary;
        ctx.font = `${fsAxis}px ${fontMono}`;
        ctx.textAlign = 'left';
        [0, 0.5, 1].forEach(v => {
            ctx.fillText(`${Math.round(v * 100)}%`, iw + 5, yScaleRight(v) + 4);
        });

        // Legend
        ctx.restore();
        const lx = margin.left;
        const ly = 11;
        ctx.font = `${fsLegend}px ${fontBody}`;

        ctx.fillStyle = 'rgba(127, 168, 196, 0.55)';
        ctx.fillRect(lx, ly - 5, 9, 9);
        ctx.fillStyle = C.textSecondary;
        ctx.textAlign = 'left';
        ctx.fillText('Catches (t)', lx + 13, ly + 3);

        const lx2 = lx + Math.min(iw * 0.48, 102);
        ctx.fillStyle = C.ivory;
        ctx.fillRect(lx2, ly - 2, 13, 2.2);
        ctx.fillStyle = C.textPrimary;
        ctx.fillText('INT Calf Survival', lx2 + 17, ly + 3);
    }

    /* ── Public API ──────────────────────────────────────────────────── */

    function initAll() {
        drawBathymetry();
        drawPopulationChart();
        drawInteractingChart();
        drawTunaChart();
    }

    function redraw() {
        drawPopulationChart();
        drawInteractingChart();
        drawTunaChart();
    }

    return { initAll, redraw, drawBathymetry, drawPopulationChart, drawInteractingChart, drawTunaChart };
})();
