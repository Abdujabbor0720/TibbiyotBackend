import type { Locale } from "@/lib/i18n/dictionaries"

export interface NewsItem {
  id: string
  title: Record<Locale, string>
  excerpt: Record<Locale, string>
  body: Record<Locale, string>
  mediaType: "photo" | "video" | "audio" | "text"
  mediaUrls?: string[]
  publishedAt: string
  createdBy: string
}

export interface ContactPerson {
  id: string
  fullName: string
  telegramId: string
  position: Record<Locale, string>
  department: Record<Locale, string>
  description: Record<Locale, string>
  photoUrl?: string
  email?: string
  phone?: string
  status: "active" | "inactive"
  createdAt: string
}

export interface ActivityLog {
  id: string
  action: string
  user: string
  timestamp: string
}

export const newsMock: NewsItem[] = [
  {
    id: "1",
    title: {
      "uz-lat": "2024-2025 o'quv yili uchun qabul e'lon qilindi",
      "uz-cyr": "2024-2025 ўқув йили учун қабул эълон қилинди",
      ru: "Объявлен приём на 2024-2025 учебный год",
      en: "Admissions announced for 2024-2025 academic year",
    },
    excerpt: {
      "uz-lat":
        "Toshkent Davlat Stomatologiya universitetiga 2024-2025 o'quv yili uchun talabalar qabul qilish jarayoni boshlandi.",
      "uz-cyr":
        "Тошкент Давлат Стоматология университетига 2024-2025 ўқув йили учун талабалар қабул қилиш жараёни бошланди.",
      ru: "Начался процесс приёма студентов в Ташкентский Государственный Стоматологический университет на 2024-2025 учебный год.",
      en: "The admission process for students to Tashkent State Stomatology University for the 2024-2025 academic year has begun.",
    },
    body: {
      "uz-lat":
        "Toshkent Davlat Stomatologiya universitetiga 2024-2025 o'quv yili uchun talabalar qabul qilish jarayoni rasman boshlandi. Abituriyentlar hujjatlarini 1-iyuldan 15-avgustgacha topshirishlari mumkin. Qabul barcha yo'nalishlar bo'yicha amalga oshiriladi.",
      "uz-cyr":
        "Тошкент Давлат Стоматология университетига 2024-2025 ўқув йили учун талабалар қабул қилиш жараёни расман бошланди. Абитуриентлар ҳужжатларини 1-июлдан 15-августгача топширишлари мумкин. Қабул барча йўналишлар бўйича амалга оширилади.",
      ru: "Официально начался процесс приёма студентов в Ташкентский Государственный Стоматологический университет на 2024-2025 учебный год. Абитуриенты могут подавать документы с 1 июля по 15 августа. Приём осуществляется по всем направлениям.",
      en: "The admission process for students to Tashkent State Stomatology University for the 2024-2025 academic year has officially begun. Applicants can submit documents from July 1 to August 15. Admission is available for all programs.",
    },
    mediaType: "photo",
    mediaUrls: ["/university-admissions-ceremony.jpg"],
    publishedAt: "2024-06-15T10:00:00Z",
    createdBy: "admin",
  },
  {
    id: "2",
    title: {
      "uz-lat": "Xalqaro stomatologiya konferensiyasi",
      "uz-cyr": "Халқаро стоматология конференцияси",
      ru: "Международная стоматологическая конференция",
      en: "International Dental Conference",
    },
    excerpt: {
      "uz-lat": "Universitetimiz xalqaro stomatologiya konferensiyasiga mezbonlik qilmoqda.",
      "uz-cyr": "Университетимиз халқаро стоматология конференциясига мезбонлик қилмоқда.",
      ru: "Наш университет принимает международную стоматологическую конференцию.",
      en: "Our university is hosting an international dental conference.",
    },
    body: {
      "uz-lat":
        "Toshkent Davlat Stomatologiya universiteti xalqaro stomatologiya konferensiyasiga mezbonlik qilmoqda. Tadbirda 20 dan ortiq mamlakatlardan mutaxassislar ishtirok etmoqda. Konferensiya 3 kun davom etadi.",
      "uz-cyr":
        "Тошкент Давлат Стоматология университети халқаро стоматология конференциясига мезбонлик қилмоқда. Тадбирда 20 дан ортиқ мамлакатлардан мутахассислар иштирок этмоқда. Конференция 3 кун давом этади.",
      ru: "Ташкентский Государственный Стоматологический университет принимает международную стоматологическую конференцию. В мероприятии участвуют специалисты из более чем 20 стран. Конференция продлится 3 дня.",
      en: "Tashkent State Stomatology University is hosting an international dental conference. Specialists from more than 20 countries are participating in the event. The conference will last 3 days.",
    },
    mediaType: "video",
    mediaUrls: ["/medical-conference-presentation-hall.jpg"],
    publishedAt: "2024-06-10T14:30:00Z",
    createdBy: "admin",
  },
  {
    id: "3",
    title: {
      "uz-lat": "Yangi laboratoriya ochildi",
      "uz-cyr": "Янги лаборатория очилди",
      ru: "Открыта новая лаборатория",
      en: "New laboratory opened",
    },
    excerpt: {
      "uz-lat": "Zamonaviy stomatologiya laboratoriyasi rasman foydalanishga topshirildi.",
      "uz-cyr": "Замонавий стоматология лабораторияси расман фойдаланишга топширилди.",
      ru: "Современная стоматологическая лаборатория официально введена в эксплуатацию.",
      en: "Modern dental laboratory officially commissioned.",
    },
    body: {
      "uz-lat":
        "Universitetimizda yangi zamonaviy stomatologiya laboratoriyasi ochildi. Laboratoriya eng so'nggi stomatologiya uskunalari bilan jihozlangan. Bu talabalar va tadqiqotchilar uchun katta imkoniyat.",
      "uz-cyr":
        "Университетимизда янги замонавий стоматология лабораторияси очилди. Лаборатория энг сўнгги стоматология ускуналари билан жиҳозланган. Бу талабалар ва тадқиқотчилар учун катта имконият.",
      ru: "В нашем университете открыта новая современная стоматологическая лаборатория. Лаборатория оснащена новейшим стоматологическим оборудованием. Это большая возможность для студентов и исследователей.",
      en: "A new modern dental laboratory has been opened at our university. The laboratory is equipped with the latest dental equipment. This is a great opportunity for students and researchers.",
    },
    mediaType: "photo",
    mediaUrls: ["/modern-medical-lab.png"],
    publishedAt: "2024-06-05T09:00:00Z",
    createdBy: "admin",
  },
  {
    id: "4",
    title: {
      "uz-lat": "Talabalar sport musobaqasi",
      "uz-cyr": "Талабалар спорт мусобақаси",
      ru: "Студенческие спортивные соревнования",
      en: "Student sports competition",
    },
    excerpt: {
      "uz-lat": "Yillik talabalar sport musobaqasi boshlandi.",
      "uz-cyr": "Йиллик талабалар спорт мусобақаси бошланди.",
      ru: "Начались ежегодные студенческие спортивные соревнования.",
      en: "Annual student sports competition has begun.",
    },
    body: {
      "uz-lat":
        "Universitetimizda yillik talabalar sport musobaqasi boshlandi. Musobaqalar futbol, basketbol, voleybol va tennis bo'yicha o'tkaziladi. Barcha fakultetlar ishtirok etmoqda.",
      "uz-cyr":
        "Университетимизда йиллик талабалар спорт мусобақаси бошланди. Мусобақалар футбол, баскетбол, волейбол ва теннис бўйича ўтказилади. Барча факултетлар иштирок этмоқда.",
      ru: "В нашем университете начались ежегодные студенческие спортивные соревнования. Соревнования проводятся по футболу, баскетболу, волейболу и теннису. Участвуют все факультеты.",
      en: "The annual student sports competition has begun at our university. Competitions are held in football, basketball, volleyball and tennis. All faculties are participating.",
    },
    mediaType: "text",
    publishedAt: "2024-06-01T11:00:00Z",
    createdBy: "admin",
  },
]

export const contactsMock: ContactPerson[] = [
  {
    id: "1",
    fullName: "Rahimov Aziz Karimovich",
    telegramId: "@rahimov_aziz",
    position: {
      "uz-lat": "Rektor o'rinbosari",
      "uz-cyr": "Ректор ўринбосари",
      ru: "Заместитель ректора",
      en: "Vice-Rector",
    },
    department: {
      "uz-lat": "Ma'muriyat",
      "uz-cyr": "Маъмурият",
      ru: "Администрация",
      en: "Administration",
    },
    description: {
      "uz-lat": "Akademik ishlar bo'yicha rektor o'rinbosari. O'quv jarayoni va ilmiy faoliyat masalalari.",
      "uz-cyr": "Академик ишлар бўйича ректор ўринбосари. Ўқув жараёни ва илмий фаолият масалалари.",
      ru: "Заместитель ректора по академическим вопросам. Вопросы учебного процесса и научной деятельности.",
      en: "Vice-Rector for Academic Affairs. Educational process and research activities.",
    },
    photoUrl: "/professional-man-suit-portrait.png",
    email: "a.rahimov@tdsu.uz",
    phone: "+998 71 230 20 65",
    status: "active",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    fullName: "Karimova Dilnoza Rustamovna",
    telegramId: "@karimova_d",
    position: {
      "uz-lat": "Dekan",
      "uz-cyr": "Декан",
      ru: "Декан",
      en: "Dean",
    },
    department: {
      "uz-lat": "Stomatologiya fakulteti",
      "uz-cyr": "Стоматология факултети",
      ru: "Стоматологический факультет",
      en: "Faculty of Dentistry",
    },
    description: {
      "uz-lat": "Stomatologiya fakulteti dekani. Talabalar masalalari va o'quv jarayoni haqida savollar.",
      "uz-cyr": "Стоматология факултети декани. Талабалар масалалари ва ўқув жараёни ҳақида саволлар.",
      ru: "Декан стоматологического факультета. Вопросы студентов и учебного процесса.",
      en: "Dean of the Faculty of Dentistry. Student affairs and educational process.",
    },
    photoUrl: "/professional-woman-doctor.png",
    email: "d.karimova@tdsu.uz",
    status: "active",
    createdAt: "2024-01-20T10:00:00Z",
  },
  {
    id: "3",
    fullName: "Islomov Sardor Baxtiyor o'g'li",
    telegramId: "@islomov_s",
    position: {
      "uz-lat": "Talabalar bo'limi boshlig'i",
      "uz-cyr": "Талабалар бўлими бошлиғи",
      ru: "Начальник отдела по работе со студентами",
      en: "Head of Student Affairs",
    },
    department: {
      "uz-lat": "Talabalar bo'limi",
      "uz-cyr": "Талабалар бўлими",
      ru: "Отдел по работе со студентами",
      en: "Student Affairs Department",
    },
    description: {
      "uz-lat": "Talabalar turmush sharoiti, yotoqxona va stipendiya masalalari.",
      "uz-cyr": "Талабалар турмуш шароити, ётоқхона ва стипендия масалалари.",
      ru: "Вопросы условий жизни студентов, общежития и стипендий.",
      en: "Student living conditions, dormitory and scholarship issues.",
    },
    photoUrl: "/young-professional-man-office-portrait.jpg",
    phone: "+998 71 230 20 65",
    status: "active",
    createdAt: "2024-02-01T10:00:00Z",
  },
  {
    id: "4",
    fullName: "Toshmatov Javlon Erkinovich",
    telegramId: "@toshmatov_j",
    position: {
      "uz-lat": "Qabul komissiyasi raisi",
      "uz-cyr": "Қабул комиссияси раиси",
      ru: "Председатель приёмной комиссии",
      en: "Admissions Committee Chair",
    },
    department: {
      "uz-lat": "Qabul komissiyasi",
      "uz-cyr": "Қабул комиссияси",
      ru: "Приёмная комиссия",
      en: "Admissions Committee",
    },
    description: {
      "uz-lat": "Abituriyentlar uchun qabul jarayoni va hujjatlar topshirish masalalari.",
      "uz-cyr": "Абитуриентлар учун қабул жараёни ва ҳужжатлар топшириш масалалари.",
      ru: "Вопросы процесса приёма и подачи документов для абитуриентов.",
      en: "Admission process and document submission for applicants.",
    },
    photoUrl: "/professional-man-educator-portrait.jpg",
    email: "j.toshmatov@tdsu.uz",
    phone: "+998 71 230 20 65",
    status: "active",
    createdAt: "2024-02-15T10:00:00Z",
  },
]

export const activityLogMock: ActivityLog[] = [
  { id: "1", action: "Yangilik qo'shildi", user: "Admin", timestamp: "2024-06-15T10:00:00Z" },
  { id: "2", action: "Kontakt tahrirlandi", user: "Admin", timestamp: "2024-06-14T15:30:00Z" },
  { id: "3", action: "Xabar yuborildi", user: "Admin", timestamp: "2024-06-13T09:00:00Z" },
  { id: "4", action: "Kontakt qo'shildi", user: "Admin", timestamp: "2024-06-12T14:00:00Z" },
  { id: "5", action: "Yangilik o'chirildi", user: "Admin", timestamp: "2024-06-11T11:00:00Z" },
]

export const adminStatsMock = {
  totalUsers: 1247,
  totalContacts: 4,
  totalNews: 4,
  messagesToday: 56,
}

export const universityInfo = {
  email: "info@tsdi.uz",
  helpline: "+998(71) 230-30-65",
  address: {
    "uz-lat": "103, Taraqqiyot ko'chasi, Toshkent",
    "uz-cyr": "103, Тараққиёт кўчаси, Тошкент",
    ru: "103, улица Тараккиёт, Ташкент",
    en: "103, Taraqqiyot Street, Tashkent",
  },
  workingHours: "09:00 - 18:00",
  website: "https://tsdi.uz",
  mapUrl: "https://maps.google.com/?q=Tashkent+state+dental+institute",
  coordinates: {
    lat: 41.311081,
    lng: 69.279737,
  },
}
