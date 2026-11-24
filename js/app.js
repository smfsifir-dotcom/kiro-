/**
 * KİRO V4.0 — Tam Sürüm (Faz 1 + 2 + 3 + 4) Akış Orkestratörü (app.js)
 */
(function () {
  'use strict';

  const STEP_FLOW = [
    'welcome', 'legal', 'profile', 'handedness',
    'cam-passive', 'cam-active', 'enhance',
    'curve-heart', 'curve-head', 'curve-life',
    'guide', 'micro', 'cinema'
  ];

  const STEP_TO_DOM = {
    'welcome': 'screen-welcome', 'legal': 'screen-legal', 'profile': 'screen-profile',
    'handedness': 'screen-handedness', 'cam-passive': 'screen-camera', 'cam-active': 'screen-camera',
    'enhance': 'screen-enhance', 'curve-heart': 'screen-curve', 'curve-head': 'screen-curve',
    'curve-life': 'screen-curve', 'guide': 'screen-guide', 'micro': 'screen-micro', 'cinema': 'screen-cinema'
  };

  let historyStack = ['welcome'];
  let legalController = null;

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const btnBack = $('#btnBack');
  const progressTrack = $('#progressTrack');
  const progressFill = $('#progressFill');
  const toastEl = $('#toast');

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toastEl.classList.remove('show'), 2500);
  }

  function updateProgress(stepKey) {
    const idx = STEP_FLOW.indexOf(stepKey);
    if (idx <= 0 || stepKey === 'cinema') { progressTrack.hidden = true; return; }
    progressTrack.hidden = false;
    progressFill.style.width = `${Math.round((idx / (STEP_FLOW.length - 1)) * 100)}%`;
  }

  function goToStep(stepKey, pushHistory = true, opts = {}) {
    if (stepKey !== 'cam-passive' && stepKey !== 'cam-active') KiroCamera.stopStream();
    if (stepKey !== 'guide') KiroGuide.stopAnim();
    if (stepKey !== 'cinema') KiroCinema.stopAnim();

    const domId = STEP_TO_DOM[stepKey];
    $$('.screen').forEach(s => s.classList.toggle('active', s.id === domId));

    if (pushHistory && historyStack[historyStack.length - 1] !== stepKey) historyStack.push(stepKey);
    btnBack.hidden = historyStack.length <= 1;
    updateProgress(stepKey);

    if (stepKey === 'cam-passive') KiroCamera.openCapture('passive', () => goToStep('cam-active'));
    else if (stepKey === 'cam-active') KiroCamera.openCapture('active', () => goToStep('enhance'));
    else if (stepKey === 'enhance') KiroCamera.openEnhanceScreen();
    else if (stepKey === 'curve-heart') KiroCurveEditor.openLine('heart');
    else if (stepKey === 'curve-head') KiroCurveEditor.openLine('head');
    else if (stepKey === 'curve-life') KiroCurveEditor.openLine('life');
    else if (stepKey === 'guide') KiroGuide.open(opts.startIndex || 0, () => goToStep('micro'));
    else if (stepKey === 'micro') KiroMicroTests.open(opts.startIndex || 0, () => goToStep('cinema'));
    else if (stepKey === 'cinema') KiroCinema.open(showToast, resetAllUI);
  }

  function goBack() {
    const curr = historyStack[historyStack.length - 1];
    if (curr === 'guide' && KiroGuide.stepBack()) return;
    if (curr === 'micro' && KiroMicroTests.stepBack()) return;
    if (historyStack.length <= 1) return;
    historyStack.pop();
    const prev = historyStack[historyStack.length - 1];
    goToStep(prev, false, { startIndex: prev === 'guide' ? KiroGuide.ITEMS.length - 1 : 0 });
  }

  const inputName = $('#inputName');
  const inputBirthDate = $('#inputBirthDate');
  const inputBirthTime = $('#inputBirthTime');
  const inputBirthCity = $('#inputBirthCity');
  const btnUnknownTime = $('#btnUnknownTime');
  const profilePreview = $('#profilePreview');
  const profilePreviewText = $('#profilePreviewText');

  function syncProfilePreview() {
    const timeUnknown = btnUnknownTime.classList.contains('active');
    KiroState.updateProfile({
      fullName: inputName.value,
      birthDate: inputBirthDate.value,
      birthTime: timeUnknown ? '' : inputBirthTime.value,
      birthTimeUnknown: timeUnknown,
      birthCity: inputBirthCity.value.trim()
    });
    const p = KiroState.get().profile;
    const chips = [];
    if (p.zodiac) chips.push(`${p.zodiac} (${p.birthElement})`);
    if (p.age !== null && p.age >= 18 && p.age <= 110) chips.push(`${p.age} Yaş`);
    if (p.risingHint) chips.push(`Yükselen: ${p.risingHint}`);
    if (p.nameTone) chips.push(`Tını: ${p.nameTone}`);
    profilePreview.hidden = !chips.length;
    if (chips.length) profilePreviewText.textContent = chips.join(' · ');
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
  }

  function openModal(id) { const el = document.getElementById(id); if (el) el.hidden = false; }
  function closeModal(id) { const el = document.getElementById(id); if (el) el.hidden = true; }

  function renderArchive() {
    const items = KiroState.getArchive();
    const mount = $('#archiveList');
    if (!items.length) {
      mount.innerHTML = `<div class="empty-archive">Henüz kayıtlı bir analiz yok.<br/><br/>7. Perdedeki "Arşive Kaydet" butonuyla analizlerini buraya saklayıp 6 ay sonraki dönüşümünü kıyaslayabilirsin.</div>`;
      return;
    }
    mount.innerHTML = items.map(item => `
      <div class="summary-card" style="margin-bottom:10px">
        <div class="summary-row"><span>Tarih</span><strong>${escapeHtml(item.date || '-')}</strong></div>
        <div class="summary-row"><span>Profil</span><strong>${escapeHtml(item.label || 'El Analizi')}</strong></div>
        <div class="summary-row"><span>Baskın Tepe</span><strong>${escapeHtml(item.mount || '-')}</strong></div>
      </div>
    `).join('');
  }

  const dedView = $('#dedicationView');
  const dedEdit = $('#dedicationEdit');
  const btnToggleEditDed = $('#btnToggleEditDed');
  const btnSaveDed = $('#btnSaveDed');

  function renderDedication() {
    const d = KiroState.getDedication();
    $('#dedicationHeadingView').textContent = d.heading;
    $('#dedicationBodyView').textContent = d.body;
    $('#dedicationSignView').textContent = d.sign;
    $('#editDedHeading').value = d.heading;
    $('#editDedBody').value = d.body;
    $('#editDedSign').value = d.sign;
    dedView.hidden = false;
    dedEdit.hidden = true;
    btnSaveDed.hidden = true;
    btnToggleEditDed.textContent = 'Mektubu Özelleştir';
  }

  function resetAllUI() {
    KiroCamera.stopStream();
    KiroGuide.stopAnim();
    KiroCinema.stopAnim();
    KiroState.reset();
    if (legalController) legalController.setValues(false, false);
    inputName.value = '';
    inputBirthDate.value = '';
    inputBirthTime.value = '';
    inputBirthCity.value = '';
    btnUnknownTime.classList.remove('active');
    inputBirthTime.disabled = false;
    profilePreview.hidden = true;
    $$('.hand-choice').forEach(b => b.classList.remove('selected'));
    historyStack = ['welcome'];
    goToStep('welcome', false);
  }

  function init() {
    legalController = KiroLegal.mount(
      $('#legalMount'),
      $('#legalFullTextMount'),
      $('#btnLegalContinue'),
      (vals) => {
        const s = KiroState.get();
        s.consent.ageAndCoreAccepted = vals.ageAndCoreAccepted;
        s.consent.comboAccepted = vals.comboAccepted;
        s.consent.acceptedAt = vals.ageAndCoreAccepted ? new Date().toISOString() : null;
      }
    );

    KiroCamera.bindEvents(showToast);
    KiroCurveEditor.bindEvents(showToast, (doneKey) => {
      if (doneKey === 'heart') goToStep('curve-head');
      else if (doneKey === 'head') goToStep('curve-life');
      else goToStep('guide');
    });
    KiroGuide.bindEvents();
    KiroMicroTests.bindEvents();
    KiroCinema.bindEvents();

    btnBack.addEventListener('click', goBack);
    $('#btnStart').addEventListener('click', () => goToStep('legal'));

    $('#btnDemo').addEventListener('click', async () => {
      KiroState.loadDemoProfile();
      const s = KiroState.get();
      if (legalController) legalController.setValues(true, true);
      inputName.value = s.profile.fullName;
      inputBirthDate.value = s.profile.birthDate;
      inputBirthTime.value = s.profile.birthTime;
      inputBirthCity.value = s.profile.birthCity;
      syncProfilePreview();
      $$('.hand-choice').forEach(b => b.classList.toggle('selected', b.dataset.hand === 'right'));

      s.hands.passiveRaw = KiroCamera.generateDemoPalm('left', false);
      s.hands.activeRaw = KiroCamera.generateDemoPalm('right', true);
      await KiroCamera.commitEnhancement();

      s.curves = {
        heart: {
          points: [{ x: 0.80, y: 0.43 }, { x: 0.56, y: 0.41 }, { x: 0.34, y: 0.33 }],
          fork: { t: 0.78, tip: { x: 0.31, y: 0.37 } },
          bendsCount: 3, hasFork: true, forkAngle: 26, arcLength: 0.48, curvatureRatio: 1.07, slope: -0.10, shapeLabel: 'Yumuşak Kavisli'
        },
        head: {
          points: [{ x: 0.27, y: 0.48 }, { x: 0.48, y: 0.53 }, { x: 0.71, y: 0.61 }],
          fork: { t: 0.74, tip: { x: 0.73, y: 0.55 } },
          bendsCount: 3, hasFork: true, forkAngle: 29, arcLength: 0.46, curvatureRatio: 1.05, slope: 0.13, shapeLabel: 'Yumuşak Kavisli'
        },
        life: {
          points: [{ x: 0.27, y: 0.50 }, { x: 0.44, y: 0.68 }, { x: 0.44, y: 0.90 }],
          fork: null,
          bendsCount: 3, hasFork: false, forkAngle: 0, arcLength: 0.46, curvatureRatio: 1.11, slope: 0.40, shapeLabel: 'Yumuşak Kavisli'
        }
      };
      s.secondaryMarks = { fate: 'yes', apollo: 'yes', mercury: 'no', venusGirdle: 'no', affection: 'yes', specialMark: 'yes' };
      s.microTests = { consistency: 'elastic', flexibility: 'flexible', texture: 'medium', fingertips: 'conic', patternType: 'whorl' };

      showToast('Demo analizi hazır — 7 perdeli keşfe başlıyoruz ✦');
      historyStack = ['welcome', 'enhance', 'curve-heart', 'guide', 'micro', 'cinema'];
      goToStep('cinema', false);
    });

    document.addEventListener('click', (e) => {
      if (e.target.id === 'btnOpenLegalText') openModal('legalTextModal');
      const closeId = e.target.getAttribute && e.target.getAttribute('data-close');
      if (closeId) closeModal(closeId);
      if (e.target.classList && e.target.classList.contains('modal-backdrop')) e.target.hidden = true;
    });

    $('#btnLegalContinue').addEventListener('click', () => {
      const s = KiroState.get();
      if (!s.consent.ageAndCoreAccepted) return;
      goToStep(s.consent.comboAccepted ? 'profile' : 'handedness');
    });

    [inputName, inputBirthDate, inputBirthTime, inputBirthCity].forEach(el => {
      el.addEventListener('input', syncProfilePreview);
      el.addEventListener('change', syncProfilePreview);
    });

    btnUnknownTime.addEventListener('click', () => {
      const active = btnUnknownTime.classList.toggle('active');
      inputBirthTime.disabled = active;
      if (active) inputBirthTime.value = '';
      syncProfilePreview();
    });

    $('#btnProfileContinue').addEventListener('click', () => {
      syncProfilePreview();
      const p = KiroState.get().profile;
      if (!p.fullName.trim()) { showToast('Lütfen en azından hitap ismini yaz'); inputName.focus(); return; }
      if (p.age !== null && p.age < 18) { showToast('Uygulama 18 yaş ve üzeri kullanıcılar içindir'); return; }
      goToStep('handedness');
    });

    $('#btnProfileSkip').addEventListener('click', () => {
      KiroState.get().consent.comboAccepted = false;
      goToStep('handedness');
    });

    $$('.hand-choice').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.hand-choice').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        KiroState.setHandedness(btn.dataset.hand);
        setTimeout(() => goToStep('cam-passive'), 170);
      });
    });

    $('#btnEnhanceContinue').addEventListener('click', async () => {
      await KiroCamera.commitEnhancement();
      goToStep('curve-heart');
    });

    $('#btnMenu').addEventListener('click', () => openModal('menuModal'));
    $('#btnOpenArchive').addEventListener('click', () => { closeModal('menuModal'); renderArchive(); openModal('archiveModal'); });
    $('#btnOpenDedication').addEventListener('click', () => { closeModal('menuModal'); renderDedication(); openModal('dedicationModal'); });
    btnToggleEditDed.addEventListener('click', () => {
      const editing = !dedEdit.hidden;
      dedView.hidden = !editing;
      dedEdit.hidden = editing;
      btnSaveDed.hidden = editing;
      btnToggleEditDed.textContent = editing ? 'Mektubu Özelleştir' : 'Vazgeç';
    });
    btnSaveDed.addEventListener('click', () => {
      KiroState.saveDedication({ heading: $('#editDedHeading').value, body: $('#editDedBody').value, sign: $('#editDedSign').value });
      renderDedication();
      showToast('Kurucu ithafı kaydedildi ✦');
    });
    $('#btnClearData').addEventListener('click', () => {
      KiroState.clearAllData();
      closeModal('menuModal');
      resetAllUI();
      showToast('Tüm yerel veriler temizlendi');
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
