/**
 * KİRO — Bilimsel El Analizi V4.0
 * Ek Modül: custom-addons.js
 *
 * Bu dosya yalnızca window.KIRO_ADDONS nesnesini tanımlar.
 * Ana uygulamaya dokunmaz; uygulama bu nesneyi hazır bulursa genişletilmiş
 * içerikleri etkinleştirir, bulamazsa kendi varsayılanlarıyla çalışmaya devam eder.
 */

(function () {
  "use strict";

  /* =========================================================
     1. EXTENDED LEGAL HTML
     ========================================================= */
  var extendedLegalHtml = `
<h4>KİRO El Analizi Uygulaması — Kullanım Koşulları ve Aydınlatma Metni</h4>

<h4>1. Veri Sorumlusu ve Uygulamanın Niteliği</h4>
<p>
  KİRO — Bilimsel El Analizi V4.0 (bundan böyle "Uygulama"), sunucu barındırmayan,
  tamamen cihaz içi çalışan bir yazılımdır. Uygulama, herhangi bir sunucuya,
  bulut sistemine veya üçüncü taraf platforma bağlanmaz; internet bağlantısı
  gerektirmez. Bu sebeple veri sorumluluğu, uygulamayı kendi cihazında çalıştıran
  kişiye aittir. Toplanan veriler yalnızca çalışma zamanında cihazın geçici
  belleğinde (RAM) tutulur ve uygulama penceresi kapatıldığında ya da sayfa
  yenilendiğinde kalıcı olarak silinir.
</p>

<h4>2. 6698 Sayılı KVKK Kapsamında Aydınlatma</h4>
<p>
  6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, Uygulama'nın
  işlediği veriler hakkında aşağıdaki hususları bildiririz:
</p>
<p>
  <strong>Toplanan Veriler:</strong> Ad-soyad, doğum tarihi, doğum yeri, el yapısı
  ölçümleri ve kullanıcının analiz oturumu boyunca girdiği diğer kişisel tercihler.
</p>
<p>
  <strong>İşleme Amacı:</strong> Söz konusu veriler yalnızca kişiselleştirilmiş
  el analizi raporu oluşturmak amacıyla, kullanıcının kendi isteğiyle ve yalnızca
  kendi cihazında işlenir. Üçüncü kişilerle paylaşılmaz, aktarılmaz, profilleme
  amacıyla kullanılmaz.
</p>
<p>
  <strong>Saklama Süresi:</strong> Veriler kalıcı olarak saklanmaz. Oturum
  süresince yalnızca RAM üzerinde geçici olarak bulunur ve oturum sonunda
  otomatik olarak yok edilir.
</p>
<p>
  <strong>Ham Biyometrik Veri:</strong> Uygulama, fotoğraf, parmak izi görüntüsü
  veya biyometrik şablon kaydı yapmaz. El ölçümleri yalnızca kullanıcının
  ekran üzerindeki etkileşimleriyle sayısal parametrelere dönüştürülür; ham
  biyometrik görüntü veya veri hiçbir şekilde cihazda depolanmaz.
</p>
<p>
  <strong>Veri Sahibinin Hakları (KVKK Madde 11):</strong> Kişisel verilerinizin
  işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme,
  işleme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,
  aktarıldığı üçüncü kişileri bilme, eksik veya yanlış işlenmiş olması hâlinde
  düzeltilmesini isteme ile silinmesini veya yok edilmesini talep etme haklarına
  sahipsiniz. Uygulama sunucusuz çalıştığından bu hakların yöneltileceği merci
  uygulamayı kendi cihazında çalıştıran kişinin kendisidir; tarayıcı önbelleğini
  ve localStorage'ı temizlemek veri silme işlemi olarak değerlendirilebilir.
</p>

<h4>3. Yaş Koşulu</h4>
<p>
  Uygulama yalnızca <strong>18 yaşını doldurmuş</strong> bireyler tarafından
  kullanılabilir. 18 yaşından küçük kullanıcıların Uygulama'yı kullanması
  yasaktır. Uygulamayı başlattığınızda 18 yaşını doldurmuş olduğunuzu beyan
  etmiş sayılırsınız. Ebeveynler ve yasal vasiler, reşit olmayan bireylerin
  bu uygulamaya erişimini engelleme konusunda tam sorumluluk taşır.
</p>

<h4>4. Tıbbi, Psikolojik ve Hukuki Teşhis Uyarısı</h4>
<p>
  Uygulama tarafından üretilen tüm raporlar, yorumlar ve öneriler; bilimsel
  el analizi metodolojisi, dermatoglifi araştırmaları ve geleneksel kadim bilgi
  sistemlerine dayalı <strong>yalnızca kişisel keşif ve eğlence</strong> amacı
  taşımaktadır. Bu çıktılar hiçbir koşulda:
</p>
<p>
  • Tıbbi teşhis, tedavi veya sağlık rehberliği yerine geçmez.<br>
  • Psikolojik değerlendirme, terapi veya klinik psikiyatri hizmeti niteliği
    taşımaz.<br>
  • Hukuki tavsiye, mali danışmanlık veya kariyer yönlendirmesi olarak
    yorumlanamaz.<br>
  • Acil sağlık durumlarında kesinlikle esas alınamaz.
</p>
<p>
  Fiziksel veya ruhsal sağlığınıza ilişkin herhangi bir endişeniz varsa lütfen
  yetkili bir sağlık profesyoneline başvurunuz.
</p>

<h4>5. Bitki Çayı ve Doğal Taş Önerilerine İlişkin Uyarı</h4>
<p>
  Uygulama bünyesinde sunulan bitki çayı ve doğal taş önerileri geleneksel
  halk tıbbı bilgisine ve aromaterapi kültürüne dayalı ilham amaçlı
  içeriklerdir; tıbbi reçete veya tedavi protokolü değildir.
</p>
<p>
  <strong>Alerji:</strong> Herhangi bir bitkiye, bitkisel ürüne veya içeriğe
  karşı bilinen ya da şüphelenilen alerjiniz varsa önerilen çayları kesinlikle
  tüketmeyiniz.
</p>
<p>
  <strong>Hamilelik ve Emzirme:</strong> Hamile ya da emziren bireyler, herhangi
  bir bitkisel ürünü kullanmadan önce mutlaka kadın doğum uzmanına veya
  eczacısına danışmalıdır. Bir kısım bitki, gebelik döneminde kontrendike
  olabilir.
</p>
<p>
  <strong>Düzenli İlaç Kullanımı ve Kronik Hastalık:</strong> Reçeteli veya
  reçetesiz ilaç kullanan, kronik hastalığı (diyabet, hipertansiyon, tiroid
  bozuklukları vb.) bulunan bireyler, bitkisel ürünlerin ilaçlarla olası
  etkileşimleri konusunda hekime veya eczacıya danışmadan herhangi bir çay
  veya takviyeyi kullanmamalıdır.
</p>
<p>
  Uygulamayı kullanmaya devam ederek yukarıdaki tüm koşul ve uyarıları okuduğunuzu,
  anladığınızı ve kabul ettiğinizi beyan etmiş olursunuz.
</p>
`;

  /* =========================================================
     2. COMPASS EXTRAS BY ELEMENT
     ========================================================= */
  var compassExtrasByElement = {

    "Toprak": {
      badge: `Mizaç & Aromatik Bitki Çayı İlhamı`,
      title: `Toprak Enerjisi — Papatya & Limon Melisası`,
      desc: `Toprak elementi, sabır, süreklilik ve besleyici bir iç huzuru simgeler.
Papatya çayı; Toprak mizacının köklü sakinliğini, sindirim sistemine ve sinir
dengesine verdiği özenle yansıtır — hafif çiçeksi aroması yoğun günlerin
ardından toprağa temas hissi yaratır. Limon melisası ise Toprak tipinin
pratik zekanın altındaki gizli kaygıyı yatıştırır, zihinsel netliği doğal
yollarla destekler. İkisi birlikte demlendikçe "güvenli sığınak" çayına
dönüşür; bol güneş almış bir öğleden sonraya, ya da bir günlük planlama
ritüelinin başına eşlik eder.`,
      footnote: `⚠️ Papatya ve melisaya karşı bilinen alerjisi olanlar, hamile
veya emziren bireyler ve antikoagülan/sedatif ilaç kullananlar lütfen
kullanmadan önce hekime danışsın.`
    },

    "Hava": {
      badge: `Mizaç & Aromatik Bitki Çayı İlhamı`,
      title: `Hava Enerjisi — Nane & Lavanta`,
      desc: `Hava elementi; hızlı düşünen, meraklı, sosyal ve sürekli hareket
eden zihinlerin evidir. Nane çayı bu enerjiye kusursuz eşlik eder: keskin,
ferahlatıcı ve anında zihni açan aromasıyla Hava tipinin düşünce tempolarını
netleştirir, özellikle çok fikirli kargaşa anlarında bir "sıfırlama" etkisi
yaratır. Lavanta ise Hava'nın aşırı uyarılmış sinir sistemini nazikçe süzer,
hiperstimülasyondan gece saatlerinde huzurlu bir uyku kapısına geçişi kolaylaştırır.
İkisinin harmonu; zihinsel yorgunluk ile zihinsel canlılık arasındaki ince
dengeyi kurar.`,
      footnote: `⚠️ Lavanta, nadir durumlarda hormonal hassasiyeti olan bireylerde
dikkat gerektirebilir. Hamilelikte lavanta kullanımı konusunda mutlaka hekime
başvurun. Nane, gastroözofajeal reflü olan kişilerde şikayeti artırabilir.`
    },

    "Ateş": {
      badge: `Mizaç & Aromatik Bitki Çayı İlhamı`,
      title: `Ateş Enerjisi — Zencefil & Tarçın`,
      desc: `Ateş elementi; tutkulu, liderlik odaklı, cesur ve ısrarcı bireylerin
yaşam enerjisini taşır. Zencefil çayı tam bu alevi besler: ısıtıcı, güçlendirici
ve metabolizmayı harekete geçiren etkisiyle Ateş tipinin dinamik gün başlangıçlarına
ve yoğun antrenman öncelerine güçlü bir katalizör olur. Tarçın ise kan şekeri
dengesini destekleyerek Ateş mizacının ani enerji yükselip inişlerini yumuşatır;
ayrıca ısıtıcı hoş aromanın altında bir güven ve kararlılık duygusu yaratır.
Bu harmon; ateşi yakmak için değil, onu akıllıca yönlendirmek için içilir.`,
      footnote: `⚠️ Zencefil, kan sulandırıcı etkisi nedeniyle antikoagülan
kullananlar, ameliyat öncesi hastalar ve mide ülseri bulunanlar için riskli
olabilir. Yüksek dozda tarçın (özellikle Cassia türü) karaciğer sağlığını
etkileyebilir; hekime danışmadan günlük yüksek miktarda kullanmayın.
Hamilelikte her ikisi için de tıbbi görüş alın.`
    },

    "Su": {
      badge: `Mizaç & Aromatik Bitki Çayı İlhamı`,
      title: `Su Enerjisi — Ihlamur & Böğürtlen Yaprağı`,
      desc: `Su elementi; empati, sezgi, duygusal derinlik ve akışkan bir iç
dünya ile tanımlanır. Ihlamur çayı, Su mizacının hassas duygusal dünyasına
nazik bir kucaklamayla yaklaşır — sakinleştirici, hafif tatlı aroması hem
sinir sistemini hem de kalp ritmini dinginleştirir; Su tipinin bazen fazla
soğurduğu başkalarının duygusal yükünü bırakmasını kolaylaştırır. Böğürtlen
yaprağı ise Su enerjisinin sezgisel, döngüsel yapısını antioksidan zenginliğiyle
besler, özellikle hormonal dalgalanma dönemlerinde vücudu içten destekler.
Bu harmon; "Ben de bu kadar" diyebilmek için, akşam günlüğünün yanında içilir.`,
      footnote: `⚠️ Ihlamur düşük tansiyonu olanlar ve sedatif ilaç kullananlar
için ekstra dikkat gerektirir. Böğürtlen yaprağı hamile bireylerde uterusu
uyarma potansiyeli taşıdığından gebelikte kullanımından kaçınılmalı; hekime
danışmadan tüketilmemelidir.`
    }

  };

  /* =========================================================
     3. GET DEEP COMBO NOTE
     ========================================================= */
  /**
   * @param {Object} state        - Uygulama durum nesnesi
   * @param {Object} baseReport   - Temel analiz raporu (kullanılmıyor; genişleme için rezerv)
   * @returns {string|null}       - Kişiye özel Türkçe çapraz tespit metni
   */
  function getDeepComboNote(state, baseReport) {
    try {
      // --- Profil verileri ---
      var profile     = (state && state.profile)    ? state.profile    : {};
      var curves      = (state && state.curves)      ? state.curves      : {};
      var microTests  = (state && state.microTests)  ? state.microTests  : {};

      var fullName    = profile.fullName     || null;
      var zodiac      = profile.zodiac       || null;
      var risingHint  = profile.risingHint   || null;
      var birthEl     = profile.birthElement || null;

      // --- Çizgi / Çatal verileri ---
      var heart  = curves.heart || {};
      var head   = curves.head  || {};
      var life   = curves.life  || {};

      // Çatal olan çizgileri topla
      var forkedLines = [];
      if (heart.hasFork) forkedLines.push("kalp");
      if (head.hasFork)  forkedLines.push("akıl");
      if (life.hasFork)  forkedLines.push("yaşam");

      // Şekil etiketleri (ilk bulunanı al)
      var shapeDesc = heart.shapeLabel || head.shapeLabel || life.shapeLabel || null;

      // --- Çeviri haritaları ---
      var fingertipMap   = { spatulate: "spatula", square: "kare", conic: "konik", pointed: "sivri" };
      var flexibilityMap = { stiff: "içe kavisli", straight: "dengeli", flexible: "geriye esnek" };
      var patternMap     = { whorl: "sarmal", loop: "ilmek", tented: "çadır", arch: "kemer" };

      // --- Parmak ucu, esneklik, desen ---
      var rawFingertips  = microTests.fingertips  || null;
      var rawFlexibility = microTests.flexibility || null;
      var rawPattern     = microTests.patternType || null;

      var fingertips  = rawFingertips  ? (fingertipMap[rawFingertips]    || rawFingertips)  : null;
      var flexibility = rawFlexibility ? (flexibilityMap[rawFlexibility] || rawFlexibility) : null;
      // "skipped" ise patternType cümleye hiç eklenmiyor
      var patternType = (rawPattern && rawPattern !== "skipped")
                          ? (patternMap[rawPattern] || rawPattern)
                          : null;

      // --- İsim bileşeni (ilk ad) ---
      var nameStr = fullName ? fullName.trim().split(/\s+/)[0] : null;

      // --- Burç / Yükselen bileşeni ---
      var astroStr = null;
      if (zodiac && risingHint && risingHint.toLowerCase() !== zodiac.toLowerCase()) {
        astroStr = zodiac + " burcu ve " + risingHint + " yükseleni";
      } else if (zodiac) {
        astroStr = zodiac + " burcu";
      }

      // --- Çizgi yapısı bileşeni ---
      var lineStr = null;
      if (forkedLines.length > 0) {
        var lineNames  = forkedLines.join(" ve ");
        var forkAngles = [];
        if (heart.hasFork && heart.forkAngle) forkAngles.push(Math.round(heart.forkAngle) + "°");
        if (head.hasFork  && head.forkAngle)  forkAngles.push(Math.round(head.forkAngle)  + "°");
        if (life.hasFork  && life.forkAngle)  forkAngles.push(Math.round(life.forkAngle)  + "°");

        lineStr = lineNames + " çizgisinde" + (forkedLines.length > 1 ? " çatallanmalar" : " çatallanma");
        if (forkAngles.length > 0) {
          lineStr += " (" + forkAngles.join(", ") + " açı)";
        }
      } else if (shapeDesc) {
        lineStr = shapeDesc + " çizgi yapısı";
      }

      // --- Doku bileşeni ---
      var textureStr = null;
      if (fingertips && flexibility) {
        textureStr = fingertips + " parmak uçları ve " + flexibility + " el esnekliği";
      } else if (fingertips) {
        textureStr = fingertips + " parmak uçları";
      } else if (flexibility) {
        textureStr = flexibility + " el esnekliği";
      }

      // --- En az bir anlamlı bilgi kontrolü ---
      var hasMeaningfulData = nameStr || astroStr || lineStr;
      if (!hasMeaningfulData) {
        return null;
      }

      // --- Cümle kurma — sıcak ikinci tekil şahıs ("senin...") dili ---
      var sentence;
      var parts = [nameStr, astroStr, lineStr, textureStr, patternType].filter(Boolean);

      if (parts.length >= 3) {
        sentence =
          (nameStr  ? nameStr + ", senin" : "Senin") +
          (astroStr ? " " + astroStr + " ile şekillenen kozmik profilin" : " kozmik profilin") +
          (birthEl  ? ", " + birthEl + " elementinin besleyici enerjisiyle derinleşirken" : "") +
          (lineStr  ? " aktif elinde saptanan " + lineStr : "") +
          (textureStr ? " ve " + textureStr : "") +
          (patternType ? " (" + patternType + " parmak deseniyle tamamlanan eşsiz bir bütün)" : "") +
          " — bu kesişim noktası, içgüdüsel sezişinin ile pratik kararlılığının aynı anda barındığı nadir bir el haritasına işaret ediyor.";
      } else {
        // Minimal veriyle güvenli kısa cümle
        sentence =
          (nameStr  ? nameStr + ", senin" : "Senin") +
          (astroStr ? " " + astroStr + " odaklı" : "") +
          (lineStr  ? " el çizgisi haritan (" + lineStr + ")" : " el haritan") +
          " kayda değer örtüşmeler barındırıyor.";
      }

      return sentence;

    } catch (err) {
      // Hiçbir hata dışarı sızmaz; güvenli fallback
      return null;
    }
  }

  /* =========================================================
     EXPORT
     ========================================================= */
  window.KIRO_ADDONS = {
    extendedLegalHtml:      extendedLegalHtml,
    compassExtrasByElement: compassExtrasByElement,
    getDeepComboNote:       getDeepComboNote
  };

}());
