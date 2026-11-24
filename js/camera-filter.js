/**
 * KİRO V4.0 — Yakın Avuç Kamerası & Gerçek Piksel İşlemeli Röntgen/Derin Çizgi Filtresi (camera-filter.js)
 * Noktalı tam-el silüeti kaldırıldı; 4 köşeli yakın odak, 3 sn sayaç, fener, ön/arka kamera ve adaptif netleştirme.
 */
(function (global) {
  'use strict';

  const WORK_W = 640;
  const WORK_H = 800;

  let stream = null;
  let facingMode = 'environment'; // 'environment' | 'user'
  let torchOn = false;
  let timerEnabled = true;
  let countdownTimer = null;
  let qualityInterval = null;
  let pendingDataUrl = null;
  let currentSlot = 'passive'; // 'passive' | 'active'
  let onPhotoAcceptedCb = null;

  // --- Gerçekçi Prosedürel Demo Avuç İçi Üretici ---
  function generateDemoPalm(side, isActive) {
    const c = document.createElement('canvas');
    c.width = WORK_W;
    c.height = WORK_H;
    const ctx = c.getContext('2d');

    // Koyu doğal arka plan
    const bg = ctx.createRadialGradient(WORK_W * 0.5, WORK_H * 0.5, 40, WORK_W * 0.5, WORK_H * 0.5, WORK_W * 0.85);
    bg.addColorStop(0, '#1B1E26');
    bg.addColorStop(1, '#090B10');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, WORK_W, WORK_H);

    ctx.save();
    if (side === 'left') {
      // Sağ avuca göre yatay ayna (sol avuçta başparmak sağda, sağ avuçta başparmak solda)
      ctx.translate(WORK_W, 0);
      ctx.scale(-1, 1);
    }

    // Yakın çekim avuç içi formu (parmak uçları üstten taşar — tam 15-20 cm yakın çekim)
    const skinGrad = ctx.createRadialGradient(WORK_W * 0.46, WORK_H * 0.54, 30, WORK_W * 0.5, WORK_H * 0.55, 340);
    skinGrad.addColorStop(0, '#DFB497');
    skinGrad.addColorStop(0.58, '#CE9B7D');
    skinGrad.addColorStop(0.88, '#B67E62');
    skinGrad.addColorStop(1, '#94624B');

    ctx.beginPath();
    // Bilekten yukarı yakın avuç silüeti (başparmak solda = sağ el)
    ctx.moveTo(195, WORK_H);
    ctx.quadraticCurveTo(170, 680, 120, 560);
    // Başparmak çıkıntısı
    ctx.quadraticCurveTo(52, 470, 38, 375);
    ctx.quadraticCurveTo(42, 330, 88, 345);
    ctx.quadraticCurveTo(138, 375, 165, 425);
    // İşaret parmağı tabanı (üstten taşan yakın kadraj)
    ctx.lineTo(156, 115);
    ctx.quadraticCurveTo(195, 50, 232, 115);
    ctx.lineTo(240, 225);
    // Orta parmak
    ctx.lineTo(260, 45);
    ctx.quadraticCurveTo(305, 5, 342, 55);
    ctx.lineTo(340, 210);
    // Yüzük parmağı
    ctx.lineTo(372, 70);
    ctx.quadraticCurveTo(412, 35, 444, 85);
    ctx.lineTo(435, 230);
    // Serçe parmak
    ctx.lineTo(476, 155);
    ctx.quadraticCurveTo(516, 132, 536, 178);
    ctx.lineTo(520, 385);
    // Ay tepesi ve dış avuç kenarı
    ctx.quadraticCurveTo(552, 540, 470, 690);
    ctx.lineTo(445, WORK_H);
    ctx.closePath();

    ctx.fillStyle = skinGrad;
    ctx.fill();

    // Avuç içi tepeleri (Venüs, Ay, Jüpiter gölge/ışık kabartısı)
    ctx.save();
    ctx.clip();

    // Venüs Tepesi dolgunluğu
    const venus = ctx.createRadialGradient(210, 575, 15, 210, 575, 145);
    venus.addColorStop(0, 'rgba(255,226,204,0.34)');
    venus.addColorStop(1, 'rgba(130,72,50,0)');
    ctx.fillStyle = venus;
    ctx.fillRect(0, 0, WORK_W, WORK_H);

    // Avuç çukuru hafif gölge
    const hollow = ctx.createRadialGradient(340, 470, 10, 340, 470, 130);
    hollow.addColorStop(0, 'rgba(115,62,42,0.22)');
    hollow.addColorStop(1, 'rgba(115,62,42,0)');
    ctx.fillStyle = hollow;
    ctx.fillRect(0, 0, WORK_W, WORK_H);

    // Mikro cilt dokusu
    ctx.fillStyle = 'rgba(110,60,40,0.035)';
    for (let i = 0; i < 650; i++) {
      const rx = ((i * 73) % 480) + 80;
      const ry = ((i * 137) % 680) + 80;
      ctx.fillRect(rx, ry, 2, 1.5);
    }

    // Çizgi çizme yardımcısı (doğal derinlik + hafif parlak kenar)
    function drawCrease(pts, width, alpha) {
      if (pts.length < 2) return;
      // Alt hafif ışık kenarı
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1] + 2);
      for (let i = 1; i < pts.length - 1; i++) {
        const xc = (pts[i][0] + pts[i + 1][0]) / 2;
        const yc = (pts[i][1] + pts[i + 1][1]) / 2;
        ctx.quadraticCurveTo(pts[i][0], pts[i][1] + 2, xc, yc + 2);
      }
      ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1] + 2);
      ctx.strokeStyle = `rgba(255,228,205,${alpha * 0.35})`;
      ctx.lineWidth = width + 1.5;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Ana koyu vadi
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length - 1; i++) {
        const xc = (pts[i][0] + pts[i + 1][0]) / 2;
        const yc = (pts[i][1] + pts[i + 1][1]) / 2;
        ctx.quadraticCurveTo(pts[i][0], pts[i][1], xc, yc);
      }
      ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
      ctx.strokeStyle = `rgba(92,46,32,${alpha})`;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();
    }

    // Kalp Çizgisi (Sağ dış kenardan Jüpiter-Satürn arasına)
    drawCrease(
      isActive
        ? [[515, 342], [435, 344], [340, 326], [248, 286], [212, 260]]
        : [[515, 350], [430, 348], [335, 336], [255, 304]],
      4.4, 0.72
    );
    // Kalp çizgisi küçük çatalı (aktif elde belirgin)
    if (isActive) {
      drawCrease([[252, 288], [228, 296], [202, 292]], 2.6, 0.52);
    }

    // Akıl Çizgisi (İşaret-başparmak arasından Ay tepesine hafif kavis + çatal)
    drawCrease(
      isActive
        ? [[175, 386], [268, 405], [358, 434], [456, 488]]
        : [[176, 392], [266, 412], [352, 436], [438, 466]],
      4.3, 0.74
    );
    // Yazar/stratejist çatalı (aktif elde)
    if (isActive) {
      drawCrease([[372, 442], [426, 448], [468, 442]], 2.7, 0.56);
    }

    // Yaşam Çizgisi (Venüs tepesini kavisle sarar)
    drawCrease(
      isActive
        ? [[172, 398], [234, 456], [282, 540], [296, 636], [280, 725]]
        : [[174, 396], [224, 458], [268, 542], [278, 634], [265, 715]],
      4.8, 0.78
    );

    // Kader (Satürn) Çizgisi (dikey orta hat)
    drawCrease([[322, 712], [326, 565], [334, 425], [326, 285]], 3.0, isActive ? 0.56 : 0.40);

    // Başarı (Apollo) Çizgisi
    drawCrease([[404, 470], [412, 378], [416, 290]], 2.4, isActive ? 0.48 : 0.28);

    // Parmak boğum çizgileri
    drawCrease([[162, 232], [232, 232]], 2.4, 0.45);
    drawCrease([[254, 212], [336, 212]], 2.4, 0.45);
    drawCrease([[362, 224], [434, 226]], 2.4, 0.45);
    drawCrease([[454, 276], [516, 286]], 2.3, 0.42);

    // Bilek çizgileri
    drawCrease([[215, 742], [325, 736], [430, 744]], 2.8, 0.44);
    drawCrease([[218, 764], [325, 758], [428, 766]], 2.4, 0.36);

    ctx.restore();
    ctx.restore();
    return c.toDataURL('image/jpeg', 0.92);
  }

  // --- Gerçek Piksel İşlemeli Netleştirme Filtresi ---
  // mode: 'natural' | 'xray' | 'deep', strength: 0..100
  function processImageToCanvas(img, canvas, mode, strength) {
    const w = WORK_W;
    const h = WORK_H;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    // En-boy koruyarak ortala (cover)
    const scale = Math.max(w / img.width, h / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    const dx = (w - dw) / 2;
    const dy = (h - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);

    const s = Math.max(0, Math.min(100, Number(strength) || 0)) / 100;
    if (mode === 'natural' && s < 0.05) return;

    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    // 1. Parlaklık (luma) haritası ve kutu-bulanıklaştırma (adaptif lokal kontrast için)
    const len = w * h;
    const luma = new Float32Array(len);
    let sumLuma = 0;
    for (let i = 0, p = 0; i < len; i++, p += 4) {
      const y = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];
      luma[i] = y;
      sumLuma += y;
    }

    // Hızlı yatay + dikey 5px box blur (yerel vadi tespiti)
    const blurH = new Float32Array(len);
    const blur = new Float32Array(len);
    const r = 5;
    for (let y = 0; y < h; y++) {
      const row = y * w;
      let acc = 0;
      for (let x = -r; x <= r; x++) {
        acc += luma[row + Math.max(0, Math.min(w - 1, x))];
      }
      for (let x = 0; x < w; x++) {
        blurH[row + x] = acc / (2 * r + 1);
        const addIdx = Math.min(w - 1, x + r + 1);
        const remIdx = Math.max(0, x - r);
        acc += luma[row + addIdx] - luma[row + remIdx];
      }
    }
    for (let x = 0; x < w; x++) {
      let acc = 0;
      for (let y = -r; y <= r; y++) {
        acc += blurH[Math.max(0, Math.min(h - 1, y)) * w + x];
      }
      for (let y = 0; y < h; y++) {
        blur[y * w + x] = acc / (2 * r + 1);
        const addIdx = Math.min(h - 1, y + r + 1);
        const remIdx = Math.max(0, y - r);
        acc += blurH[addIdx * w + x] - blurH[remIdx * w + x];
      }
    }

    const avgLuma = sumLuma / len;
    const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);

    for (let i = 0, p = 0; i < len; i++, p += 4) {
      let R = data[p];
      let G = data[p + 1];
      let B = data[p + 2];
      // detail > 0: parlak sırt, detail < 0: koyu avuç içi çizgisi (vadi)
      const detail = luma[i] - blur[i];
      const valley = detail < 0 ? -detail : 0;

      if (mode === 'natural') {
        // Hafif unsharp mask ile doğal netleştirme
        const boost = detail * (0.8 + s * 2.2);
        data[p] = clamp(R + boost);
        data[p + 1] = clamp(G + boost);
        data[p + 2] = clamp(B + boost);
      } else if (mode === 'xray') {
        // Gerçek Röntgen (Invert) + kontrollü kontrast + vadi parlatma
        const gain = 1.05 + s * 0.9;
        let iR = (255 - R - 128) * gain + 128;
        let iG = (255 - G - 128) * gain + 128;
        let iB = (255 - B - 128) * gain + 128;
        // Çizgi vadilerini soğuk-altın / camgöbeği tonda öne çıkar
        const linePop = valley * (1.2 + s * 3.0);
        data[p] = clamp(iR * 0.85 + linePop * 0.75);
        data[p + 1] = clamp(iG * 0.98 + linePop * 1.15);
        data[p + 2] = clamp(iB * 1.08 + linePop * 1.25);
      } else {
        // 'deep': Ten tonuna adaptif derin çizgi modu (koyu/açık ten dengeli)
        const norm = (luma[i] - avgLuma) * (1.1 + s * 0.55) + 122;
        const darkLine = valley * (2.0 + s * 5.2);
        const ridge = detail > 0 ? detail * (0.4 + s * 0.9) : 0;
        // Sıcak koyu zemin + net kontrastlı çizgi vadisi (altın/sepia röntgen estetiği)
        const base = clamp(norm + ridge - darkLine * 1.35);
        data[p] = clamp(base * 0.96 + darkLine * 0.08);
        data[p + 1] = clamp(base * 0.89);
        data[p + 2] = clamp(base * 0.78);
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }

  function enhanceDataUrl(dataUrl, mode, strength) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        processImageToCanvas(img, c, mode, strength);
        resolve(c.toDataURL('image/jpeg', 0.92));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  }

  // --- Kamera Yönetimi ---
  function stopStream() {
    clearInterval(qualityInterval);
    clearInterval(countdownTimer);
    qualityInterval = null;
    countdownTimer = null;
    torchOn = false;
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      stream = null;
    }
    const cd = document.getElementById('camCountdown');
    if (cd) cd.hidden = true;
  }

  async function startCamera() {
    stopStream();
    const video = document.getElementById('camVideo');
    const fallback = document.getElementById('camFallback');
    const fallbackMsg = document.getElementById('camFallbackMsg');
    const previewCanvas = document.getElementById('camPreviewCanvas');
    const btnTorch = document.getElementById('btnTorch');

    previewCanvas.hidden = true;
    video.hidden = false;
    if (btnTorch) btnTorch.classList.remove('active');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      fallback.hidden = false;
      fallbackMsg.textContent = 'Bu tarayıcıda canlı kamera desteklenmiyor. Galeriden yükleyebilir veya örnek eli kullanabilirsin.';
      return;
    }

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 1600 }
        },
        audio: false
      });
      video.srcObject = stream;
      video.classList.toggle('mirrored', facingMode === 'user');
      await video.play();
      fallback.hidden = true;
      startQualityMeter(video);
    } catch (_) {
      fallback.hidden = false;
      fallbackMsg.textContent = 'Kamera izni alınamadı veya cihazda kamera bulunamadı. Galeriden fotoğraf seçebilir ya da örnek eli kullanabilirsin.';
    }
  }

  function startQualityMeter(video) {
    const badge = document.getElementById('camQualityBadge');
    const sample = document.createElement('canvas');
    sample.width = 64;
    sample.height = 80;
    const sctx = sample.getContext('2d', { willReadFrequently: true });

    qualityInterval = setInterval(() => {
      if (!video || video.readyState < 2 || !stream) return;
      sctx.drawImage(video, 0, 0, 64, 80);
      const d = sctx.getImageData(12, 16, 40, 48).data;
      let sum = 0;
      let edgeSum = 0;
      let count = 0;
      for (let i = 0; i < d.length; i += 4) {
        const y = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        sum += y;
        if (i >= 4) {
          const prevY = 0.299 * d[i - 4] + 0.587 * d[i - 3] + 0.114 * d[i - 2];
          edgeSum += Math.abs(y - prevY);
        }
        count++;
      }
      const avg = sum / count;
      const edge = edgeSum / count;
      badge.classList.remove('good', 'warn');
      if (avg < 55) {
        badge.textContent = 'Işık Düşük';
        badge.classList.add('warn');
      } else if (avg > 225) {
        badge.textContent = 'Çok Parlak';
        badge.classList.add('warn');
      } else if (edge < 5) {
        badge.textContent = 'Eline Yaklaştır';
      } else {
        badge.textContent = 'Işık & Netlik İyi';
        badge.classList.add('good');
      }
    }, 650);
  }

  async function toggleTorch(showToast) {
    if (!stream) {
      showToast('Önce kamerayı başlat');
      return;
    }
    const track = stream.getVideoTracks()[0];
    if (!track || !track.getCapabilities) {
      showToast('Bu cihazda tarayıcı feneri desteklenmiyor');
      return;
    }
    const caps = track.getCapabilities();
    if (!caps.torch) {
      showToast('Bu kamerada fener özelliği yok');
      return;
    }
    torchOn = !torchOn;
    try {
      await track.applyConstraints({ advanced: [{ torch: torchOn }] });
      document.getElementById('btnTorch').classList.toggle('active', torchOn);
    } catch (_) {
      torchOn = false;
      showToast('Fener açılamadı');
    }
  }

  function showCapturedPreview(dataUrl) {
    pendingDataUrl = dataUrl;
    stopStream();

    const video = document.getElementById('camVideo');
    const fallback = document.getElementById('camFallback');
    const previewCanvas = document.getElementById('camPreviewCanvas');
    const shutterRow = document.getElementById('camShutterRow');
    const confirmRow = document.getElementById('camConfirmRow');
    const toolsLive = document.getElementById('camToolsLive');

    const img = new Image();
    img.onload = () => {
      previewCanvas.width = WORK_W;
      previewCanvas.height = WORK_H;
      const ctx = previewCanvas.getContext('2d');
      const scale = Math.max(WORK_W / img.width, WORK_H / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      ctx.drawImage(img, (WORK_W - dw) / 2, (WORK_H - dh) / 2, dw, dh);
      pendingDataUrl = previewCanvas.toDataURL('image/jpeg', 0.92);

      video.hidden = true;
      fallback.hidden = true;
      previewCanvas.hidden = false;
      shutterRow.hidden = true;
      toolsLive.style.opacity = '0.35';
      toolsLive.style.pointerEvents = 'none';
      confirmRow.hidden = false;
    };
    img.src = dataUrl;
  }

  function captureFromVideoNow() {
    const video = document.getElementById('camVideo');
    if (!stream || video.readyState < 2) {
      // Kamera aktif değilse nazikçe demo eli veya galeri uyarısı ver
      return false;
    }
    const c = document.createElement('canvas');
    c.width = WORK_W;
    c.height = WORK_H;
    const ctx = c.getContext('2d');
    const vw = video.videoWidth || WORK_W;
    const vh = video.videoHeight || WORK_H;
    const scale = Math.max(WORK_W / vw, WORK_H / vh);
    const dw = vw * scale;
    const dh = vh * scale;
    const dx = (WORK_W - dw) / 2;
    const dy = (WORK_H - dh) / 2;

    if (facingMode === 'user') {
      // Ön kamera aynasını gerçek avuç yönüne düzelt
      ctx.translate(WORK_W, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, dx, dy, dw, dh);
    showCapturedPreview(c.toDataURL('image/jpeg', 0.92));
    return true;
  }

  function resetCaptureUI() {
    pendingDataUrl = null;
    document.getElementById('camPreviewCanvas').hidden = true;
    document.getElementById('camVideo').hidden = false;
    document.getElementById('camShutterRow').hidden = false;
    document.getElementById('camConfirmRow').hidden = true;
    const toolsLive = document.getElementById('camToolsLive');
    toolsLive.style.opacity = '1';
    toolsLive.style.pointerEvents = 'auto';
  }

  function openCapture(slot, onAccepted) {
    currentSlot = slot;
    onPhotoAcceptedCb = onAccepted;
    const hands = KiroState.get().hands;
    const side = slot === 'passive' ? hands.passiveSide : hands.activeSide;
    const sideLabel = side === 'left' ? 'Sol' : 'Sağ';
    const roleLabel = slot === 'passive' ? '1 / 2 · Pasif El (Potansiyel)' : '2 / 2 · Aktif El (Bugünkü Sen)';

    document.getElementById('camStepBadge').textContent = roleLabel;
    document.getElementById('camTitle').textContent = `${sideLabel} Avuç İçini Çek`;
    document.getElementById('camQualityBadge').textContent = 'Işık: Hazır';
    document.getElementById('camQualityBadge').className = 'quality-badge';

    resetCaptureUI();

    const existing = slot === 'passive' ? hands.passiveRaw : hands.activeRaw;
    if (existing) {
      showCapturedPreview(existing);
    } else {
      startCamera();
    }
  }

  // --- Netleştirme Ekranı ---
  let enhanceTarget = 'active';
  let loadedImgs = { active: null, passive: null };

  function renderEnhanceCanvas() {
    const hands = KiroState.get().hands;
    const canvas = document.getElementById('enhanceCanvas');
    const img = loadedImgs[enhanceTarget];
    if (!img || !canvas) return;
    processImageToCanvas(img, canvas, hands.filterMode, hands.sharpness);
  }

  function openEnhanceScreen() {
    stopStream();
    const hands = KiroState.get().hands;
    enhanceTarget = 'active';

    document.querySelectorAll('#enhanceHandSeg .seg-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.target === 'active');
    });
    document.querySelectorAll('#filterModePills .mode-pill').forEach(b => {
      b.classList.toggle('active', b.dataset.mode === hands.filterMode);
    });
    const slider = document.getElementById('sliderSharpness');
    slider.value = hands.sharpness;
    document.getElementById('lblSharpness').textContent = hands.sharpness;

    ['active', 'passive'].forEach(slot => {
      const src = slot === 'active' ? hands.activeRaw : hands.passiveRaw;
      if (!src) return;
      const im = new Image();
      im.onload = () => {
        loadedImgs[slot] = im;
        if (slot === enhanceTarget) renderEnhanceCanvas();
      };
      im.src = src;
    });
  }

  async function commitEnhancement() {
    const hands = KiroState.get().hands;
    hands.activeEnhanced = await enhanceDataUrl(hands.activeRaw, hands.filterMode, hands.sharpness);
    hands.passiveEnhanced = await enhanceDataUrl(hands.passiveRaw, hands.filterMode, hands.sharpness);
  }

  function bindEvents(showToast) {
    document.getElementById('btnEnableCam').addEventListener('click', startCamera);

    document.getElementById('btnUseDemoHand').addEventListener('click', () => {
      const hands = KiroState.get().hands;
      const side = currentSlot === 'passive' ? hands.passiveSide : hands.activeSide;
      const demoUrl = generateDemoPalm(side, currentSlot === 'active');
      showCapturedPreview(demoUrl);
      showToast('Örnek avuç içi yüklendi');
    });

    document.getElementById('btnFlipCam').addEventListener('click', () => {
      facingMode = facingMode === 'environment' ? 'user' : 'environment';
      document.getElementById('lblCamFacing').textContent = facingMode === 'environment' ? 'Arka' : 'Ön';
      startCamera();
    });

    document.getElementById('btnTorch').addEventListener('click', () => toggleTorch(showToast));

    document.getElementById('btnTimerToggle').addEventListener('click', (e) => {
      timerEnabled = !timerEnabled;
      e.currentTarget.classList.toggle('active', timerEnabled);
      showToast(timerEnabled ? '3 sn otomatik çekim açık' : 'Anında çekim modu');
    });

    document.getElementById('inputGalleryFile').addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => showCapturedPreview(ev.target.result);
      reader.readAsDataURL(file);
      e.target.value = '';
    });

    document.getElementById('btnCapture').addEventListener('click', () => {
      if (!stream) {
        showToast('Önce kamerayı aç, galeri seç veya örnek el kullan');
        return;
      }
      if (!timerEnabled) {
        captureFromVideoNow();
        return;
      }
      const cd = document.getElementById('camCountdown');
      let sec = 3;
      cd.textContent = sec;
      cd.hidden = false;
      clearInterval(countdownTimer);
      countdownTimer = setInterval(() => {
        sec -= 1;
        if (sec <= 0) {
          clearInterval(countdownTimer);
          cd.hidden = true;
          captureFromVideoNow();
        } else {
          cd.textContent = sec;
        }
      }, 850);
    });

    document.getElementById('btnRetake').addEventListener('click', () => {
      resetCaptureUI();
      startCamera();
    });

    document.getElementById('btnAcceptPhoto').addEventListener('click', () => {
      if (!pendingDataUrl) return;
      const hands = KiroState.get().hands;
      if (currentSlot === 'passive') hands.passiveRaw = pendingDataUrl;
      else hands.activeRaw = pendingDataUrl;
      if (typeof onPhotoAcceptedCb === 'function') onPhotoAcceptedCb();
    });

    // Netleştirme Olayları
    document.querySelectorAll('#enhanceHandSeg .seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        enhanceTarget = btn.dataset.target;
        document.querySelectorAll('#enhanceHandSeg .seg-btn').forEach(b => b.classList.toggle('active', b === btn));
        renderEnhanceCanvas();
      });
    });

    document.querySelectorAll('#filterModePills .mode-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        KiroState.get().hands.filterMode = btn.dataset.mode;
        document.querySelectorAll('#filterModePills .mode-pill').forEach(b => b.classList.toggle('active', b === btn));
        renderEnhanceCanvas();
      });
    });

    document.getElementById('sliderSharpness').addEventListener('input', (e) => {
      const val = Number(e.target.value);
      KiroState.get().hands.sharpness = val;
      document.getElementById('lblSharpness').textContent = val;
      renderEnhanceCanvas();
    });
  }

  global.KiroCamera = {
    bindEvents,
    openCapture,
    stopStream,
    openEnhanceScreen,
    commitEnhancement,
    generateDemoPalm,
    enhanceDataUrl
  };
})(window);
