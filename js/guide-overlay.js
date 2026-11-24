/**
 * KİRO V4.0 — "Buraya Bak" El Üstü İkincil Çizgi Rehberi (guide-overlay.js)
 * Kullanıcının kendi el fotoğrafı üzerinde tam bakması gereken bölgeyi yumuşak ışık halkasıyla aydınlatır.
 */
(function (global) {
  'use strict';

  // Sağ avuç içi (başparmak solda) normalize bölge koordinatları; sol elde otomatik aynalanır.
  const GUIDE_ITEMS = [
    {
      key: 'fate',
      title: 'Kader (Satürn) Çizgisi',
      spotLabel: 'Avuç ortasındaki dikey hatta bak',
      desc: 'Avucunun tam ortasında, bilekten orta parmağa doğru dikey uzanan bir çizgi görüyor musun?',
      zone: { cx: 0.52, cy: 0.62, rx: 0.14, ry: 0.26 },
      guideLine: [[0.50, 0.84], [0.52, 0.62], [0.52, 0.39]],
      sampleSvg: `
        <svg viewBox="0 0 64 64" width="60" height="60" fill="none">
          <path d="M18 56 Q16 36 20 18 M46 56 Q48 36 44 18" stroke="rgba(255,255,255,0.16)" stroke-width="1.4" stroke-linecap="round"/>
          <path d="M19 30 Q33 28 45 31" stroke="rgba(255,255,255,0.18)" stroke-width="1.3" stroke-linecap="round"/>
          <path d="M32 54 L32 14" stroke="#F0D79A" stroke-width="2.6" stroke-linecap="round"/>
          <path d="M27 19 L32 13 L37 19" stroke="#D4AF6A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.75"/>
        </svg>`
    },
    {
      key: 'apollo',
      title: 'Başarı (Apollo) Çizgisi',
      spotLabel: 'Yüzük parmağının tam altına bak',
      desc: 'Yüzük parmağının hemen altında, aşağıdan yukarı doğru çıkan ince dikey bir çizgi var mı?',
      zone: { cx: 0.65, cy: 0.45, rx: 0.12, ry: 0.17 },
      guideLine: [[0.64, 0.59], [0.65, 0.45], [0.66, 0.32]],
      sampleSvg: `
        <svg viewBox="0 0 64 64" width="60" height="60" fill="none">
          <rect x="24" y="8" width="16" height="14" rx="7" stroke="rgba(255,255,255,0.22)" stroke-width="1.3"/>
          <path d="M14 38 Q32 34 50 38" stroke="rgba(255,255,255,0.18)" stroke-width="1.3" stroke-linecap="round"/>
          <path d="M32 54 L32 25" stroke="#F0D79A" stroke-width="2.6" stroke-linecap="round"/>
          <circle cx="32" cy="25" r="3" fill="#F0D79A"/>
        </svg>`
    },
    {
      key: 'mercury',
      title: 'İletişim (Merkür) Çizgisi',
      spotLabel: 'Serçe parmak altından çapraz inen alana bak',
      desc: 'Serçe parmağının altından avucun alt kısmına doğru çapraz uzanan ince bir çizgi seçebiliyor musun?',
      zone: { cx: 0.72, cy: 0.58, rx: 0.14, ry: 0.20 },
      guideLine: [[0.78, 0.40], [0.71, 0.56], [0.63, 0.74]],
      sampleSvg: `
        <svg viewBox="0 0 64 64" width="60" height="60" fill="none">
          <path d="M16 54 Q30 42 26 24" stroke="rgba(255,255,255,0.18)" stroke-width="1.3" stroke-linecap="round"/>
          <path d="M48 16 L24 52" stroke="#F0D79A" stroke-width="2.6" stroke-linecap="round"/>
          <circle cx="48" cy="16" r="2.5" fill="#D4AF6A"/>
        </svg>`
    },
    {
      key: 'venusGirdle',
      title: 'Venüs Kuşağı',
      spotLabel: 'Parmak diplerinin hemen altına bak',
      desc: 'Kalp çizgisinin de üstünde, işaret ve yüzük parmağı altından yarım ay gibi geçen ince bir yay var mı?',
      zone: { cx: 0.53, cy: 0.30, rx: 0.24, ry: 0.10 },
      guideLine: [[0.33, 0.27], [0.53, 0.34], [0.73, 0.28]],
      sampleSvg: `
        <svg viewBox="0 0 64 64" width="60" height="60" fill="none">
          <path d="M12 44 Q32 40 52 44" stroke="rgba(255,255,255,0.20)" stroke-width="1.4" stroke-linecap="round"/>
          <path d="M14 22 Q32 36 50 22" stroke="#F0D79A" stroke-width="2.6" stroke-linecap="round"/>
          <path d="M18 19 Q32 31 46 19" stroke="#D4AF6A" stroke-width="1.2" stroke-dasharray="3 3" stroke-linecap="round" opacity="0.7"/>
        </svg>`
    },
    {
      key: 'affection',
      title: 'Bağlılık Çizgileri',
      spotLabel: 'Serçe parmak altındaki dış kenara bak',
      desc: 'Serçe parmağının hemen altındaki yan kenardan avuç içine doğru uzanan kısa yatay çizgiler görüyor musun?',
      zone: { cx: 0.80, cy: 0.37, rx: 0.11, ry: 0.10 },
      guideLine: [[0.86, 0.36], [0.76, 0.36]],
      sampleSvg: `
        <svg viewBox="0 0 64 64" width="60" height="60" fill="none">
          <path d="M46 10 L46 54" stroke="rgba(255,255,255,0.24)" stroke-width="1.6" stroke-linecap="round"/>
          <path d="M46 44 L14 44" stroke="rgba(255,255,255,0.16)" stroke-width="1.4" stroke-linecap="round"/>
          <path d="M46 27 L27 27" stroke="#F0D79A" stroke-width="2.8" stroke-linecap="round"/>
          <path d="M46 34 L33 34" stroke="#D4AF6A" stroke-width="1.8" stroke-linecap="round" opacity="0.8"/>
        </svg>`
    },
    {
      key: 'specialMark',
      title: 'Koruyucu Çizgi veya Üçgen',
      spotLabel: 'Yaşam çizgisi içi ve avuç merkezine bak',
      desc: 'Yaşam çizginin hemen iç yanında paralel ikinci bir çizgi ya da avuç ortasında belirgin bir üçgen şekli var mı?',
      zone: { cx: 0.42, cy: 0.62, rx: 0.18, ry: 0.18 },
      guideLine: [[0.33, 0.54], [0.40, 0.65], [0.41, 0.76]],
      sampleSvg: `
        <svg viewBox="0 0 64 64" width="60" height="60" fill="none">
          <path d="M16 18 Q28 34 25 52" stroke="rgba(255,255,255,0.24)" stroke-width="1.6" stroke-linecap="round"/>
          <path d="M12 24 Q22 36 20 50" stroke="#F0D79A" stroke-width="2.4" stroke-linecap="round"/>
          <polygon points="44,24 54,44 34,44" stroke="#F0D79A" stroke-width="2.2" stroke-linejoin="round" fill="rgba(212,175,106,0.12)"/>
        </svg>`
    }
  ];

  let currentIndex = 0;
  let useEnhanced = true;
  let imgEnhanced = null;
  let imgRaw = null;
  let rafId = null;
  let canvas = null;
  let ctx = null;
  let onCompleteCb = null;

  function stopAnim() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function mirrorX(x) {
    return KiroState.get().hands.activeSide === 'left' ? 1 - x : x;
  }

  function drawFrame(ts) {
    if (!canvas || !ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const item = GUIDE_ITEMS[currentIndex];
    const img = (useEnhanced && imgEnhanced) ? imgEnhanced : (imgRaw || imgEnhanced);

    ctx.clearRect(0, 0, w, h);
    if (img) {
      ctx.drawImage(img, 0, 0, w, h);
    }

    const cx = mirrorX(item.zone.cx) * w;
    const cy = item.zone.cy * h;
    const rx = item.zone.rx * w;
    const ry = item.zone.ry * h;

    // Spot ışık perdesi: hedef bölge net kalır, çevresi yumuşakça kararır
    ctx.save();
    ctx.fillStyle = 'rgba(7, 9, 13, 0.56)';
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    ctx.ellipse(cx, cy, rx * 1.15, ry * 1.15, 0, 0, Math.PI * 2, true);
    ctx.fill('evenodd');
    ctx.restore();

    // Nabız gibi parlayan altın halka
    const pulse = 0.5 + 0.5 * Math.sin((ts || 0) / 420);
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx * (1.03 + pulse * 0.08), ry * (1.03 + pulse * 0.08), 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(240, 215, 154, ${0.35 + pulse * 0.55})`;
    ctx.lineWidth = 3;
    ctx.shadowColor = '#D4AF6A';
    ctx.shadowBlur = 14 + pulse * 10;
    ctx.stroke();

    // İnce kesikli yön kılavuzu (kullanıcının tam nasıl bir yön arayacağını gösterir)
    if (item.guideLine && item.guideLine.length >= 2) {
      ctx.beginPath();
      item.guideLine.forEach((pt, idx) => {
        const px = mirrorX(pt[0]) * w;
        const py = pt[1] * h;
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.strokeStyle = `rgba(240, 215, 154, ${0.48 + pulse * 0.35})`;
      ctx.lineWidth = 2.6;
      ctx.lineCap = 'round';
      ctx.setLineDash([8, 7]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();

    rafId = requestAnimationFrame(drawFrame);
  }

  function renderCurrentCard() {
    const item = GUIDE_ITEMS[currentIndex];
    document.getElementById('guideCounter').textContent = `Buraya Bak · ${currentIndex + 1} / ${GUIDE_ITEMS.length}`;
    document.getElementById('guideTitle').textContent = item.title;
    document.getElementById('guideSpotTag').textContent = item.spotLabel;
    document.getElementById('guideSampleSvg').innerHTML = item.sampleSvg;
    document.getElementById('guideDesc').textContent = item.desc;
    document.getElementById('btnGuideFilterToggle').textContent = useEnhanced ? 'Röntgen: Açık' : 'Röntgen: Kapalı';
    document.getElementById('btnGuideFilterToggle').classList.toggle('active', useEnhanced);
  }

  function open(startIndex, onComplete) {
    stopAnim();
    currentIndex = Math.max(0, Math.min(GUIDE_ITEMS.length - 1, startIndex || 0));
    onCompleteCb = onComplete;
    useEnhanced = true;

    const hands = KiroState.get().hands;
    imgEnhanced = null;
    imgRaw = null;

    if (hands.activeEnhanced) {
      const im = new Image();
      im.onload = () => {
        imgEnhanced = im;
        canvas.width = im.width || 640;
        canvas.height = im.height || 800;
      };
      im.src = hands.activeEnhanced;
    }
    if (hands.activeRaw) {
      const im2 = new Image();
      im2.onload = () => {
        imgRaw = im2;
        if (!imgEnhanced) {
          canvas.width = im2.width || 640;
          canvas.height = im2.height || 800;
        }
      };
      im2.src = hands.activeRaw;
    }

    renderCurrentCard();
    rafId = requestAnimationFrame(drawFrame);
  }

  function stepBack() {
    if (currentIndex > 0) {
      currentIndex -= 1;
      renderCurrentCard();
      return true;
    }
    stopAnim();
    return false;
  }

  function bindEvents() {
    canvas = document.getElementById('guideCanvas');
    ctx = canvas.getContext('2d');

    document.getElementById('btnGuideFilterToggle').addEventListener('click', () => {
      useEnhanced = !useEnhanced;
      renderCurrentCard();
    });

    document.querySelectorAll('#screen-guide .guide-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = GUIDE_ITEMS[currentIndex];
        KiroState.get().secondaryMarks[item.key] = btn.dataset.answer;

        if (currentIndex < GUIDE_ITEMS.length - 1) {
          currentIndex += 1;
          renderCurrentCard();
        } else {
          stopAnim();
          if (typeof onCompleteCb === 'function') onCompleteCb();
        }
      });
    });
  }

  global.KiroGuide = {
    ITEMS: GUIDE_ITEMS,
    bindEvents,
    open,
    stopAnim,
    stepBack,
    getIndex: () => currentIndex
  };
})(window);
