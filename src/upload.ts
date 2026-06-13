// uploadDrivePoint.ts
// Бизнес: DrivePoint — прокат автомобілів
// Один файл — один запуск — весь бізнес.

import { ref, set, push } from "firebase/database";
import { db } from "./firebase";
import type { BusinessMeta } from "./models/Meta.ts";
import type { GeneralInfo } from "./models/GeneralInfo.ts";
import type { Service } from "./models/Service.ts";
import type { PriceModel } from "./models/Price.ts";
import type { Employee } from "./models/Employee.ts";
import type { FAQ } from "./models/FAQ.ts";
import type { Blog } from "./models/Blog.ts";
import type { Special } from "./models/Special.ts";
import type { Photo } from "./models/Photo.ts";
import type { PageContent } from "./models/PageContent.ts";


interface BusinessData {
  meta: BusinessMeta;
  generalInfo: GeneralInfo;
  services: Omit<Service, "id">[];
  prices: Omit<PriceModel, "id">[];
  employees: Omit<Employee, "id">[];
  faqs: Omit<FAQ, "id">[];
  specials: Omit<Special, "id">[];
  photos: Omit<Photo, "id">[];
  blogs: Omit<Blog, "id">[];
  pages: { about: PageContent; [key: string]: PageContent };
}


const businessSlug = "LinguaPoint";

const busines: BusinessData  =
    {
      "meta": {
        "name":      { "uk": "LinguaPoint", "ru": "LinguaPoint", "en": "LinguaPoint", "de": "LinguaPoint" },
        "shortName": { "uk": "LinguaPoint", "ru": "LinguaPoint", "en": "LinguaPoint", "de": "LinguaPoint" },
        "type": "company",
        "slogan": {
          "uk": "Говори впевнено — ми побудуємо твій шлях до мови",
          "ru": "Говори уверенно — мы построим твой путь к языку",
          "en": "Speak with confidence — we build your path to the language",
          "de": "Sprich selbstbewusst — wir bauen deinen Weg zur Sprache"
        },
        "description": {
          "uk": "Мовна школа з індивідуальним та груповим навчанням. Англійська, німецька, українська та російська мови. Курси від 4 тижнів до 1 року. Онлайн і офлайн формат. Сертифіковані викладачі, підготовка до IELTS, TOEFL, TestDaF.",
          "ru": "Языковая школа с индивидуальным и групповым обучением. Английский, немецкий, украинский и русский языки. Курсы от 4 недель до 1 года. Онлайн и офлайн формат. Сертифицированные преподаватели, подготовка к IELTS, TOEFL, TestDaF.",
          "en": "Language school offering individual and group lessons. English, German, Ukrainian and Russian. Courses from 4 weeks to 1 year. Online and offline formats. Certified teachers, preparation for IELTS, TOEFL, TestDaF.",
          "de": "Sprachschule mit Einzel- und Gruppenunterricht. Englisch, Deutsch, Ukrainisch und Russisch. Kurse von 4 Wochen bis 1 Jahr. Online und Präsenz. Zertifizierte Lehrkräfte, Vorbereitung auf IELTS, TOEFL, TestDaF."
        },
        "logo": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022",
        "tabs": {
          "about": {
            "route": "about", "order": 0, "enabled": true,
            "shortName": { "uk": "Про нас",    "ru": "О нас",       "en": "About",      "de": "Über uns" },
            "title":     { "uk": "Про LinguaPoint та наш підхід", "ru": "О LinguaPoint и нашем подходе", "en": "About LinguaPoint & Our Approach", "de": "Über LinguaPoint & unseren Ansatz" },
            "description": { "uk": "Хто ми, як ми навчаємо та наші гарантії", "ru": "Кто мы, как мы учим и наши гарантии", "en": "Who we are, how we teach and our guarantees", "de": "Wer wir sind, wie wir unterrichten und unsere Garantien" },
            "headerImage": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070"
          },
          "services": {
            "route": "services", "order": 1, "enabled": true,
            "shortName": { "uk": "Послуги",    "ru": "Услуги",      "en": "Courses",    "de": "Kurse" },
            "title":     { "uk": "Наші курси та послуги", "ru": "Наши курсы и услуги", "en": "Our Courses & Services", "de": "Unsere Kurse & Leistungen" },
            "description": { "uk": "Індивідуальне, групове, корпоративне навчання та підготовка до іспитів", "ru": "Индивидуальное, групповое, корпоративное обучение и подготовка к экзаменам", "en": "Individual, group, corporate training and exam preparation", "de": "Einzel-, Gruppen-, Firmenkurse und Prüfungsvorbereitung" },
            "headerImage": "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2064"
          },
          "specials": {
            "route": "specials", "order": 2, "enabled": true,
            "shortName": { "uk": "Акції",      "ru": "Акции",       "en": "Deals",      "de": "Angebote" },
            "title":     { "uk": "Акції та знижки", "ru": "Акции и скидки", "en": "Special Deals & Discounts", "de": "Angebote & Rabatte" },
            "description": { "uk": "Сезонні знижки, реферальна програма та групові пропозиції", "ru": "Сезонные скидки, реферальная программа и групповые предложения", "en": "Seasonal discounts, referral programme and group offers", "de": "Saisonale Rabatte, Empfehlungsprogramm und Gruppenangebote" },
            "headerImage": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070"
          },
          "price": {
            "route": "price", "order": 3, "enabled": true,
            "shortName": { "uk": "Ціни",       "ru": "Цены",        "en": "Prices",     "de": "Preise" },
            "title":     { "uk": "Тарифи та ціни на навчання", "ru": "Тарифы и цены на обучение", "en": "Tuition Rates & Prices", "de": "Kurspreise & Tarife" },
            "description": { "uk": "Прозорі ціни на всі формати навчання", "ru": "Прозрачные цены на все форматы обучения", "en": "Transparent pricing for all learning formats", "de": "Transparente Preise für alle Lernformate" }
          },
          "employees": {
            "route": "employees", "order": 4, "enabled": true,
            "shortName": { "uk": "Викладачі", "ru": "Преподаватели", "en": "Teachers",  "de": "Lehrkräfte" },
            "title":     { "uk": "Наша команда викладачів", "ru": "Наша команда преподавателей", "en": "Our Teaching Team", "de": "Unser Lehrerteam" },
            "description": { "uk": "Сертифіковані викладачі з міжнародним досвідом", "ru": "Сертифицированные преподаватели с международным опытом", "en": "Certified teachers with international experience", "de": "Zertifizierte Lehrkräfte mit internationalem Erfahrung" },
            "headerImage": "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=2074"
          },
          "faq": {
            "route": "faq", "order": 5, "enabled": true,
            "shortName": { "uk": "Питання",   "ru": "Вопросы",     "en": "FAQ",        "de": "FAQ" },
            "title":     { "uk": "Часті питання про навчання", "ru": "Частые вопросы об обучении", "en": "Frequently Asked Questions", "de": "Häufig gestellte Fragen" },
            "description": { "uk": "Відповіді на найпоширеніші питання про курси, формат і оплату", "ru": "Ответы на самые распространённые вопросы о курсах, формате и оплате", "en": "Answers to the most common questions about courses, format and payment", "de": "Antworten auf die häufigsten Fragen zu Kursen, Format und Zahlung" }
          },
          "gallery": {
            "route": "gallery", "order": 6, "enabled": true,
            "shortName": { "uk": "Галерея",   "ru": "Галерея",     "en": "Gallery",    "de": "Galerie" },
            "title":     { "uk": "Фото наших класів та подій", "ru": "Фото наших классов и событий", "en": "Photos of Our Classrooms & Events", "de": "Fotos unserer Klassenräume & Veranstaltungen" },
            "description": { "uk": "Реальна атмосфера навчання у LinguaPoint", "ru": "Реальная атмосфера обучения в LinguaPoint", "en": "The real learning atmosphere at LinguaPoint", "de": "Die echte Lernatmosphäre bei LinguaPoint" },
            "headerImage": "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=2032"
          },
          "blogs": {
            "route": "blogs", "order": 7, "enabled": true,
            "shortName": { "uk": "Блог",      "ru": "Блог",        "en": "Blog",       "de": "Blog" },
            "title":     { "uk": "Поради з вивчення мов та корисні статті", "ru": "Советы по изучению языков и полезные статьи", "en": "Language Learning Tips & Useful Articles", "de": "Sprachtipps & nützliche Artikel" },
            "description": { "uk": "Методики, лайфхаки та поради від наших викладачів", "ru": "Методики, лайфхаки и советы от наших преподавателей", "en": "Methods, life hacks and tips from our teachers", "de": "Methoden, Lifehacks und Tipps von unseren Lehrkräften" },
            "headerImage": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1973"
          },
          "contact": {
            "route": "contact", "order": 8, "enabled": true,
            "shortName": { "uk": "Контакти",  "ru": "Контакты",    "en": "Contact",    "de": "Kontakt" },
            "title":     { "uk": "Запишіться на безкоштовний пробний урок", "ru": "Запишитесь на бесплатный пробный урок", "en": "Sign Up for a Free Trial Lesson", "de": "Für eine kostenlose Probestunde anmelden" },
            "description": { "uk": "Відповімо протягом 15 хвилин у будь-який зручний месенджер", "ru": "Ответим в течение 15 минут в любой удобный мессенджер", "en": "We reply within 15 minutes via any convenient messenger", "de": "Wir antworten innerhalb von 15 Minuten über jeden Messenger" }
          }
        }
      },

      "generalInfo": {
        "address": {
          "uk": "вул. Хрещатик, 22, Київ, 01001",
          "ru": "ул. Крещатик, 22, Киев, 01001",
          "en": "22 Khreshchatyk St, Kyiv, 01001",
          "de": "Khreshchatyk-Str. 22, Kiew, 01001"
        },
        "phone": {
          "uk": "+38 (044) 333-77-55",
          "ru": "+38 (044) 333-77-55",
          "en": "+38 044 333-77-55",
          "de": "+38 044 333-77-55"
        },
        "email": "hello@linguapoint.ua",
        "working_hours": [
          { "days": { "uk": "Пн–Пт", "ru": "Пн–Пт", "en": "Mon–Fri", "de": "Mo–Fr" }, "hours": "09:00–21:00" },
          { "days": { "uk": "Сб–Нд", "ru": "Сб–Вс", "en": "Sat–Sun", "de": "Sa–So" }, "hours": "10:00–18:00" }
        ],
        "messengers": {
          "telegram": "@linguapoint_ua",
          "viber": "+380443337755",
          "whatsapp": "+380443337755"
        },
        "socials": {
          "instagram": "instagram.com/linguapoint.ua",
          "facebook": "facebook.com/linguapointua"
        },
        "map": "https://maps.google.com/?q=Khreshchatyk+22+Kyiv"
      },

      "services": [
        {
          "slug": "individual-lessons",
          "mainImage": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071",
          "title":    { "uk": "Індивідуальні уроки", "ru": "Индивидуальные уроки", "en": "Individual Lessons", "de": "Einzelunterricht" },
          "subtitle": { "uk": "Особистий викладач, гнучкий графік, максимальний прогрес", "ru": "Личный преподаватель, гибкий график, максимальный прогресс", "en": "Personal teacher, flexible schedule, maximum progress", "de": "Persönlicher Lehrer, flexibler Zeitplan, maximaler Fortschritt" },
          "headerTitle": { "uk": "Навчання 1:1 — найефективніший формат", "ru": "Обучение 1:1 — самый эффективный формат", "en": "1:1 Learning — the most effective format", "de": "1:1 Lernen — das effektivste Format" },
          "content": [
            {
              "type": "heading", "align": "left",
              "content": { "uk": "Чому індивідуально — це в рази швидше ніж у групі", "ru": "Почему индивидуально — это в разы быстрее чем в группе", "en": "Why 1:1 is many times faster than a group", "de": "Warum Einzelunterricht viel schneller ist als Gruppenunterricht" }
            },
            {
              "type": "paragraph", "align": "left",
              "content": {
                "uk": "Індивідуальний урок — це 60 хвилин виключно вашого прогресу. Ніяких пауз поки інші відповідають. Ніяких тем які вам вже відомі. Викладач повністю адаптує програму під ваші цілі: бізнес-англійська, розмовна практика, підготовка до IELTS чи просто впевнена комунікація.",
                "ru": "Индивидуальный урок — это 60 минут исключительно вашего прогресса. Никаких пауз пока другие отвечают. Никаких тем которые вам уже известны. Преподаватель полностью адаптирует программу под ваши цели: бизнес-английский, разговорная практика, подготовка к IELTS или просто уверенная коммуникация.",
                "en": "An individual lesson is 60 minutes exclusively for your progress. No pauses while others answer. No topics you already know. The teacher fully adapts the programme to your goals: business English, conversational practice, IELTS preparation or simply confident communication.",
                "de": "Ein Einzelunterricht sind 60 Minuten ausschließlich für Ihren Fortschritt. Keine Pausen während andere antworten. Keine Themen die Sie bereits kennen. Der Lehrer passt das Programm vollständig an Ihre Ziele an: Business-Englisch, Konversationspraxis, IELTS-Vorbereitung oder einfach selbstbewusste Kommunikation."
              }
            },
            {
              "type": "image", "align": "left",
              "media": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071",
              "widthPercent": 50,
              "children": [
                { "type": "heading", "align": "left", "content": { "uk": "Доступні мови", "ru": "Доступные языки", "en": "Available languages", "de": "Verfügbare Sprachen" } },
                {
                  "type": "list", "align": "left",
                  "content": {
                    "uk": "Англійська — A1 до C2, всі рівні\nНімецька — A1 до C1\nУкраїнська — для іноземців та ділове мовлення\nРосійська — для іноземців",
                    "ru": "Английский — A1 до C2, все уровни\nНемецкий — A1 до C1\nУкраинский — для иностранцев и деловая речь\nРусский — для иностранцев",
                    "en": "English — A1 to C2, all levels\nGerman — A1 to C1\nUkrainian — for foreigners and business speech\nRussian — for foreigners",
                    "de": "Englisch — A1 bis C2, alle Niveaus\nDeutsch — A1 bis C1\nUkrainisch — für Ausländer und Geschäftssprache\nRussisch — für Ausländer"
                  }
                }
              ]
            },
            {
              "type": "image", "align": "right",
              "media": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022",
              "widthPercent": 50,
              "children": [
                { "type": "heading", "align": "left", "content": { "uk": "Тривалість курсів", "ru": "Длительность курсов", "en": "Course durations", "de": "Kursdauern" } },
                {
                  "type": "list", "align": "left",
                  "content": {
                    "uk": "4 тижні — інтенсивний старт (8 уроків)\n8 тижнів — базовий курс (16 уроків)\n3 місяці — стандартний рівень (24 уроки)\n6 місяців — повне занурення (48 уроків)\n1 рік — від нуля до впевненого рівня (96 уроків)",
                    "ru": "4 недели — интенсивный старт (8 уроков)\n8 недель — базовый курс (16 уроков)\n3 месяца — стандартный уровень (24 урока)\n6 месяцев — полное погружение (48 уроков)\n1 год — от нуля до уверенного уровня (96 уроков)",
                    "en": "4 weeks — intensive start (8 lessons)\n8 weeks — basic course (16 lessons)\n3 months — standard level (24 lessons)\n6 months — full immersion (48 lessons)\n1 year — from zero to confident level (96 lessons)",
                    "de": "4 Wochen — intensiver Start (8 Lektionen)\n8 Wochen — Grundkurs (16 Lektionen)\n3 Monate — Standardniveau (24 Lektionen)\n6 Monate — vollständige Immersion (48 Lektionen)\n1 Jahr — von null bis sicheres Niveau (96 Lektionen)"
                  }
                }
              ]
            },
            {
              "type": "heading", "align": "left",
              "content": { "uk": "Що включено в кожен урок", "ru": "Что включено в каждый урок", "en": "What's included in every lesson", "de": "Was in jeder Lektion enthalten ist" }
            },
            {
              "type": "list", "align": "left",
              "content": {
                "uk": "Вхідне тестування рівня — безкоштовно\nПерший пробний урок — безкоштовно\nІндивідуальний план навчання\nДоступ до платформи з домашніми завданнями\nЗапис уроку (онлайн-формат) для повторення\nЩомісячний звіт про прогрес\nПідтримка у месенджері між уроками",
                "ru": "Входное тестирование уровня — бесплатно\nПервый пробный урок — бесплатно\nИндивидуальный план обучения\nДоступ к платформе с домашними заданиями\nЗапись урока (онлайн-формат) для повторения\nЕжемесячный отчёт о прогрессе\nПоддержка в мессенджере между уроками",
                "en": "Entry level test — free\nFirst trial lesson — free\nIndividual learning plan\nAccess to homework platform\nLesson recording (online format) for review\nMonthly progress report\nMessenger support between lessons",
                "de": "Einstufungstest — kostenlos\nErste Probestunde — kostenlos\nIndividueller Lernplan\nZugang zur Hausaufgaben-Plattform\nLektionsaufzeichnung (Online-Format) zur Wiederholung\nMonatlicher Fortschrittsbericht\nMessenger-Support zwischen den Lektionen"
              }
            }
          ]
        },

        {
          "slug": "group-courses",
          "mainImage": "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2064",
          "title":    { "uk": "Групові курси", "ru": "Групповые курсы", "en": "Group Courses", "de": "Gruppenkkurse" },
          "subtitle": { "uk": "Мінігрупи 4–8 осіб, живе спілкування, практика з першого уроку", "ru": "Мини-группы 4–8 человек, живое общение, практика с первого урока", "en": "Mini-groups of 4–8, live communication, practice from lesson one", "de": "Minigruppen von 4–8, lebendige Kommunikation, Praxis ab der ersten Lektion" },
          "headerTitle": { "uk": "Вчитися разом — і веселіше, і ефективніше", "ru": "Учиться вместе — и веселее, и эффективнее", "en": "Learning together — more fun and more effective", "de": "Gemeinsam lernen — macht mehr Spaß und ist effektiver" },
          "content": [
            {
              "type": "heading", "align": "left",
              "content": { "uk": "Групові курси — живе спілкування від першого дня", "ru": "Групповые курсы — живое общение с первого дня", "en": "Group courses — live communication from day one", "de": "Gruppenkurse — lebendige Kommunikation ab dem ersten Tag" }
            },
            {
              "type": "paragraph", "align": "left",
              "content": {
                "uk": "У групі з 4 до 8 студентів одного рівня ви отримуєте живу практику розмовної мови вже з першого заняття. Рольові ігри, дискусії, парні завдання — все це неможливо відтворити самостійно. Плюс мотивація групи яка тягне вперед навіть у моменти коли хочеться пропустити.",
                "ru": "В группе от 4 до 8 студентов одного уровня вы получаете живую практику разговорной речи уже с первого занятия. Ролевые игры, дискуссии, парные задания — всё это невозможно воспроизвести самостоятельно. Плюс мотивация группы которая тянет вперёд даже в моменты когда хочется пропустить.",
                "en": "In a group of 4 to 8 students at the same level you get live conversational practice from the very first lesson. Role plays, discussions, pair tasks — all things impossible to replicate alone. Plus the group motivation that pushes you forward even when you feel like skipping.",
                "de": "In einer Gruppe von 4 bis 8 Studierenden auf gleichem Niveau erhalten Sie ab der ersten Lektion lebendige Konversationspraxis. Rollenspiele, Diskussionen, Partneraufgaben — alles was man alleine nicht reproduzieren kann. Plus die Gruppenmotivation die einen vorwärts zieht, auch wenn man mal keine Lust hat."
              }
            },
            {
              "type": "image", "align": "left",
              "media": "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=2032",
              "widthPercent": 50,
              "children": [
                { "type": "heading", "align": "left", "content": { "uk": "Рівні та розклад", "ru": "Уровни и расписание", "en": "Levels and schedule", "de": "Niveaus und Stundenplan" } },
                {
                  "type": "list", "align": "left",
                  "content": {
                    "uk": "Beginner (A1–A2) — пн/ср/пт 18:00–19:30\nPre-Intermediate (A2–B1) — вт/чт 18:30–20:00\nIntermediate (B1–B2) — пн/ср 19:00–20:30\nUpper-Intermediate (B2) — вт/пт 18:00–19:30\nAdvanced (C1) — сб 10:00–13:00\nОнлайн-группи — будь-який час за домовленістю",
                    "ru": "Beginner (A1–A2) — пн/ср/пт 18:00–19:30\nPre-Intermediate (A2–B1) — вт/чт 18:30–20:00\nIntermediate (B1–B2) — пн/ср 19:00–20:30\nUpper-Intermediate (B2) — вт/пт 18:00–19:30\nAdvanced (C1) — сб 10:00–13:00\nОнлайн-группы — в любое время по договорённости",
                    "en": "Beginner (A1–A2) — Mon/Wed/Fri 18:00–19:30\nPre-Intermediate (A2–B1) — Tue/Thu 18:30–20:00\nIntermediate (B1–B2) — Mon/Wed 19:00–20:30\nUpper-Intermediate (B2) — Tue/Fri 18:00–19:30\nAdvanced (C1) — Sat 10:00–13:00\nOnline groups — any time by arrangement",
                    "de": "Beginner (A1–A2) — Mo/Mi/Fr 18:00–19:30\nPre-Intermediate (A2–B1) — Di/Do 18:30–20:00\nIntermediate (B1–B2) — Mo/Mi 19:00–20:30\nUpper-Intermediate (B2) — Di/Fr 18:00–19:30\nAdvanced (C1) — Sa 10:00–13:00\nOnline-Gruppen — jederzeit nach Vereinbarung"
                  }
                }
              ]
            },
            {
              "type": "image", "align": "right",
              "media": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1973",
              "widthPercent": 50,
              "children": [
                { "type": "heading", "align": "left", "content": { "uk": "Що входить у групові курси", "ru": "Что входит в групповые курсы", "en": "What group courses include", "de": "Was Gruppenkurse beinhalten" } },
                {
                  "type": "list", "align": "left",
                  "content": {
                    "uk": "Підручники та роздаткові матеріали включені\nДоступ до онлайн-платформи з тестами\nРозмовний клуб щотижня — безкоштовно\nЗнижка 20% на індивідуальні уроки\nСертифікат після завершення курсу\nМожливість перейти в інший рівень якщо є прогрес\nЗапис уроків для пропущених занять",
                    "ru": "Учебники и раздаточные материалы включены\nДоступ к онлайн-платформе с тестами\nРазговорный клуб еженедельно — бесплатно\nСкидка 20% на индивидуальные уроки\nСертификат после завершения курса\nВозможность перейти на другой уровень при наличии прогресса\nЗапись уроков для пропущенных занятий",
                    "en": "Textbooks and handouts included\nAccess to online platform with tests\nWeekly conversation club — free\n20% discount on individual lessons\nCertificate on course completion\nOption to move to another level if progressing\nLesson recordings for missed classes",
                    "de": "Lehrbücher und Handouts inklusive\nZugang zur Online-Plattform mit Tests\nWöchentlicher Konversationsclub — kostenlos\n20% Rabatt auf Einzelunterricht\nZertifikat nach Kursabschluss\nMöglichkeit auf ein anderes Niveau zu wechseln bei Fortschritt\nLektionsaufzeichnungen für verpasste Stunden"
                  }
                }
              ]
            }
          ]
        },

        {
          "slug": "exam-preparation",
          "mainImage": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070",
          "title":    { "uk": "Підготовка до іспитів", "ru": "Подготовка к экзаменам", "en": "Exam Preparation", "de": "Prüfungsvorbereitung" },
          "subtitle": { "uk": "IELTS, TOEFL, Cambridge, TestDaF — з гарантією результату", "ru": "IELTS, TOEFL, Cambridge, TestDaF — с гарантией результата", "en": "IELTS, TOEFL, Cambridge, TestDaF — with guaranteed results", "de": "IELTS, TOEFL, Cambridge, TestDaF — mit Ergebnisgarantie" },
          "headerTitle": { "uk": "Сертифікат міжнародного рівня — це реально", "ru": "Сертификат международного уровня — это реально", "en": "An international certificate — it's achievable", "de": "Ein internationales Zertifikat — das ist machbar" },
          "content": [
            {
              "type": "heading", "align": "left",
              "content": { "uk": "Ми знаємо формат іспиту зсередини", "ru": "Мы знаем формат экзамена изнутри", "en": "We know the exam format inside out", "de": "Wir kennen das Prüfungsformat von innen" }
            },
            {
              "type": "paragraph", "align": "left",
              "content": {
                "uk": "Підготовка до IELTS — це не просто вивчення мови. Це розуміння структури кожної секції, стратегій управління часом і типових пасток. Наші викладачі — самі складали ці іспити та мають сертифікати IELTS 8.0+, TestDaF TDN4+. Вони навчать вас не лише мови, а й тактики.",
                "ru": "Подготовка к IELTS — это не просто изучение языка. Это понимание структуры каждой секции, стратегий управления временем и типичных ловушек. Наши преподаватели — сами сдавали эти экзамены и имеют сертификаты IELTS 8.0+, TestDaF TDN4+. Они научат вас не только языку, но и тактике.",
                "en": "Preparing for IELTS is not just about learning the language. It's understanding the structure of each section, time management strategies and typical traps. Our teachers have taken these exams themselves and hold IELTS 8.0+, TestDaF TDN4+ certificates. They'll teach you not just the language, but the tactics.",
                "de": "Die Vorbereitung auf IELTS dreht sich nicht nur ums Sprachenlernen. Es geht um das Verständnis der Struktur jedes Abschnitts, Zeitmanagementstrategien und typische Fallen. Unsere Lehrkräfte haben diese Prüfungen selbst abgelegt und besitzen IELTS 8.0+, TestDaF TDN4+ Zertifikate. Sie lehren nicht nur die Sprache sondern auch die Taktik."
              }
            },
            {
              "type": "image", "align": "left",
              "media": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070",
              "widthPercent": 50,
              "children": [
                { "type": "heading", "align": "left", "content": { "uk": "Іспити до яких ми готуємо", "ru": "Экзамены к которым мы готовим", "en": "Exams we prepare for", "de": "Prüfungen für die wir vorbereiten" } },
                {
                  "type": "list", "align": "left",
                  "content": {
                    "uk": "IELTS Academic & General Training\nTOEFL iBT\nCambridge B2 First (FCE)\nCambridge C1 Advanced (CAE)\nTestDaF (Deutsch als Fremdsprache)\nGoethe-Zertifikat B2/C1\nUkrainian language exam (іноземці)",
                    "ru": "IELTS Academic & General Training\nTOEFL iBT\nCambridge B2 First (FCE)\nCambridge C1 Advanced (CAE)\nTestDaF (Deutsch als Fremdsprache)\nGoethe-Zertifikat B2/C1\nExamen Ukrainian language (иностранцы)",
                    "en": "IELTS Academic & General Training\nTOEFL iBT\nCambridge B2 First (FCE)\nCambridge C1 Advanced (CAE)\nTestDaF (Deutsch als Fremdsprache)\nGoethe-Zertifikat B2/C1\nUkrainian language exam (foreigners)",
                    "de": "IELTS Academic & General Training\nTOEFL iBT\nCambridge B2 First (FCE)\nCambridge C1 Advanced (CAE)\nTestDaF (Deutsch als Fremdsprache)\nGoethe-Zertifikat B2/C1\nUkrainische Sprachprüfung (Ausländer)"
                  }
                }
              ]
            },
            {
              "type": "image", "align": "right",
              "media": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070",
              "widthPercent": 50,
              "children": [
                { "type": "heading", "align": "left", "content": { "uk": "Наша гарантія результату", "ru": "Наша гарантия результата", "en": "Our result guarantee", "de": "Unsere Ergebnisgarantie" } },
                {
                  "type": "paragraph", "align": "left",
                  "content": {
                    "uk": "Якщо ви пройшли повний курс підготовки і не набрали цільовий бал — ми повторюємо курс безкоштовно. За умови відвідування 90%+ уроків і виконання домашніх завдань. Наша статистика: 94% студентів досягають або перевищують цільовий бал з першої спроби.",
                    "ru": "Если вы прошли полный курс подготовки и не набрали целевой балл — мы повторяем курс бесплатно. При условии посещения 90%+ уроков и выполнения домашних заданий. Наша статистика: 94% студентов достигают или превышают целевой балл с первой попытки.",
                    "en": "If you completed the full preparation course and didn't reach your target score — we repeat the course for free. Provided you attended 90%+ of lessons and completed homework. Our statistics: 94% of students reach or exceed their target score on the first attempt.",
                    "de": "Wenn Sie den vollständigen Vorbereitungskurs abgeschlossen haben und die Zielpunktzahl nicht erreicht haben — wiederholen wir den Kurs kostenlos. Vorausgesetzt Sie haben 90%+ der Lektionen besucht und Hausaufgaben erledigt. Unsere Statistik: 94% der Studierenden erreichen oder übertreffen ihre Zielpunktzahl beim ersten Versuch."
                  }
                }
              ]
            }
          ]
        },

        {
          "slug": "corporate-training",
          "mainImage": "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070",
          "title":    { "uk": "Корпоративне навчання", "ru": "Корпоративное обучение", "en": "Corporate Training", "de": "Firmenschulungen" },
          "subtitle": { "uk": "Навчання команди прямо в офісі або онлайн — за вашим розкладом", "ru": "Обучение команды прямо в офисе или онлайн — по вашему расписанию", "en": "Team training at your office or online — on your schedule", "de": "Teamschulung direkt im Büro oder online — nach Ihrem Zeitplan" },
          "headerTitle": { "uk": "Ваша команда говоритиме мовою партнерів", "ru": "Ваша команда заговорит на языке партнёров", "en": "Your team will speak the language of your partners", "de": "Ihr Team wird die Sprache Ihrer Partner sprechen" },
          "content": [
            {
              "type": "heading", "align": "left",
              "content": { "uk": "Корпоративні курси — це інвестиція яка повертається", "ru": "Корпоративные курсы — это инвестиция которая возвращается", "en": "Corporate courses — an investment that pays off", "de": "Firmenkurse — eine Investition die sich auszahlt" }
            },
            {
              "type": "paragraph", "align": "left",
              "content": {
                "uk": "Ми розробляємо програму під специфіку вашого бізнесу. IT-компанія — технічна англійська та листування. Готель — гостинна англійська для персоналу. Виробництво — технічна документація. Ми приїжджаємо до вас або проводимо онлайн. Рахунок виставляємо раз на місяць.",
                "ru": "Мы разрабатываем программу под специфику вашего бизнеса. IT-компания — техническая английская и переписка. Отель — гостеприимная английская для персонала. Производство — техническая документация. Мы приезжаем к вам или проводим онлайн. Счёт выставляем раз в месяц.",
                "en": "We design the programme for your business specifics. IT company — technical English and correspondence. Hotel — hospitality English for staff. Manufacturing — technical documentation. We come to you or run it online. One invoice per month.",
                "de": "Wir entwickeln das Programm für die Besonderheiten Ihres Unternehmens. IT-Firma — technisches Englisch und Korrespondenz. Hotel — Gastfreundschaftsenglisch für Personal. Produktion — technische Dokumentation. Wir kommen zu Ihnen oder führen es online durch. Eine Rechnung pro Monat."
              }
            },
            {
              "type": "image", "align": "left",
              "media": "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070",
              "widthPercent": 50,
              "children": [
                { "type": "heading", "align": "left", "content": { "uk": "Формати корпоративного навчання", "ru": "Форматы корпоративного обучения", "en": "Corporate training formats", "de": "Formate der Firmenschulung" } },
                {
                  "type": "list", "align": "left",
                  "content": {
                    "uk": "Групи 4–12 осіб у вашому офісі\nОнлайн-корпоративні групи — Zoom/Teams\nМіні-групи 2–3 особи для менеджменту\nІндивідуальні уроки для керівників\nІнтенсиви перед відрядженням чи конференцією\nВоркшопи з презентацій та ділового листування",
                    "ru": "Группы 4–12 человек в вашем офисе\nОнлайн корпоративные группы — Zoom/Teams\nМини-группы 2–3 человека для менеджмента\nИндивидуальные уроки для руководителей\nИнтенсивы перед командировкой или конференцией\nВоркшопы по презентациям и деловой переписке",
                    "en": "Groups of 4–12 at your office\nOnline corporate groups — Zoom/Teams\nMini-groups of 2–3 for management\nIndividual lessons for executives\nIntensives before a business trip or conference\nWorkshops on presentations and business correspondence",
                    "de": "Gruppen von 4–12 in Ihrem Büro\nOnline-Firmengruppen — Zoom/Teams\nMinigruppen von 2–3 für Management\nEinzelunterricht für Führungskräfte\nIntensivkurse vor Dienstreise oder Konferenz\nWorkshops zu Präsentationen und Geschäftskorrespondenz"
                  }
                }
              ]
            }
          ]
        },

        {
          "slug": "kids-courses",
          "mainImage": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022",
          "title":    { "uk": "Курси для дітей", "ru": "Курсы для детей", "en": "Kids Courses", "de": "Kurse für Kinder" },
          "subtitle": { "uk": "Від 5 до 16 років — ігрове навчання мові без стресу", "ru": "От 5 до 16 лет — игровое обучение языку без стресса", "en": "Ages 5–16 — playful language learning without stress", "de": "Von 5 bis 16 Jahren — spielerisches Sprachenlernen ohne Stress" },
          "headerTitle": { "uk": "Діти вчать мову грючи — це наш метод", "ru": "Дети учат язык играя — это наш метод", "en": "Children learn language by playing — that's our method", "de": "Kinder lernen Sprachen beim Spielen — das ist unsere Methode" },
          "content": [
            {
              "type": "heading", "align": "left",
              "content": { "uk": "Ніяких нудних підручників — тільки жива мова", "ru": "Никаких скучных учебников — только живой язык", "en": "No boring textbooks — only living language", "de": "Keine langweiligen Lehrbücher — nur lebendige Sprache" }
            },
            {
              "type": "paragraph", "align": "left",
              "content": {
                "uk": "Діти до 10 років засвоюють мову через пісні, гри, мультфільми і живе спілкування. Після 10 — структурована граматика з ігровими елементами. Ми вчимо так що дитина йде на урок з радістю. Групи максимум 6 дітей щоб кожен отримував увагу.",
                "ru": "Дети до 10 лет усваивают язык через песни, игры, мультфильмы и живое общение. После 10 — структурированная грамматика с игровыми элементами. Мы учим так чтобы ребёнок шёл на урок с радостью. Группы максимум 6 детей чтобы каждый получал внимание.",
                "en": "Children under 10 acquire language through songs, games, cartoons and live communication. After 10 — structured grammar with playful elements. We teach in a way that makes children want to come to class. Groups of maximum 6 children so each one gets attention.",
                "de": "Kinder unter 10 Jahren nehmen Sprache durch Lieder, Spiele, Cartoons und lebendige Kommunikation auf. Nach 10 — strukturierte Grammatik mit spielerischen Elementen. Wir unterrichten so dass Kinder gerne zur Stunde kommen. Gruppen von maximal 6 Kindern damit jedes die Aufmerksamkeit bekommt."
              }
            },
            {
              "type": "image", "align": "left",
              "media": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022",
              "widthPercent": 50,
              "children": [
                { "type": "heading", "align": "left", "content": { "uk": "Вікові групи", "ru": "Возрастные группы", "en": "Age groups", "de": "Altersgruppen" } },
                {
                  "type": "list", "align": "left",
                  "content": {
                    "uk": "5–7 років — Pre-Starters (ігровий формат)\n8–10 років — Starters & Movers (пісні, мультики)\n11–13 років — Flyers & KET (структуроване навчання)\n14–16 років — PET & FCE Junior (підготовка до іспитів)\nLittles Online — 30 хвилинні міні-уроки для малюків",
                    "ru": "5–7 лет — Pre-Starters (игровой формат)\n8–10 лет — Starters & Movers (песни, мультики)\n11–13 лет — Flyers & KET (структурированное обучение)\n14–16 лет — PET & FCE Junior (подготовка к экзаменам)\nLittles Online — 30 минутные мини-уроки для малышей",
                    "en": "5–7 years — Pre-Starters (playful format)\n8–10 years — Starters & Movers (songs, cartoons)\n11–13 years — Flyers & KET (structured learning)\n14–16 years — PET & FCE Junior (exam preparation)\nLittles Online — 30-minute mini-lessons for young children",
                    "de": "5–7 Jahre — Pre-Starters (Spielformat)\n8–10 Jahre — Starters & Movers (Lieder, Cartoons)\n11–13 Jahre — Flyers & KET (strukturiertes Lernen)\n14–16 Jahre — PET & FCE Junior (Prüfungsvorbereitung)\nLittles Online — 30-Minuten-Minilektionen für Kleinkinder"
                  }
                }
              ]
            }
          ]
        }
      ],

      "prices": [
        {
          "category": { "uk": "Індивідуальне навчання", "ru": "Индивидуальное обучение", "en": "Individual Lessons", "de": "Einzelunterricht" },
          "columns": {
            "duration": { "uk": "Тривалість курсу", "ru": "Длительность курса", "en": "Course Duration", "de": "Kursdauer" },
            "procedure": { "uk": "Формат / Мова", "ru": "Формат / Язык", "en": "Format / Language", "de": "Format / Sprache" },
            "price": { "uk": "Вартість", "ru": "Стоимость", "en": "Price", "de": "Preis" }
          },
          "sections": [
            {
              "subtitle": { "uk": "Англійська, Німецька — індивідуально", "ru": "Английский, Немецкий — индивидуально", "en": "English, German — individual", "de": "Englisch, Deutsch — Einzelunterricht" },
              "items": [
                { "duration": { "uk": "4 тижні (8 уроків)", "ru": "4 недели (8 уроков)", "en": "4 weeks (8 lessons)", "de": "4 Wochen (8 Lektionen)" }, "procedure": { "uk": "Онлайн або офлайн, 60 хв/урок", "ru": "Онлайн или офлайн, 60 мин/урок", "en": "Online or offline, 60 min/lesson", "de": "Online oder Präsenz, 60 Min/Lektion" }, "price": { "uk": "від 6 400 грн", "ru": "от 6 400 грн", "en": "from $160", "de": "ab 160 €" } },
                { "duration": { "uk": "8 тижнів (16 уроків)", "ru": "8 недель (16 уроков)", "en": "8 weeks (16 lessons)", "de": "8 Wochen (16 Lektionen)" }, "procedure": { "uk": "Онлайн або офлайн, 60 хв/урок", "ru": "Онлайн или офлайн, 60 мин/урок", "en": "Online or offline, 60 min/lesson", "de": "Online oder Präsenz, 60 Min/Lektion" }, "price": { "uk": "від 11 200 грн", "ru": "от 11 200 грн", "en": "from $280", "de": "ab 280 €" } },
                { "duration": { "uk": "3 місяці (24 уроки)", "ru": "3 месяца (24 урока)", "en": "3 months (24 lessons)", "de": "3 Monate (24 Lektionen)" }, "procedure": { "uk": "Онлайн або офлайн, 60 хв/урок", "ru": "Онлайн или офлайн, 60 мин/урок", "en": "Online or offline, 60 min/lesson", "de": "Online oder Präsenz, 60 Min/Lektion" }, "price": { "uk": "від 15 600 грн", "ru": "от 15 600 грн", "en": "from $390", "de": "ab 390 €" } },
                { "duration": { "uk": "6 місяців (48 уроків)", "ru": "6 месяцев (48 уроков)", "en": "6 months (48 lessons)", "de": "6 Monate (48 Lektionen)" }, "procedure": { "uk": "Онлайн або офлайн, 60 хв/урок", "ru": "Онлайн или офлайн, 60 мин/урок", "en": "Online or offline, 60 min/lesson", "de": "Online oder Präsenz, 60 Min/Lektion" }, "price": { "uk": "від 27 000 грн", "ru": "от 27 000 грн", "en": "from $680", "de": "ab 680 €" } },
                { "duration": { "uk": "1 рік (96 уроків)", "ru": "1 год (96 уроков)", "en": "1 year (96 lessons)", "de": "1 Jahr (96 Lektionen)" }, "procedure": { "uk": "Онлайн або офлайн, 60 хв/урок", "ru": "Онлайн или офлайн, 60 мин/урок", "en": "Online or offline, 60 min/lesson", "de": "Online oder Präsenz, 60 Min/Lektion" }, "price": { "uk": "від 48 000 грн", "ru": "от 48 000 грн", "en": "from $1 200", "de": "ab 1 200 €" } }
              ]
            }
          ]
        },
        {
          "category": { "uk": "Групові курси", "ru": "Групповые курсы", "en": "Group Courses", "de": "Gruppenkurse" },
          "columns": {
            "duration": { "uk": "Тривалість", "ru": "Длительность", "en": "Duration", "de": "Dauer" },
            "procedure": { "uk": "Формат", "ru": "Формат", "en": "Format", "de": "Format" },
            "price": { "uk": "Вартість / особа", "ru": "Стоимость / чел.", "en": "Price / person", "de": "Preis / Person" }
          },
          "sections": [
            {
              "subtitle": { "uk": "Групи 4–8 осіб (англійська / німецька)", "ru": "Группы 4–8 человек (английский / немецкий)", "en": "Groups of 4–8 (English / German)", "de": "Gruppen von 4–8 (Englisch / Deutsch)" },
              "items": [
                { "duration": { "uk": "4 тижні", "ru": "4 недели", "en": "4 weeks", "de": "4 Wochen" }, "procedure": { "uk": "2 рази/тиж, 90 хв, офлайн або онлайн", "ru": "2 раза/нед, 90 мин, офлайн или онлайн", "en": "2x/week, 90 min, offline or online", "de": "2x/Woche, 90 Min, Präsenz oder online" }, "price": { "uk": "від 2 400 грн", "ru": "от 2 400 грн", "en": "from $60", "de": "ab 60 €" } },
                { "duration": { "uk": "8 тижнів", "ru": "8 недель", "en": "8 weeks", "de": "8 Wochen" }, "procedure": { "uk": "2 рази/тиж, 90 хв, офлайн або онлайн", "ru": "2 раза/нед, 90 мин, офлайн или онлайн", "en": "2x/week, 90 min, offline or online", "de": "2x/Woche, 90 Min, Präsenz oder online" }, "price": { "uk": "від 4 200 грн", "ru": "от 4 200 грн", "en": "from $105", "de": "ab 105 €" } },
                { "duration": { "uk": "3 місяці", "ru": "3 месяца", "en": "3 months", "de": "3 Monate" }, "procedure": { "uk": "2 рази/тиж, 90 хв, офлайн або онлайн", "ru": "2 раза/нед, 90 мин, офлайн или онлайн", "en": "2x/week, 90 min, offline or online", "de": "2x/Woche, 90 Min, Präsenz oder online" }, "price": { "uk": "від 7 200 грн", "ru": "от 7 200 грн", "en": "from $180", "de": "ab 180 €" } },
                { "duration": { "uk": "6 місяців", "ru": "6 месяцев", "en": "6 months", "de": "6 Monate" }, "procedure": { "uk": "2–3 рази/тиж, 90 хв", "ru": "2–3 раза/нед, 90 мин", "en": "2–3x/week, 90 min", "de": "2–3x/Woche, 90 Min" }, "price": { "uk": "від 12 000 грн", "ru": "от 12 000 грн", "en": "from $300", "de": "ab 300 €" } },
                { "duration": { "uk": "1 рік", "ru": "1 год", "en": "1 year", "de": "1 Jahr" }, "procedure": { "uk": "2–3 рази/тиж, 90 хв", "ru": "2–3 раза/нед, 90 мин", "en": "2–3x/week, 90 min", "de": "2–3x/Woche, 90 Min" }, "price": { "uk": "від 20 000 грн", "ru": "от 20 000 грн", "en": "from $500", "de": "ab 500 €" } }
              ]
            },
            {
              "subtitle": { "uk": "Підготовка до іспитів (IELTS / TestDaF)", "ru": "Подготовка к экзаменам (IELTS / TestDaF)", "en": "Exam preparation (IELTS / TestDaF)", "de": "Prüfungsvorbereitung (IELTS / TestDaF)" },
              "items": [
                { "duration": { "uk": "8 тижнів (інтенсив)", "ru": "8 недель (интенсив)", "en": "8 weeks (intensive)", "de": "8 Wochen (Intensiv)" }, "procedure": { "uk": "Група до 6 осіб, 3 рази/тиж", "ru": "Группа до 6 человек, 3 раза/нед", "en": "Group up to 6, 3x/week", "de": "Gruppe bis 6, 3x/Woche" }, "price": { "uk": "від 7 600 грн", "ru": "от 7 600 грн", "en": "from $190", "de": "ab 190 €" } },
                { "duration": { "uk": "3 місяці", "ru": "3 месяца", "en": "3 months", "de": "3 Monate" }, "procedure": { "uk": "Група до 6 осіб, 2 рази/тиж + індив. консультація", "ru": "Группа до 6 человек, 2 раза/нед + индив. консультация", "en": "Group up to 6, 2x/week + individual consultation", "de": "Gruppe bis 6, 2x/Woche + Einzelberatung" }, "price": { "uk": "від 10 400 грн", "ru": "от 10 400 грн", "en": "from $260", "de": "ab 260 €" } }
              ]
            },
            {
              "subtitle": { "uk": "Курси для дітей", "ru": "Курсы для детей", "en": "Kids courses", "de": "Kinderkurse" },
              "items": [
                { "duration": { "uk": "8 тижнів", "ru": "8 недель", "en": "8 weeks", "de": "8 Wochen" }, "procedure": { "uk": "Група до 6 дітей, 2 рази/тиж, 60 хв", "ru": "Группа до 6 детей, 2 раза/нед, 60 мин", "en": "Group up to 6 kids, 2x/week, 60 min", "de": "Gruppe bis 6 Kinder, 2x/Woche, 60 Min" }, "price": { "uk": "від 3 200 грн", "ru": "от 3 200 грн", "en": "from $80", "de": "ab 80 €" } },
                { "duration": { "uk": "3 місяці", "ru": "3 месяца", "en": "3 months", "de": "3 Monate" }, "procedure": { "uk": "Група до 6 дітей, 2 рази/тиж, 60 хв", "ru": "Группа до 6 детей, 2 раза/нед, 60 мин", "en": "Group up to 6 kids, 2x/week, 60 min", "de": "Gruppe bis 6 Kinder, 2x/Woche, 60 Min" }, "price": { "uk": "від 5 400 грн", "ru": "от 5 400 грн", "en": "from $135", "de": "ab 135 €" } }
              ]
            }
          ]
        }
      ],

      "employees": [
        {
          "slug": "anna-kovalenko",
          "photo": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=688",
          "fullName":  { "uk": "Анна Коваленко",  "ru": "Анна Коваленко",   "en": "Anna Kovalenko",  "de": "Anna Kovalenko" },
          "shortName": { "uk": "А. Коваленко",    "ru": "А. Коваленко",     "en": "A. Kovalenko",    "de": "A. Kovalenko" },
          "position":  { "uk": "Старший викладач англійської, IELTS-коуч", "ru": "Старший преподаватель английского, IELTS-коуч", "en": "Senior English Teacher, IELTS Coach", "de": "Oberlehrerin Englisch, IELTS-Coach" },
          "specializations": [
            { "uk": "Підготовка до IELTS Academic — результати 7.0–8.5", "ru": "Подготовка к IELTS Academic — результаты 7.0–8.5", "en": "IELTS Academic preparation — scores 7.0–8.5", "de": "IELTS Academic Vorbereitung — Ergebnisse 7,0–8,5" },
            { "uk": "Бізнес-англійська для IT та фінансів", "ru": "Бизнес-английский для IT и финансов", "en": "Business English for IT and finance", "de": "Business-Englisch für IT und Finanzen" },
            { "uk": "Розмовна практика — середній та просунутий рівні", "ru": "Разговорная практика — средний и продвинутый уровни", "en": "Conversational practice — intermediate and advanced", "de": "Konversationspraxis — Mittel- und Fortgeschrittenenniveau" }
          ],
          "education": [
            { "uk": "КНУ ім. Шевченка — Англійська філологія (2012)", "ru": "КНУ им. Шевченко — Английская филология (2012)", "en": "Taras Shevchenko National University — English Philology (2012)", "de": "Nationale Universität Kiew — Englische Philologie (2012)" },
            { "uk": "University of Edinburgh — MEd TESOL (2015)", "ru": "University of Edinburgh — MEd TESOL (2015)", "en": "University of Edinburgh — MEd TESOL (2015)", "de": "University of Edinburgh — MEd TESOL (2015)" }
          ],
          "certificates": [
            "IELTS 8.5 — British Council (2014)",
            "CELTA — Cambridge Assessment English (2013)",
            "DELTA Module 2 — Cambridge (2017)",
            "10+ років викладацького досвіду, 400+ студентів"
          ]
        },
        {
          "slug": "markus-bauer",
          "photo": "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=687",
          "fullName":  { "uk": "Маркус Бауер",    "ru": "Маркус Бауэр",    "en": "Markus Bauer",    "de": "Markus Bauer" },
          "shortName": { "uk": "М. Бауер",        "ru": "М. Бауэр",        "en": "M. Bauer",        "de": "M. Bauer" },
          "position":  { "uk": "Викладач німецької мови, носій мови", "ru": "Преподаватель немецкого языка, носитель языка", "en": "German Language Teacher, native speaker", "de": "Deutschlehrer, Muttersprachler" },
          "specializations": [
            { "uk": "Підготовка до TestDaF та Goethe-Zertifikat", "ru": "Подготовка к TestDaF и Goethe-Zertifikat", "en": "Preparation for TestDaF and Goethe-Zertifikat", "de": "Vorbereitung auf TestDaF und Goethe-Zertifikat" },
            { "uk": "Ділова та академічна німецька", "ru": "Деловой и академический немецкий", "en": "Business and academic German", "de": "Wirtschafts- und Akademisches Deutsch" },
            { "uk": "Вимова та фонетика для початківців", "ru": "Произношение и фонетика для начинающих", "en": "Pronunciation and phonetics for beginners", "de": "Aussprache und Phonetik für Anfänger" }
          ],
          "education": [
            { "uk": "Humboldt-Universität zu Berlin — Германістика (2008)", "ru": "Humboldt-Universität zu Berlin — Германистика (2008)", "en": "Humboldt University Berlin — German Studies (2008)", "de": "Humboldt-Universität zu Berlin — Germanistik (2008)" },
            { "uk": "Goethe-Institut — DaF-Lehrerausbildung (2010)", "ru": "Goethe-Institut — DaF-Lehrerausbildung (2010)", "en": "Goethe-Institut — DaF Teacher Training (2010)", "de": "Goethe-Institut — DaF-Lehrerausbildung (2010)" }
          ],
          "certificates": [
            "DaF-Lehrkraft zertifiziert — Goethe-Institut",
            "TestDaF TDN 5 (максимальний результат)",
            "7 років в Україні, спеціалізація — підготовка до міграційних іспитів"
          ]
        },
        {
          "slug": "olena-savchenko",
          "photo": "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=2074",
          "fullName":  { "uk": "Олена Савченко",  "ru": "Елена Савченко",   "en": "Olena Savchenko", "de": "Olena Savchenko" },
          "shortName": { "uk": "О. Савченко",     "ru": "Е. Савченко",      "en": "O. Savchenko",    "de": "O. Savchenko" },
          "position":  { "uk": "Викладач дитячих курсів та Cambridge Young Learners", "ru": "Преподаватель детских курсов и Cambridge Young Learners", "en": "Kids Courses & Cambridge Young Learners Teacher", "de": "Lehrkraft für Kinderkurse & Cambridge Young Learners" },
          "specializations": [
            { "uk": "Навчання дітей 5–12 років через гру та творчість", "ru": "Обучение детей 5–12 лет через игру и творчество", "en": "Teaching children 5–12 through play and creativity", "de": "Unterrichten von Kindern 5–12 durch Spiel und Kreativität" },
            { "uk": "Cambridge Young Learners — Starters, Movers, Flyers", "ru": "Cambridge Young Learners — Starters, Movers, Flyers", "en": "Cambridge Young Learners — Starters, Movers, Flyers", "de": "Cambridge Young Learners — Starters, Movers, Flyers" },
            { "uk": "Англійська для підлітків 13–17 років", "ru": "Английский для подростков 13–17 лет", "en": "English for teenagers 13–17", "de": "Englisch für Teenager 13–17" }
          ],
          "education": [
            { "uk": "НПДУ — Дошкільна освіта та англійська мова (2010)", "ru": "НПДУ — Дошкольное образование и английский язык (2010)", "en": "NPDU — Early Childhood Education & English (2010)", "de": "NPDU — Frühkindliche Bildung & Englisch (2010)" }
          ],
          "certificates": [
            "TKT Young Learners — Cambridge Assessment (2015)",
            "CELTA — Cambridge (2013)",
            "Montessori Level 1 Certificate (2018)",
            "8 років роботи виключно з дітьми та підлітками"
          ]
        },
        {
          "slug": "ivan-petrenko",
          "photo": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=687",
          "fullName":  { "uk": "Іван Петренко",   "ru": "Иван Петренко",    "en": "Ivan Petrenko",   "de": "Ivan Petrenko" },
          "shortName": { "uk": "І. Петренко",     "ru": "И. Петренко",      "en": "I. Petrenko",     "de": "I. Petrenko" },
          "position":  { "uk": "Викладач TOEFL, бізнес-англійської та корпоративних курсів", "ru": "Преподаватель TOEFL, бизнес-английского и корпоративных курсов", "en": "TOEFL, Business English & Corporate Courses Teacher", "de": "TOEFL-, Business-Englisch- & Firmenkurslehrer" },
          "specializations": [
            { "uk": "TOEFL iBT — підготовка для вступу в американські університети", "ru": "TOEFL iBT — подготовка для поступления в американские университеты", "en": "TOEFL iBT — preparation for US university admission", "de": "TOEFL iBT — Vorbereitung für US-Universitätszulassung" },
            { "uk": "Корпоративна англійська для IT, юридичних та фінансових компаній", "ru": "Корпоративная английская для IT, юридических и финансовых компаний", "en": "Corporate English for IT, legal and financial companies", "de": "Unternehmens-Englisch für IT-, Rechts- und Finanzfirmen" },
            { "uk": "Презентації, переговори та ділова переписка англійською", "ru": "Презентации, переговоры и деловая переписка на английском", "en": "Presentations, negotiations and business correspondence in English", "de": "Präsentationen, Verhandlungen und Geschäftskorrespondenz auf Englisch" }
          ],
          "education": [
            { "uk": "КПІ ім. Сікорського — Прикладна лінгвістика (2009)", "ru": "КПИ им. Сикорского — Прикладная лингвистика (2009)", "en": "KPI — Applied Linguistics (2009)", "de": "KPI — Angewandte Linguistik (2009)" },
            { "uk": "Columbia University — Online Certificate: Teaching English (2019)", "ru": "Columbia University — Online Certificate: Teaching English (2019)", "en": "Columbia University — Online Certificate: Teaching English (2019)", "de": "Columbia University — Online Certificate: Teaching English (2019)" }
          ],
          "certificates": [
            "TOEFL iBT 115/120 (2018)",
            "CELTA — Cambridge (2011)",
            "12 років у корпоративному навчанні",
            "Клієнти: Deloitte, EPAM, OTP Bank, Нова Пошта"
          ]
        }
      ],

      "faqs": [
        {
          "question": { "uk": "З чого починається навчання у LinguaPoint?", "ru": "С чего начинается обучение в LinguaPoint?", "en": "How does learning at LinguaPoint begin?", "de": "Wie beginnt das Lernen bei LinguaPoint?" },
          "answer": { "uk": "Все починається з безкоштовного тестування рівня — онлайн, займає 15 хвилин. Потім вільна розмова з викладачем (30 хвилин) щоб зрозуміти ваші цілі та слабкі місця. Після цього ми пропонуємо оптимальний формат та план навчання. Перший пробний урок — також безкоштовно.", "ru": "Всё начинается с бесплатного тестирования уровня — онлайн, занимает 15 минут. Затем свободная беседа с преподавателем (30 минут) чтобы понять ваши цели и слабые места. После этого мы предлагаем оптимальный формат и план обучения. Первый пробный урок — тоже бесплатно.", "en": "Everything starts with a free level test — online, takes 15 minutes. Then a free conversation with the teacher (30 minutes) to understand your goals and weak points. After that we suggest the optimal format and learning plan. The first trial lesson is also free.", "de": "Alles beginnt mit einem kostenlosen Einstufungstest — online, dauert 15 Minuten. Dann ein freies Gespräch mit dem Lehrer (30 Minuten) um Ihre Ziele und Schwachstellen zu verstehen. Danach schlagen wir das optimale Format und den Lernplan vor. Die erste Probestunde ist ebenfalls kostenlos." }
        },
        {
          "question": { "uk": "Яку мову вибрати для вивчення?", "ru": "Какой язык выбрать для изучения?", "en": "Which language should I choose?", "de": "Welche Sprache soll ich wählen?" },
          "answer": { "uk": "Залежить від вашої мети. Англійська — якщо потрібна для роботи, подорожей, IELTS або еміграції до Канади/Австралії/США. Німецька — якщо плануєте вчитися або переїхати до Німеччини/Австрії/Швейцарії, або потрібна TestDaF. Українська та російська — для іноземців які живуть або планують переїхати до України. Якщо не знаєте — поговоріть з нашим консультантом безкоштовно.", "ru": "Зависит от вашей цели. Английский — если нужен для работы, путешествий, IELTS или эмиграции в Канаду/Австралию/США. Немецкий — если планируете учиться или переехать в Германию/Австрию/Швейцарию, или нужен TestDaF. Украинский и русский — для иностранцев которые живут или планируют переехать в Украину. Если не знаете — поговорите с нашим консультантом бесплатно.", "en": "It depends on your goal. English — if you need it for work, travel, IELTS or emigrating to Canada/Australia/USA. German — if you plan to study or move to Germany/Austria/Switzerland, or need TestDaF. Ukrainian and Russian — for foreigners living or planning to move to Ukraine. If you're unsure — talk to our consultant for free.", "de": "Es hängt von Ihrem Ziel ab. Englisch — wenn Sie es für die Arbeit, Reisen, IELTS oder Auswanderung nach Kanada/Australien/USA brauchen. Deutsch — wenn Sie planen in Deutschland/Österreich/der Schweiz zu studieren oder umzuziehen, oder TestDaF benötigen. Ukrainisch und Russisch — für Ausländer die in der Ukraine leben oder dorthin umziehen wollen. Wenn Sie unsicher sind — sprechen Sie kostenlos mit unserem Berater." }
        },
        {
          "question": { "uk": "Скільки часу потрібно щоб вивчити англійську з нуля?", "ru": "Сколько времени нужно чтобы выучить английский с нуля?", "en": "How long does it take to learn English from scratch?", "de": "Wie lange dauert es Englisch von Grund auf zu lernen?" },
          "answer": { "uk": "Офіційні дані Ради Європи: з A0 до B2 (розмовний рівень) — 600–800 годин практики. При 2 уроках на тиждень + домашні завдання — це 2–3 роки. При інтенсивному навчанні 5 разів на тиждень — 1–1.5 роки. Реалістичний прогрес у нас: за 3 місяці ви впевнено піднімаєтесь на 1 рівень (A1→A2 або B1→B2).", "ru": "Официальные данные Совета Европы: с A0 до B2 (разговорный уровень) — 600–800 часов практики. При 2 уроках в неделю + домашние задания — это 2–3 года. При интенсивном обучении 5 раз в неделю — 1–1.5 года. Реалистичный прогресс у нас: за 3 месяца вы уверенно поднимаетесь на 1 уровень (A1→A2 или B1→B2).", "en": "Official Council of Europe data: from A0 to B2 (conversational level) — 600–800 hours of practice. At 2 lessons per week + homework — that's 2–3 years. With intensive training 5 times a week — 1–1.5 years. Realistic progress with us: in 3 months you confidently move up 1 level (A1→A2 or B1→B2).", "de": "Offizielle Daten des Europarates: Von A0 bis B2 (Konversationsniveau) — 600–800 Stunden Praxis. Bei 2 Stunden pro Woche + Hausaufgaben — das sind 2–3 Jahre. Bei intensivem Training 5 Mal pro Woche — 1–1,5 Jahre. Realistischer Fortschritt bei uns: In 3 Monaten steigen Sie sicher um 1 Niveau (A1→A2 oder B1→B2)." }
        },
        {
          "question": { "uk": "Чи можна навчатися онлайн?", "ru": "Можно ли учиться онлайн?", "en": "Can I learn online?", "de": "Kann ich online lernen?" },
          "answer": { "uk": "Так, усі наші курси доступні онлайн у повноцінному форматі. Ми використовуємо Zoom + інтерактивну дошку Miro. Онлайн-уроки нічим не поступаються офлайн за якістю — особливо для середнього та просунутого рівнів. Єдине що доступно лише офлайн — живий розмовний клуб у нашому офісі по суботах.", "ru": "Да, все наши курсы доступны онлайн в полноценном формате. Мы используем Zoom + интерактивную доску Miro. Онлайн-уроки ничем не уступают офлайн по качеству — особенно для среднего и продвинутого уровней. Единственное что доступно только офлайн — живой разговорный клуб в нашем офисе по субботам.", "en": "Yes, all our courses are available online in full format. We use Zoom + the Miro interactive whiteboard. Online lessons are just as good as offline in quality — especially for intermediate and advanced levels. The only thing available exclusively offline is the live conversation club at our office on Saturdays.", "de": "Ja, alle unsere Kurse sind vollständig online verfügbar. Wir nutzen Zoom + das interaktive Whiteboard Miro. Online-Lektionen stehen Präsenzlektionen qualitativ in nichts nach — besonders für Mittel- und Fortgeschrittenenniveaus. Das Einzige das ausschließlich offline verfügbar ist, ist der Live-Konversationsclub in unserem Büro samstags." }
        },
        {
          "question": { "uk": "Що якщо я пропускаю уроки?", "ru": "Что если я пропускаю уроки?", "en": "What if I miss lessons?", "de": "Was wenn ich Lektionen verpasse?" },
          "answer": { "uk": "У груповому форматі — усі уроки записуються, пропущені заняття можна переглянути в особистому кабінеті. Також є можливість відпрацювати урок в іншій групі того ж рівня (за наявності місць). В індивідуальному форматі — перенесення уроку за 24 години безкоштовно, за менше ніж 24 години — урок вважається проведеним.", "ru": "В групповом формате — все уроки записываются, пропущенные занятия можно просмотреть в личном кабинете. Также есть возможность отработать урок в другой группе того же уровня (при наличии мест). В индивидуальном формате — перенос урока за 24 часа бесплатно, менее чем за 24 часа — урок считается проведённым.", "en": "In group format — all lessons are recorded and missed classes can be watched in your personal account. You can also make up a lesson in another group at the same level (subject to availability). In individual format — rescheduling 24 hours in advance is free; less than 24 hours and the lesson counts as used.", "de": "Im Gruppenformat — alle Lektionen werden aufgezeichnet und verpasste Stunden können im persönlichen Konto angesehen werden. Es gibt auch die Möglichkeit eine Lektion in einer anderen Gruppe auf demselben Niveau nachzuholen (je nach Verfügbarkeit). Im Einzelformat — Verschiebung 24 Stunden im Voraus ist kostenlos; unter 24 Stunden gilt die Lektion als abgehalten." }
        },
        {
          "question": { "uk": "Чи видається сертифікат після закінчення курсу?", "ru": "Выдаётся ли сертификат после окончания курса?", "en": "Is a certificate issued after completing a course?", "de": "Wird nach Kursabschluss ein Zertifikat ausgestellt?" },
          "answer": { "uk": "Так. Після завершення курсу та підсумкового тесту ви отримуєте сертифікат LinguaPoint із зазначенням мови, рівня та кількості годин. Для курсів підготовки до міжнародних іспитів — сертифікат з відміткою про підготовку до IELTS/TestDaF/Cambridge. Сертифікат видається у цифровому та паперовому форматі.", "ru": "Да. После завершения курса и итогового теста вы получаете сертификат LinguaPoint с указанием языка, уровня и количества часов. Для курсов подготовки к международным экзаменам — сертификат с отметкой о подготовке к IELTS/TestDaF/Cambridge. Сертификат выдаётся в цифровом и бумажном формате.", "en": "Yes. After completing the course and the final test you receive a LinguaPoint certificate specifying the language, level and number of hours. For international exam preparation courses — a certificate noting preparation for IELTS/TestDaF/Cambridge. The certificate is issued in both digital and paper format.", "de": "Ja. Nach Kursabschluss und dem Abschlusstest erhalten Sie ein LinguaPoint-Zertifikat mit Angabe der Sprache, des Niveaus und der Stundenzahl. Für Kurse zur Vorbereitung auf internationale Prüfungen — ein Zertifikat mit Vermerk zur IELTS/TestDaF/Cambridge-Vorbereitung. Das Zertifikat wird in digitaler und Papierform ausgestellt." }
        }
      ],

      "specials": [
        {
          "slug": "free-trial-plus-10percent",
          "title": { "uk": "Безкоштовний пробний урок + 10% на перший курс", "ru": "Бесплатный пробный урок + 10% на первый курс", "en": "Free trial lesson + 10% off your first course", "de": "Kostenlose Probestunde + 10% auf den ersten Kurs" },
          "subtitle": { "uk": "Спробуйте без ризику — і отримайте знижку якщо вирішите залишитися", "ru": "Попробуйте без риска — и получите скидку если решите остаться", "en": "Try without risk — and get a discount if you decide to stay", "de": "Probieren Sie ohne Risiko — und erhalten Sie einen Rabatt wenn Sie bleiben" },
          "mainImage": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070",
          "content": [
            { "type": "paragraph", "align": "left", "content": { "uk": "Перший урок з будь-яким нашим викладачем — абсолютно безкоштовно. Без передоплати, без карти. Просто запишіться через форму або месенджер. Якщо після пробного уроку ви вирішите продовжити — отримуєте 10% знижки на будь-який перший курс. Акція діє для нових студентів.", "ru": "Первый урок с любым нашим преподавателем — абсолютно бесплатно. Без предоплаты, без карты. Просто запишитесь через форму или мессенджер. Если после пробного урока вы решите продолжить — получаете 10% скидки на любой первый курс. Акция действует для новых студентов.", "en": "The first lesson with any of our teachers is completely free. No prepayment, no card required. Just sign up via the form or messenger. If after the trial lesson you decide to continue — you get a 10% discount on any first course. Offer valid for new students.", "de": "Die erste Lektion mit jedem unserer Lehrer ist völlig kostenlos. Keine Vorauszahlung, keine Karte erforderlich. Melden Sie sich einfach über das Formular oder Messenger an. Wenn Sie sich nach der Probestunde entscheiden weiterzumachen — erhalten Sie 10% Rabatt auf jeden ersten Kurs. Angebot gilt für neue Studierende." } }
          ],
          "serviceId": [],
          "prices": [],
          "blogs": []
        },
        {
          "slug": "refer-friend-both-get-discount",
          "title": { "uk": "Приведи друга — обидва отримають -15%", "ru": "Приведи друга — оба получат -15%", "en": "Refer a friend — both get -15%", "de": "Freund werben — beide bekommen -15%" },
          "subtitle": { "uk": "Навчайтеся разом і платіть менше — реферальна програма LinguaPoint", "ru": "Учитесь вместе и платите меньше — реферальная программа LinguaPoint", "en": "Learn together and pay less — LinguaPoint referral programme", "de": "Lernen Sie zusammen und zahlen Sie weniger — LinguaPoint Empfehlungsprogramm" },
          "mainImage": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070",
          "content": [
            { "type": "paragraph", "align": "left", "content": { "uk": "Порекомендуйте LinguaPoint другу — і обидва отримаєте 15% знижки на наступний оплачений курс. Умова: друг має оплатити повний курс (не менше 8 тижнів). Знижка нараховується автоматично після першої оплати друга. Без обмежень на кількість друзів — кожен новий реферал = нова знижка для вас.", "ru": "Порекомендуйте LinguaPoint другу — и оба получите 15% скидки на следующий оплаченный курс. Условие: друг должен оплатить полный курс (не менее 8 недель). Скидка начисляется автоматически после первой оплаты друга. Без ограничений на количество друзей — каждый новый реферал = новая скидка для вас.", "en": "Recommend LinguaPoint to a friend — and both of you get a 15% discount on your next paid course. Condition: the friend must pay for a full course (minimum 8 weeks). The discount is credited automatically after the friend's first payment. No limit on the number of friends — each new referral = a new discount for you.", "de": "Empfehlen Sie LinguaPoint einem Freund — und Sie beide erhalten 15% Rabatt auf Ihren nächsten bezahlten Kurs. Bedingung: Der Freund muss einen vollständigen Kurs bezahlen (mindestens 8 Wochen). Der Rabatt wird automatisch nach der ersten Zahlung des Freundes gutgeschrieben. Keine Begrenzung der Freundesanzahl — jede neue Empfehlung = ein neuer Rabatt für Sie." } }
          ],
          "serviceId": [],
          "prices": [],
          "blogs": []
        },
        {
          "slug": "summer-intensive-20off",
          "title": { "uk": "Літній інтенсив: –20% на групові курси червень–серпень", "ru": "Летний интенсив: –20% на групповые курсы июнь–август", "en": "Summer Intensive: –20% on group courses June–August", "de": "Sommer-Intensiv: –20% auf Gruppenkurse Juni–August" },
          "subtitle": { "uk": "Літо — ідеальний час для прориву в мові. Використайте його з вигодою", "ru": "Лето — идеальное время для прорыва в языке. Используйте его с выгодой", "en": "Summer is the perfect time for a language breakthrough. Make the most of it", "de": "Sommer ist die perfekte Zeit für einen Sprachdurchbruch. Nutzen Sie ihn mit Vorteil" },
          "mainImage": "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2064",
          "content": [
            { "type": "paragraph", "align": "left", "content": { "uk": "У червні, липні та серпні всі групові курси — зі знижкою 20%. Літні групи формуються швидко — не більше 6 осіб, часто щоденні заняття. Це можливість за 3 місяці пройти те, що зазвичай займає пів року. Знижка не підсумовується з іншими акціями.", "ru": "В июне, июле и августе все групповые курсы — со скидкой 20%. Летние группы формируются быстро — не более 6 человек, часто ежедневные занятия. Это возможность за 3 месяца пройти то, что обычно занимает полгода. Скидка не суммируется с другими акциями.", "en": "In June, July and August all group courses come with a 20% discount. Summer groups fill up fast — no more than 6 people, often daily sessions. This is your chance to cover in 3 months what normally takes half a year. Discount cannot be combined with other offers.", "de": "Im Juni, Juli und August erhalten alle Gruppenkurse 20% Rabatt. Sommergruppen füllen sich schnell — maximal 6 Personen, oft tägliche Sitzungen. Das ist Ihre Chance in 3 Monaten zu schaffen was normalerweise ein halbes Jahr dauert. Rabatt nicht mit anderen Angeboten kombinierbar." } }
          ],
          "serviceId": [],
          "prices": [],
          "blogs": []
        }
      ],

      "photos": [
        {
          "title": { "uk": "LinguaPoint зсередини", "ru": "LinguaPoint изнутри", "en": "LinguaPoint Inside", "de": "LinguaPoint von innen" },
          "description": { "uk": "Наші класи, заходи та команда", "ru": "Наши классы, мероприятия и команда", "en": "Our classrooms, events and team", "de": "Unsere Klassenräume, Veranstaltungen und Team" },
          "mainImage": "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=2032",
          "imgArr": [
            { "src": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070", "title": { "uk": "Клас для дорослих", "ru": "Класс для взрослых", "en": "Adult classroom", "de": "Erwachsenenklassenraum" }, "description": { "uk": "Сучасне обладнання та зручні місця для навчання", "ru": "Современное оборудование и удобные места для учёбы", "en": "Modern equipment and comfortable learning spaces", "de": "Moderne Ausstattung und komfortable Lernplätze" } },
            { "src": "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2064", "title": { "uk": "Групове заняття", "ru": "Групповое занятие", "en": "Group lesson", "de": "Gruppenunterricht" }, "description": { "uk": "Жива атмосфера та активна розмовна практика", "ru": "Живая атмосфера и активная разговорная практика", "en": "Lively atmosphere and active conversational practice", "de": "Lebendige Atmosphäre und aktive Konversationspraxis" } },
            { "src": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1973", "title": { "uk": "Онлайн-урок", "ru": "Онлайн-урок", "en": "Online lesson", "de": "Online-Lektion" }, "description": { "uk": "Повноцінний онлайн-формат з інтерактивною дошкою", "ru": "Полноценный онлайн-формат с интерактивной доской", "en": "Full online format with interactive whiteboard", "de": "Vollständiges Online-Format mit interaktivem Whiteboard" } },
            { "src": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022", "title": { "uk": "Дитячий клас", "ru": "Детский класс", "en": "Kids classroom", "de": "Kinderklassenraum" }, "description": { "uk": "Яскраве та безпечне середовище для навчання дітей", "ru": "Яркая и безопасная среда для обучения детей", "en": "Bright and safe environment for children's learning", "de": "Helle und sichere Umgebung für das Lernen der Kinder" } },
            { "src": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070", "title": { "uk": "Розмовний клуб", "ru": "Разговорный клуб", "en": "Conversation club", "de": "Konversationsclub" }, "description": { "uk": "Щосуботній безкоштовний розмовний клуб для студентів", "ru": "Еженедельный бесплатный разговорный клуб для студентов", "en": "Weekly free conversation club for students", "de": "Wöchentlicher kostenloser Konversationsclub für Studierende" } },
            { "src": "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=2032", "title": { "uk": "Церемонія вручення сертифікатів", "ru": "Церемония вручения сертификатов", "en": "Certificate ceremony", "de": "Zertifikatsverleihung" }, "description": { "uk": "Кожне завершення курсу — маленьке свято для нашої команди і студентів", "ru": "Каждое завершение курса — маленький праздник для нашей команды и студентов", "en": "Every course completion is a small celebration for our team and students", "de": "Jeder Kursabschluss ist ein kleines Fest für unser Team und die Studierenden" } }
          ]
        }
      ],

      "blogs": [
        {
          "slug": "how-to-learn-english-in-6-months",
          "mainImage": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1973",
          "title": { "uk": "Як вивчити англійську за 6 місяців: чесний план без казок", "ru": "Как выучить английский за 6 месяцев: честный план без сказок", "en": "How to learn English in 6 months: an honest plan with no fairy tales", "de": "Wie man Englisch in 6 Monaten lernt: ein ehrlicher Plan ohne Märchen" },
          "subtitle": { "uk": "Реалістичний маршрут від A1 до B2 з конкретними кроками", "ru": "Реалистичный маршрут от A1 до B2 с конкретными шагами", "en": "A realistic roadmap from A1 to B2 with concrete steps", "de": "Ein realistischer Weg von A1 bis B2 mit konkreten Schritten" },
          "content": [
            {
              "type": "heading", "align": "left",
              "content": { "uk": "6 місяців = 720 годин. Скільки з них ви готові вкласти в мову?", "ru": "6 месяцев = 720 часов. Сколько из них вы готовы вложить в язык?", "en": "6 months = 720 hours. How many of them are you ready to invest in the language?", "de": "6 Monate = 720 Stunden. Wie viele davon sind Sie bereit in die Sprache zu investieren?" }
            },
            {
              "type": "paragraph", "align": "left",
              "content": {
                "uk": "Чесна відповідь: за 6 місяців з нуля до B2 — нереально якщо ви займаєтесь 2 рази на тиждень по 60 хвилин. Але цілком реально піднятися на 2 рівні (A1→B1 або A2→B2) при правильній стратегії та мінімум 1 годині практики щодня. Ми розбили цей шлях на 4 фази.",
                "ru": "Честный ответ: за 6 месяцев с нуля до B2 — нереально если вы занимаетесь 2 раза в неделю по 60 минут. Но вполне реально подняться на 2 уровня (A1→B1 или A2→B2) при правильной стратегии и минимум 1 часе практики ежедневно. Мы разбили этот путь на 4 фазы.",
                "en": "The honest answer: going from zero to B2 in 6 months is unrealistic if you study twice a week for 60 minutes. But moving up 2 levels (A1→B1 or A2→B2) in 6 months is entirely realistic with the right strategy and at least 1 hour of daily practice. We've broken this path into 4 phases.",
                "de": "Die ehrliche Antwort: Von null auf B2 in 6 Monaten zu schaffen ist unrealistisch wenn man zweimal pro Woche 60 Minuten lernt. Aber 2 Niveaus aufzusteigen (A1→B1 oder A2→B2) in 6 Monaten ist absolut realistisch mit der richtigen Strategie und mindestens 1 Stunde täglicher Praxis. Wir haben diesen Weg in 4 Phasen aufgeteilt."
              }
            },
            {
              "type": "image", "align": "left",
              "media": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1973",
              "widthPercent": 50,
              "children": [
                { "type": "heading", "align": "left", "content": { "uk": "4 фази плану", "ru": "4 фазы плана", "en": "4 phases of the plan", "de": "4 Phasen des Plans" } },
                {
                  "type": "list", "align": "left",
                  "content": {
                    "uk": "Місяць 1–2: Фундамент — базова граматика та 500 найпотрібніших слів\nМісяць 3: Занурення — щоденне аудіювання і читання\nМісяць 4–5: Говоріння — мінімум 30 хвилин розмовної практики щодня\nМісяць 6: Фінальний спринт — симуляції іспиту або реальні розмови з носієм",
                    "ru": "Месяц 1–2: Фундамент — базовая грамматика и 500 самых нужных слов\nМесяц 3: Погружение — ежедневное аудирование и чтение\nМесяц 4–5: Говорение — минимум 30 минут разговорной практики ежедневно\nМесяц 6: Финальный спринт — симуляции экзамена или реальные разговоры с носителем",
                    "en": "Month 1–2: Foundation — basic grammar and the 500 most needed words\nMonth 3: Immersion — daily listening and reading\nMonth 4–5: Speaking — at least 30 minutes of conversational practice daily\nMonth 6: Final sprint — exam simulations or real conversations with a native speaker",
                    "de": "Monat 1–2: Fundament — Grundgrammatik und die 500 wichtigsten Wörter\nMonat 3: Eintauchen — tägliches Hörverstehen und Lesen\nMonat 4–5: Sprechen — mindestens 30 Minuten Konversationspraxis täglich\nMonat 6: Endspurt — Prüfungssimulationen oder echte Gespräche mit einem Muttersprachler"
                  }
                }
              ]
            },
            {
              "type": "heading", "align": "left",
              "content": { "uk": "Конкретні інструменти які працюють", "ru": "Конкретные инструменты которые работают", "en": "Specific tools that work", "de": "Konkrete Werkzeuge die funktionieren" }
            },
            {
              "type": "list", "align": "left",
              "content": {
                "uk": "Anki — флеш-картки для нових слів, 20 хвилин щоранку\nYouGlish — чути як носії вимовляють конкретне слово\nLangmate — знайти партнера для розмовного обміну\nBBC Learning English — структуровані подкасти за рівнями\nNetflix + Language Reactor — дивитися серіали з паралельними субтитрами\nChatGPT — тренувати письмо і отримувати корекцію помилок\nНаш розмовний клуб щосуботи — живе спілкування безкоштовно",
                "ru": "Anki — флеш-карточки для новых слов, 20 минут каждое утро\nYouGlish — слышать как носители произносят конкретное слово\nLangmate — найти партнёра для разговорного обмена\nBBC Learning English — структурированные подкасты по уровням\nNetflix + Language Reactor — смотреть сериалы с параллельными субтитрами\nChatGPT — тренировать письмо и получать коррекцию ошибок\nНаш разговорный клуб каждую субботу — живое общение бесплатно",
                "en": "Anki — flashcards for new words, 20 minutes every morning\nYouGlish — hear how native speakers pronounce a specific word\nLangmate — find a partner for conversational exchange\nBBC Learning English — structured podcasts by level\nNetflix + Language Reactor — watch series with parallel subtitles\nChatGPT — practise writing and get error corrections\nOur Saturday conversation club — live communication for free",
                "de": "Anki — Lernkarten für neue Wörter, 20 Minuten jeden Morgen\nYouGlish — hören wie Muttersprachler ein bestimmtes Wort aussprechen\nLangmate — einen Partner für Sprachaustausch finden\nBBC Learning English — strukturierte Podcasts nach Niveau\nNetflix + Language Reactor — Serien mit parallelen Untertiteln ansehen\nChatGPT — Schreiben üben und Fehlerkorrekturen erhalten\nUnser Konversationsclub jeden Samstag — lebendige Kommunikation kostenlos"
              }
            }
          ]
        },
        {
          "slug": "ielts-vs-toefl-which-to-choose",
          "mainImage": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070",
          "title": { "uk": "IELTS vs TOEFL: який іспит вибрати і чому", "ru": "IELTS vs TOEFL: какой экзамен выбрать и почему", "en": "IELTS vs TOEFL: which exam to choose and why", "de": "IELTS vs TOEFL: Welche Prüfung wählen und warum" },
          "subtitle": { "uk": "Порівнюємо формат, вартість, складність та де кожен визнається", "ru": "Сравниваем формат, стоимость, сложность и где каждый признаётся", "en": "Comparing format, cost, difficulty and where each is recognised", "de": "Format, Kosten, Schwierigkeitsgrad und Anerkennung im Vergleich" },
          "content": [
            {
              "type": "heading", "align": "left",
              "content": { "uk": "Головне питання: куди ви їдете і для чого потрібен сертифікат", "ru": "Главный вопрос: куда вы едете и для чего нужен сертификат", "en": "The key question: where are you going and what is the certificate for", "de": "Die Schlüsselfrage: Wohin gehen Sie und wofür brauchen Sie das Zertifikat" }
            },
            {
              "type": "image", "align": "left",
              "media": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022",
              "widthPercent": 50,
              "children": [
                { "type": "heading", "align": "left", "content": { "uk": "IELTS — обирайте якщо:", "ru": "IELTS — выбирайте если:", "en": "Choose IELTS if:", "de": "Wählen Sie IELTS wenn:" } },
                {
                  "type": "list", "align": "left",
                  "content": {
                    "uk": "Плануєте до Великобританії, Австралії, Канади або Нової Зеландії\nПотрібен для імміграційних цілей або ПМЖ\nХочете Academic або General Training версію\nПереважно письмовий формат вам комфортніший\nВартість: ~$250 USD",
                    "ru": "Планируете в Великобританию, Австралию, Канаду или Новую Зеландию\nНужен для иммиграционных целей или ПМЖ\nХотите Academic или General Training версию\nВ основном письменный формат вам удобнее\nСтоимость: ~$250 USD",
                    "en": "Planning to go to the UK, Australia, Canada or New Zealand\nNeeded for immigration or permanent residency\nYou want the Academic or General Training version\nYou're more comfortable with primarily written format\nCost: ~$250 USD",
                    "de": "Sie planen nach Großbritannien, Australien, Kanada oder Neuseeland\nBenötigt für Einwanderungszwecke oder dauerhaften Aufenthalt\nSie möchten die Academic oder General Training Version\nDas überwiegend schriftliche Format ist Ihnen angenehmer\nKosten: ~250 USD"
                  }
                }
              ]
            },
            {
              "type": "image", "align": "right",
              "media": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070",
              "widthPercent": 50,
              "children": [
                { "type": "heading", "align": "left", "content": { "uk": "TOEFL — обирайте якщо:", "ru": "TOEFL — выбирайте если:", "en": "Choose TOEFL if:", "de": "Wählen Sie TOEFL wenn:" } },
                {
                  "type": "list", "align": "left",
                  "content": {
                    "uk": "Плануєте до США або американських університетів\nПереваги комп'ютерного формату онлайн\nМаєте сильніший академічний бекграунд\nПотрібно для магістратури або PhD в USA\nВартість: ~$200–$245 USD",
                    "ru": "Планируете в США или американские университеты\nПредпочитаете компьютерный формат онлайн\nИмеете более сильный академический бэкграунд\nНужен для магистратуры или PhD в USA\nСтоимость: ~$200–$245 USD",
                    "en": "Planning to go to the USA or American universities\nYou prefer a computer-based online format\nYou have a stronger academic background\nNeeded for a Master's or PhD in the USA\nCost: ~$200–$245 USD",
                    "de": "Sie planen in die USA oder an amerikanische Universitäten\nSie bevorzugen das computerbasierte Online-Format\nSie haben einen stärkeren akademischen Hintergrund\nBenötigt für Master- oder PhD in den USA\nKosten: ~200–245 USD"
                  }
                }
              ]
            },
            {
              "type": "paragraph", "align": "left",
              "content": {
                "uk": "Не можете вирішити? Запишіться на безкоштовну консультацію з нашим IELTS/TOEFL-тренером — ми проаналізуємо ваш цільовий університет або країну та дамо чітку рекомендацію.",
                "ru": "Не можете решить? Запишитесь на бесплатную консультацию с нашим IELTS/TOEFL-тренером — мы проанализируем ваш целевой университет или страну и дадим чёткую рекомендацию.",
                "en": "Can't decide? Book a free consultation with our IELTS/TOEFL coach — we'll analyse your target university or country and give you a clear recommendation.",
                "de": "Können Sie sich nicht entscheiden? Buchen Sie eine kostenlose Beratung mit unserem IELTS/TOEFL-Coach — wir analysieren Ihre Zieluniversität oder -land und geben Ihnen eine klare Empfehlung."
              }
            }
          ]
        },
        {
          "slug": "german-language-tips-for-beginners",
          "mainImage": "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=2074",
          "title": { "uk": "Німецька для початківців: 7 порад які врятують вас від помилок", "ru": "Немецкий для начинающих: 7 советов которые спасут вас от ошибок", "en": "German for beginners: 7 tips that will save you from mistakes", "de": "Deutsch für Anfänger: 7 Tipps die Sie vor Fehlern bewahren" },
          "subtitle": { "uk": "Викладач-носій мови Маркус Бауер ділиться чесними порадами", "ru": "Преподаватель-носитель языка Маркус Бауэр делится честными советами", "en": "Native speaker teacher Markus Bauer shares honest advice", "de": "Muttersprachler-Lehrer Markus Bauer teilt ehrliche Ratschläge" },
          "content": [
            {
              "type": "heading", "align": "left",
              "content": { "uk": "Чому німецька здається складною — і чому насправді вона не така страшна", "ru": "Почему немецкий кажется сложным — и почему на самом деле он не такой страшный", "en": "Why German seems hard — and why it's actually not that scary", "de": "Warum Deutsch schwer erscheint — und warum es eigentlich nicht so schlimm ist" }
            },
            {
              "type": "paragraph", "align": "left",
              "content": {
                "uk": "Більшість людей лякаються відмінків (der/die/das), довгих слів та граматичних правил. Але насправді: після 200 годин практики мозок починає «чути» правильний артикль без зазубрювання. Головне — почати говорити відразу, навіть якщо робите помилки.",
                "ru": "Большинство людей пугаются падежей (der/die/das), длинных слов и грамматических правил. Но на самом деле: после 200 часов практики мозг начинает «слышать» правильный артикль без зазубривания. Главное — начать говорить сразу, даже если делаете ошибки.",
                "en": "Most people are scared by cases (der/die/das), long words and grammar rules. But in reality: after 200 hours of practice the brain starts to 'hear' the correct article without memorising. The key is to start speaking immediately, even when you make mistakes.",
                "de": "Die meisten Menschen haben Angst vor Fällen (der/die/das), langen Wörtern und Grammatikregeln. Aber in Wirklichkeit: Nach 200 Stunden Praxis beginnt das Gehirn den richtigen Artikel zu 'hören' ohne auswendig zu lernen. Das Wichtigste ist sofort anzufangen zu sprechen, auch wenn man Fehler macht."
              }
            },
            {
              "type": "image", "align": "left",
              "media": "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=2074",
              "widthPercent": 50,
              "children": [
                { "type": "heading", "align": "left", "content": { "uk": "7 порад від Маркуса", "ru": "7 советов от Маркуса", "en": "7 tips from Markus", "de": "7 Tipps von Markus" } },
                {
                  "type": "list", "align": "left",
                  "content": {
                    "uk": "1. Вчіть іменники ЗАВЖДИ з артиклем: не «Hund», а «der Hund»\n2. Слухайте Slow German подкаст — ідеально для A2–B1\n3. Не бійтесь довгих слів — вони складаються з простих частин\n4. Щодня 10 нових слів через Anki — і тільки речення, не переклад\n5. Deutsche Welle має безкоштовні курси для всіх рівнів\n6. Дивіться німецькі фільми з субтитрами — хоч 15 хвилин щодня\n7. Говоріть вголос — навіть якщо нема з ким. З собою. З кішкою.",
                    "ru": "1. Учите существительные ВСЕГДА с артиклем: не «Hund», а «der Hund»\n2. Слушайте подкаст Slow German — идеально для A2–B1\n3. Не бойтесь длинных слов — они состоят из простых частей\n4. Ежедневно 10 новых слов через Anki — и только предложения, не перевод\n5. Deutsche Welle имеет бесплатные курсы для всех уровней\n6. Смотрите немецкие фильмы с субтитрами — хоть 15 минут в день\n7. Говорите вслух — даже если не с кем. С собой. С кошкой.",
                    "en": "1. Learn nouns ALWAYS with their article: not 'Hund' but 'der Hund'\n2. Listen to the Slow German podcast — perfect for A2–B1\n3. Don't be scared of long words — they're made of simple parts\n4. 10 new words daily via Anki — in sentences only, not translations\n5. Deutsche Welle has free courses for all levels\n6. Watch German films with subtitles — even 15 minutes a day\n7. Speak aloud — even when alone. To yourself. To your cat.",
                    "de": "1. Lernen Sie Substantive IMMER mit Artikel: nicht 'Hund' sondern 'der Hund'\n2. Hören Sie den Slow German Podcast — perfekt für A2–B1\n3. Haben Sie keine Angst vor langen Wörtern — sie bestehen aus einfachen Teilen\n4. Täglich 10 neue Wörter über Anki — nur in Sätzen, nicht als Übersetzung\n5. Deutsche Welle hat kostenlose Kurse für alle Niveaus\n6. Schauen Sie deutsche Filme mit Untertiteln — mindestens 15 Minuten täglich\n7. Sprechen Sie laut — auch wenn niemand da ist. Mit sich selbst. Mit der Katze."
                  }
                }
              ]
            }
          ]
        }
      ],

      "pages": {
        "about": {
          "routeKey": "about",
          "content": [
            {
              "type": "heading", "align": "left",
              "content": { "uk": "LinguaPoint — мовна школа яка будується на результатах, а не обіцянках", "ru": "LinguaPoint — языковая школа которая строится на результатах, а не обещаниях", "en": "LinguaPoint — a language school built on results, not promises", "de": "LinguaPoint — eine Sprachschule die auf Ergebnissen aufgebaut ist, nicht auf Versprechen" }
            },
            {
              "type": "paragraph", "align": "left",
              "content": {
                "uk": "LinguaPoint відкрився у 2019 році — але до цього наша команда 7 років працювала у великих мовних мережах. Ми бачили все: переповнені групи де студент не встигає говорити, невмотивованих викладачів на потоці, красиві офіси без реального результату. Ми вирішили зробити по-іншому: менше, але краще.",
                "ru": "LinguaPoint открылся в 2019 году — но до этого наша команда 7 лет работала в крупных языковых сетях. Мы видели всё: переполненные группы где студент не успевает говорить, немотивированных преподавателей на потоке, красивые офисы без реального результата. Мы решили сделать по-другому: меньше, но лучше.",
                "en": "LinguaPoint opened in 2019 — but before that our team spent 7 years working in large language school chains. We saw it all: overcrowded groups where students barely get to speak, unmotivated assembly-line teachers, beautiful offices with no real results. We decided to do it differently: less, but better.",
                "de": "LinguaPoint eröffnete 2019 — aber davor hat unser Team 7 Jahre in großen Sprachschulketten gearbeitet. Wir haben alles gesehen: überfüllte Gruppen wo Studierende kaum zu Wort kommen, unmotivierte Fließband-Lehrkräfte, schöne Büros ohne echte Ergebnisse. Wir entschieden es anders zu machen: weniger, aber besser."
              }
            },
            {
              "type": "image", "align": "left",
              "media": "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=2032",
              "widthPercent": 50,
              "children": [
                { "type": "heading", "align": "left", "content": { "uk": "LinguaPoint у цифрах", "ru": "LinguaPoint в цифрах", "en": "LinguaPoint by the numbers", "de": "LinguaPoint in Zahlen" } },
                {
                  "type": "list", "align": "left",
                  "content": {
                    "uk": "4 мови викладання\n12 викладачів у команді\n1 800+ студентів за всю історію\n94% студентів рекомендують нас друзям\nРейтинг Google: 4.9/5 (340+ відгуків)\nМакс. 8 осіб у групі — жодного винятку\nБезкоштовний перший урок — завжди",
                    "ru": "4 языка преподавания\n12 преподавателей в команде\n1 800+ студентов за всю историю\n94% студентов рекомендуют нас друзьям\nРейтинг Google: 4.9/5 (340+ отзывов)\nМакс. 8 человек в группе — никаких исключений\nБесплатный первый урок — всегда",
                    "en": "4 teaching languages\n12 teachers in the team\n1,800+ students throughout our history\n94% of students recommend us to friends\nGoogle rating: 4.9/5 (340+ reviews)\nMax 8 people in a group — no exceptions\nFree first lesson — always",
                    "de": "4 Unterrichtssprachen\n12 Lehrkräfte im Team\n1.800+ Studierende in unserer Geschichte\n94% der Studierenden empfehlen uns an Freunde\nGoogle-Bewertung: 4,9/5 (340+ Bewertungen)\nMax. 8 Personen in einer Gruppe — keine Ausnahmen\nKostenlose erste Lektion — immer"
                  }
                }
              ]
            },
            {
              "type": "image", "align": "right",
              "media": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070",
              "widthPercent": 50,
              "children": [
                { "type": "heading", "align": "left", "content": { "uk": "Як ми відбираємо викладачів", "ru": "Как мы отбираем преподавателей", "en": "How we select our teachers", "de": "Wie wir unsere Lehrkräfte auswählen" } },
                {
                  "type": "list", "align": "left",
                  "content": {
                    "uk": "Мінімальний рівень сертифікату: CELTA, DELTA або DaF\nОбов'язкове пробне заняття перед комісією\nПеревірка результатів попередніх студентів\nЩоквартальний зворотний зв'язок від студентів\nОбов'язкові внутрішні тренінги з методики\nВикладачі самі здають іспити які викладають\nПлата вища за середню по ринку — бо ми хочемо кращих",
                    "ru": "Минимальный уровень сертификата: CELTA, DELTA или DaF\nОбязательное пробное занятие перед комиссией\nПроверка результатов предыдущих студентов\nЕжеквартальная обратная связь от студентов\nОбязательные внутренние тренинги по методике\nПреподаватели сами сдают экзамены которые преподают\nОплата выше средней по рынку — потому что мы хотим лучших",
                    "en": "Minimum certificate level: CELTA, DELTA or DaF\nMandatory demo lesson before the panel\nReview of previous students' results\nQuarterly student feedback\nMandatory internal methodology trainings\nTeachers take the exams they teach\nPay above market average — because we want the best",
                    "de": "Mindestzertifikatsniveau: CELTA, DELTA oder DaF\nObligatorische Demostunde vor dem Ausschuss\nÜberprüfung der Ergebnisse früherer Studierender\nVierteljährliches Studierendenfeedback\nObligatorische interne Methodikschulungen\nLehrkräfte legen die Prüfungen selbst ab die sie unterrichten\nVergütung über dem Marktdurchschnitt — weil wir die Besten wollen"
                  }
                }
              ]
            },
            {
              "type": "heading", "align": "center",
              "content": { "uk": "Як записатися на урок за 3 хвилини", "ru": "Как записаться на урок за 3 минуты", "en": "How to sign up for a lesson in 3 minutes", "de": "Wie man sich in 3 Minuten für eine Lektion anmeldet" }
            },
            {
              "type": "list", "align": "left",
              "content": {
                "uk": "1. Пройдіть безкоштовний тест рівня на сайті або у месенджері\n2. Оберіть формат: індивідуально, група, онлайн чи офлайн\n3. Оберіть викладача або дайте нам підібрати\n4. Узгодьте зручний час для пробного уроку\n5. Перший урок — безкоштовно. Рішення після нього — ваше",
                "ru": "1. Пройдите бесплатный тест уровня на сайте или в мессенджере\n2. Выберите формат: индивидуально, группа, онлайн или офлайн\n3. Выберите преподавателя или дайте нам подобрать\n4. Согласуйте удобное время для пробного урока\n5. Первый урок — бесплатно. Решение после него — ваше",
                "en": "1. Take the free level test on the website or via messenger\n2. Choose the format: individual, group, online or offline\n3. Choose a teacher or let us match you\n4. Agree on a convenient time for the trial lesson\n5. The first lesson is free. The decision after is yours",
                "de": "1. Machen Sie den kostenlosen Einstufungstest auf der Website oder per Messenger\n2. Wählen Sie das Format: Einzel, Gruppe, online oder Präsenz\n3. Wählen Sie eine Lehrkraft oder lassen Sie uns eine auswählen\n4. Vereinbaren Sie eine passende Zeit für die Probestunde\n5. Die erste Lektion ist kostenlos. Die Entscheidung danach liegt bei Ihnen"
              }
            }
          ]
        }
      }
    }

const {
  meta,
  generalInfo,
  services,
  prices,
  employees,
  faqs,
  specials,
  photos,
  blogs,
  pages,
} = busines;

const aboutPage = pages.about;

// ═══════════════════════════════════════════════════════════
// UPLOAD ALL
// ═══════════════════════════════════════════════════════════
async function uploadList<T>(path: string, items: T[], label: string) {
  for (const item of items) {
    const r = ref(db, path);
    const newRef = push(r);
    if (!newRef.key) continue;
    await set(newRef, { ...item, id: newRef.key, updatedAt: Date.now() });
    console.log(`✅ ${label} uploaded — id: ${newRef.key}`);
  }
}

async function uploadPage(page: PageContent) {
  await set(
      ref(db, `businesses/${businessSlug}/pages/${page.routeKey}`),
      { ...page, updatedAt: Date.now() }
  );
  console.log(`✅ Page "${page.routeKey}" uploaded`);
}

export async function uploadAll() {
  try {
    await set(ref(db, `businesses/${businessSlug}/meta`), { ...meta, updatedAt: Date.now() });
    console.log("✅ Meta uploaded");

    await set(ref(db, `businesses/${businessSlug}/generalInfo`), { ...generalInfo, updatedAt: Date.now() });
    console.log("✅ GeneralInfo uploaded");

    await uploadList(`businesses/${businessSlug}/services`,  services,  "Service");
    await uploadList(`businesses/${businessSlug}/prices`,    prices,    "Price");
    await uploadList(`businesses/${businessSlug}/employees`, employees, "Employee");
    await uploadList(`businesses/${businessSlug}/faqs`,      faqs,      "FAQ");
    await uploadList(`businesses/${businessSlug}/specials`,  specials,  "Special");
    await uploadList(`businesses/${businessSlug}/blogs`,     blogs,     "Blog");
    await uploadList(`businesses/${businessSlug}/photos`,    photos,    "Photo");

    await uploadPage(aboutPage);

    console.log("\n🎉 LinguaPoint — all data uploaded successfully!");
    console.log(`   Slug: ${businessSlug}`);
    console.log(`\n   Tab names (унікальні назви):`);
    console.log(`   about     → "Гараж / Our Garage"`);
    console.log(`   services  → "Каталог / Catalogue"`);
    console.log(`   specials  → "Hot Wheels"`);
    console.log(`   price     → "Тарифи / Rates"`);
    console.log(`   employees → "Команда / Crew"`);
    console.log(`   faq       → "Правила / Rulebook"`);
    console.log(`   gallery   → "Шоурум / Showroom"`);
    console.log(`   blogs     → "Дорожні нотатки / Road Notes"`);
    console.log(`   contact   → "Диспетчер / Dispatch"`);
  } catch (err) {
    console.error("❌ Upload error:", err);
  }
}

uploadAll();