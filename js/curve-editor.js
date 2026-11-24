/**
 * KİRO V4.0 — Çoklu Kıvrım (+ Kıvrım Ekle), Çatal (⑂ Çatal Ekle) ve 2.4x Büyüteçli Kavis Editörü (curve-editor.js)
 * Catmull-Rom yumuşak eğrileri + gerçek matematiksel geometri ölçümü.
 */
(function (global) {
  'use strict';

  const MAX_POINTS = 6;
  const LOUPE_ZOOM = 2.4;

  const LINE_META = {
    heart: {
      step: 'Çizgi 1 / 3',
      title: 'Kalp Çizgisini Belirle',
      btn: 'Kalp Çizgisini Onayla',
      color: '#F28B82',
      hint: 'Üstteki yatay çizgi: serçe parmak kenarından işaret parmağına doğru uzanır.',
      // Sağ avuç içi (başparmak solda) normalize koordinatları (0..1)
      defaultsRight: [
        { x: 0.80, y: 0.43 },
        { x: 0.56, y: 0.42 },
        { x: 0.34, y: 0.34 }
      ]
    },
    head: {
      step: 'Çizgi 2 / 3',
      title: 'Akıl Çizgisini Belirle',
      btn: 'Akıl Çizgisini Onayla',
      color: '#7DD3FC',
      hint: 'Ortadaki çizgi: başparmak ile işaret parmağı arasından avucun dışına uzanır.',
      defaultsRight: [
        { x: 0.28, y: 0.48 },
        { x: 0.50, y: 0.53 },
        { x: 0.72, y: 0.61 }
      ]
    },
    life: {
      step: 'Çizgi 3 / 3',
      title: 'Yaşam Çizgisini Belirle',
      btn: 'Yaşam Çizgisini Onayla',
      color: '#E6C27A',
      hint: 'Başparmak kökünü kavisle sarıp bileğe doğru inen ana çizgi.',
      defaultsRight: [
        { x: 0.27, y: 0.50 },
        { x: 0.43, y: 0.68 },
        { x: 0.44, y: 0.89 }
      ]
    }
  };

  let currentKey = 'heart';
  let bgImg = null;
  let points = []; // [{x, y}] normalize 0..1
  let fork = null; // null | { t: 0.7, tip: {x, y} }
  let dragTarget = null; // { type: 'pt', idx } | { type: 'forkOrigin' } | { type: 'forkTip' }
  let canvas = null;
  let ctx = null;
  let loupe = null;
  let loupeCtx = null;

  function mirrorIfLeft(pts) {
    const side = KiroState.get().hands.activeSide;
    return pts.map(p => ({ x: side === 'left' ? 1 - p.x : p.x, y: p.y }));
  }

  function buildMiniRefSvg(key) {
    const side = KiroState.get().hands.activeSide;
    const flip = side === 'left' ? 'transform="scale(-1,1) translate(-64,0)"' : '';
    const cHeart = key === 'heart' ? '#F28B82' : 'rgba(255,255,255,0.20)';
    const cHead = key === 'head' ? '#7DD3FC' : 'rgba(255,255,255,0.20)';
    const cLife = key === 'life' ? '#E6C27A' : 'rgba(255,255,255,0.20)';
    const wHeart = key === 'heart' ? 2.6 : 1.2;
    const wHead = key === 'head' ? 2.6 : 1.2;
    const wLife = key === 'life' ? 2.6 : 1.2;
    const label = key === 'heart' ? 'KALP' : key === 'head' ? 'AKIL' : 'YAŞAM';

    return `
      <svg viewBox="0 0 64 64" width="48" height="48" fill="none">
        <g ${flip}>
          <path d="M18 58 L16 42 Q8 34 10 26 Q14 24 19 30 L20 12 Q24 9 26 15 L27 24 L29 8 Q33 5 35 11 L35 23 L38 10 Q42 8 43 14 L42 25 L46 17 Q50 16 50 22 L48 40 Q50 50 43 58" stroke="rgba(212,175,106,0.45)" stroke-width="1.3" stroke-linecap="round"/>
          <path d="M47 32 Q36 31 24 26" stroke="${cHeart}" stroke-width="${wHeart}" stroke-linecap="round"/>
          <path d="M21 34 Q33 36 45 42" stroke="${cHead}" stroke-width="${wHead}" stroke-linecap="round"/>
          <path d="M21 35 Q30 43 29 55" stroke="${cLife}" stroke-width="${wLife}" stroke-linecap="round"/>
        </g>
      </svg>
      <span>${label}</span>
    `;
  }

  // Catmull-Rom yumuşak eğri örnekleme
  function sampleSpline(pts, samplesPerSeg = 22) {
    if (pts.length < 2) return pts.slice();
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let s = 0; s < samplesPerSeg; s++) {
        const t = s / samplesPerSeg;
        const t2 = t * t;
        const t3 = t2 * t;
        const x = 0.5 * (
          (2 * p1.x) +
          (-p0.x + p2.x) * t +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
        );
        const y = 0.5 * (
          (2 * p1.y) +
          (-p0.y + p2.y) * t +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
        );
        out.push({ x, y });
      }
    }
    out.push({ x: pts[pts.length - 1].x, y: pts[pts.length - 1].y });
    return out;
  }

  function pointOnSplineAtT(t) {
    const sampled = sampleSpline(points, 20);
    const idx = Math.max(0, Math.min(sampled.length - 1, Math.round(t * (sampled.length - 1))));
    return sampled[idx];
  }

  function nearestTOnSpline(nx, ny) {
    const sampled = sampleSpline(points, 24);
    let bestT = 0.7;
    let bestD = Infinity;
    for (let i = 0; i < sampled.length; i++) {
      const dx = sampled[i].x - nx;
      const dy = sampled[i].y - ny;
      const d = dx * dx + dy * dy;
      if (d < bestD) {
        bestD = d;
        bestT = i / (sampled.length - 1);
      }
    }
    return Math.max(0.15, Math.min(0.95, bestT));
  }

  // Gerçek Matematiksel Geometri Analizi
  function computeMetrics() {
    const sampled = sampleSpline(points, 24);
    let arcLen = 0;
    for (let i = 1; i < sampled.length; i++) {
      arcLen += Math.hypot(sampled[i].x - sampled[i - 1].x, sampled[i].y - sampled[i - 1].y);
    }
    const start = points[0];
    const end = points[points.length - 1];
    const chord = Math.hypot(end.x - start.x, end.y - start.y) || 0.001;
    const curvatureRatio = +(arcLen / chord).toFixed(3); // 1.0 = düz, >1.08 = belirgin kavis

    // Çatal açısı hesabı (derece)
    let forkAngle = 0;
    if (fork) {
      const origin = pointOnSplineAtT(fork.t);
      const ahead = pointOnSplineAtT(Math.min(1, fork.t + 0.12));
      const v1x = ahead.x - origin.x;
      const v1y = ahead.y - origin.y;
      const v2x = fork.tip.x - origin.x;
      const v2y = fork.tip.y - origin.y;
      const dot = v1x * v2x + v1y * v2y;
      const mag = (Math.hypot(v1x, v1y) * Math.hypot(v2x, v2y)) || 0.001;
      forkAngle = Math.round(Math.acos(Math.max(-1, Math.min(1, dot / mag))) * (180 / Math.PI));
    }

    const slope = +(end.y - start.y).toFixed(3);
    const shapeLabel =
      curvatureRatio < 1.04 ? 'Düz & Net'
      : curvatureRatio < 1.14 ? 'Yumuşak Kavisli'
      : 'Derin Kavisli';

    return {
      points: points.map(p => ({ x: +p.x.toFixed(4), y: +p.y.toFixed(4) })),
      fork: fork ? { t: +fork.t.toFixed(3), tip: { x: +fork.tip.x.toFixed(4), y: +fork.tip.y.toFixed(4) } } : null,
      bendsCount: points.length,
      hasFork: !!fork,
      forkAngle,
      arcLength: +arcLen.toFixed(3),
      curvatureRatio,
      slope,
      shapeLabel
    };
  }

  function drawScene(targetCtx, w, h, showHandles = true) {
    targetCtx.clearRect(0, 0, w, h);
    if (bgImg) {
      targetCtx.drawImage(bgImg, 0, 0, w, h);
    }

    // Hafif koyu kontrast perdesi (çizgi okunurluğu için)
    targetCtx.fillStyle = 'rgba(7, 9, 13, 0.18)';
    targetCtx.fillRect(0, 0, w, h);

    const meta = LINE_META[currentKey];
    const sampled = sampleSpline(points, 24);

    // Ana Eğri — Dış Parlama + Keskin Çizgi
    targetCtx.save();
    targetCtx.lineCap = 'round';
    targetCtx.lineJoin = 'round';

    targetCtx.beginPath();
    sampled.forEach((p, idx) => {
      if (idx === 0) targetCtx.moveTo(p.x * w, p.y * h);
      else targetCtx.lineTo(p.x * w, p.y * h);
    });
    targetCtx.strokeStyle = meta.color;
    targetCtx.shadowColor = meta.color;
    targetCtx.shadowBlur = 12;
    targetCtx.lineWidth = 4;
    targetCtx.stroke();

    // Çatal Dalı
    if (fork) {
      const origin = pointOnSplineAtT(fork.t);
      const midX = (origin.x + fork.tip.x) / 2;
      const midY = (origin.y + fork.tip.y) / 2;
      targetCtx.beginPath();
      targetCtx.moveTo(origin.x * w, origin.y * h);
      targetCtx.quadraticCurveTo(midX * w, midY * h, fork.tip.x * w, fork.tip.y * h);
      targetCtx.strokeStyle = '#F0D79A';
      targetCtx.shadowColor = '#D4AF6A';
      targetCtx.shadowBlur = 10;
      targetCtx.lineWidth = 3.2;
      targetCtx.setLineDash([7, 5]);
      targetCtx.stroke();
      targetCtx.setLineDash([]);
    }
    targetCtx.restore();

    if (!showHandles) return;

    // Kontrol Noktaları
    points.forEach((p, idx) => {
      const px = p.x * w;
      const py = p.y * h;
      const isEnd = idx === 0 || idx === points.length - 1;
      targetCtx.beginPath();
      targetCtx.arc(px, py, isEnd ? 11 : 9, 0, Math.PI * 2);
      targetCtx.fillStyle = 'rgba(11, 13, 18, 0.85)';
      targetCtx.fill();
      targetCtx.lineWidth = 2.5;
      targetCtx.strokeStyle = meta.color;
      targetCtx.stroke();

      targetCtx.beginPath();
      targetCtx.arc(px, py, 3, 0, Math.PI * 2);
      targetCtx.fillStyle = '#FFFFFF';
      targetCtx.fill();
    });

    // Çatal Noktaları
    if (fork) {
      const origin = pointOnSplineAtT(fork.t);
      // Kök düğümü (elmas)
      targetCtx.save();
      targetCtx.translate(origin.x * w, origin.y * h);
      targetCtx.rotate(Math.PI / 4);
      targetCtx.fillStyle = '#0B0D12';
      targetCtx.strokeStyle = '#F0D79A';
      targetCtx.lineWidth = 2.2;
      targetCtx.fillRect(-6, -6, 12, 12);
      targetCtx.strokeRect(-6, -6, 12, 12);
      targetCtx.restore();

      // Çatal ucu
      targetCtx.beginPath();
      targetCtx.arc(fork.tip.x * w, fork.tip.y * h, 10, 0, Math.PI * 2);
      targetCtx.fillStyle = 'rgba(11, 13, 18, 0.88)';
      targetCtx.fill();
      targetCtx.lineWidth = 2.4;
      targetCtx.strokeStyle = '#F0D79A';
      targetCtx.stroke();
    }
  }

  function render() {
    if (!canvas || !ctx) return;
    drawScene(ctx, canvas.width, canvas.height, true);
  }

  function updateLoupe(nx, ny, clientX, clientY) {
    if (!loupe || !loupeCtx || !canvas) return;
    const box = document.getElementById('curveStageBox').getBoundingClientRect();
    const lx = clientX - box.left;
    const ly = clientY - box.top;

    // Parmağın üstünde, ekrandan taşmayacak şekilde konumlandır
    const size = 118;
    const left = Math.max(8, Math.min(box.width - size - 8, lx - size / 2));
    const top = ly > size + 30 ? ly - size - 24 : ly + 28;
    loupe.style.left = `${left}px`;
    loupe.style.top = `${top}px`;
    loupe.hidden = false;

    const lw = loupe.width;
    const lh = loupe.height;
    loupeCtx.clearRect(0, 0, lw, lh);
    loupeCtx.save();
    loupeCtx.beginPath();
    loupeCtx.arc(lw / 2, lh / 2, lw / 2, 0, Math.PI * 2);
    loupeCtx.clip();

    const sx = nx * canvas.width;
    const sy = ny * canvas.height;
    const sw = lw / LOUPE_ZOOM;
    const sh = lh / LOUPE_ZOOM;
    loupeCtx.drawImage(canvas, sx - sw / 2, sy - sh / 2, sw, sh, 0, 0, lw, lh);

    // İnce nişangah artısı
    loupeCtx.strokeStyle = 'rgba(240, 215, 154, 0.75)';
    loupeCtx.lineWidth = 1;
    loupeCtx.beginPath();
    loupeCtx.moveTo(lw / 2 - 12, lh / 2);
    loupeCtx.lineTo(lw / 2 + 12, lh / 2);
    loupeCtx.moveTo(lw / 2, lh / 2 - 12);
    loupeCtx.lineTo(lw / 2, lh / 2 + 12);
    loupeCtx.stroke();
    loupeCtx.restore();
  }

  function syncToolbarUI() {
    document.getElementById('lblBendCount').textContent = `${points.length}/${MAX_POINTS}`;
    document.getElementById('btnAddBend').disabled = points.length >= MAX_POINTS;
    const forkBtn = document.getElementById('btnToggleFork');
    forkBtn.classList.toggle('active', !!fork);
    document.getElementById('lblForkBtn').textContent = fork ? '⑂ Çatalı Kaldır' : '⑂ Çatal Ekle';
  }

  function addBendPoint(showToast) {
    if (points.length >= MAX_POINTS) {
      showToast('En fazla 6 kıvrım noktası eklenebilir');
      return;
    }
    // En uzun segmentin ortasına yeni nokta ekle
    let bestIdx = 0;
    let bestLen = -1;
    for (let i = 0; i < points.length - 1; i++) {
      const d = Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y);
      if (d > bestLen) {
        bestLen = d;
        bestIdx = i;
      }
    }
    const p1 = points[bestIdx];
    const p2 = points[bestIdx + 1];
    points.splice(bestIdx + 1, 0, { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 });
    syncToolbarUI();
    render();
  }

  function toggleFork(showToast) {
    if (fork) {
      fork = null;
      showToast('Çatal kaldırıldı');
    } else {
      const t = 0.72;
      const origin = pointOnSplineAtT(t);
      const end = points[points.length - 1];
      const dx = end.x - origin.x;
      const dy = end.y - origin.y;
      // Ana yöne ~35° açılı varsayılan çatal ucu
      const angle = 0.62;
      const rx = dx * Math.cos(angle) - dy * Math.sin(angle);
      const ry = dx * Math.sin(angle) + dy * Math.cos(angle);
      const len = Math.hypot(rx, ry) || 0.1;
      const scale = Math.max(0.11, Math.min(0.16, len)) / len;
      fork = {
        t,
        tip: {
          x: Math.max(0.08, Math.min(0.92, origin.x + rx * scale)),
          y: Math.max(0.08, Math.min(0.92, origin.y + ry * scale))
        }
      };
      showToast('Çatal eklendi — altın noktayı dalın ucuna sürükle');
    }
    syncToolbarUI();
    render();
  }

  function resetCurrentCurve() {
    points = mirrorIfLeft(LINE_META[currentKey].defaultsRight);
    fork = null;
    syncToolbarUI();
    render();
  }

  function getNormCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const nx = Math.max(0.04, Math.min(0.96, (e.clientX - rect.left) / rect.width));
    const ny = Math.max(0.04, Math.min(0.96, (e.clientY - rect.top) / rect.height));
    return { nx, ny };
  }

  function hitTest(nx, ny) {
    const thresh = 0.065;
    if (fork) {
      if (Math.hypot(fork.tip.x - nx, fork.tip.y - ny) < thresh) return { type: 'forkTip' };
      const orig = pointOnSplineAtT(fork.t);
      if (Math.hypot(orig.x - nx, orig.y - ny) < thresh) return { type: 'forkOrigin' };
    }
    let best = null;
    let bestD = thresh;
    points.forEach((p, idx) => {
      const d = Math.hypot(p.x - nx, p.y - ny);
      if (d < bestD) {
        bestD = d;
        best = { type: 'pt', idx };
      }
    });
    return best;
  }

  function openLine(key) {
    currentKey = key;
    const meta = LINE_META[key];
    document.getElementById('curveStepBadge').textContent = meta.step;
    document.getElementById('curveTitle').textContent = meta.title;
    document.getElementById('curveHint').textContent = meta.hint;
    document.getElementById('btnCurveNext').textContent = meta.btn;
    document.getElementById('curveMiniRef').innerHTML = buildMiniRefSvg(key);

    const saved = KiroState.get().curves[key];
    if (saved && saved.points && saved.points.length >= 2) {
      points = saved.points.map(p => ({ x: p.x, y: p.y }));
      fork = saved.fork ? { t: saved.fork.t, tip: { x: saved.fork.tip.x, y: saved.fork.tip.y } } : null;
    } else {
      points = mirrorIfLeft(meta.defaultsRight);
      fork = null;
    }

    syncToolbarUI();

    const src = KiroState.get().hands.activeEnhanced || KiroState.get().hands.activeRaw;
    if (src) {
      const im = new Image();
      im.onload = () => {
        bgImg = im;
        canvas.width = im.width || 640;
        canvas.height = im.height || 800;
        render();
      };
      im.src = src;
    }
  }

  function saveCurrentLine() {
    KiroState.get().curves[currentKey] = computeMetrics();
  }

  function bindEvents(showToast, onNext) {
    canvas = document.getElementById('curveCanvas');
    ctx = canvas.getContext('2d');
    loupe = document.getElementById('loupeCanvas');
    loupeCtx = loupe.getContext('2d');

    canvas.addEventListener('pointerdown', (e) => {
      const { nx, ny } = getNormCoords(e);
      dragTarget = hitTest(nx, ny);
      if (dragTarget) {
        canvas.setPointerCapture(e.pointerId);
        updateLoupe(nx, ny, e.clientX, e.clientY);
      }
    });

    canvas.addEventListener('pointermove', (e) => {
      if (!dragTarget) return;
      const { nx, ny } = getNormCoords(e);
      if (dragTarget.type === 'pt') {
        points[dragTarget.idx] = { x: nx, y: ny };
      } else if (dragTarget.type === 'forkTip' && fork) {
        fork.tip = { x: nx, y: ny };
      } else if (dragTarget.type === 'forkOrigin' && fork) {
        fork.t = nearestTOnSpline(nx, ny);
      }
      render();
      updateLoupe(nx, ny, e.clientX, e.clientY);
    });

    const endDrag = () => {
      dragTarget = null;
      if (loupe) loupe.hidden = true;
    };
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);

    document.getElementById('btnAddBend').addEventListener('click', () => addBendPoint(showToast));
    document.getElementById('btnToggleFork').addEventListener('click', () => toggleFork(showToast));
    document.getElementById('btnResetCurve').addEventListener('click', () => {
      resetCurrentCurve();
      showToast('Çizgi sıfırlandı');
    });

    document.getElementById('btnCurveAutoSkip').addEventListener('click', () => {
      saveCurrentLine();
      onNext(currentKey);
    });

    document.getElementById('btnCurveNext').addEventListener('click', () => {
      saveCurrentLine();
      onNext(currentKey);
    });
  }

  global.KiroCurveEditor = {
    bindEvents,
    openLine,
    saveCurrentLine
  };
})(window);
