/**
 * KİRO V4.0 — Hukuk, 18+ Yaş ve Açık Rıza Modülü (legal-consent.js)
 */
(function (global) {
  'use strict';

  const FULL_LEGAL_HTML = `
    <h4>1. Veri Sorumlusu ve %100 Cihaz İçi İşleme</h4>
    <p>KİRO, bulut sunucusu kullanmayan bir istemci (cihaz içi) uygulamasıdır. Çektiğiniz veya yüklediğiniz el fotoğrafları, adınız ve doğum bilgileriniz hiçbir dış sunucuya aktarılmaz, üçüncü taraflarla paylaşılmaz ve yalnızca tarayıcınızın/cihazınızın geçici belleğinde işlenir.</p>

    <h4>2. Biyometrik Veri Politikası</h4>
    <p>Uygulama ham parmak izi taraması, kimlik doğrulama şablonu çıkarma veya biyometrik veri tabanı oluşturma işlemi yapmaz. İsteğe bağlı yaşam amacı katmanında kullanıcı yalnızca literatürdeki soyut desen tiplerinden birini kendi gözlemiyle seçer.</p>

    <h4>3. 18+ Yaş ve Kişisel Farkındalık Kapsamı</h4>
    <p>Bu uygulama 18 yaş ve üzeri kullanıcılar için kişisel farkındalık, geleneksel kiromansi literatürü incelemesi ve eğlence amaçlı hazırlanmıştır. Üretilen analizler hiçbir şekilde tıbbi tanı, psikolojik/psikiyatrik değerlendirme, hukuki tavsiye veya kesin gelecek tahmini niteliği taşımaz.</p>

    <h4>4. Doğal Taş ve Aromatik Çay İlhamı Uyarısı</h4>
    <p>Kişisel Pusula bölümünde sunulan doğal taş, odak ritüeli ve aromatik bitki çayı önerileri yalnızca geleneksel iyi yaşam ilhamıdır; tedavi veya şifa iddiası taşımaz. Alerjisi, kronik rahatsızlığı, hamilelik durumu veya düzenli ilaç kullanımı olan kişilerin herhangi bir bitkisel ürün tüketmeden önce mutlaka bir hekime danışması gerekir.</p>

    <h4>5. Veri Silme Hakkınız</h4>
    <p>İsteğe bağlı olarak 6 Aylık Gelişim Arşivine kaydettiğiniz verileri dilediğiniz an sağ üstteki ✦ menüsünden "Tüm Verilerimi Temizle" seçeneğiyle cihazınızdan kalıcı olarak silebilirsiniz.</p>
  `;

  function mount(containerEl, fullTextEl, continueBtnEl, onStateChange) {
    if (!containerEl) return;
    if (fullTextEl) fullTextEl.innerHTML = (global.KIRO_ADDONS && global.KIRO_ADDONS.extendedLegalHtml) || FULL_LEGAL_HTML;

    containerEl.innerHTML = `
      <div class="screen-head">
        <span class="eyebrow">Gizlilik &amp; Şeffaflık</span>
        <h2>Başlamadan Önce Kısa Onay</h2>
        <p class="muted">Verilerin tamamen senin kontrolünde kalır.</p>
      </div>

      <div class="legal-card">
        <div class="legal-point">
          <span class="dot"></span>
          <div><strong>Sunucusuz Cihaz İçi Analiz:</strong> Fotoğraflar ve bilgiler telefonundan dışarı çıkmaz; geçici bellekte işlenir.</div>
        </div>
        <div class="legal-point">
          <span class="dot"></span>
          <div><strong>Ham Biyometrik Kayıt Yok:</strong> Parmak izi taraması yapılmaz; yalnızca isteğe bağlı görsel desen seçimi sunulur.</div>
        </div>
        <div class="legal-point">
          <span class="dot"></span>
          <div><strong>Kişisel Farkındalık Kapsamı:</strong> Sonuçlar tıbbi, psikolojik veya hukuki teşhis niteliği taşımaz.</div>
        </div>
        <button type="button" class="link-btn" id="btnOpenLegalText">Tam Aydınlatma ve Kullanım Metnini Oku</button>
      </div>

      <label class="consent-box" id="boxCore">
        <input type="checkbox" id="chkCore" />
        <span class="consent-copy">
          <span class="tag-req">Zorunlu</span>
          <strong>18 yaşından büyüğüm;</strong> tüm verilerin yalnızca cihazımda işlendiğini ve analizin kişisel farkındalık amaçlı olduğunu okudum, onaylıyorum.
        </span>
      </label>

      <label class="consent-box" id="boxCombo">
        <input type="checkbox" id="chkCombo" />
        <span class="consent-copy">
          <span class="tag-opt">Opsiyonel</span>
          <strong>3'lü Kombo Açık Rızası:</strong> İsim, doğum bilgisi ve desen seçiminin yalnızca bu cihazda çapraz analiz için kullanılmasına onay veriyorum.
        </span>
      </label>
    `;

    const chkCore = containerEl.querySelector('#chkCore');
    const chkCombo = containerEl.querySelector('#chkCombo');
    const boxCore = containerEl.querySelector('#boxCore');
    const boxCombo = containerEl.querySelector('#boxCombo');

    function sync() {
      boxCore.classList.toggle('checked', chkCore.checked);
      boxCombo.classList.toggle('checked', chkCombo.checked);
      if (continueBtnEl) continueBtnEl.disabled = !chkCore.checked;
      if (typeof onStateChange === 'function') {
        onStateChange({ ageAndCoreAccepted: chkCore.checked, comboAccepted: chkCombo.checked });
      }
    }

    chkCore.addEventListener('change', sync);
    chkCombo.addEventListener('change', sync);

    return {
      setValues(coreVal, comboVal) {
        chkCore.checked = !!coreVal;
        chkCombo.checked = !!comboVal;
        sync();
      }
    };
  }

  global.KiroLegal = { mount };
})(window);
