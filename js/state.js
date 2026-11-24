/**
 * KİRO V4.0 — Merkezi Durum ve Yerel Depolama (state.js)
 */
(function (global) {
  'use strict';

  const STORAGE_KEYS = {
    ARCHIVE: 'kiro_v4_archive',
    DEDICATION: 'kiro_v4_dedication'
  };

  const DEFAULT_DEDICATION = {
    heading: 'İyi ki Doğdun, Kurucu',
    body:
      'Vakit bulamadığın için ertelediğin hayalini gerçeğe dönüştürüp sana kendi uygulamanı armağan etmek istedim.\n\n' +
      'İnsanların ellerindeki hikâyeyi kanıtıyla, zarafetle ve derinlikle okuyacak bu sistem senin merakından ve vizyonundan doğdu.\n\n' +
      'Yeni yaşın; aktif elindeki çizgiler kadar güçlü, aydınlık ve senin seçtiğin yönde aksın.',
    sign: 'Her zaman yanında'
  };

  function createInitialState() {
    return {
      isDemo: false,
      consent: {
        ageAndCoreAccepted: false,
        comboAccepted: false,
        acceptedAt: null
      },
      profile: {
        fullName: '',
        firstName: '',
        birthDate: '',
        birthTime: '',
        birthTimeUnknown: false,
        birthCity: '',
        age: null,
        zodiac: null,
        birthElement: null,
        risingHint: null,
        nameTone: null
      },
      handedness: null, // 'right' | 'left'
      hands: {
        passiveSide: 'left',
        activeSide: 'right',
        passiveRaw: null,      // dataURL
        activeRaw: null,       // dataURL
        passiveEnhanced: null, // dataURL
        activeEnhanced: null,  // dataURL
        filterMode: 'deep',    // 'natural' | 'xray' | 'deep'
        sharpness: 62
      },
      curves: {
        heart: null,
        head: null,
        life: null
      },
      secondaryMarks: {},
      microTests: {},
      analysisResult: null
    };
  }

  let state = createInitialState();

  function computeZodiac(dateStr) {
    if (!dateStr) return null;
    const parts = dateStr.split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return null;
    const [year, month, day] = parts;

    const today = new Date();
    let age = today.getFullYear() - year;
    const mDiff = (today.getMonth() + 1) - month;
    if (mDiff < 0 || (mDiff === 0 && today.getDate() < day)) age -= 1;

    const signs = [
      { name: 'Oğlak', element: 'Toprak', end: [1, 19] },
      { name: 'Kova', element: 'Hava', end: [2, 18] },
      { name: 'Balık', element: 'Su', end: [3, 20] },
      { name: 'Koç', element: 'Ateş', end: [4, 19] },
      { name: 'Boğa', element: 'Toprak', end: [5, 20] },
      { name: 'İkizler', element: 'Hava', end: [6, 20] },
      { name: 'Yengeç', element: 'Su', end: [7, 22] },
      { name: 'Aslan', element: 'Ateş', end: [8, 22] },
      { name: 'Başak', element: 'Toprak', end: [9, 22] },
      { name: 'Terazi', element: 'Hava', end: [10, 22] },
      { name: 'Akrep', element: 'Su', end: [11, 21] },
      { name: 'Yay', element: 'Ateş', end: [12, 21] },
      { name: 'Oğlak', element: 'Toprak', end: [12, 31] }
    ];
    const found = signs.find(s => month < s.end[0] || (month === s.end[0] && day <= s.end[1])) || signs[0];
    return { age, zodiac: found.name, element: found.element };
  }

  function computeRisingHint(zodiacName, timeStr) {
    if (!zodiacName || !timeStr) return null;
    const order = ['Koç','Boğa','İkizler','Yengeç','Aslan','Başak','Terazi','Akrep','Yay','Oğlak','Kova','Balık'];
    const idx = order.indexOf(zodiacName);
    if (idx === -1) return null;
    const [hh, mm] = timeStr.split(':').map(Number);
    if (isNaN(hh)) return null;
    const hoursFromSix = ((hh + (mm || 0) / 60) - 6 + 24) % 24;
    const shift = Math.floor(hoursFromSix / 2);
    return order[(idx + shift) % 12];
  }

  function computeNameTone(fullName) {
    const clean = (fullName || '').trim();
    if (!clean) return null;
    const vowels = clean.toLowerCase().match(/[aeıioöuü]/g) || [];
    const letters = clean.toLowerCase().match(/[a-zçğıöşü]/g) || [];
    if (!letters.length) return null;
    const ratio = vowels.length / letters.length;
    if (ratio >= 0.45) return 'Akışkan ve İletişim Odaklı';
    if (ratio <= 0.34) return 'Kararlı ve Yapılandırıcı';
    return 'Dengeli ve Stratejik';
  }

  function updateProfile(partial) {
    Object.assign(state.profile, partial);
    const full = (state.profile.fullName || '').trim();
    state.profile.firstName = full ? full.split(/\s+/)[0] : '';
    state.profile.nameTone = computeNameTone(full);

    const z = computeZodiac(state.profile.birthDate);
    if (z) {
      state.profile.age = z.age;
      state.profile.zodiac = z.zodiac;
      state.profile.birthElement = z.element;
      state.profile.risingHint = (!state.profile.birthTimeUnknown && state.profile.birthTime)
        ? computeRisingHint(z.zodiac, state.profile.birthTime)
        : null;
    } else {
      state.profile.age = null;
      state.profile.zodiac = null;
      state.profile.birthElement = null;
      state.profile.risingHint = null;
    }
  }

  function setHandedness(hand) {
    state.handedness = hand;
    if (hand === 'left') {
      state.hands.passiveSide = 'right';
      state.hands.activeSide = 'left';
    } else {
      state.hands.passiveSide = 'left';
      state.hands.activeSide = 'right';
    }
  }

  function loadDemoProfile() {
    state = createInitialState();
    state.isDemo = true;
    state.consent = {
      ageAndCoreAccepted: true,
      comboAccepted: true,
      acceptedAt: new Date().toISOString()
    };
    updateProfile({
      fullName: 'Deniz Aksoy',
      birthDate: '1995-11-24',
      birthTime: '08:30',
      birthTimeUnknown: false,
      birthCity: 'Kayseri'
    });
    setHandedness('right');
  }

  function getArchive() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.ARCHIVE) || '[]'); }
    catch (_) { return []; }
  }

  function saveArchiveEntry(entry) {
    const list = getArchive();
    list.unshift(entry);
    const trimmed = list.slice(0, 12);
    localStorage.setItem(STORAGE_KEYS.ARCHIVE, JSON.stringify(trimmed));
    return trimmed;
  }

  function getDedication() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.DEDICATION) || 'null');
      return saved ? Object.assign({}, DEFAULT_DEDICATION, saved) : Object.assign({}, DEFAULT_DEDICATION);
    } catch (_) {
      return Object.assign({}, DEFAULT_DEDICATION);
    }
  }

  function saveDedication(data) {
    localStorage.setItem(STORAGE_KEYS.DEDICATION, JSON.stringify({
      heading: (data.heading || '').trim() || DEFAULT_DEDICATION.heading,
      body: (data.body || '').trim() || DEFAULT_DEDICATION.body,
      sign: (data.sign || '').trim() || DEFAULT_DEDICATION.sign
    }));
  }

  function clearAllData() {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    state = createInitialState();
  }

  global.KiroState = {
    get: () => state,
    reset: () => { state = createInitialState(); },
    updateProfile,
    setHandedness,
    loadDemoProfile,
    getArchive,
    saveArchiveEntry,
    getDedication,
    saveDedication,
    clearAllData
  };
})(window);
