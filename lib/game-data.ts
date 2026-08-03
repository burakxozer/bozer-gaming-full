export interface GameInfo {
  slug: string;
  file: string;
  icon: string;
  name: string;
  description: string;
  features: string[];
  hasRules?: boolean;
  isDart?: boolean;
}

export const GAMES: GameInfo[] = [
  {
    slug: "americano",
    file: "/games/americano.html",
    icon: "🧮",
    name: "Americano",
    description: "Puan & Strateji Oyunu",
    features: ["2-5 Oyuncu"],
    hasRules: true,
  },
  {
    slug: "dart",
    file: "",
    icon: "🎯",
    name: "Dart",
    description: "Karambol Kriket Dart Oyunu",
    features: ["Antrenman", "Turnuva", "Maç"],
    isDart: true,
  },
  {
    slug: "kura-cek",
    file: "/games/kura-cek.html",
    icon: "🎲",
    name: "Kura Çek",
    description: "Çekiliş, Kura vb.",
    features: ["Çekiliş", "Grup Kurası", "Turnuva"],
  },
  {
    slug: "lig",
    file: "/games/lig.html",
    icon: "🏟️",
    name: "Lig Oluştur",
    description: "Lig oluşturma ve yönetim",
    features: [],
  },
  {
    slug: "somali",
    file: "/games/somali.html",
    icon: "🎴",
    name: "Somali",
    description: "Okey Tabanlı Bahis Oyunu",
    features: ["Tekli", "Eşli"],
  },
];

export const DART_GAMES: GameInfo[] = [
  {
    slug: "dartbot-v1",
    file: "/games/dart/dartbot-v1.html",
    icon: "🤖",
    name: "Dartbot v1",
    description: "Bota karşı Karambol Kriket",
    features: ["Karambol Kriket", "1-10 LvL Bot"],
  },
  {
    slug: "dart-turnuva",
    file: "/games/dart/dart-turnuva.html",
    icon: "🏆",
    name: "Turnuva",
    description: "Eleme sistemi",
    features: ["Karambol Kriket", "Max 8 Takım", "Otomatik Eşleşme"],
  },
  {
    slug: "dart-mac",
    file: "/games/dart/dart-mac.html",
    icon: "⚔️",
    name: "Dart Maç",
    description: "Hızlı skor takibi",
    features: ["Karambol Kriket", "Max 4 Takım", "Tek Maç"],
  },
];

export const GAME_INFO_TEXTS: Record<string, { title: string; items: string[] }> = {
  americano: {
    title: "Americano Scoreboard Nasıl Kullanılır?",
    items: [
      "2-5 kişi ile oynanabilir.",
      "Sol sütunda kural eli güncel olarak gösterilir.",
      'Bir kural satırında tüm oyunculara puan yazılmadan, altta kalan diğer sütunlar hesaba katılmaz. Mevcut kuraldaki tüm oyuncuların puan hanesi doldurulduğu anda puanlar otomatik olarak toplanıp ara toplama yazılır ve sıra bir alttaki kurala geçer.',
      'Oyunda bazı kuralları oynamak istemiyorsanız, o elde oyunculara 0 puan girebilirsiniz. Aksi halde kural eli, oyunculara puan girilmediği için sabit kalır.',
      'Bir oyuncuya ceza yazmak için, ceza satırının oyuncuya denk gelen hücresine tıklayarak yazabilirsiniz. Bir oyuncuya en fazla 8 ceza yazılabilecek şekilde tasarlanmıştır.',
      'Ceza hücreleri 8 cezadan sonra başa döner ve sıfırlanır. Yanlış ceza işlenmesi durumunda tıklayarak en başa dönüp tekrar işleyebilirsiniz.',
      'Normal bitişler için \"-\" veya \"/\" yazabilirsiniz. Job bitişler için \"X\" yazabilirsiniz. Çift elinde Job ile bitiş yapılırsa \"XX\" de yazabilirsiniz.',
      '\"Joker\" eline geçildiği zaman (çift eli tamamen doldurulduktan sonra) ekrana otomatik olarak \"Joker Eli için Kura Çek\" tuşu gelir.',
      'Joker eli doldurulduktan sonra ekranın en altına \"Kazanma Şansları\" butonu gelir.',
      '\"Konken\" eli için tüm oyuncuların puanları girildikten 3 saniye sonra oyunun sonucu ve sıralama gösterilir.',
    ],
  },
  "americano-rules": {
    title: "Americano Oyun Kuralları",
    items: [
      "Oyun 2 adet tam deste (52*2=104) ve 2 adet Job ile toplamda 106 kağıtla oynanır.",
      "Dağıtıcı, 106 kağıdı karıştırıp sol tarafında bulunan oyuncuya desteyi kestirir. Desteyi kesen oyuncu kestiği kısmın en altındaki kağıdı açıp kalan desteyi de açık kağıdın üstüne koyar. Eğer açılan kağıt Job ise kesen oyuncu o tur için alır.",
      "Dağıtıcının sağındaki oyuncuya 14, diğer tüm oyunculara 13 kağıt dağıtılır. 14 kağıt dağıtılan oyuncu ilk tur ortadan kağıt çekmez, atarak başlar.",
      "Atılacak kağıtlar masanın ortasına üst üste atılır. Oyuncular, solundaki oyuncunun attığı her kağıdı alabilir.",
      "Öncelik sırası, kağıt atan kişiden sonra oyun yönündeki kişi öncelik sahibidir.",
      "Bir oyuncu ceza çekmemesi durumunda 13, 1 ceza çekerse 15, 2 ceza çekerse 17, 3 ceza çekerse 19 kağıda sahip olabilir.",
      "Oyunda per açabilmek için öncelikle o elin kuralını uygulamak gerekir.",
      "Seri, küt ve çift olmak üzere 3 farklı per açma şekli vardır.",
      "Kağıtların sıralaması: A-2-3-4-5-6-7-8-9-10-J-Q-K",
      "Seri: Aynı türde ardışık sıralı perler. Q-K-A veya A-2-3 yapılabilir, K-A-2 yapılamaz.",
      "Küt: Aynı değerdeki kağıtların 3'ü 3'lü küt, 4'ü de 4'lü küt anlamına gelir.",
      "Çift: Herhangi bir kağıdın aynısı ile oluşturulur. Çift eli kuralı için 3 çift açmak gerekir.",
      "Herhangi bir oyuncu tur kuralını uygulamadan işleme yapamaz.",
      "Her turda oyun dağıtıldığı el, oyun sırası 1 kez daha gelmeden tur kuralını açmak için per açılamaz.",
      "Tur kuralının açıldığı sırada başka per açma veya işlek işleme yapılamaz.",
      "Oyunda bitiş, tüm kağıtlarını per açarak veya işleyerek masaya indirdikten sonra bitiş kağıdını ortaya atmak şartıyla yapılabilir.",
      "Normal kağıtla bitiş -25 puandır (/ veya - ile gösterilir). Çift elinde normal kağıtla bitilirse -50 puan.",
      "Job'la bitiş -50 puandır (X ile gösterilir). Çift elinde Job ile bitiş XX ile -100 puan.",
      "İşlek kağıt veya Job atmak (bitmiyorsa) +25 puan cezadır.",
      "Yerde açılan perlerde Job'u başkası tarafından alınan oyuncu +25 puan ceza yer.",
      "Hatalı el açıp geri toplamak +25 puan cezadır.",
      "Elde kalan sayılar: 2-10 kendi değeri, J-Q-K-A 10 puan, Job 25 puandır.",
      "Çift elinde yazılan ceza 2 kat yazılır.",
      "Konken: Düz okey gibi tüm kağıtların per oluşturup bitiş kağıdının ortaya atılmasıyla biter.",
      "En düşük toplam puana sahip oyuncu kazanır.",
    ],
  },
  "kura-cek": {
    title: "Kura Çek Nasıl Kullanılır?",
    items: [
      '3 moddan oluşur: Çekiliş, Grup Kurası ve Turnuva.',
      '\"Çekiliş Yap\" modunda; katılımcı ve kazanacak kişi sayısı girerek, yazacağınız isimler içerisinden kazananı rastgele belirleyebilirsiniz.',
      '\"Grup Kurası\" modu ile; yazacağınız kişileri, istediğiniz grup sayısına rastgele olarak bölebilirsiniz.',
      'Turnuva modu ile; Grup Kurası gibi gruplara ayırıp, sonrasında rastgele eşleşmelerle eleme usulü turnuva şampiyonu belirleyebilirsiniz.',
      'Turnuva Modunda 4 veya 8 takımda problem yaşanmaz, takım sayısı tek sayı ise ve BAY geçme durumu söz konusuysa hata verir.',
      'Turnuva başladıktan sonra maça tıklayarak kazananı seçerek diğer turlara geçiş yapabilirsiniz.',
    ],
  },
  lig: {
    title: "Lig Oluştur Nasıl Kullanılır?",
    items: [
      'İstediğiniz takım sayısında lig oluşturabilirsiniz.',
      '\"Tek Karşılaşma\", \"Çift Karşılaşma\" seçenekleriyle oluşan takımların birbiriyle kaç kez karşılaşacağını belirleyin.',
      'Maça tıklayarak maçın galibini seçin. 1 Fark (2-1): kazanan 2 puan, kaybeden 1 puan. 2 Fark (2-0): kazanan 3 puan, kaybeden 0 puan.',
      'Takım sayısı tek ise BAY geçecek takım rastgele belirlenir. BAY geçen takım 1 puan alır.',
    ],
  },
  somali: {
    title: "Somali Scoreboard Nasıl Kullanılır?",
    items: [
      'İsim yazma ekranında takımları karıştır tuşu ile rastgele masa yerleşimi yapabilirsiniz.',
      'Başlangıç sayısı ekranından, kaç puandan düşüleceğini girin. (Genellikle 10\'dan düşülür)',
      'Bahis ekranında gireceğiniz miktarla, sayısı kaçtan hesaplanacağını belirleyin.',
      'Oyun başladıktan sonra \"İşlem Yap\" tuşu ile düz bitiş, okey bitiş veya gösterge için veri girin.',
      'Oyunda her tur kaydedilir ve \"Güncel Durum\" butonu sayesinde turlar ve genel toplama ulaşılabilir.',
    ],
  },
  "dartbot-v1": {
    title: "Dartbot Nasıl Oynanır?",
    items: [
      'Karambol Kriket oyun kuralları geçerlidir.',
      '11 farklı seviye bottan oluşur. Bot seviyesi arttıkça zorluk artar.',
      'Botun temel hedefi house atmak, sonrasında da kalan kuralları tamamlamaktır.',
      'Kuralları bilmiyorsanız dart modu içinde en altta Youtube videosuna girerek öğrenebilirsiniz.',
    ],
  },
};

export const THEMES = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
  { value: "green", label: "Card Table Green" },
  { value: "purple", label: "Casino Purple" },
  { value: "steel", label: "Steel / Graphite" },
  { value: "red", label: "Red Arena" },
  { value: "midnight", label: "Midnight Blue" },
];

export const PRESET_AVATARS = [
  { key: "avatar_gaming", emoji: "🎮", bg: "#22c55e" },
  { key: "avatar_alien", emoji: "👾", bg: "#a855f7" },
  { key: "avatar_dart", emoji: "🎯", bg: "#ef4444" },
  { key: "avatar_dice", emoji: "🎲", bg: "#f97316" },
  { key: "avatar_cards", emoji: "🃏", bg: "#38bdf8" },
  { key: "avatar_flower", emoji: "🎴", bg: "#ec4899" },
  { key: "avatar_trophy", emoji: "🏆", bg: "#eab308" },
  { key: "avatar_swords", emoji: "⚔️", bg: "#6366f1" },
  { key: "avatar_robot", emoji: "🤖", bg: "#14b8a6" },
  { key: "avatar_crown", emoji: "👑", bg: "#f59e0b" },
  { key: "avatar_circus", emoji: "🎪", bg: "#e11d48" },
  { key: "avatar_masks", emoji: "🎭", bg: "#8b5cf6" },
];
