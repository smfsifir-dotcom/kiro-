/**
 * KİRO V4.0 — 7 Perdeli Aşamalı Sinematik Keşif & 9:16 El Kimliği Kartı (cinema-results.js)
 */
(function (global) {
  'use strict';

  const TOTAL_CURTAINS = 7;

  let report = null;
  let currentCurtain = 1;
  let activeLineTab = 'heart';
  let useXray = true;
  let ttsEnabled = false;
  let imgActiveRaw = null;
  let imgActiveEnh = null;
  let rafId = null;
  let stageStartTs = 0;

  let canvas = null;
  let ctx = null;
  let cardCanvas = null;

  function stopAnim() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    stopSpeech();
  }

  function stopSpeech() {
    if (global.speechSynthesis) {
      try { global.speechSynthesis.cancel(); } catch (_) {}
    }
  }

  function speakText(text) {
    stopSpeech();
    if (!ttsEnabled || !global.speechSynthesis || !text) return;
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'tr-TR';
      u.rate = 0.96;
      global.speechSynthesis.speak(u);
    } catch (_) {}
  }

  function mirrorX(x) {
    return KiroState.get().hands.activeSide === 'left' ? 1 - x : x;
  }

  function sampleSpline(pts, steps = 20) {
    if (!pts || pts.length < 2) return pts || [];
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let s = 0; s < steps; s++) {
        const t = s / steps;
        const t2 = t * t, t3 = t2 * t;
        out.push({
          x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
          y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
        });
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  }

  function getCurveOrDefault(key) {
    const saved = KiroState.get().curves[key];
    if (saved && saved.points && saved.points.length >= 2) return saved;
    const isLeft = KiroState.get().hands.activeSide === 'left';
    const defs = {
      heart: [{ x: 0.80, y: 0.43 }, { x: 0.56, y: 0.42 }, { x: 0.34, y: 0.34 }],
      head: [{ x: 0.28, y: 0.48 }, { x: 0.50, y: 0.53 }, { x: 0.72, y: 0.61 }],
      life: [{ x: 0.27, y: 0.50 }, { x: 0.43, y: 0.68 }, { x: 0.44, y: 0.89 }]
    };
    return {
      points: defs[key].map(p => ({ x: isLeft ? 1 - p.x : p.x, y: p.y })),
      fork: null
    };
  }

  function drawGlowingCurve(targetCtx, w, h, curve, color, progress = 1, lineWidth = 4.5) {
    const sampled = sampleSpline(curve.points, 22);
    const count = Math.max(2, Math.floor(sampled.length * Math.min(1, progress)));
    targetCtx.save();
    targetCtx.beginPath();
    for (let i = 0; i < count; i++) {
      if (i === 0) targetCtx.moveTo(sampled[i].x * w, sampled[i].y * h);
      else targetCtx.lineTo(sampled[i].x * w, sampled[i].y * h);
    }
    targetCtx.strokeStyle = color;
    targetCtx.shadowColor = color;
    targetCtx.shadowBlur = 16;
    targetCtx.lineWidth = lineWidth;
    targetCtx.lineCap = 'round';
    targetCtx.lineJoin = 'round';
    targetCtx.stroke();

    if (curve.fork && progress >= curve.fork.t) {
      const idx = Math.min(sampled.length - 1, Math.round(curve.fork.t * (sampled.length - 1)));
      const orig = sampled[idx];
      const fProg = Math.min(1, (progress - curve.fork.t) / Math.max(0.15, 1 - curve.fork.t));
      const tx = orig.x + (curve.fork.tip.x - orig.x) * fProg;
      const ty = orig.y + (curve.fork.tip.y - orig.y) * fProg;
      targetCtx.beginPath();
      targetCtx.moveTo(orig.x * w, orig.y * h);
      targetCtx.lineTo(tx * w, ty * h);
      targetCtx.strokeStyle = '#F0D79A';
      targetCtx.shadowColor = '#D4AF6A';
      targetCtx.lineWidth = lineWidth * 0.78;
      targetCtx.stroke();
    }
    targetCtx.restore();
  }

  function roundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }

  function renderStageFrame(ts) {
    if (!canvas || !ctx || !report) return;
    if (!stageStartTs) stageStartTs = ts;
    const elapsed = (ts - stageStartTs) / 1000;
    const pulse = 0.5 + 0.5 * Math.sin(elapsed * 3.4);

    const w = canvas.width;
    const h = canvas.height;
    const img = (useXray && imgActiveEnh) ? imgActiveEnh : (imgActiveRaw || imgActiveEnh);
    ctx.clearRect(0, 0, w, h);

    if (currentCurtain <= 4 && img) {
      ctx.save();

      if (currentCurtain === 3) {
        const c = getCurveOrDefault(activeLineTab);
        const mid = c.points[Math.floor(c.points.length / 2)];
        const ease = Math.min(1, elapsed / 0.85);
        const zoom = 1 + 0.26 * (1 - Math.pow(1 - ease, 3));
        ctx.translate(w / 2, h / 2);
        ctx.scale(zoom, zoom);
        ctx.translate(-mid.x * w, -mid.y * h);
      }

      ctx.drawImage(img, 0, 0, w, h);

      const vig = ctx.createRadialGradient(w * 0.5, h * 0.5, w * 0.15, w * 0.5, h * 0.5, w * 0.75);
      vig.addColorStop(0, 'rgba(7,9,13,0.08)');
      vig.addColorStop(1, 'rgba(7,9,13,0.68)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

      if (currentCurtain === 1) {
        const p1 = Math.min(1, elapsed / 1.1);
        drawGlowingCurve(ctx, w, h, getCurveOrDefault('heart'), 'rgba(242,139,130,0.82)', p1, 3.4);
        drawGlowingCurve(ctx, w, h, getCurveOrDefault('head'), 'rgba(125,211,252,0.82)', Math.max(0, p1 - 0.12) / 0.88, 3.4);
        drawGlowingCurve(ctx, w, h, getCurveOrDefault('life'), 'rgba(230,194,122,0.9)', Math.max(0, p1 - 0.22) / 0.78, 3.8);
      } else if (currentCurtain === 2) {
        drawGlowingCurve(ctx, w, h, getCurveOrDefault('life'), 'rgba(230,194,122,0.78)', Math.min(1, elapsed / 0.9), 4);
        const ap = report.curtain2.agePoint;
        const ax = ap.x * w, ay = ap.y * h;
        ctx.save();
        ctx.beginPath();
        ctx.arc(ax, ay, 18 + pulse * 14, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(240,215,154,${0.25 + (1 - pulse) * 0.5})`;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(ax, ay, 9, 0, Math.PI * 2);
        ctx.fillStyle = '#F0D79A';
        ctx.shadowColor = '#D4AF6A';
        ctx.shadowBlur = 18;
        ctx.fill();

        const tag = `${ap.age} Yaş · Bugün`;
        ctx.font = '600 18px -apple-system, sans-serif';
        const tw = ctx.measureText(tag).width + 24;
        const bx = Math.max(12, Math.min(w - tw - 12, ax + 18));
        const by = Math.max(20, ay - 18);
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(11,13,18,0.88)';
        ctx.strokeStyle = '#D4AF6A';
        ctx.lineWidth = 1.6;
        roundRect(ctx, bx, by, tw, 34, 17);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#F0D79A';
        ctx.fillText(tag, bx + 12, by + 23);
        ctx.restore();
      } else if (currentCurtain === 3) {
        const lineMeta = report.curtain3.lines[activeLineTab];
        drawGlowingCurve(ctx, w, h, getCurveOrDefault(activeLineTab), lineMeta.color, Math.min(1, elapsed / 1.15), 4.8);
      } else if (currentCurtain === 4) {
        const mz = report.curtain4.mountZone;
        const mx = mirrorX(mz.cx) * w, my = mz.cy * h, mr = mz.r * w;
        const aura = ctx.createRadialGradient(mx, my, 8, mx, my, mr * (1.25 + pulse * 0.2));
        aura.addColorStop(0, 'rgba(240,215,154,0.58)');
        aura.addColorStop(0.55, 'rgba(212,175,106,0.22)');
        aura.addColorStop(1, 'rgba(212,175,106,0)');
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(mx, my, mr * 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(mx, my, mr * (0.88 + pulse * 0.08), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(240,215,154,${0.45 + pulse * 0.45})`;
        ctx.lineWidth = 2.4;
        ctx.stroke();
      }

      ctx.restore();
      rafId = requestAnimationFrame(renderStageFrame);
    }
  }

  function renderIdentityCardPNG() {
    if (!cardCanvas || !report) return;
    const W = 1080, H = 1920;
    cardCanvas.width = W;
    cardCanvas.height = H;
    const c = cardCanvas.getContext('2d');

    const bg = c.createRadialGradient(W * 0.5, H * 0.18, 60, W * 0.5, H * 0.4, W * 1.1);
    bg.addColorStop(0, '#1C2230');
    bg.addColorStop(0.55, '#0D1017');
    bg.addColorStop(1, '#07090D');
    c.fillStyle = bg;
    c.fillRect(0, 0, W, H);

    c.strokeStyle = 'rgba(212, 175, 106, 0.38)';
    c.lineWidth = 3;
    roundRect(c, 48, 48, W - 96, H - 96, 40);
    c.stroke();

    c.fillStyle = '#D4AF6A';
    c.font = '600 30px -apple-system, sans-serif';
    c.textAlign = 'center';
    c.fillText('✦   K İ R O   ·   E L   K İ M L İ Ğ İ   ✦', W / 2, 140);

    c.fillStyle = '#F2EFE9';
    c.font = '400 72px Georgia, serif';
    c.fillText(report.fullName, W / 2, 245);

    c.fillStyle = '#F0D79A';
    c.font = '600 36px -apple-system, sans-serif';
    c.fillText(report.curtain7.cardTitle, W / 2, 312);

    c.fillStyle = '#9BA3B4';
    c.font = '400 28px -apple-system, sans-serif';
    c.fillText(report.curtain7.cardSubtitle, W / 2, 362);

    const imgBoxX = 140, imgBoxY = 420, imgBoxW = 800, imgBoxH = 880;
    c.save();
    roundRect(c, imgBoxX, imgBoxY, imgBoxW, imgBoxH, 34);
    c.clip();

    const handImg = imgActiveEnh || imgActiveRaw;
    if (handImg) {
      const scale = Math.max(imgBoxW / handImg.width, imgBoxH / handImg.height);
      const dw = handImg.width * scale, dh = handImg.height * scale;
      c.drawImage(handImg, imgBoxX + (imgBoxW - dw) / 2, imgBoxY + (imgBoxH - dh) / 2, dw, dh);
    }

    c.save();
    c.translate(imgBoxX, imgBoxY);
    drawGlowingCurve(c, imgBoxW, imgBoxH, getCurveOrDefault('heart'), '#F28B82', 1, 6);
    drawGlowingCurve(c, imgBoxW, imgBoxH, getCurveOrDefault('head'), '#7DD3FC', 1, 6);
    drawGlowingCurve(c, imgBoxW, imgBoxH, getCurveOrDefault('life'), '#E6C27A', 1, 6.5);
    const ap = report.curtain2.agePoint;
    c.beginPath();
    c.arc(ap.x * imgBoxW, ap.y * imgBoxH, 16, 0, Math.PI * 2);
    c.fillStyle = '#F0D79A';
    c.shadowColor = '#D4AF6A';
    c.shadowBlur = 24;
    c.fill();
    c.restore();
    c.restore();

    c.strokeStyle = 'rgba(212, 175, 106, 0.55)';
    c.lineWidth = 3;
    roundRect(c, imgBoxX, imgBoxY, imgBoxW, imgBoxH, 34);
    c.stroke();

    const pills = [
      ['DÖNEM', report.curtain7.ageLabel],
      ['DOĞAL TAŞ', report.curtain7.stoneLabel.split('&')[0].trim()],
      ['İMZA', report.curtain7.patternLabel]
    ];
    const pillW = 285, pillH = 116, gap = 24, startX = (W - (pillW * 3 + gap * 2)) / 2, pillY = 1365;
    pills.forEach(([k, v], idx) => {
      const x = startX + idx * (pillW + gap);
      c.fillStyle = 'rgba(212, 175, 106, 0.08)';
      c.strokeStyle = 'rgba(212, 175, 106, 0.34)';
      c.lineWidth = 2;
      roundRect(c, x, pillY, pillW, pillH, 22);
      c.fill();
      c.stroke();
      c.fillStyle = '#D4AF6A';
      c.font = '600 20px -apple-system, sans-serif';
      c.fillText(k, x + pillW / 2, pillY + 44);
      c.fillStyle = '#F2EFE9';
      c.font = '600 26px -apple-system, sans-serif';
      c.fillText(v, x + pillW / 2, pillY + 86);
    });

    c.fillStyle = '#D7D2C7';
    c.font = 'italic 30px Georgia, serif';
    wrapText(c, `"${report.curtain1.lead}"`, W / 2, 1565, 860, 44, 3);

    c.fillStyle = '#7F8796';
    c.font = '500 24px -apple-system, sans-serif';
    c.fillText(`${report.createdAt}  ·  %100 Cihaz İçi Bilimsel El Analizi`, W / 2, 1820);
  }

  function wrapText(c, text, x, y, maxW, lineH, maxLines) {
    const words = text.split(' ');
    let line = '', lineNum = 0;
    for (let i = 0; i < words.length; i++) {
      const test = line + words[i] + ' ';
      if (c.measureText(test).width > maxW && i > 0) {
        lineNum++;
        if (lineNum >= maxLines) { c.fillText(line.trim() + '…', x, y); return; }
        c.fillText(line.trim(), x, y);
        line = words[i] + ' ';
        y += lineH;
      } else {
        line = test;
      }
    }
    c.fillText(line.trim(), x, y);
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
  }

  function renderCurtain() {
    if (!report) return;
    stopAnim();
    stageStartTs = 0;

    document.getElementById('cinemaBars').innerHTML = Array.from({ length: TOTAL_CURTAINS }, (_, i) =>
      `<span class="c-bar ${i + 1 === currentCurtain ? 'active' : i + 1 < currentCurtain ? 'done' : ''}"></span>`
    ).join('');

    const visualBox = document.getElementById('cinemaVisualBox');
    const twoHandsBox = document.getElementById('cinemaTwoHandsBox');
    const compassBox = document.getElementById('cinemaCompassBox');
    const cardBox = document.getElementById('cinemaCardBox');
    const lineTabs = document.getElementById('cinemaLineTabs');
    const cardCopyPanel = document.getElementById('cinemaCopyPanel');
    const evidenceDetails = document.getElementById('cinemaEvidenceBox');
    const btnXray = document.getElementById('btnCinemaXray');

    visualBox.hidden = true;
    twoHandsBox.hidden = true;
    compassBox.hidden = true;
    cardBox.hidden = true;
    lineTabs.hidden = true;
    cardCopyPanel.hidden = false;
    evidenceDetails.open = false;

    let eyebrow = '', headline = '', lead = '', sub = '', evidence = '', source = '';

    if (currentCurtain === 1) {
      visualBox.hidden = false;
      ({ eyebrow, headline, lead, sub, evidence, source } = report.curtain1);
    } else if (currentCurtain === 2) {
      visualBox.hidden = false;
      ({ eyebrow, headline, lead, sub, evidence, source } = report.curtain2);
    } else if (currentCurtain === 3) {
      const d = report.curtain3.lines[activeLineTab];
      visualBox.hidden = false;
      lineTabs.hidden = false;
      document.querySelectorAll('#cinemaLineTabs .line-tab').forEach(b => {
        b.classList.toggle('active', b.dataset.line === activeLineTab);
      });
      eyebrow = report.curtain3.eyebrow;
      headline = d.headline;
      lead = d.lead;
      evidence = d.evidence;
      source = d.source;
    } else if (currentCurtain === 4) {
      const d = report.curtain4;
      visualBox.hidden = false;
      eyebrow = d.eyebrow;
      headline = d.headline;
      lead = d.lead;
      sub = d.sub + (d.patternInfo ? ` (${d.patternInfo.label} Deseni: ${d.patternInfo.purpose})` : '');
      evidence = d.evidence;
      source = d.source;
    } else if (currentCurtain === 5) {
      const d = report.curtain5;
      twoHandsBox.hidden = false;
      const h = KiroState.get().hands;
      document.getElementById('imgComparePassive').src = h.passiveEnhanced || h.passiveRaw || '';
      document.getElementById('imgCompareActive').src = h.activeEnhanced || h.activeRaw || '';
      document.getElementById('lblComparePassive').textContent = d.passiveSideLabel;
      document.getElementById('lblCompareActive').textContent = d.activeSideLabel;
      ({ eyebrow, headline, lead, sub, evidence, source } = d);
    } else if (currentCurtain === 6) {
      const d = report.curtain6;
      const cp = d.compass;
      compassBox.hidden = false;
      cardCopyPanel.hidden = true;

      const extraCardHtml = cp.addonExtra ? `
        <div class="compass-block addon-block">
          <span class="c-tag gold">✦ ${escapeHtml(cp.addonExtra.badge || 'Özel Denge Önerisi')}</span>
          <strong class="addon-title">${escapeHtml(cp.addonExtra.title || '')}</strong>
          <p>${escapeHtml(cp.addonExtra.desc || '')}</p>
          ${cp.addonExtra.footnote ? `<p class="safety-footnote">${escapeHtml(cp.addonExtra.footnote)}</p>` : ''}
        </div>` : '';

      compassBox.innerHTML = `
        <div class="compass-head">
          <span class="eyebrow">${escapeHtml(d.eyebrow)}</span>
          <h2 class="compact-title">${escapeHtml(d.headline)}</h2>
        </div>

        <div class="compass-scroll">
          <div class="compass-block">
            <span class="c-tag gold">✦ Güçlü Yanını Parlatacak 2 Tavsiye</span>
            <ul>${cp.advices.map(a => `<li>${escapeHtml(a)}</li>`).join('')}</ul>
          </div>

          <div class="compass-block">
            <span class="c-tag warn">◈ Dikkat Etmen Gereken 2 Kör Nokta</span>
            <ul>${cp.blindspots.map(b => `<li>${escapeHtml(b)}</li>`).join('')}</ul>
          </div>

          <div class="compass-grid">
            <div class="compass-mini">
              <span class="c-tag">Sembolik Doğal Taş</span>
              <strong>${escapeHtml(cp.stone)}</strong>
              <p>${escapeHtml(cp.stoneReason)}</p>
            </div>
            <div class="compass-mini">
              <span class="c-tag">Uyumlu Renk &amp; Atmosfer</span>
              <strong>${escapeHtml(cp.palette)}</strong>
              <p>${escapeHtml(cp.paletteReason)}</p>
            </div>
          </div>

          ${extraCardHtml}

          <div class="compass-block ritual-block">
            <span class="c-tag gold">Haftalık Mini Denge Ritüeli</span>
            <p>${escapeHtml(cp.ritual)}</p>
          </div>
        </div>
      `;
      speakText(`${d.headline}. ${cp.advices[0]} ${cp.ritual}`);
    } else if (currentCurtain === 7) {
      cardBox.hidden = false;
      cardCopyPanel.hidden = true;
      renderIdentityCardPNG();
      speakText(`${report.curtain7.headline}. Analizin tamamlandı; el kimliği kartını indirebilir veya arşive kaydedebilirsin.`);
    }

    if (currentCurtain <= 5) {
      document.getElementById('cinemaEyebrow').textContent = eyebrow;
      document.getElementById('cinemaHeadline').textContent = headline;
      document.getElementById('cinemaLead').textContent = lead;
      const subEl = document.getElementById('cinemaSub');
      subEl.textContent = sub;
      subEl.hidden = !sub;
      document.getElementById('cinemaEvidenceText').textContent = evidence;
      document.getElementById('cinemaSourceText').textContent = source;
      speakText(`${headline}. ${lead}`);
    }

    btnXray.hidden = currentCurtain > 4;
    btnXray.textContent = useXray ? 'Röntgen' : 'Doğal';
    btnXray.classList.toggle('active', useXray);

    document.getElementById('btnCinemaPrev').disabled = currentCurtain <= 1;
    document.getElementById('btnCinemaNext').textContent =
      currentCurtain === TOTAL_CURTAINS ? 'Yeni Analiz Başlat' : `Sonraki Perde (${currentCurtain + 1}/${TOTAL_CURTAINS}) →`;

    if (currentCurtain <= 4) {
      rafId = requestAnimationFrame(renderStageFrame);
    }
  }

  async function open(showToast, onRestart) {
    stopAnim();
    currentCurtain = 1;
    activeLineTab = 'heart';
    useXray = true;

    const s = KiroState.get();
    report = await KiroEngine.buildReport(s);
    s.analysisResult = report;

    const loadImg = (src) => new Promise(res => {
      if (!src) return res(null);
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = () => res(null);
      im.src = src;
    });

    [imgActiveRaw, imgActiveEnh] = await Promise.all([
      loadImg(s.hands.activeRaw),
      loadImg(s.hands.activeEnhanced || s.hands.activeRaw)
    ]);

    const refImg = imgActiveEnh || imgActiveRaw;
    if (canvas && refImg) {
      canvas.width = refImg.width || 640;
      canvas.height = refImg.height || 800;
    }

    open._onRestart = onRestart;
    open._showToast = showToast;
    renderCurtain();
  }

  function bindEvents() {
    canvas = document.getElementById('cinemaCanvas');
    ctx = canvas.getContext('2d');
    cardCanvas = document.getElementById('identityCardCanvas');

    document.getElementById('btnCinemaXray').addEventListener('click', () => {
      useXray = !useXray;
      renderCurtain();
    });

    document.getElementById('btnCinemaTTS').addEventListener('click', (e) => {
      ttsEnabled = !ttsEnabled;
      e.currentTarget.classList.toggle('active', ttsEnabled);
      e.currentTarget.textContent = ttsEnabled ? '🔊 Ses: Açık' : '🔇 Sesli Anlatım';
      if (!ttsEnabled) stopSpeech();
      else renderCurtain();
    });

    document.querySelectorAll('#cinemaLineTabs .line-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        activeLineTab = btn.dataset.line;
        renderCurtain();
      });
    });

    document.getElementById('btnCinemaPrev').addEventListener('click', () => {
      if (currentCurtain > 1) { currentCurtain -= 1; renderCurtain(); }
    });

    document.getElementById('btnCinemaNext').addEventListener('click', () => {
      if (currentCurtain < TOTAL_CURTAINS) { currentCurtain += 1; renderCurtain(); }
      else if (typeof open._onRestart === 'function') { stopAnim(); open._onRestart(); }
    });

    document.getElementById('btnDownloadCard').addEventListener('click', () => {
      if (!cardCanvas) return;
      const a = document.createElement('a');
      a.download = `kiro-el-kimligi-${Date.now()}.png`;
      a.href = cardCanvas.toDataURL('image/png');
      a.click();
      if (open._showToast) open._showToast('9:16 El Kimliği Kartı indirildi ✦');
    });

    document.getElementById('btnSaveArchive').addEventListener('click', () => {
      if (!report) return;
      KiroState.saveArchiveEntry({
        id: Date.now(),
        date: report.createdAt,
        label: `${report.fullName} · ${report.curtain7.cardTitle}`,
        mount: report.curtain4.headline,
        age: report.curtain2.agePoint.age,
        element: report.handElement
      });
      if (open._showToast) open._showToast('6 Aylık Gelişim Arşivine kaydedildi ✦');
    });
  }

  global.KiroCinema = { bindEvents, open, stopAnim };
})(window);
