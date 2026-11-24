// Ana Müfredat: kaynak .claude/skills/candlehub/references/seriler.md (sıra önkoşula göre, atlanamaz).
// Başlık kuralı gereği "X nedir?" kalıbı sitede kullanılmaz (Bölüm 1 bu yüzden yeniden yazıldı).
window.CH_MUFREDAT = [
 { kod: "K1", ad: "Mutlak temel", ozet: "Fiyat nasıl oluşur, emir nedir, kaldıraç neyi büyütür.", bolumler: [
  [1, "Piyasa nasıl işler? Fiyatı alıcı mı belirler, satıcı mı?"],
  [2, "Arz ve talep senin ekranında nasıl görünür?"],
  [3, "Emir tipleri: piyasa, limit, stop"],
  [4, "Spread: her trade'de ödediğin görünmez vergi"],
  [5, "Kaldıraç gerçekte ne yapıyor?"],
  [6, "Pip, lot, kontrat büyüklüğü: 60 saniyede"],
  [7, "Long ve short: aynı piyasada iki farklı bahis"],
  [8, "Grafik türleri: çizgi, bar, mum"] ] },
 { kod: "K2", ad: "Klasik okuma", ozet: "İndikatörleri öğren, sonra likidite diliyle nerede çakıştığını gör.", bolumler: [
  [9, "Grafiği ilk açtığında gördüğün şey ne?"],
  [10, "Yaygın mum formasyonları: doji, çekiç, yutan"],
  [11, "Destek-direnç neden herkeste farklı çizili?"],
  [12, "Trend çizgi değil, yapıdır (HH-HL)"],
  [13, "Kırılım mı tuzak mı? Fakeout anatomisi"],
  [14, "Hacim sana ne fısıldıyor?"],
  [15, "Hareketli ortalama: fiyatın hafızası mı, gecikmesi mi?"],
  [16, "RSI 70'i geçti. Bu \"sat\" demek mi?"],
  [17, "MACD kesişimi neyi kaçırıyor?"],
  [18, "Bollinger Bantları: oynaklık bir sinyal değil, bir çerçeve"],
  [19, "Fibonacci: %61,8 neden bu kadar konuşuluyor?"],
  [20, "Hangi zaman dilimi? 1 dakikaya bakan neden kaybediyor"] ] },
 { kod: "K3", ad: "Risk yönetimi", ozet: "Ne kadar riske gireceğini analizden önce bil.", bolumler: [
  [21, "İndikatör çöplüğü: hangileri gereksiz?"],
  [22, "İlk analiz şablonun"],
  [23, "Stop-loss nereye konur, \"biraz altına\" değilse nereye?"],
  [24, "Pozisyon büyüklüğü nasıl hesaplanır?"],
  [25, "Risk/ödül oranı: neden 1:1 yeterli değil"],
  [26, "Para yönetimi: sermayenin ne kadarı riske girer?"],
  [27, "Korku ve açgözlülük aynı hatayı yaptırır"],
  [28, "Plan yazmadan işlem açmak, pusulasız denize açılmak"],
  [29, "Kayıp bir hata değil, bir maliyettir"] ] },
 { kod: "K4", ad: "Stop ve mum", ozet: "Stopun neden hep aynı yerden döndüğünü mumun içinden oku.", bolumler: [
  [30, "Stopun neden hep tam dipten dönüyor?"],
  [31, "Senin stopunu kim görüyor?"],
  [32, "Fitil mi destek mi? Bir mumun anatomisi"],
  [33, "Eşit dipler neden tuzaktır?"],
  [34, "Sweep'ten sonra ne olur?"] ] },
 { kod: "K5", ad: "Yapı kırılması", ozet: "Trendin gerçekten ne zaman değiştiğini ayırt et.", bolumler: [
  [35, "Yapı ne zaman \"kırılır\"? (BOS)"],
  [36, "Trend gerçekten ne zaman değişir? (CHoCH)"],
  [37, "Asıl av öncesi yem: küçük tuzak seviyeler"],
  [38, "Seans açılışındaki yalancı hareket"] ] },
 { kod: "K6", ad: "Order block", ozet: "Büyük emirlerin bıraktığı izi test ederek incele.", bolumler: [
  [39, "Order block gerçekten çalışıyor mu? 100 örnekle test"],
  [40, "Alım mı satım mı? İki order block'un farkı"],
  [41, "Kırılan order block ne işe yarar?"],
  [42, "Piyasa eski hatasını nasıl \"düzeltir\"?"] ] },
 { kod: "K7", ad: "Boşluklar", ozet: "Fiyatın atladığı yerler neden geri çağırır?", bolumler: [
  [43, "Fiyatın \"atladığı\" boşluk neden geri çağırır?"],
  [44, "Boşluk mu, likidite deposu mu?"] ] },
 { kod: "K8", ad: "Zaman ve seans", ozet: "Aynı hareket neden hep aynı saatlerde olur?", bolumler: [
  [45, "Asya seansı neden sabaha karşı avlanır?"],
  [46, "Londra'da neden herkes aynı anda pozisyon açar?"],
  [47, "Piyasanın 3 perdelik oyunu"] ] },
 { kod: "K9", ad: "Fiyatın adaleti", ozet: "Pahalı ve ucuz bölgeyi mekanizma olarak öğren.", not: "Bu kademede giriş seviyesi verilmez. Yalnız mekanizma ve test.", bolumler: [
  [48, "Pahalı mı ucuz mu? Fiyatın kendi içindeki adaleti"],
  [49, "Kurumsal oyuncuların \"tercih ettiği\" bölge nasıl hesaplanır?"],
  [50, "\"Sihirli saat\" iddiası doğru mu? 100 örnekle test"],
  [51, "Kendi likidite haritanı çiz"] ] },
 { kod: "K10", ad: "İleri SMC", ozet: "Ana çizgiyi bitirenler için: kavram ailesini genişlet, güçlüyü zayıftan ayır.", bolumler: [
  [52, "Reddedilen bölge: order block'un iptali"],
  [53, "Kırılan boşluk rol değiştirince ne olur?"],
  [54, "Bir hareketi asıl başlatan mumlar"],
  [55, "Fiyatın hiç durmadığı bölge"],
  [56, "İki zıt boşluğun kesiştiği denge noktası"],
  [57, "BOS ve CHoCH yeter mi? Üçüncü teyit eşiği"],
  [58, "Nadir ama güçlü: iki kurulumun çakıştığı an"],
  [59, "İki enstrüman neden aynı anda yalan söylemez?"],
  [60, "Kırılım gerçek mi tuzak mı? (Turtle Soup)"],
  [61, "Çift tepe, çift dip tesadüf değil"],
  [62, "Bütün likidite türlerini tek haritada topla"],
  [63, "Güçlü hareketle zayıf hareketi ayıran şey"] ] }
];
