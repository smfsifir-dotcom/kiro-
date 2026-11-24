/**
 * KİRO V4.0 — Bütünsel Deterministik Analiz ve 3'lü Kombo Motoru (analysis-engine.js)
 */
(function (global) {
  'use strict';

  let cachedRules = null;

  async function loadRules() {
    if (cachedRules) return cachedRules;
    if (global.KIRO_RULES_FALLBACK) {
      cachedRules = global.KIRO_RULES_FALLBACK;
    }
    try {
      const res = await fetch('data/rules.json');
      if (res.ok) cachedRules = await res.json();
    } catch (_) {}
    return cachedRules;
  }

  function inferHandElement(state, rules) {
    const micro = state.microTests || {};
    const curves = state.curves || {};
    const scores = { Toprak: 0, Hava: 0, Ateş: 0, Su: 0 };

    const tipBias = (rules.fingertips[micro.fingertips] || {}).elementBias;
    if (tipBias) scores[tipBias] += 3;

    if (micro.consistency === 'hard') scores.Toprak += 2;
    else if (micro.consistency === 'elastic') { scores.Ateş += 1.5; scores.Hava += 1.5; }
    else if (micro.consistency === 'soft') scores.Su += 2;
    else if (micro.consistency === 'flabby') scores.Su += 1.5;

    if (micro.flexibility === 'stiff') scores.Toprak += 2;
    else if (micro.flexibility === 'straight') scores.Hava += 1.5;
    else if (micro.flexibility === 'flexible') { scores.Ateş += 1.5; scores.Su += 1; }

    if (micro.texture === 'fine') { scores.Su += 1.5; scores.Hava += 1; }
    else if (micro.texture === 'coarse') scores.Toprak += 1.5;
    else scores.Ateş += 1;

    if (curves.head) {
      if (curves.head.slope > 0.12) scores.Su += 1.5;
      else if (Math.abs(curves.head.slope) < 0.08) scores.Toprak += 1.5;
      else scores.Hava += 1.5;
    }

    return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  }

  function inferDominantMount(state) {
    const marks = state.secondaryMarks || {};
    const curves = state.curves || {};
    const micro = state.microTests || {};
    const scores = { jupiter: 1, saturn: 1, apollo: 1, mercury: 1, venus: 1.2, moon: 1 };

    if (marks.fate === 'yes') scores.saturn += 2.6;
    if (marks.apollo === 'yes') scores.apollo += 2.8;
    if (marks.mercury === 'yes') scores.mercury += 2.6;
    if (marks.venusGirdle === 'yes') scores.venus += 2.2;
    if (marks.affection === 'yes') scores.venus += 1.2;

    if (curves.heart && curves.heart.curvatureRatio >= 1.07) scores.jupiter += 1.8;
    if (curves.head && curves.head.slope > 0.13) scores.moon += 2.2;
    if (curves.head && curves.head.hasFork) scores.mercury += 1.5;
    if (curves.life && curves.life.curvatureRatio >= 1.12) scores.venus += 1.6;

    if (micro.fingertips === 'spatulate') scores.jupiter += 1.4;
    if (micro.fingertips === 'square') scores.saturn += 1.4;
    if (micro.fingertips === 'conic') scores.apollo += 1.4;
    if (micro.fingertips === 'pointed') scores.moon += 1.5;

    return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  }

  function computeLifeAgePoint(age, lifeCurve) {
    const effAge = (age && age >= 18 && age <= 95) ? age : 30;
    const t = Math.max(0.12, Math.min(0.88, (effAge - 8) / 76));
    const pts = (lifeCurve && lifeCurve.points && lifeCurve.points.length >= 2)
      ? lifeCurve.points
      : [{ x: 0.27, y: 0.50 }, { x: 0.43, y: 0.68 }, { x: 0.44, y: 0.89 }];

    const segCount = pts.length - 1;
    const scaled = t * segCount;
    const idx = Math.min(segCount - 1, Math.floor(scaled));
    const localT = scaled - idx;
    const p1 = pts[idx];
    const p2 = pts[idx + 1];
    return {
      age: effAge,
      t: +t.toFixed(3),
      x: +(p1.x + (p2.x - p1.x) * localT).toFixed(4),
      y: +(p1.y + (p2.y - p1.y) * localT).toFixed(4)
    };
  }

  function describeLifePhase(age, hasFate, hasSpecial, firstName) {
    const call = firstName ? `${firstName}, ` : '';
    if (age < 28) {
      return {
        headline: `${age} Yaş: Keşif ve Temel Atma Eşiği`,
        lead: `${call}yaşam çizgindeki bu nokta, kendi sesini bulduğun ve kalıcı alışkanlıkların temelini attığın dinamik bir geçiş bölgesine denk geliyor.`,
        sub: hasFate
          ? 'Dikey kader hattının bu döneme eşlik etmesi, erken yaşta sorumluluk alıp kendi yönünü çizebildiğini gösteriyor.'
          : 'Bu evrede farklı deneyimleri tatmak, ilerideki kalıcı çizgini netleştirecektir.'
      };
    }
    if (age < 40) {
      return {
        headline: `${age} Yaş: İnşa, Seçim ve Olgunlaşma Dönemi`,
        lead: `${call}avuç merkezine en yakın bu kavis noktasında, biriktirdiğin deneyimleri somut bir yapıya dönüştürme gücün zirvede.`,
        sub: hasSpecial
          ? 'Koruyucu izlerin bu eşiği desteklemesi, kritik karar anlarında doğru zemini hızla bulduğunu gösteriyor.'
          : 'İkinci büyük büyüme döngüsü içindesin; gereksiz yükleri sadeleştirip tek bir ana hedefe odaklanmak seni hızlandırır.'
      };
    }
    if (age < 55) {
      return {
        headline: `${age} Yaş: Ustalık ve Etki Genişletme Evresi`,
        lead: `${call}çizginin bu olgunluk yayında artık neyi istemediğini net biliyorsun; enerjini yalnızca değer üreten alanlara saklıyorsun.`,
        sub: 'Deneyimini başkalarına rehberlik ederek veya kendi bağımsız projeni büyüterek değerlendirmek bu dönemin en verimli hamlesi.'
      };
    }
    return {
      headline: `${age} Yaş: Bilgelik ve Kalıcı İz Dönemi`,
      lead: `${call}yaşam çizgisinin bu dingin ve derin bölümünde, dış onayın ötesine geçip kendi iç huzurunu merkeze alan bir bilgelik öne çıkıyor.`,
      sub: 'Biriktirdiğin görgüyü sade, seçkin ilişkiler ve anlamlı paylaşımlarla taçlandıracağın verimli bir evredesin.'
    };
  }

  function analyzeMainLine(key, curve) {
    const c = curve || { shapeLabel: 'Yumuşak Kavisli', bendsCount: 3, hasFork: false, forkAngle: 0, curvatureRatio: 1.07, slope: 0.08, arcLength: 0.45 };

    if (key === 'heart') {
      const curved = c.curvatureRatio >= 1.06;
      const summary = curved
        ? 'Duygularını saklamadan, sıcak ve içten bir akışla yaşayan; karşılıklı samimiyete çok değer veren bir kalp yapın var.'
        : 'Sevgini büyük sözlerden çok tutarlı davranışlarla ve güven vererek gösteren, ölçülü ve sadık bir duygusal yapın var.';
      const forkNote = c.hasFork
        ? ` Çizgindeki ${c.forkAngle}° açılı çatal, kalbinle aklın arasında nadir bir denge kurabildiğini ve empatini korurken sınır çizebildiğini gösteriyor.`
        : '';
      return {
        key: 'heart',
        name: 'Kalp Çizgisi',
        color: '#F28B82',
        headline: c.hasFork ? 'Dengeli Empati & Çatallı Kalp İmzası' : (curved ? 'Sıcak ve İfade Gücü Yüksek Kalp' : 'Tutarlı ve Güven Odaklı Kalp'),
        lead: summary + forkNote,
        evidence: `Ölçülen geometri: ${c.shapeLabel} (kavis oranı ${c.curvatureRatio}, ${c.bendsCount} kontrol noktası${c.hasFork ? `, ${c.forkAngle}° çatal` : ''}).`,
        source: 'Benham (Line of Heart) & Cheiro: Kavis derecesi duygusal ifade sıcaklığını, çatal ise idealizm ile gerçekçilik arasındaki dengeyi yansıtır.'
      };
    }

    if (key === 'head') {
      const sloping = c.slope > 0.11;
      const summary = sloping
        ? 'Analitik düşüncen Ay tepesine doğru kıvrılarak hayal gücü ve sezgiyle birleşiyor; kalıpların dışında özgün çözümler üretebiliyorsun.'
        : 'Doğrudan sonuca giden, net, somut verilerle karar alan ve karmaşayı hızla sadeleştiren berrak bir zihin yapın var.';
      const forkNote = c.hasFork
        ? ` Ucundaki ${c.forkAngle}° çatal ("stratejist / yazar çatalı"), aynı meseleye hem mantık hem de yaratıcı pencereden bakabildiğini kanıtlıyor.`
        : '';
      return {
        key: 'head',
        name: 'Akıl Çizgisi',
        color: '#7DD3FC',
        headline: c.hasFork ? 'Çift Perspektifli Stratejist Zihin' : (sloping ? 'Sezgisel ve Yaratıcı Zihin' : 'Berrak ve Pragmatik Zihin'),
        lead: summary + forkNote,
        evidence: `Ölçülen geometri: ${c.shapeLabel}, eğim ${c.slope > 0 ? '+' : ''}${c.slope}, ${c.bendsCount} kıvrım noktası${c.hasFork ? `, ${c.forkAngle}° çatal` : ''}.`,
        source: 'Benham (Line of Head) & Ellen Goldberg: Düz akıl çizgisi somut mantığı, aşağı kavis hayal gücünü, çatal ise çok yönlü zihinsel sentezi gösterir.'
      };
    }

    const wideArc = c.curvatureRatio >= 1.09;
    const summary = wideArc
      ? 'Venüs tepesini geniş bir yayla saran yaşam çizgin; güçlü bir yaşam sevinci, cömert enerji ve yeniliklere açık bir dayanıklılık gösteriyor.'
      : 'Odaklı ve ekonomik ilerleyen yaşam çizgin; enerjini gereksiz yerlere harcamadan kendi seçtiğin alanda derinleştiğini gösteriyor.';
    const forkNote = c.hasFork
      ? ` Çizgide işaretlediğin ${c.forkAngle}° açılı dal, hayatında yeni bir şehir, farklı bir iş veya ikinci bir yaşam kanalı açma potansiyeline işaret ediyor.`
      : '';
    return {
      key: 'life',
      name: 'Yaşam Çizgisi',
      color: '#E6C27A',
      headline: c.hasFork ? 'Değişime Açık ve Çok Kanallı Yaşam Enerjisi' : (wideArc ? 'Geniş Yaylı Canlı Yaşam Enerjisi' : 'Odaklı ve Kontrollü Yaşam Ritmi'),
      lead: summary + forkNote,
      evidence: `Ölçülen geometri: ${c.shapeLabel} (kavis oranı ${c.curvatureRatio}, yay uzunluğu ${c.arcLength}${c.hasFork ? `, ${c.forkAngle}° dal` : ''}).`,
      source: 'Benham (Line of Life) & Mehmet Ali Bulut (Elfabe): Yaşam çizgisi ömür uzunluğunu değil, yaşam kalitesini ve enerji akış tarzını gösterir.'
    };
  }

  async function buildReport(state) {
    const rules = await loadRules();
    const addons = global.KIRO_ADDONS || {};
    const p = state.profile || {};
    const micro = state.microTests || {};
    const marks = state.secondaryMarks || {};
    const combo = !!state.consent.comboAccepted;

    const handElement = inferHandElement(state, rules);
    const elInfo = rules.elements[handElement];
    const birthEl = (combo && p.birthElement) ? p.birthElement : null;
    const dominantMountKey = inferDominantMount(state);
    const mountInfo = rules.mounts[dominantMountKey];

    const tipInfo = rules.fingertips[micro.fingertips] || rules.fingertips.square;
    const consInfo = rules.consistency[micro.consistency] || rules.consistency.elastic;
    const flexInfo = rules.flexibility[micro.flexibility] || rules.flexibility.straight;
    const patternInfo = (combo && micro.patternType && rules.patterns[micro.patternType]) ? rules.patterns[micro.patternType] : null;

    const firstName = p.firstName || '';
    const call = firstName ? `${firstName}, ` : '';

    let comboHeadline = `${elInfo.title} · ${elInfo.archetype}`;
    let comboLead = `${call}${elInfo.summary}`;
    let comboCross = `${tipInfo.label} ve ${flexInfo.label.toLowerCase()} el yapın bir araya gelerek sende ${tipInfo.trait} özelliğini baskın kılıyor.`;
    let comboEvidence = `El Elementi (${handElement}) = ${tipInfo.label} + ${consInfo.label} + ${flexInfo.label}.`;

    if (combo && p.zodiac && birthEl) {
      comboHeadline = `${p.zodiac} (${birthEl}) × ${elInfo.title}`;
      const sameEl = birthEl === handElement;
      const risingPart = p.risingHint ? ` Yükselen eğilimin (${p.risingHint}) bu tabloya dışarıdan fark edilen ekstra bir duruş katıyor.` : '';
      const namePart = p.nameTone ? ` İsminin "${p.nameTone.toLowerCase()}" tınısı da bu çizgiyi destekliyor.` : '';
      comboLead = sameEl
        ? `${call}doğum elementin (${birthEl}) ile aktif elinin anatomisi (${handElement}) nadir görülen bir uyum içinde; içinden gelenle hayata yansıttığın çizgi tek bir yönde akıyor.`
        : `${call}doğum haritan (${p.zodiac} · ${birthEl}) sana doğal bir iç ritim verirken, aktif elinin ${handElement} yapısı seni hayatın içinde ${elInfo.archetype.toLowerCase()} bir karaktere dönüştürmüş.`;
      comboCross = `${tipInfo.label} formunla ${tipInfo.trait} ön planda.${risingPart}${namePart}`;
      comboEvidence = `3'lü Kombo: İsim Tınısı (${p.nameTone || '-'}) + ${p.zodiac}/${birthEl}${p.risingHint ? ' · Yükselen ' + p.risingHint : ''} × Aktif El (${handElement} · ${tipInfo.label}).`;
    }

    const agePoint = computeLifeAgePoint(combo ? p.age : null, state.curves.life);
    const ageStory = describeLifePhase(agePoint.age, marks.fate === 'yes', marks.specialMark === 'yes', firstName);

    const mainLines = {
      heart: analyzeMainLine('heart', state.curves.heart),
      head: analyzeMainLine('head', state.curves.head),
      life: analyzeMainLine('life', state.curves.life)
    };

    const detectedSecondary = Object.keys(rules.secondary)
      .filter(k => marks[k] === 'yes')
      .map(k => ({ key: k, ...rules.secondary[k] }));

    const secondarySummary = detectedSecondary.length
      ? detectedSecondary.map(s => `${s.name}: ${s.meaning}`).slice(0, 2).join(' ')
      : 'Avucunda fazla çizgi gürültüsü olmaması, enerjini dağıtmadan sade ve net bir yaşam odağı kurabildiğini gösterir.';

    const activeSideLabel = state.hands.activeSide === 'left' ? 'Sol Elin (Aktif)' : 'Sağ Elin (Aktif)';
    const passiveSideLabel = state.hands.passiveSide === 'left' ? 'Sol Elin (Pasif)' : 'Sağ Elin (Pasif)';
    const twoHandsLead = `${call}${passiveSideLabel.toLowerCase()} doğuştan getirdiğin ham potansiyeli taşırken, ${activeSideLabel.toLowerCase()} bugüne kadar kendi iradenle verdiğin kararların canlı haritası.`;
    const twoHandsSub = (state.curves.head && state.curves.head.hasFork) || detectedSecondary.length >= 2
      ? `Aktif elindeki zengin izler ve ${consInfo.energy} yapın, doğuştan gelen mirasının üzerine bilinçli olarak yeni katmanlar inşa ettiğini gösteriyor.`
      : `İki elin arasındaki sade akış, özünden kopmadan kendi ritmini koruyarak büyüdüğüne işaret ediyor.`;

    const addonExtra = (addons.compassExtrasByElement && addons.compassExtrasByElement[handElement]) || null;

    const reportObj = {
      createdAt: new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }),
      firstName,
      fullName: p.fullName || 'Kişisel El Profili',
      handElement,
      birthElement: birthEl,
      zodiac: p.zodiac || null,
      risingHint: p.risingHint || null,
      archetype: elInfo.archetype,
      curtain1: {
        eyebrow: "Perde 1 / 7 · 3'lü Kombo İmzân",
        headline: comboHeadline,
        lead: comboLead,
        sub: comboCross,
        evidence: comboEvidence,
        source: `${rules.sources.benham}; ${rules.sources.goldberg}.`
      },
      curtain2: {
        eyebrow: 'Perde 2 / 7 · Şu An Buradasın',
        headline: ageStory.headline,
        lead: ageStory.lead,
        sub: ageStory.sub,
        agePoint,
        evidence: `Yaşam çizgisi yay projeksiyonu: ${agePoint.age} yaş konumu (çizgi boyunca %${Math.round(agePoint.t * 100)} noktası).`,
        source: `${rules.sources.benham} (Age as Indicated on the Lines) & ${rules.sources.reid}.`
      },
      curtain3: {
        eyebrow: 'Perde 3 / 7 · Ana Çizgi Kanıtları',
        lines: mainLines
      },
      curtain4: {
        eyebrow: 'Perde 4 / 7 · Baskın Tepe & Gizli İmzalar',
        headline: `${mountInfo.name} · ${mountInfo.trait}`,
        lead: mountInfo.desc,
        sub: secondarySummary,
        mountKey: dominantMountKey,
        mountZone: mountInfo.zone,
        detectedSecondary,
        patternInfo,
        evidence: mountInfo.evidence + (patternInfo ? ` | Desen: ${patternInfo.label} (${patternInfo.purpose}).` : ''),
        source: `${rules.sources.benham} (7 Mount Types)${patternInfo ? ` & ${rules.sources.unger}` : ''}.`
      },
      curtain5: {
        eyebrow: 'Perde 5 / 7 · İki Elin Hikâyesi',
        headline: 'Potansiyelden Bugünkü Sene',
        lead: twoHandsLead,
        sub: twoHandsSub,
        passiveSideLabel,
        activeSideLabel,
        evidence: `Baskın el: ${state.handedness === 'left' ? 'Solak' : 'Sağlak'} · Kıvam: ${consInfo.label} · Esneklik: ${flexInfo.label}.`,
        source: `${rules.sources.benham} (What Hand to Use: Pasif el doğuştan yapıyı, aktif el iradi gelişimi gösterir).`
      },
      curtain6: {
        eyebrow: 'Perde 6 / 7 · Kişisel Pusulan',
        headline: 'Güçlü Yönler, Kör Noktalar & Denge',
        compass: {
          advices: [tipInfo.advice, flexInfo.advice],
          blindspots: [tipInfo.blindspot, consInfo.blindspot],
          stone: elInfo.stone,
          stoneReason: elInfo.stoneReason,
          palette: elInfo.palette,
          paletteReason: elInfo.paletteReason,
          ritual: elInfo.ritual,
          addonExtra
        },
        evidence: `Öneriler ${handElement} el elementi, ${tipInfo.label}, ${consInfo.label} ve ${flexInfo.label} kombinasyonundan deterministik üretildi.`,
        source: `${rules.sources.benham} & ${rules.sources.goldberg}.`
      },
      curtain7: {
        eyebrow: 'Perde 7 / 7 · Kişisel El Kimliği Kartı',
        headline: firstName ? `${firstName} · El Kimliği` : 'El Kimliği Kartın',
        cardTitle: comboHeadline,
        cardSubtitle: `${mountInfo.name} · ${elInfo.archetype}`,
        ageLabel: `${agePoint.age} Yaş Dönemi`,
        stoneLabel: elInfo.stone,
        patternLabel: patternInfo ? patternInfo.label : tipInfo.label
      }
    };

    if (typeof addons.getDeepComboNote === 'function') {
      try {
        const deepNote = addons.getDeepComboNote(state, reportObj);
        if (deepNote) reportObj.curtain1.sub += ' ' + deepNote;
      } catch (_) {}
    }

    return reportObj;
  }

  global.KiroEngine = { loadRules, buildReport };
})(window);
