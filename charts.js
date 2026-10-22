/* ========================================================================
   ORCA STORYTELLING — Chart Module
   D3.js-based data visualisations embedded in the story.
   ======================================================================== */

const Charts = (() => {

    /* ── Colour tokens (match CSS variables) ─────────────────────────── */
    const C = {
        ocean300: '#4a8fe7',
        ocean200: '#64b5f6',
        ocean100: '#a8d8ea',
        orcaAccent: '#06d6a0',
        tunaRed: '#e63946',
        gold: '#f4a261',
        textPrimary: '#e6f1ff',
        textSecondary: '#a8b2d1',
        textDim: '#8892b0',
        gridLine: 'rgba(255,255,255,0.06)',
        thresholdLine: 'rgba(244,162,97,0.5)'
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
                .attr('fill', 'rgba(230, 57, 70, 0.25)')
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

    /* ── Orca Population Chart (Canvas via D3) ───────────────────────── */

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

        const margin = { top: 16, right: 12, bottom: 28, left: 32 };
        const iw = w - margin.left - margin.right;
        const ih = h - margin.top - margin.bottom;

        const data = orcaPopulationData;

        const xScale = d3.scaleLinear()
            .domain(d3.extent(data.years))
            .range([0, iw]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data.totalAbundance) * 1.15])
            .range([ih, 0]);

        ctx.save();
        ctx.translate(margin.left, margin.top);

        // Grid
        ctx.strokeStyle = C.gridLine;
        ctx.lineWidth = 0.5;
        [10, 20, 30, 40].forEach(v => {
            const yy = yScale(v);
            ctx.beginPath();
            ctx.moveTo(0, yy);
            ctx.lineTo(iw, yy);
            ctx.stroke();

            ctx.fillStyle = C.textDim;
            ctx.font = `9px ${fontMono}`;
            ctx.textAlign = 'right';
            ctx.fillText(v, -6, yy + 3);
        });

        // X labels
        ctx.fillStyle = C.textDim;
        ctx.font = `9px ${fontMono}`;
        ctx.textAlign = 'center';
        data.years.filter((_, i) => i % 2 === 0).forEach(year => {
            ctx.fillText(year, xScale(year), ih + 18);
        });

        // Area fill - total
        ctx.beginPath();
        ctx.moveTo(xScale(data.years[0]), ih);
        data.years.forEach((year, i) => {
            ctx.lineTo(xScale(year), yScale(data.totalAbundance[i]));
        });
        ctx.lineTo(xScale(data.years[data.years.length - 1]), ih);
        ctx.closePath();

        const areaGrad = ctx.createLinearGradient(0, 0, 0, ih);
        areaGrad.addColorStop(0, 'rgba(6, 214, 160, 0.25)');
        areaGrad.addColorStop(1, 'rgba(6, 214, 160, 0.02)');
        ctx.fillStyle = areaGrad;
        ctx.fill();

        // Total line
        ctx.beginPath();
        ctx.strokeStyle = C.orcaAccent;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        data.years.forEach((year, i) => {
            const px = xScale(year);
            const py = yScale(data.totalAbundance[i]);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        });
        ctx.stroke();

        // Interacting pods line
        ctx.beginPath();
        ctx.strokeStyle = C.ocean300;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 3]);
        data.years.forEach((year, i) => {
            const px = xScale(year);
            const py = yScale(data.interactingPodsINT[i]);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        });
        ctx.stroke();
        ctx.setLineDash([]);

        // Dots for total
        data.years.forEach((year, i) => {
            const px = xScale(year);
            const py = yScale(data.totalAbundance[i]);
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fillStyle = C.orcaAccent;
            ctx.fill();
            ctx.strokeStyle = '#0a192f';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        });

        // Birth annotations (for notable years)
        data.years.forEach((year, i) => {
            if (data.births[i] >= 2) {
                const px = xScale(year);
                const py = yScale(data.totalAbundance[i]);
                ctx.fillStyle = C.gold;
                ctx.font = `bold 8px ${fontMono}`;
                ctx.textAlign = 'center';
                ctx.fillText(`+${data.births[i]}`, px, py - 10);
            }
        });

        // Legend
        ctx.restore();
        const lx = margin.left;
        const ly = 8;
        ctx.font = `9px ${fontBody}`;

        ctx.fillStyle = C.orcaAccent;
        ctx.fillRect(lx, ly, 12, 2);
        ctx.fillStyle = C.textSecondary;
        ctx.textAlign = 'left';
        ctx.fillText('Total', lx + 16, ly + 4);

        ctx.fillStyle = C.ocean300;
        ctx.fillRect(lx + 60, ly, 12, 2);
        ctx.fillStyle = C.textSecondary;
        ctx.fillText('Interacting', lx + 76, ly + 4);
    }

    /* ── Tuna Catches & Survival Chart (Canvas via D3) ───────────────── */

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

        const margin = { top: 16, right: 30, bottom: 28, left: 32 };
        const iw = w - margin.left - margin.right;
        const ih = h - margin.top - margin.bottom;

        const data = tunaCatchesAndSurvivalData;

        const xScale = d3.scaleLinear()
            .domain(d3.extent(data.years))
            .range([0, iw]);

        const yScaleLeft = d3.scaleLinear()
            .domain([0, 850])
            .range([ih, 0]);

        const yScaleRight = d3.scaleLinear()
            .domain([0, 1])
            .range([ih, 0]);

        ctx.save();
        ctx.translate(margin.left, margin.top);

        // Grid
        ctx.strokeStyle = C.gridLine;
        ctx.lineWidth = 0.5;
        [200, 400, 600, 800].forEach(v => {
            const yy = yScaleLeft(v);
            ctx.beginPath();
            ctx.moveTo(0, yy);
            ctx.lineTo(iw, yy);
            ctx.stroke();

            ctx.fillStyle = C.textDim;
            ctx.font = `8px ${fontMono}`;
            ctx.textAlign = 'right';
            ctx.fillText(`${v}t`, -4, yy + 3);
        });

        // Threshold lines
        [data.thresholdStable, data.thresholdGrowth].forEach((t, i) => {
            const yy = yScaleLeft(t);
            ctx.beginPath();
            ctx.strokeStyle = i === 0 ? C.thresholdLine : C.gold;
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.moveTo(0, yy);
            ctx.lineTo(iw, yy);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = i === 0 ? C.thresholdLine : C.gold;
            ctx.font = `7px ${fontMono}`;
            ctx.textAlign = 'left';
            ctx.fillText(i === 0 ? `Stable (${t}t)` : `Growth (${t}t)`, 4, yy - 4);
        });

        // X labels
        ctx.fillStyle = C.textDim;
        ctx.font = `9px ${fontMono}`;
        ctx.textAlign = 'center';
        data.years.filter((_, i) => i % 2 === 0).forEach(year => {
            ctx.fillText(year, xScale(year), ih + 18);
        });

        // Bars for tuna catches
        const barWidth = Math.max(iw / data.years.length * 0.6, 4);
        data.years.forEach((year, i) => {
            const px = xScale(year) - barWidth / 2;
            const val = data.tunaCatchesTons[i];
            const py = yScaleLeft(val);
            const barH = ih - py;

            // Color based on threshold
            const isAboveStable = val >= data.thresholdStable;
            ctx.fillStyle = isAboveStable
                ? 'rgba(6, 214, 160, 0.6)'
                : 'rgba(230, 57, 70, 0.5)';

            // Rounded top
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
        });

        // Survival rate line (right axis)
        ctx.beginPath();
        ctx.strokeStyle = C.tunaRed;
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        data.years.forEach((year, i) => {
            const px = xScale(year);
            const py = yScaleRight(data.calfSurvivalRate[i]);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        });
        ctx.stroke();

        // Survival dots
        data.years.forEach((year, i) => {
            const px = xScale(year);
            const py = yScaleRight(data.calfSurvivalRate[i]);
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fillStyle = data.calfSurvivalRate[i] > 0 ? C.orcaAccent : C.tunaRed;
            ctx.fill();
            ctx.strokeStyle = '#0a192f';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        });

        // Right axis labels
        ctx.fillStyle = C.textDim;
        ctx.font = `8px ${fontMono}`;
        ctx.textAlign = 'left';
        [0, 0.5, 1].forEach(v => {
            ctx.fillText(`${Math.round(v * 100)}%`, iw + 4, yScaleRight(v) + 3);
        });

        // Legend
        ctx.restore();
        const lx = margin.left;
        const ly = 8;
        ctx.font = `8px ${fontBody}`;

        ctx.fillStyle = 'rgba(6, 214, 160, 0.6)';
        ctx.fillRect(lx, ly - 2, 8, 8);
        ctx.fillStyle = C.textSecondary;
        ctx.textAlign = 'left';
        ctx.fillText('Catches', lx + 12, ly + 4);

        ctx.fillStyle = C.tunaRed;
        ctx.fillRect(lx + 60, ly, 12, 2);
        ctx.fillStyle = C.textSecondary;
        ctx.fillText('Calf Survival', lx + 76, ly + 4);
    }

    /* ── Public API ──────────────────────────────────────────────────── */

    function initAll() {
        drawBathymetry();
        drawPopulationChart();
        drawTunaChart();
    }

    function redraw() {
        drawPopulationChart();
        drawTunaChart();
    }

    return { initAll, redraw, drawBathymetry, drawPopulationChart, drawTunaChart };
})();
