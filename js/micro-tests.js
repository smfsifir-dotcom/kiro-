/**
 * KİRO V4.0 — Anatomik SVG Çizimli Görsel Mikro-Sorular Modülü (micro-tests.js)
 * Benham (Kıvam, Esneklik, Doku, Parmak Ucu) + Unger (Opsiyonel Soyut Desen Tipi)
 * Her soru kendi tam ekranında, "Nasıl anlarsın?" ipucu ve net SVG çizimleriyle sunulur.
 */
(function (global) {
  'use strict';

  const QUESTIONS = [
    {
      key: 'consistency',
      badge: 'El Kıvamı',
      title: 'Avucunun Kıvamı Nasıl?',
      tip: 'Diğer elinin başparmağıyla avucunun tam ortasına hafifçe bastır; etin verdiği dirence bak.',
      layout: 'grid-2',
      optional: false,
      options: [
        {
          value: 'flabby',
          label: 'Gevşek',
          sub: 'Süngerimsi, hiç direnç vermez',
          svg: `<svg viewBox="0 0 64 56" width="54" height="48" fill="none">
            <path d="M8 38 Q32 50 56 38" stroke="#D4AF6A" stroke-width="2.2" stroke-linecap="round"/>
            <path d="M8 38 Q32 48 56 38 L56 50 L8 50 Z" fill="rgba(212,175,106,0.12)"/>
            <path d="M32 10 L32 34" stroke="#F0D79A" stroke-width="2" stroke-linecap="round"/>
            <path d="M26 28 L32 35 L38 28" stroke="#F0D79A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>`
        },
        {
          value: 'soft',
          label: 'Yumuşak',
          sub: 'Dolgun, kolayca hafifçe esner',
          svg: `<svg viewBox="0 0 64 56" width="54" height="48" fill="none">
            <path d="M8 36 Q32 43 56 36" stroke="#D4AF6A" stroke-width="2.2" stroke-linecap="round"/>
            <path d="M8 36 Q32 43 56 36 L56 50 L8 50 Z" fill="rgba(212,175,106,0.16)"/>
            <path d="M32 12 L32 31" stroke="#F0D79A" stroke-width="2" stroke-linecap="round"/>
            <path d="M27 26 L32 32 L37 26" stroke="#F0D79A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>`
        },
        {
          value: 'elastic',
          label: 'Elastik',
          sub: 'Yay gibi geri iter, diri ve canlı',
          svg: `<svg viewBox="0 0 64 56" width="54" height="48" fill="none">
            <path d="M8 36 Q32 32 56 36" stroke="#F0D79A" stroke-width="2.4" stroke-linecap="round"/>
            <path d="M8 36 Q32 32 56 36 L56 50 L8 50 Z" fill="rgba(212,175,106,0.22)"/>
            <path d="M26 26 L32 18 L38 26" stroke="#F0D79A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M32 19 L32 32" stroke="#F0D79A" stroke-width="2" stroke-linecap="round"/>
          </svg>`
        },
        {
          value: 'hard',
          label: 'Sert',
          sub: 'Hiç çökmez, tok ve sıkı yapı',
          svg: `<svg viewBox="0 0 64 56" width="54" height="48" fill="none">
            <line x1="8" y1="35" x2="56" y2="35" stroke="#F0D79A" stroke-width="2.8" stroke-linecap="round"/>
            <rect x="8" y="35" width="48" height="14" rx="3" fill="rgba(212,175,106,0.24)"/>
            <path d="M32 12 L32 28" stroke="#D4AF6A" stroke-width="2" stroke-linecap="round"/>
            <line x1="25" y1="30" x2="39" y2="30" stroke="#F0D79A" stroke-width="2" stroke-linecap="round"/>
          </svg>`
        }
      ]
    },
    {
      key: 'flexibility',
      badge: 'El Esnekliği',
      title: 'Parmakların Geriye Ne Kadar Esner?',
      tip: 'Diğer elinle parmaklarını arkaya doğru nazikçe it ve yandan baktığında oluşan çizgiye bak.',
      layout: 'list-3',
      optional: false,
      options: [
        {
          value: 'stiff',
          label: 'İçe Kavisli / Sert',
          sub: 'Geriye neredeyse hiç bükülmez, hafif içe dönük durur',
          svg: `<svg viewBox="0 0 64 56" width="54" height="48" fill="none">
            <path d="M36 50 L36 32 Q35 18 22 10" stroke="#F0D79A" stroke-width="3.2" stroke-linecap="round"/>
            <line x1="36" y1="50" x2="36" y2="10" stroke="rgba(255,255,255,0.2)" stroke-dasharray="3 3" stroke-width="1.2"/>
          </svg>`
        },
        {
          value: 'straight',
          label: 'Düz / Dengeli',
          sub: 'Tam dik hizaya açılır, yalnızca çok hafif esner',
          svg: `<svg viewBox="0 0 64 56" width="54" height="48" fill="none">
            <path d="M32 50 L32 10" stroke="#F0D79A" stroke-width="3.2" stroke-linecap="round"/>
            <circle cx="32" cy="30" r="3" fill="#D4AF6A"/>
          </svg>`
        },
        {
          value: 'flexible',
          label: 'Geriye Esnek',
          sub: 'Zarif bir yay gibi arkaya doğru rahatça kıvrılır',
          svg: `<svg viewBox="0 0 64 56" width="54" height="48" fill="none">
            <path d="M26 50 L26 32 Q28 18 46 11" stroke="#F0D79A" stroke-width="3.2" stroke-linecap="round"/>
            <line x1="26" y1="50" x2="26" y2="10" stroke="rgba(255,255,255,0.2)" stroke-dasharray="3 3" stroke-width="1.2"/>
            <path d="M29 19 Q36 18 41 14" stroke="#D4AF6A" stroke-width="1.5" stroke-linecap="round"/>
          </svg>`
        }
      ]
    },
    {
      key: 'texture',
      badge: 'Deri Dokusu',
      title: 'Elinin Sırtındaki Deri Dokusu Nasıl?',
      tip: 'Parmak ucunu elinin üst yüzeyinde gezdir; gözenek belirginliğine ve pürüzsüzlüğe dikkat et.',
      layout: 'list-3',
      optional: false,
      options: [
        {
          value: 'fine',
          label: 'İnce & İpeksi',
          sub: 'Çok pürüzsüz, gözenekler neredeyse seçilmez',
          svg: `<svg viewBox="0 0 64 56" width="54" height="48" fill="none">
            <path d="M10 18 Q32 15 54 18" stroke="#F0D79A" stroke-width="1.2" opacity="0.85"/>
            <path d="M10 28 Q32 25 54 28" stroke="#F0D79A" stroke-width="1.2" opacity="0.85"/>
            <path d="M10 38 Q32 35 54 38" stroke="#F0D79A" stroke-width="1.2" opacity="0.85"/>
          </svg>`
        },
        {
          value: 'medium',
          label: 'Orta & Elastik',
          sub: 'Dengeli doku; ne aşırı narin ne sert, canlı his',
          svg: `<svg viewBox="0 0 64 56" width="54" height="48" fill="none">
            <path d="M10 16 Q22 12 32 16 T54 16" stroke="#D4AF6A" stroke-width="1.7"/>
            <path d="M10 28 Q22 24 32 28 T54 28" stroke="#F0D79A" stroke-width="1.7"/>
            <path d="M10 40 Q22 36 32 40 T54 40" stroke="#D4AF6A" stroke-width="1.7"/>
          </svg>`
        },
        {
          value: 'coarse',
          label: 'Belirgin & Tok',
          sub: 'Dayanıklı, gözenek ve çizgi dokusu gözle seçilir',
          svg: `<svg viewBox="0 0 64 56" width="54" height="48" fill="none">
            <path d="M10 16 L20 22 L32 16 L44 22 L54 16" stroke="#F0D79A" stroke-width="2.1" stroke-linejoin="round"/>
            <path d="M10 28 L20 34 L32 28 L44 34 L54 28" stroke="#D4AF6A" stroke-width="2.1" stroke-linejoin="round"/>
            <path d="M10 40 L20 46 L32 40 L44 46 L54 40" stroke="#F0D79A" stroke-width="2.1" stroke-linejoin="round"/>
          </svg>`
        }
      ]
    },
    {
      key: 'fingertips',
      badge: 'Parmak Ucu Şekli',
      title: 'Parmak Uçların Hangisine Benziyor?',
      tip: 'İşaret ve orta parmağını göz hizana kaldırıp en uçtaki konturu bu 4 şekille karşılaştır.',
      layout: 'grid-2',
      optional: false,
      options: [
        {
          value: 'spatulate',
          label: 'Spatula',
          sub: 'Uca doğru hafifçe genişler',
          svg: `<svg viewBox="0 0 64 56" width="54" height="48" fill="none">
            <path d="M23 50 L23 30 C16 25, 16 12, 32 11 C48 12, 48 25, 41 30 L41 50" stroke="#F0D79A" stroke-width="2.3" fill="rgba(212,175,106,0.12)" stroke-linecap="round"/>
          </svg>`
        },
        {
          value: 'square',
          label: 'Kare',
          sub: 'Üstü düz, köşeli ve net bitiş',
          svg: `<svg viewBox="0 0 64 56" width="54" height="48" fill="none">
            <path d="M21 50 L21 15 Q21 11 26 11 L38 11 Q43 11 43 15 L43 50" stroke="#F0D79A" stroke-width="2.3" fill="rgba(212,175,106,0.12)" stroke-linecap="round"/>
          </svg>`
        },
        {
          value: 'conic',
          label: 'Konik',
          sub: 'Yumuşak oval, uca zarif daralır',
          svg: `<svg viewBox="0 0 64 56" width="54" height="48" fill="none">
            <path d="M21 50 L22 24 C23 13, 27 10, 32 10 C37 10, 41 13, 42 24 L43 50" stroke="#F0D79A" stroke-width="2.3" fill="rgba(212,175,106,0.12)" stroke-linecap="round"/>
          </svg>`
        },
        {
          value: 'pointed',
          label: 'Sivri',
          sub: 'İnce, uzun ve narin uç formu',
          svg: `<svg viewBox="0 0 64 56" width="54" height="48" fill="none">
            <path d="M21 50 L24 24 C26 14, 30 9, 32 8 C34 9, 38 14, 40 24 L43 50" stroke="#F0D79A" stroke-width="2.3" fill="rgba(212,175,106,0.12)" stroke-linecap="round"/>
          </svg>`
        }
      ]
    },
    {
      key: 'patternType',
      badge: 'Yaşam Amacı Deseni (Opsiyonel)',
      title: 'Başparmak Uç Desenin Hangisi?',
      tip: 'Işık altında başparmağının iç ucuna bak. Tarama yapılmaz; yalnızca gözünle en yakın soyut şekli seç.',
      layout: 'grid-2',
      optional: true,
      options: [
        {
          value: 'whorl',
          label: 'Sarmal',
          sub: 'İç içe halkalar / girdap',
          svg: `<svg viewBox="0 0 64 56" width="54" height="48" fill="none">
            <ellipse cx="32" cy="28" rx="18" ry="20" stroke="#D4AF6A" stroke-width="1.6" opacity="0.6"/>
            <ellipse cx="32" cy="28" rx="12" ry="14" stroke="#F0D79A" stroke-width="1.8"/>
            <ellipse cx="32" cy="28" rx="6" ry="7.5" stroke="#F0D79A" stroke-width="1.9"/>
            <circle cx="32" cy="28" r="2" fill="#F0D79A"/>
          </svg>`
        },
        {
          value: 'loop',
          label: 'İlmek',
          sub: 'Bir yandan girip dönen akış',
          svg: `<svg viewBox="0 0 64 56" width="54" height="48" fill="none">
            <path d="M12 44 C18 14, 48 12, 46 30 C44 40, 26 42, 16 46" stroke="#D4AF6A" stroke-width="1.6" stroke-linecap="round"/>
            <path d="M16 42 C22 20, 41 19, 39 30 C38 37, 26 38, 19 42" stroke="#F0D79A" stroke-width="1.9" stroke-linecap="round"/>
            <path d="M22 38 C26 26, 35 25, 34 31 C33 34, 27 35, 23 37" stroke="#F0D79A" stroke-width="1.9" stroke-linecap="round"/>
          </svg>`
        },
        {
          value: 'tented',
          label: 'Çadır',
          sub: 'Ortada keskin yükselen sivri tepe',
          svg: `<svg viewBox="0 0 64 56" width="54" height="48" fill="none">
            <path d="M12 44 Q28 40 32 12 Q36 40 52 44" stroke="#F0D79A" stroke-width="2" stroke-linecap="round"/>
            <path d="M14 36 Q28 32 32 18 Q36 32 50 36" stroke="#D4AF6A" stroke-width="1.6" stroke-linecap="round"/>
            <line x1="32" y1="22" x2="32" y2="46" stroke="#F0D79A" stroke-width="2" stroke-linecap="round"/>
          </svg>`
        },
        {
          value: 'arch',
          label: 'Kemer',
          sub: 'Bir uçtan diğerine yumuşak tepe',
          svg: `<svg viewBox="0 0 64 56" width="54" height="48" fill="none">
            <path d="M10 42 Q32 22 54 42" stroke="#D4AF6A" stroke-width="1.8" stroke-linecap="round"/>
            <path d="M10 33 Q32 14 54 33" stroke="#F0D79A" stroke-width="2" stroke-linecap="round"/>
            <path d="M12 24 Q32 9 52 24" stroke="#D4AF6A" stroke-width="1.5" stroke-linecap="round" opacity="0.75"/>
          </svg>`
        }
      ]
    }
  ];

  let activeList = [];
  let currentIndex = 0;
  let onCompleteCb = null;

  function buildActiveList() {
    const comboAllowed = !!KiroState.get().consent.comboAccepted;
    return QUESTIONS.filter(q => !q.optional || comboAllowed);
  }

  function renderCurrentQuestion() {
    const q = activeList[currentIndex];
    const savedVal = KiroState.get().microTests[q.key];

    document.getElementById('microStepBadge').textContent =
      `Soru ${currentIndex + 1} / ${activeList.length} · ${q.badge}`;
    document.getElementById('microTitle').textContent = q.title;
    document.getElementById('microTipText').textContent = q.tip;

    const mount = document.getElementById('microOptionsMount');
    mount.className = `micro-options ${q.layout}`;
    mount.innerHTML = q.options.map(opt => `
      <button type="button" class="micro-card ${savedVal === opt.value ? 'selected' : ''}" data-val="${opt.value}">
        <div class="micro-svg-wrap" aria-hidden="true">${opt.svg}</div>
        <div class="micro-card-copy">
          <strong>${opt.label}</strong>
          <span>${opt.sub}</span>
        </div>
      </button>
    `).join('');

    const footer = document.getElementById('microFooter');
    footer.hidden = !q.optional;

    mount.querySelectorAll('.micro-card').forEach(card => {
      card.addEventListener('click', () => {
        mount.querySelectorAll('.micro-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        KiroState.get().microTests[q.key] = card.dataset.val;
        setTimeout(advance, 160);
      });
    });
  }

  function advance() {
    if (currentIndex < activeList.length - 1) {
      currentIndex += 1;
      renderCurrentQuestion();
    } else if (typeof onCompleteCb === 'function') {
      onCompleteCb();
    }
  }

  function open(startIndex, onComplete) {
    activeList = buildActiveList();
    currentIndex = Math.max(0, Math.min(activeList.length - 1, startIndex || 0));
    onCompleteCb = onComplete;
    renderCurrentQuestion();
  }

  function stepBack() {
    if (currentIndex > 0) {
      currentIndex -= 1;
      renderCurrentQuestion();
      return true;
    }
    return false;
  }

  function bindEvents() {
    document.getElementById('btnMicroSkip').addEventListener('click', () => {
      const q = activeList[currentIndex];
      if (q) KiroState.get().microTests[q.key] = 'skipped';
      advance();
    });
  }

  function getLabelMap() {
    const map = {};
    QUESTIONS.forEach(q => {
      map[q.key] = {};
      q.options.forEach(o => { map[q.key][o.value] = o.label; });
      map[q.key].skipped = 'Atlandı';
    });
    return map;
  }

  global.KiroMicroTests = {
    bindEvents,
    open,
    stepBack,
    getLabelMap,
    getIndex: () => currentIndex
  };
})(window);
