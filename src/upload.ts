// uploadDrivePoint.ts
// Бизнес: DrivePoint — прокат автомобілів
// Один файл — один запуск — весь бізнес.

import { ref, set, push } from "firebase/database";
import { db } from "./firebase";
import type { BusinessMeta, BusinessType } from "./models/Meta.ts";
import type { GeneralInfo } from "./models/GeneralInfo.ts";
import type { Service } from "./models/Service.ts";
import type { PriceModel } from "./models/Price.ts";
import type { Employee } from "./models/Employee.ts";
import type { FAQ } from "./models/FAQ.ts";
import type { Blog } from "./models/Blog.ts";
import type { Special } from "./models/Special.ts";
import type { Photo } from "./models/Photo.ts";
import type { PageContent } from "./models/PageContent.ts";

const businessSlug = "DrivePoint";

// ═══════════════════════════════════════════════════════════
// META — унікальні назви табів
// ═══════════════════════════════════════════════════════════
const meta: BusinessMeta = {
  name:      { uk: "DrivePoint",     ru: "DrivePoint",     en: "DrivePoint",     de: "DrivePoint" },
  shortName: { uk: "DrivePoint",     ru: "DrivePoint",     en: "DrivePoint",     de: "DrivePoint" },
  type: "company" as BusinessType,
  slogan: {
    uk: "Сідайте за кермо — ми потурбуємось про решту",
    ru: "Садитесь за руль — мы позаботимся об остальном",
    en: "Get behind the wheel — we take care of the rest",
    de: "Setzen Sie sich ans Steuer — wir kümmern uns um den Rest"
  },
  description: {
    uk: "Прокат легкових автомобілів, SUV, мінівенів та преміум-класу. Подобова і тривала оренда. Доставка в аеропорт, готель або додому. Без застави при наявності картки, без прихованих платежів.",
    ru: "Прокат легковых автомобилей, SUV, минивэнов и премиум-класса. Посуточная и длительная аренда. Доставка в аэропорт, отель или домой. Без залога при наличии карты, без скрытых платежей.",
    en: "Car rental: sedans, SUVs, minivans and premium vehicles. Daily and long-term rental. Delivery to airport, hotel or your door. No deposit with a card, no hidden fees.",
    de: "Autovermietung: Limousinen, SUVs, Minivans und Premium-Fahrzeuge. Tages- und Langzeitmiete. Lieferung zum Flughafen, Hotel oder nach Hause. Keine Kaution bei Kartenzahlung, keine versteckten Gebühren."
  },
  logo: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=2025",
  tabs: {
    garage: {
      route: "about", order: 0, enabled: true,
      shortName: { uk: "Гараж",       ru: "Гараж",       en: "Our Garage",   de: "Garage" },
      title:     { uk: "Про DrivePoint та наш автопарк", ru: "О DrivePoint и нашем автопарке", en: "About DrivePoint & Our Fleet", de: "Über DrivePoint & unsere Flotte" },
      description: { uk: "Хто ми, як ми обслуговуємо авто та наші гарантії", ru: "Кто мы, как обслуживаем авто и наши гарантии", en: "Who we are, how we maintain cars and our guarantees", de: "Wer wir sind, wie wir Autos warten und unsere Garantien" },
      headerImage: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2070"
    },
    catalogue: {
      route: "services", order: 1, enabled: true,
      shortName: { uk: "Каталог",     ru: "Каталог",     en: "Catalogue",    de: "Katalog" },
      title:     { uk: "Каталог автомобілів для оренди", ru: "Каталог автомобилей для аренды", en: "Car Rental Catalogue", de: "Fahrzeugkatalog zur Miete" },
      description: { uk: "Economy, Comfort, SUV, Premium та мінівени", ru: "Economy, Comfort, SUV, Premium и минивэны", en: "Economy, Comfort, SUV, Premium and minivans", de: "Economy, Comfort, SUV, Premium und Minivans" },
      headerImage: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=2070"
    },
    hot_wheels: {
      route: "specials", order: 2, enabled: true,
      shortName: { uk: "Hot Wheels",  ru: "Hot Wheels",  en: "Hot Wheels",   de: "Hot Wheels" },
      title:     { uk: "Акції та знижки на прокат", ru: "Акции и скидки на прокат", en: "Rental Deals & Discounts", de: "Mietangebote & Rabatte" },
      description: { uk: "Тижневі флеш-акції та сезонні тарифи", ru: "Еженедельные флеш-акции и сезонные тарифы", en: "Weekly flash deals and seasonal rates", de: "Wöchentliche Flash-Deals und Saisonpreise" },
      headerImage: "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=2070"
    },
    rates: {
      route: "price", order: 3, enabled: true,
      shortName: { uk: "Тарифи",      ru: "Тарифы",      en: "Rates",        de: "Tarife" },
      title:     { uk: "Тарифи та умови оренди", ru: "Тарифы и условия аренды", en: "Rental Rates & Terms", de: "Mietpreise & Bedingungen" },
      description: { uk: "Прозорі ціни на всі категорії авто", ru: "Прозрачные цены на все категории авто", en: "Transparent pricing for all vehicle categories", de: "Transparente Preise für alle Fahrzeugkategorien" }
    },
    crew: {
      route: "employees", order: 4, enabled: true,
      shortName: { uk: "Команда",     ru: "Команда",     en: "Crew",         de: "Team" },
      title:     { uk: "Наша команда та водії", ru: "Наша команда и водители", en: "Our Crew & Drivers", de: "Unser Team & Fahrer" },
      description: { uk: "Менеджери, водії та механіки DrivePoint", ru: "Менеджеры, водители и механики DrivePoint", en: "DrivePoint managers, drivers and mechanics", de: "DrivePoint-Manager, Fahrer und Mechaniker" },
      headerImage: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070"
    },
    rulebook: {
      route: "faq", order: 5, enabled: true,
      shortName: { uk: "Правила",     ru: "Правила",     en: "Rulebook",     de: "Regeln" },
      title:     { uk: "Умови оренди та часті питання", ru: "Условия аренды и частые вопросы", en: "Rental Terms & FAQ", de: "Mietbedingungen & FAQ" },
      description: { uk: "Все що потрібно знати до підписання договору", ru: "Всё что нужно знать до подписания договора", en: "Everything to know before signing the contract", de: "Alles was man vor der Vertragsunterzeichnung wissen muss" }
    },
    showroom: {
      route: "gallery", order: 6, enabled: true,
      shortName: { uk: "Шоурум",      ru: "Шоурум",      en: "Showroom",     de: "Showroom" },
      title:     { uk: "Фото нашого автопарку", ru: "Фото нашего автопарка", en: "Fleet Photo Gallery", de: "Fuhrpark-Fotogalerie" },
      description: { uk: "Реальні фото автомобілів — зовні і всередині", ru: "Реальные фото автомобилей — снаружи и внутри", en: "Real car photos — outside and inside", de: "Echte Autofotos — außen und innen" },
      headerImage: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=2070"
    },
    roadnotes: {
      route: "blogs", order: 7, enabled: true,
      shortName: { uk: "Дорожні нотатки", ru: "Дорожные записки", en: "Road Notes",  de: "Straßennotizen" },
      title:     { uk: "Поради водіям та мандрівникам", ru: "Советы водителям и путешественникам", en: "Tips for Drivers & Travellers", de: "Tipps für Fahrer & Reisende" },
      description: { uk: "Маршрути, лайфхаки та огляди авто від нашої команди", ru: "Маршруты, лайфхаки и обзоры авто от нашей команды", en: "Routes, life hacks and car reviews from our team", de: "Routen, Lifehacks und Autorezensionen von unserem Team" },
      headerImage: "https://images.unsplash.com/photo-1488998527040-85054a85150e?q=80&w=2070"
    },
    dispatch: {
      route: "contact", order: 8, enabled: true,
      shortName: { uk: "Диспетчер",   ru: "Диспетчер",   en: "Dispatch",     de: "Disposition" },
      title:     { uk: "Замовити авто прямо зараз", ru: "Заказать авто прямо сейчас", en: "Book a Car Right Now", de: "Auto jetzt buchen" },
      description: { uk: "Диспетчер на зв'язку 24/7 — відповімо за 5 хвилин", ru: "Диспетчер на связи 24/7 — ответим за 5 минут", en: "Dispatcher available 24/7 — we reply in 5 minutes", de: "Dispatcher rund um die Uhr — Antwort in 5 Minuten" }
    }
  }
};

// ═══════════════════════════════════════════════════════════
// GENERAL INFO
// ═══════════════════════════════════════════════════════════
const generalInfo: GeneralInfo = {
  address: {
    uk: "просп. Перемоги, 67, Київ, 03113",
    ru: "просп. Победы, 67, Киев, 03113",
    en: "67 Peremohy Ave, Kyiv, 03113",
    de: "Peremohy-Allee 67, Kiew, 03113"
  },
  phone: {
    uk: "+38 (044) 400-66-88",
    ru: "+38 (044) 400-66-88",
    en: "+38 044 400-66-88",
    de: "+38 044 400-66-88"
  },
  email: "book@drivepoint.ua",
  working_hours: [
    { days: { uk: "Пн–Нд", ru: "Пн–Вс", en: "Mon–Sun", de: "Mo–So" }, hours: "07:00–23:00" },
    { days: { uk: "Аеропорт Бориспіль", ru: "Аэропорт Борисполь", en: "Boryspil Airport", de: "Flughafen Boryspil" }, hours: "24/7" }
  ],
  messengers: {
    telegram: "@drivepoint_ua",
    viber: "+380444006688",
    whatsapp: "+380444006688"
  },
  socials: {
    instagram: "instagram.com/drivepoint.ua",
    facebook: "facebook.com/drivepointua"
  },
  map: "https://maps.google.com/?q=Peremohy+67+Kyiv"
};

// ═══════════════════════════════════════════════════════════
// SERVICES  (route: "services" = tab "catalogue")
// ═══════════════════════════════════════════════════════════
const services: Omit<Service, "id">[] = [

  // ── 1. Economy ──────────────────────────────────────────
  {
    slug: "economy-cars",
    mainImage: "https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=2070",
    title:       { uk: "Economy клас",         ru: "Economy класс",          en: "Economy Class",          de: "Economy-Klasse" },
    subtitle:    { uk: "Volkswagen Polo, Skoda Fabia, Hyundai i20 — місто без зайвих витрат", ru: "Volkswagen Polo, Skoda Fabia, Hyundai i20 — город без лишних трат", en: "Volkswagen Polo, Skoda Fabia, Hyundai i20 — city driving without overspending", de: "Volkswagen Polo, Skoda Fabia, Hyundai i20 — Stadtfahrten ohne Mehrkosten" },
    headerTitle: { uk: "Дешево — не значить погано", ru: "Дёшево — не значит плохо", en: "Affordable doesn't mean bad", de: "Günstig bedeutet nicht schlecht" },
    content: [
      {
        type: "heading", align: "left",
        content: { uk: "Economy — найпопулярніший клас у міських поїздках", ru: "Economy — самый популярный класс для городских поездок", en: "Economy — the most popular class for city trips", de: "Economy — die beliebteste Klasse für Stadtfahrten" }
      },
      {
        type: "paragraph", align: "left",
        content: {
          uk: "Якщо вам потрібно просто дістатись з точки А до точки Б, не думати про паркінг у центрі і не витрачати зайве на пальне — Economy клас це те що потрібно. Усі авто Economy — не старші 3 років, з кондиціонером, повним баком та пройденим ТО.",
          ru: "Если вам нужно просто добраться из точки А в точку Б, не думать о парковке в центре и не тратить лишнее на топливо — Economy класс это то что нужно. Все авто Economy — не старше 3 лет, с кондиционером, полным баком и пройденным ТО.",
          en: "If you just need to get from A to B, not worry about parking in the city centre and not overspend on fuel — Economy class is what you need. All Economy cars are no older than 3 years, with AC, a full tank and a recent service.",
          de: "Wenn Sie nur von A nach B kommen möchten, sich keine Gedanken über Parkplätze in der Innenstadt machen wollen und nicht zu viel für Kraftstoff ausgeben möchten — Economy-Klasse ist das Richtige. Alle Economy-Autos sind nicht älter als 3 Jahre, mit Klimaanlage, vollem Tank und durchgeführter Inspektion."
        }
      },
      {
        type: "image", align: "left",
        media: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070",
        widthPercent: 50,
        children: [
          { type: "heading", align: "left", content: { uk: "Модельний ряд Economy", ru: "Модельный ряд Economy", en: "Economy model range", de: "Economy Modellreihe" } },
          {
            type: "list", align: "left",
            content: {
              uk: "Volkswagen Polo — класика міського Economy\nSkoda Fabia — просторий для свого класу\nHyundai i20 — надійний і економний\nRenault Logan — великий багажник для Economy\nDaewoo Nexia — бюджетний варіант для короткого прокату",
              ru: "Volkswagen Polo — классика городского Economy\nSkoda Fabia — просторный для своего класса\nHyundai i20 — надёжный и экономный\nRenault Logan — большой багажник для Economy\nDaewoo Nexia — бюджетный вариант для короткого проката",
              en: "Volkswagen Polo — urban Economy classic\nSkoda Fabia — spacious for its class\nHyundai i20 — reliable and economical\nRenault Logan — large boot for Economy\nDaewoo Nexia — budget option for short rentals",
              de: "Volkswagen Polo — urbaner Economy-Klassiker\nSkoda Fabia — geräumig für seine Klasse\nHyundai i20 — zuverlässig und sparsam\nRenault Logan — großer Kofferraum für Economy\nDaewoo Nexia — Budgetoption für kurze Mieten"
            }
          }
        ]
      },
      {
        type: "image", align: "right",
        media: "https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=2070",
        widthPercent: 50,
        children: [
          { type: "heading", align: "left", content: { uk: "Що включено в кожне авто", ru: "Что включено в каждое авто", en: "What's included with every car", de: "Was in jedem Auto enthalten ist" } },
          {
            type: "list", align: "left",
            content: {
              uk: "Повний бак при видачі\nКондиціонер / клімат-контроль\nБазова страховка ОСЦПВ включена\nАптечка, вогнегасник, знак аварійної зупинки\nЗарядка для телефону USB/USB-C\nДопомога на дорозі 24/7 — безкоштовно\nМожливість повернення в іншому місті",
              ru: "Полный бак при выдаче\nКондиционер / климат-контроль\nБазовая страховка ОСАГО включена\nАптечка, огнетушитель, знак аварийной остановки\nЗарядка для телефона USB/USB-C\nПомощь на дороге 24/7 — бесплатно\nВозможность возврата в другом городе",
              en: "Full tank on pickup\nAir conditioning / climate control\nBasic liability insurance included\nFirst aid kit, fire extinguisher, warning triangle\nUSB/USB-C phone charger\n24/7 roadside assistance — free\nOption to return in another city",
              de: "Voller Tank bei Abholung\nKlimaanlage / Klimakontrolle\nBasis-Haftpflichtversicherung inklusive\nErstehilfekasten, Feuerlöscher, Warndreieck\nUSB/USB-C Telefonladegerät\n24/7 Pannenhilfe — kostenlos\nRückgabemöglichkeit in einer anderen Stadt"
            }
          }
        ]
      },
      {
        type: "heading", align: "left",
        content: { uk: "Для кого Economy клас підходить найкраще", ru: "Для кого Economy класс подходит лучше всего", en: "Who Economy class suits best", de: "Für wen die Economy-Klasse am besten geeignet ist" }
      },
      {
        type: "paragraph", align: "left",
        content: {
          uk: "Ділові поїздки коли своє авто в ремонті. Туристи в Києві яким потрібна мобільність без переплати. Молоді пари на вихідну поїздку. Студенти та молоді спеціалісти. Будь-хто кому потрібно просто поїхати — без пафосу, без зайвих витрат.",
          ru: "Деловые поездки когда своё авто в ремонте. Туристы в Киеве которым нужна мобильность без переплаты. Молодые пары на поездку на выходные. Студенты и молодые специалисты. Все кому нужно просто поехать — без пафоса, без лишних трат.",
          en: "Business trips when your own car is in the shop. Tourists in Kyiv who need mobility without overpaying. Young couples for a weekend trip. Students and young professionals. Anyone who just needs to get somewhere — no fuss, no extra cost.",
          de: "Geschäftsreisen wenn das eigene Auto in der Werkstatt ist. Touristen in Kiew die Mobilität ohne Mehrkosten benötigen. Junge Paare für einen Wochenendausflug. Studenten und junge Fachleute. Jeder der einfach irgendwohin muss — ohne Aufhebens, ohne Mehrkosten."
        }
      }
    ]
  },

  // ── 2. SUV ──────────────────────────────────────────────
  {
    slug: "suv-rental",
    mainImage: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2070",
    title:       { uk: "SUV та кросовери",     ru: "SUV и кроссоверы",       en: "SUVs & Crossovers",      de: "SUVs & Crossover" },
    subtitle:    { uk: "Toyota RAV4, Hyundai Tucson, Kia Sportage — для сім'ї та бездоріжжя", ru: "Toyota RAV4, Hyundai Tucson, Kia Sportage — для семьи и бездорожья", en: "Toyota RAV4, Hyundai Tucson, Kia Sportage — for family and off-road", de: "Toyota RAV4, Hyundai Tucson, Kia Sportage — für Familie und Gelände" },
    headerTitle: { uk: "Більше простору. Більше впевненості.", ru: "Больше пространства. Больше уверенности.", en: "More space. More confidence.", de: "Mehr Raum. Mehr Selbstvertrauen." },
    content: [
      {
        type: "heading", align: "left",
        content: { uk: "SUV — коли потрібно більше ніж просто доїхати", ru: "SUV — когда нужно больше чем просто доехать", en: "SUV — when you need more than just getting there", de: "SUV — wenn man mehr braucht als nur anzukommen" }
      },
      {
        type: "paragraph", align: "left",
        content: {
          uk: "SUV DrivePoint — це про свободу. Сім'я з дітьми і купою багажу. Поїздка в Карпати з великою компанією. Подорож у місця де звичайна легковушка просто не проїде. Або просто хочете сидіти вище за інших на трасі і насолоджуватись видом.",
          ru: "SUV DrivePoint — это про свободу. Семья с детьми и кучей багажа. Поездка в Карпаты с большой компанией. Путешествие в места где обычная легковушка просто не проедет. Или просто хотите сидеть выше остальных на трассе и наслаждаться видом.",
          en: "DrivePoint SUV is about freedom. A family with kids and loads of luggage. A trip to the Carpathians with a big group. Travel to places where a regular car simply won't go. Or just want to sit higher than everyone else on the highway and enjoy the view.",
          de: "DrivePoint SUV handelt von Freiheit. Eine Familie mit Kindern und viel Gepäck. Eine Reise in die Karpaten mit einer großen Gruppe. Reisen zu Orten wo ein normales Auto einfach nicht durchkommt. Oder man möchte einfach höher als alle anderen auf der Autobahn sitzen und die Aussicht genießen."
        }
      },
      {
        type: "image", align: "left",
        media: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=2071",
        widthPercent: 50,
        children: [
          { type: "heading", align: "left", content: { uk: "Модельний ряд SUV", ru: "Модельный ряд SUV", en: "SUV model range", de: "SUV-Modellreihe" } },
          {
            type: "list", align: "left",
            content: {
              uk: "Toyota RAV4 (2022–2024) — флагман нашого парку\nHyundai Tucson — стильний та просторий\nKia Sportage — ідеальний баланс ціни та якості\nMazda CX-5 — найкраще водіння серед кросоверів\nNissan Qashqai — компактний SUV для міста і траси\nFord Escape — американська надійність",
              ru: "Toyota RAV4 (2022–2024) — флагман нашего парка\nHyundai Tucson — стильный и просторный\nKia Sportage — идеальный баланс цены и качества\nMazda CX-5 — лучшее вождение среди кроссоверов\nNissan Qashqai — компактный SUV для города и трассы\nFord Escape — американская надёжность",
              en: "Toyota RAV4 (2022–2024) — flagship of our fleet\nHyundai Tucson — stylish and spacious\nKia Sportage — ideal price-quality balance\nMazda CX-5 — best driving among crossovers\nNissan Qashqai — compact SUV for city and highway\nFord Escape — American reliability",
              de: "Toyota RAV4 (2022–2024) — Flaggschiff unserer Flotte\nHyundai Tucson — stilvoll und geräumig\nKia Sportage — ideales Preis-Leistungs-Verhältnis\nMazda CX-5 — bestes Fahrerlebnis unter Crossovern\nNissan Qashqai — kompaktes SUV für Stadt und Autobahn\nFord Escape — amerikanische Zuverlässigkeit"
            }
          }
        ]
      },
      {
        type: "image", align: "right",
        media: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2070",
        widthPercent: 50,
        children: [
          { type: "heading", align: "left", content: { uk: "Чому SUV — правильний вибір для довгих поїздок", ru: "Почему SUV — правильный выбор для длинных поездок", en: "Why SUV is the right choice for long trips", de: "Warum SUV die richtige Wahl für lange Fahrten ist" } },
          {
            type: "paragraph", align: "left",
            content: {
              uk: "На трасі Київ–Одеса чи Київ–Львів різниця між Economy і SUV — це різниця між «доїхали» і «доїхали з задоволенням». Вищий кліренс, краща підвіска, більше місця для ніг ззаду. Плюс повний привод у деяких моделях для поїздок до Карпат або в бездоріжжя.",
              ru: "На трассе Киев–Одесса или Киев–Львов разница между Economy и SUV — это разница между «доехали» и «доехали с удовольствием». Более высокий клиренс, лучшая подвеска, больше места для ног сзади. Плюс полный привод в некоторых моделях для поездок в Карпаты или по бездорожью.",
              en: "On the Kyiv–Odesa or Kyiv–Lviv highway, the difference between Economy and SUV is the difference between 'we got there' and 'we enjoyed getting there'. Higher ground clearance, better suspension, more legroom in the back. Plus all-wheel drive on some models for Carpathian trips or off-road.",
              de: "Auf der Kyiw–Odessa oder Kyiw–Lwiw-Autobahn ist der Unterschied zwischen Economy und SUV der Unterschied zwischen 'wir sind angekommen' und 'wir haben es genossen anzukommen'. Höhere Bodenfreiheit, bessere Federung, mehr Beinfreiheit hinten. Plus Allradantrieb bei einigen Modellen für Karpaten-Ausflüge oder Gelände."
            }
          }
        ]
      },
      {
        type: "heading", align: "left",
        content: { uk: "Популярні маршрути на SUV від наших клієнтів", ru: "Популярные маршруты на SUV от наших клиентов", en: "Popular SUV routes from our clients", de: "Beliebte SUV-Routen unserer Kunden" }
      },
      {
        type: "list", align: "left",
        content: {
          uk: "Київ → Карпати (Буковель, Яремче) — 6–7 годин\nКиїв → Одеса → узбережжя — 5–6 годин\nКиїв → Умань → Миколаїв → Херсон — 2 дні\nКиїв → Львів → Закарпаття — 2 дні\nКиїв → Чернівці → Хотин → Кам'янець-Подільський — 2 дні",
          ru: "Киев → Карпаты (Буковель, Яремче) — 6–7 часов\nКиев → Одесса → побережье — 5–6 часов\nКиев → Умань → Николаев → Херсон — 2 дня\nКиев → Львов → Закарпатье — 2 дня\nКиев → Черновцы → Хотин → Каменец-Подольский — 2 дня",
          en: "Kyiv → Carpathians (Bukovel, Yaremche) — 6–7 hours\nKyiv → Odesa → coast — 5–6 hours\nKyiv → Uman → Mykolaiv → Kherson — 2 days\nKyiv → Lviv → Transcarpathia — 2 days\nKyiv → Chernivtsi → Khotyn → Kamianets-Podilskyi — 2 days",
          de: "Kiew → Karpaten (Bukovel, Yaremche) — 6–7 Stunden\nKiew → Odessa → Küste — 5–6 Stunden\nKiew → Uman → Mykolaiv → Cherson — 2 Tage\nKiew → Lwiw → Transkarpaten — 2 Tage\nKiew → Czernowitz → Chotyn → Kamjanez-Podilskyj — 2 Tage"
        }
      }
    ]
  },

  // ── 3. Premium ──────────────────────────────────────────
  {
    slug: "premium-cars",
    mainImage: "https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=2070",
    title:       { uk: "Premium клас",         ru: "Premium класс",          en: "Premium Class",          de: "Premium-Klasse" },
    subtitle:    { uk: "BMW 5, Mercedes E-Class, Audi A6 — для статусних поїздок", ru: "BMW 5, Mercedes E-Class, Audi A6 — для статусных поездок", en: "BMW 5, Mercedes E-Class, Audi A6 — for high-status trips", de: "BMW 5, Mercedes E-Class, Audi A6 — für statusbewusste Fahrten" },
    headerTitle: { uk: "Перший клас на дорозі", ru: "Первый класс на дороге", en: "First class on the road", de: "Erste Klasse auf der Straße" },
    content: [
      {
        type: "heading", align: "left",
        content: { uk: "Premium — коли враження важливі так само як пункт призначення", ru: "Premium — когда впечатления важны так же как пункт назначения", en: "Premium — when the experience matters as much as the destination", de: "Premium — wenn das Erlebnis genauso wichtig ist wie das Ziel" }
      },
      {
        type: "paragraph", align: "left",
        content: {
          uk: "Ділова зустріч з партнерами з-за кордону. Весілля або ювілей. Зустріч дорогого гостя в аеропорту. Поїздка куди треба приїхати і справити враження ще до того як зайшов у двері — Premium клас DrivePoint для цього і існує.",
          ru: "Деловая встреча с партнёрами из-за рубежа. Свадьба или юбилей. Встреча дорогого гостя в аэропорту. Поездка куда нужно приехать и произвести впечатление ещё до того как зашёл в дверь — Premium класс DrivePoint для этого и существует.",
          en: "A business meeting with overseas partners. A wedding or anniversary. Meeting an important guest at the airport. A trip where you need to arrive and make an impression before even walking through the door — that's what DrivePoint Premium class exists for.",
          de: "Ein Geschäftstreffen mit ausländischen Partnern. Eine Hochzeit oder ein Jubiläum. Einen wichtigen Gast am Flughafen abholen. Eine Reise wo man ankommen und einen Eindruck hinterlassen muss noch bevor man durch die Tür geht — dafür gibt es die DrivePoint Premium-Klasse."
        }
      },
      {
        type: "image", align: "left",
        media: "https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=2070",
        widthPercent: 50,
        children: [
          { type: "heading", align: "left", content: { uk: "Модельний ряд Premium", ru: "Модельный ряд Premium", en: "Premium model range", de: "Premium-Modellreihe" } },
          {
            type: "list", align: "left",
            content: {
              uk: "BMW 5 Series (F90, 2021–2024) — баварський перфекціонізм\nMercedes-Benz E-Class (W213) — символ статусу\nAudi A6 (C8) — технологічний лідер класу\nLexus ES — японська якість у бізнес-тілі\nVolvo S90 — скандинавський мінімалізм і безпека",
              ru: "BMW 5 Series (F90, 2021–2024) — баварский перфекционизм\nMercedes-Benz E-Class (W213) — символ статуса\nAudi A6 (C8) — технологический лидер класса\nLexus ES — японское качество в бизнес-теле\nVolvo S90 — скандинавский минимализм и безопасность",
              en: "BMW 5 Series (F90, 2021–2024) — Bavarian perfectionism\nMercedes-Benz E-Class (W213) — symbol of status\nAudi A6 (C8) — class's technology leader\nLexus ES — Japanese quality in a business body\nVolvo S90 — Scandinavian minimalism and safety",
              de: "BMW 5 Series (F90, 2021–2024) — bayerischer Perfektionismus\nMercedes-Benz E-Class (W213) — Symbol des Status\nAudi A6 (C8) — Technologieführer der Klasse\nLexus ES — japanische Qualität in einem Business-Körper\nVolvo S90 — skandinavischer Minimalismus und Sicherheit"
            }
          }
        ]
      },
      {
        type: "image", align: "right",
        media: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=2074",
        widthPercent: 50,
        children: [
          { type: "heading", align: "left", content: { uk: "Premium сервіс включений", ru: "Premium сервис включён", en: "Premium service included", de: "Premium-Service inklusive" } },
          {
            type: "list", align: "left",
            content: {
              uk: "Авто подається чистим і відполірованим\nАроматизатор та освіжувач повітря в салоні\nВода та дрібні снеки на борту за запитом\nВодій у костюмі за доплатою\nОформлення з доставкою в готель або офіс\nЗнижена застава при наявності золотої/платинової картки\nПріоритетна заміна при будь-якій несправності",
              ru: "Авто подаётся чистым и отполированным\nАроматизатор и освежитель воздуха в салоне\nВода и мелкие снеки на борту по запросу\nВодитель в костюме за доплату\nОформление с доставкой в отель или офис\nСниженный залог при наличии золотой/платиновой карты\nПриоритетная замена при любой неисправности",
              en: "Car delivered clean and polished\nAir freshener and fragrance in the cabin\nWater and small snacks on board on request\nSuited driver for an extra fee\nPickup with delivery to hotel or office\nReduced deposit with gold/platinum card\nPriority replacement for any malfunction",
              de: "Auto sauber und poliert geliefert\nLufterfrischer und Duft im Innenraum\nWasser und kleine Snacks an Bord auf Anfrage\nFahrer im Anzug gegen Aufpreis\nAbholung mit Lieferung ins Hotel oder Büro\nReduzierte Kaution mit Gold-/Platinkarte\nPrioritätsersatz bei jeder Fehlfunktion"
            }
          }
        ]
      }
    ]
  },

  // ── 4. Мінівени ─────────────────────────────────────────
  {
    slug: "minivans",
    mainImage: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069",
    title:       { uk: "Мінівени та мікроавтобуси", ru: "Минивэны и микроавтобусы", en: "Minivans & Minibuses",      de: "Minivans & Kleinbusse" },
    subtitle:    { uk: "Mercedes Vito, Volkswagen Caravelle — для великих компаній та трансферів", ru: "Mercedes Vito, Volkswagen Caravelle — для больших компаний и трансферов", en: "Mercedes Vito, Volkswagen Caravelle — for large groups and transfers", de: "Mercedes Vito, Volkswagen Caravelle — für große Gruppen und Transfers" },
    headerTitle: { uk: "Всі разом — на одному авто", ru: "Все вместе — на одном авто", en: "Everyone together — one vehicle", de: "Alle zusammen — ein Fahrzeug" },
    content: [
      {
        type: "heading", align: "left",
        content: { uk: "7–9 місць, великий багажник і жодного «хто їде окремо»", ru: "7–9 мест, большой багажник и никакого «кто едет отдельно»", en: "7–9 seats, large luggage space and no 'who rides separately'", de: "7–9 Sitze, großer Kofferraum und kein 'wer fährt separat'" }
      },
      {
        type: "paragraph", align: "left",
        content: {
          uk: "Корпоративний трансфер команди до аеропорту. Сімейна поїздка з дітьми, колясками та валізами. Туристична група яка хоче їхати разом. Весілля де потрібно забрати та розвезти гостей. Мінівени DrivePoint — коли одного авто недостатньо і двох забагато.",
          ru: "Корпоративный трансфер команды до аэропорта. Семейная поездка с детьми, колясками и чемоданами. Туристическая группа которая хочет ехать вместе. Свадьба где нужно забрать и развезти гостей. Минивэны DrivePoint — когда одного авто недостаточно и двух слишком много.",
          en: "Corporate team transfer to the airport. A family trip with children, prams and suitcases. A tourist group that wants to travel together. A wedding where guests need to be collected and dropped off. DrivePoint minivans — when one car isn't enough and two is too many.",
          de: "Unternehmenstransfer des Teams zum Flughafen. Ein Familienausflug mit Kindern, Kinderwagen und Koffern. Eine Touristengruppe die zusammen reisen möchte. Eine Hochzeit bei der Gäste abgeholt und gebracht werden müssen. DrivePoint Minivans — wenn ein Auto nicht reicht und zwei zu viele sind."
        }
      },
      {
        type: "image", align: "left",
        media: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069",
        widthPercent: 50,
        children: [
          { type: "heading", align: "left", content: { uk: "Наш парк мінівенів", ru: "Наш парк минивэнов", en: "Our minivan fleet", de: "Unser Minivanpark" } },
          {
            type: "list", align: "left",
            content: {
              uk: "Mercedes-Benz Vito 7+1 — бізнес-трансфер преміум\nVolkswagen Caravelle T6 — комфорт для 9 осіб\nFord Tourneo Custom — просторий і доступний\nRenault Trafic — відмінна вантажомісткість\nOpel Vivaro — міський мінівен\nMercedes-Benz Sprinter 12 міс. — для великих груп",
              ru: "Mercedes-Benz Vito 7+1 — бизнес-трансфер премиум\nVolkswagen Caravelle T6 — комфорт для 9 человек\nFord Tourneo Custom — просторный и доступный\nRenault Trafic — отличная грузовместимость\nOpel Vivaro — городской минивэн\nMercedes-Benz Sprinter 12 мест — для больших групп",
              en: "Mercedes-Benz Vito 7+1 — premium business transfer\nVolkswagen Caravelle T6 — comfort for 9 people\nFord Tourneo Custom — spacious and affordable\nRenault Trafic — excellent cargo capacity\nOpel Vivaro — city minivan\nMercedes-Benz Sprinter 12 seats — for large groups",
              de: "Mercedes-Benz Vito 7+1 — Premium Business-Transfer\nVolkswagen Caravelle T6 — Komfort für 9 Personen\nFord Tourneo Custom — geräumig und erschwinglich\nRenault Trafic — ausgezeichnete Nutzlast\nOpel Vivaro — Stadtminivan\nMercedes-Benz Sprinter 12 Sitze — für große Gruppen"
            }
          }
        ]
      }
    ]
  },

  // ── 5. Сервіс з водієм ───────────────────────────────────
  {
    slug: "driver-service",
    mainImage: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070",
    title:       { uk: "Послуга водія",         ru: "Услуга водителя",         en: "Driver Service",          de: "Fahrerdienst" },
    subtitle:    { uk: "Ви відпочиваєте — наш водій за кермом", ru: "Вы отдыхаете — наш водитель за рулём", en: "You relax — our driver is at the wheel", de: "Sie entspannen — unser Fahrer ist am Steuer" },
    headerTitle: { uk: "Персональний водій без покупки авто", ru: "Персональный водитель без покупки авто", en: "Personal driver without buying a car", de: "Persönlicher Fahrer ohne Autokauf" },
    content: [
      {
        type: "heading", align: "left",
        content: { uk: "Наш водій — не таксист. Це ваш тимчасовий особистий шофер", ru: "Наш водитель — не таксист. Это ваш временный личный шофёр", en: "Our driver is not a taxi driver. They are your temporary personal chauffeur", de: "Unser Fahrer ist kein Taxifahrer. Er ist Ihr vorübergehender persönlicher Chauffeur" }
      },
      {
        type: "paragraph", align: "left",
        content: {
          uk: "Різниця між таксі і нашою послугою водія — колосальна. Таксі забрало і зникло. Наш водій приїжджає о 8 ранку і залишається з вами весь день. Чекає поки ви на зустрічі. Везе на наступну. Забирає з вечірки о 2 ночі без питань і без сюрпризів з ціною.",
          ru: "Разница между такси и нашей услугой водителя — колоссальная. Такси забрало и исчезло. Наш водитель приезжает в 8 утра и остаётся с вами весь день. Ждёт пока вы на встрече. Везёт на следующую. Забирает с вечеринки в 2 ночи без вопросов и без сюрпризов с ценой.",
          en: "The difference between a taxi and our driver service is enormous. A taxi picks you up and disappears. Our driver arrives at 8am and stays with you all day. Waits while you're in a meeting. Takes you to the next one. Picks you up from a party at 2am with no questions and no price surprises.",
          de: "Der Unterschied zwischen einem Taxi und unserem Fahrerdienst ist enorm. Ein Taxi holt Sie ab und verschwindet. Unser Fahrer kommt um 8 Uhr morgens und bleibt den ganzen Tag bei Ihnen. Wartet während Sie in einem Meeting sind. Fährt Sie zum nächsten. Holt Sie um 2 Uhr nachts von einer Party ab ohne Fragen und ohne Preisüberraschungen."
        }
      },
      {
        type: "image", align: "left",
        media: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2070",
        widthPercent: 50,
        children: [
          { type: "heading", align: "left", content: { uk: "Хто наші водії", ru: "Кто наши водители", en: "Who our drivers are", de: "Wer unsere Fahrer sind" } },
          {
            type: "list", align: "left",
            content: {
              uk: "Стаж від 7 років на представницьких авто\nЩорічне психологічне тестування\nКурс захисного та безпечного водіння\nЗнання Києва та основних міжміських маршрутів\nКонфіденційність — підписують NDA\nАнгломовні водії за запитом\nКостюм та бездоганний зовнішній вигляд",
              ru: "Стаж от 7 лет на представительских авто\nЕжегодное психологическое тестирование\nКурс защитного и безопасного вождения\nЗнание Киева и основных межгородских маршрутов\nКонфиденциальность — подписывают NDA\nАнглоязычные водители по запросу\nКостюм и безупречный внешний вид",
              en: "7+ years experience with executive vehicles\nAnnual psychological testing\nDefensive and safe driving course\nKnowledge of Kyiv and main intercity routes\nConfidentiality — they sign an NDA\nEnglish-speaking drivers on request\nSuit and impeccable appearance",
              de: "7+ Jahre Erfahrung mit Repräsentationsfahrzeugen\nJährliche psychologische Tests\nDefensiv- und Sicherheitsfahrkurs\nKenntnis von Kiew und Hauptfernstrecken\nVertraulichkeit — sie unterzeichnen ein NDA\nEnglischsprachige Fahrer auf Anfrage\nAnzug und makelloses Erscheinungsbild"
            }
          }
        ]
      },
      {
        type: "image", align: "right",
        media: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074",
        widthPercent: 50,
        children: [
          { type: "heading", align: "left", content: { uk: "Коли замовляють послугу водія", ru: "Когда заказывают услугу водителя", en: "When to book the driver service", de: "Wann man den Fahrerdienst bucht" } },
          {
            type: "list", align: "left",
            content: {
              uk: "Зустріч іноземних партнерів або делегацій\nДіловий день з кількома зустрічами підряд\nАеропорт туди-назад + очікування\nВесілля — від завтра до фінального банкету\nКорпоратив або вечірка де плануєте пити\nДовга поїздка в інше місто де не хочеться самому вести",
              ru: "Встреча иностранных партнёров или делегаций\nДеловой день с несколькими встречами подряд\nАэропорт туда-обратно + ожидание\nСвадьба — от завтра до финального банкета\nКорпоратив или вечеринка где планируете выпить\nДлинная поездка в другой город где не хочется самому вести",
              en: "Meeting foreign partners or delegations\nA business day with several back-to-back meetings\nAirport return + waiting\nWedding — from the morning to the final banquet\nCompany event or party where you plan to drink\nA long trip to another city where you don't want to drive",
              de: "Treffen ausländischer Partner oder Delegationen\nEin Geschäftstag mit mehreren aufeinanderfolgenden Meetings\nFlughafen hin und zurück + Wartezeit\nHochzeit — vom Morgen bis zum Abschlussbankett\nFirmenveranstaltung oder Party bei der man trinken will\nEine lange Fahrt in eine andere Stadt bei der man nicht selbst fahren möchte"
            }
          }
        ]
      }
    ]
  },

  // ── 6. Аеропортний трансфер ──────────────────────────────
  {
    slug: "airport-transfer",
    mainImage: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074",
    title:       { uk: "Аеропортні трансфери",  ru: "Аэропортные трансферы",   en: "Airport Transfers",       de: "Flughafentransfers" },
    subtitle:    { uk: "Бориспіль, Жуляни, Київ-пасажирський — вчасно і без нервів", ru: "Борисполь, Жуляны, Киев-пассажирский — вовремя и без нервов", en: "Boryspil, Zhuliany, Kyiv station — on time, stress-free", de: "Boryspil, Zhuliany, Bahnhof Kyiv — pünktlich und stressfrei" },
    headerTitle: { uk: "Ми стежимо за вашим рейсом — ви дивитесь у вікно", ru: "Мы следим за вашим рейсом — вы смотрите в окно", en: "We track your flight — you look out the window", de: "Wir verfolgen Ihren Flug — Sie schauen aus dem Fenster" },
    content: [
      {
        type: "heading", align: "left",
        content: { uk: "Як це працює: рейс на 6:40 — водій о 4:30 вже біля під'їзду", ru: "Как это работает: рейс в 6:40 — водитель в 4:30 уже у подъезда", en: "How it works: flight at 6:40 — driver at 4:30 already at your door", de: "Wie es funktioniert: Flug um 6:40 — Fahrer um 4:30 bereits vor der Tür" }
      },
      {
        type: "paragraph", align: "left",
        content: {
          uk: "Ми отримуємо номер вашого рейсу і моніторимо його статус у реальному часі. Якщо рейс затримується на 2 години — ваш водій приїде на 2 години пізніше. Жодних доплат за очікування до 60 хвилин після посадки. Зустріч з табличкою у залі прильотів.",
          ru: "Мы получаем номер вашего рейса и мониторим его статус в реальном времени. Если рейс задерживается на 2 часа — ваш водитель приедет на 2 часа позже. Никаких доплат за ожидание до 60 минут после посадки. Встреча с табличкой в зале прилётов.",
          en: "We receive your flight number and monitor its status in real time. If the flight is delayed by 2 hours — your driver arrives 2 hours later. No extra charges for waiting up to 60 minutes after landing. Meeting with a name sign in the arrivals hall.",
          de: "Wir erhalten Ihre Flugnummer und überwachen den Status in Echtzeit. Wenn der Flug 2 Stunden Verspätung hat — kommt Ihr Fahrer 2 Stunden später. Keine Aufschläge für Wartezeit bis zu 60 Minuten nach der Landung. Empfang mit Namenstafel in der Ankunftshalle."
        }
      },
      {
        type: "image", align: "center",
        media: "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?q=80&w=1974",
        widthPercent: 88,
        children: [
          { type: "heading", align: "center", content: { uk: "Напрямки та тарифи аеропортних трансферів", ru: "Направления и тарифы аэропортных трансферов", en: "Airport transfer directions and rates", de: "Richtungen und Tarife für Flughafentransfers" } },
          {
            type: "list", align: "center",
            content: {
              uk: "Бориспіль ↔ Київ (Economy) — від 600 грн / $15\nБориспіль ↔ Київ (Premium) — від 2 000 грн / $50\nЖуляни ↔ Київ (Economy) — від 350 грн / $9\nКиїв-пасажирський ↔ Готель — від 250 грн / $6\nБориспіль ↔ Бориспіль (пересадка) — від 400 грн\nКиїв → Харків / Одеса / Львів (трансфер) — уточнюйте",
              ru: "Борисполь ↔ Киев (Economy) — от 600 грн / $15\nБорисполь ↔ Киев (Premium) — от 2 000 грн / $50\nЖуляны ↔ Киев (Economy) — от 350 грн / $9\nКиев-пассажирский ↔ Отель — от 250 грн / $6\nБорисполь ↔ Борисполь (пересадка) — от 400 грн\nКиев → Харьков / Одесса / Львов (трансфер) — уточняйте",
              en: "Boryspil ↔ Kyiv (Economy) — from ₴600 / $15\nBoryspil ↔ Kyiv (Premium) — from ₴2,000 / $50\nZhuliany ↔ Kyiv (Economy) — from ₴350 / $9\nKyiv station ↔ Hotel — from ₴250 / $6\nBoryspil ↔ Boryspil (connecting) — from ₴400\nKyiv → Kharkiv / Odesa / Lviv (transfer) — ask for quote",
              de: "Boryspil ↔ Kiew (Economy) — ab 600 UAH / $15\nBoryspil ↔ Kiew (Premium) — ab 2.000 UAH / $50\nZhuliany ↔ Kiew (Economy) — ab 350 UAH / $9\nBahnhof Kiew ↔ Hotel — ab 250 UAH / $6\nBoryspil ↔ Boryspil (Umsteigen) — ab 400 UAH\nKiew → Charkiw / Odessa / Lwiw (Transfer) — Angebot anfragen"
            }
          }
        ]
      }
    ]
  }
];

// ═══════════════════════════════════════════════════════════
// PRICES
// ═══════════════════════════════════════════════════════════
const prices: Omit<PriceModel, "id">[] = [
  {
    category: { uk: "Оренда автомобілів / доба", ru: "Аренда автомобилей / сутки", en: "Car Rental / per day", de: "Autovermietung / pro Tag" },
    columns: {
      duration: { uk: "Термін", ru: "Срок", en: "Duration", de: "Dauer" },
      procedure: { uk: "Клас / Модель", ru: "Класс / Модель", en: "Class / Model", de: "Klasse / Modell" },
      price: { uk: "Вартість / доба", ru: "Стоимость / сутки", en: "Rate / day", de: "Preis / Tag" }
    },
    sections: [
      {
        subtitle: { uk: "Economy клас", ru: "Economy класс", en: "Economy class", de: "Economy-Klasse" },
        items: [
          { duration: { uk: "1–2 доби", ru: "1–2 суток", en: "1–2 days", de: "1–2 Tage" }, procedure: { uk: "VW Polo / Skoda Fabia", ru: "VW Polo / Skoda Fabia", en: "VW Polo / Skoda Fabia", de: "VW Polo / Skoda Fabia" }, price: { uk: "від 1 200 грн", ru: "от 1 200 грн", en: "from $30", de: "ab $30" } },
          { duration: { uk: "3–6 діб", ru: "3–6 суток", en: "3–6 days", de: "3–6 Tage" }, procedure: { uk: "VW Polo / Skoda Fabia", ru: "VW Polo / Skoda Fabia", en: "VW Polo / Skoda Fabia", de: "VW Polo / Skoda Fabia" }, price: { uk: "від 900 грн", ru: "от 900 грн", en: "from $22", de: "ab $22" } },
          { duration: { uk: "7+ діб", ru: "7+ суток", en: "7+ days", de: "7+ Tage" }, procedure: { uk: "VW Polo / Skoda Fabia", ru: "VW Polo / Skoda Fabia", en: "VW Polo / Skoda Fabia", de: "VW Polo / Skoda Fabia" }, price: { uk: "від 700 грн", ru: "от 700 грн", en: "from $17", de: "ab $17" } }
        ]
      },
      {
        subtitle: { uk: "Comfort клас", ru: "Comfort класс", en: "Comfort class", de: "Comfort-Klasse" },
        items: [
          { duration: { uk: "1–2 доби", ru: "1–2 суток", en: "1–2 days", de: "1–2 Tage" }, procedure: { uk: "Toyota Corolla / Mazda 3", ru: "Toyota Corolla / Mazda 3", en: "Toyota Corolla / Mazda 3", de: "Toyota Corolla / Mazda 3" }, price: { uk: "від 1 800 грн", ru: "от 1 800 грн", en: "from $45", de: "ab $45" } },
          { duration: { uk: "7+ діб", ru: "7+ суток", en: "7+ days", de: "7+ Tage" }, procedure: { uk: "Toyota Corolla / Mazda 3", ru: "Toyota Corolla / Mazda 3", en: "Toyota Corolla / Mazda 3", de: "Toyota Corolla / Mazda 3" }, price: { uk: "від 1 350 грн", ru: "от 1 350 грн", en: "from $34", de: "ab $34" } }
        ]
      },
      {
        subtitle: { uk: "SUV клас", ru: "SUV класс", en: "SUV class", de: "SUV-Klasse" },
        items: [
          { duration: { uk: "1–2 доби", ru: "1–2 суток", en: "1–2 days", de: "1–2 Tage" }, procedure: { uk: "Toyota RAV4 / Hyundai Tucson", ru: "Toyota RAV4 / Hyundai Tucson", en: "Toyota RAV4 / Hyundai Tucson", de: "Toyota RAV4 / Hyundai Tucson" }, price: { uk: "від 3 200 грн", ru: "от 3 200 грн", en: "from $80", de: "ab $80" } },
          { duration: { uk: "7+ діб", ru: "7+ суток", en: "7+ days", de: "7+ Tage" }, procedure: { uk: "Toyota RAV4 / Hyundai Tucson", ru: "Toyota RAV4 / Hyundai Tucson", en: "Toyota RAV4 / Hyundai Tucson", de: "Toyota RAV4 / Hyundai Tucson" }, price: { uk: "від 2 400 грн", ru: "от 2 400 грн", en: "from $60", de: "ab $60" } }
        ]
      },
      {
        subtitle: { uk: "Premium клас", ru: "Premium класс", en: "Premium class", de: "Premium-Klasse" },
        items: [
          { duration: { uk: "1–2 доби", ru: "1–2 суток", en: "1–2 days", de: "1–2 Tage" }, procedure: { uk: "BMW 5 / Mercedes E-Class", ru: "BMW 5 / Mercedes E-Class", en: "BMW 5 / Mercedes E-Class", de: "BMW 5 / Mercedes E-Class" }, price: { uk: "від 5 600 грн", ru: "от 5 600 грн", en: "from $140", de: "ab $140" } },
          { duration: { uk: "7+ діб", ru: "7+ суток", en: "7+ days", de: "7+ Tage" }, procedure: { uk: "BMW 5 / Mercedes E-Class", ru: "BMW 5 / Mercedes E-Class", en: "BMW 5 / Mercedes E-Class", de: "BMW 5 / Mercedes E-Class" }, price: { uk: "від 4 400 грн", ru: "от 4 400 грн", en: "from $110", de: "ab $110" } }
        ]
      },
      {
        subtitle: { uk: "Мінівени", ru: "Минивэны", en: "Minivans", de: "Minivans" },
        items: [
          { duration: { uk: "1–2 доби", ru: "1–2 суток", en: "1–2 days", de: "1–2 Tage" }, procedure: { uk: "Mercedes Vito / VW Caravelle (7–9 міс.)", ru: "Mercedes Vito / VW Caravelle (7–9 мест)", en: "Mercedes Vito / VW Caravelle (7–9 seats)", de: "Mercedes Vito / VW Caravelle (7–9 Sitze)" }, price: { uk: "від 4 400 грн", ru: "от 4 400 грн", en: "from $110", de: "ab $110" } }
        ]
      }
    ]
  },
  {
    category: { uk: "Послуга водія та трансфери", ru: "Услуга водителя и трансферы", en: "Driver Service & Transfers", de: "Fahrerdienst & Transfers" },
    columns: {
      duration: { uk: "Формат", ru: "Формат", en: "Format", de: "Format" },
      procedure: { uk: "Послуга", ru: "Услуга", en: "Service", de: "Leistung" },
      price: { uk: "Вартість", ru: "Стоимость", en: "Price", de: "Preis" }
    },
    sections: [
      {
        subtitle: { uk: "Особистий водій", ru: "Личный водитель", en: "Personal driver", de: "Persönlicher Fahrer" },
        items: [
          { duration: { uk: "2 год", ru: "2 ч", en: "2 hrs", de: "2 Std" }, procedure: { uk: "Водій + Comfort авто", ru: "Водитель + Comfort авто", en: "Driver + Comfort car", de: "Fahrer + Comfort Auto" }, price: { uk: "від 1 600 грн", ru: "от 1 600 грн", en: "from $40", de: "ab $40" } },
          { duration: { uk: "4 год", ru: "4 ч", en: "4 hrs", de: "4 Std" }, procedure: { uk: "Водій + Comfort авто", ru: "Водитель + Comfort авто", en: "Driver + Comfort car", de: "Fahrer + Comfort Auto" }, price: { uk: "від 2 800 грн", ru: "от 2 800 грн", en: "from $70", de: "ab $70" } },
          { duration: { uk: "8 год (день)", ru: "8 ч (день)", en: "8 hrs (day)", de: "8 Std (Tag)" }, procedure: { uk: "Водій + Comfort авто", ru: "Водитель + Comfort авто", en: "Driver + Comfort car", de: "Fahrer + Comfort Auto" }, price: { uk: "від 4 800 грн", ru: "от 4 800 грн", en: "from $120", de: "ab $120" } },
          { duration: { uk: "8 год (день)", ru: "8 ч (день)", en: "8 hrs (day)", de: "8 Std (Tag)" }, procedure: { uk: "Водій + Premium авто", ru: "Водитель + Premium авто", en: "Driver + Premium car", de: "Fahrer + Premium Auto" }, price: { uk: "від 8 800 грн", ru: "от 8 800 грн", en: "from $220", de: "ab $220" } }
        ]
      },
      {
        subtitle: { uk: "Аеропортні трансфери", ru: "Аэропортные трансферы", en: "Airport transfers", de: "Flughafentransfers" },
        items: [
          { duration: { uk: "Один бік", ru: "В одну сторону", en: "One way", de: "Einfache Fahrt" }, procedure: { uk: "Бориспіль ↔ Київ, Economy", ru: "Борисполь ↔ Киев, Economy", en: "Boryspil ↔ Kyiv, Economy", de: "Boryspil ↔ Kiew, Economy" }, price: { uk: "від 600 грн", ru: "от 600 грн", en: "from $15", de: "ab $15" } },
          { duration: { uk: "Один бік", ru: "В одну сторону", en: "One way", de: "Einfache Fahrt" }, procedure: { uk: "Бориспіль ↔ Київ, Premium", ru: "Борисполь ↔ Киев, Premium", en: "Boryspil ↔ Kyiv, Premium", de: "Boryspil ↔ Kiew, Premium" }, price: { uk: "від 2 000 грн", ru: "от 2 000 грн", en: "from $50", de: "ab $50" } },
          { duration: { uk: "Один бік", ru: "В одну сторону", en: "One way", de: "Einfache Fahrt" }, procedure: { uk: "Жуляни / Вокзал ↔ Готель", ru: "Жуляны / Вокзал ↔ Отель", en: "Zhuliany / Station ↔ Hotel", de: "Zhuliany / Bahnhof ↔ Hotel" }, price: { uk: "від 350 грн", ru: "от 350 грн", en: "from $9", de: "ab $9" } }
        ]
      }
    ]
  }
];

// ═══════════════════════════════════════════════════════════
// EMPLOYEES
// ═══════════════════════════════════════════════════════════
const employees: Omit<Employee, "id">[] = [
  {
    slug: "serhii-bondarenko",
    photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=687",
    fullName:  { uk: "Сергій Бондаренко", ru: "Сергей Бондаренко", en: "Serhii Bondarenko", de: "Serhii Bondarenko" },
    shortName: { uk: "С. Бондаренко",     ru: "С. Бондаренко",     en: "S. Bondarenko",     de: "S. Bondarenko" },
    position:  { uk: "Старший водій VIP-класу", ru: "Старший водитель VIP-класса", en: "Senior VIP Driver", de: "Senior VIP-Fahrer" },
    specializations: [
      { uk: "BMW 7, Mercedes S-Class — VIP-перевезення", ru: "BMW 7, Mercedes S-Class — VIP-перевозки", en: "BMW 7, Mercedes S-Class — VIP transfers", de: "BMW 7, Mercedes S-Class — VIP-Transfers" },
      { uk: "Зустріч делегацій та іноземних партнерів", ru: "Встреча делегаций и иностранных партнёров", en: "Meeting delegations and foreign partners", de: "Empfang von Delegationen und ausländischen Partnern" },
      { uk: "Захисне водіння та курс екстремального керування", ru: "Защитное вождение и курс экстремального управления", en: "Defensive driving and emergency vehicle control", de: "Defensiv- und Notfallfahrzeugsteuerung" }
    ],
    education: [
      { uk: "Автомобільний коледж, Київ — Технічне обслуговування (2003)", ru: "Автомобильный колледж, Киев — Техническое обслуживание (2003)", en: "Automotive College, Kyiv — Vehicle Maintenance (2003)", de: "Kfz-College, Kiew — Fahrzeugwartung (2003)" }
    ],
    certificates: [
      "BMW Driving Experience — Professional Level (2018)",
      "Defensive Driving Certificate — IAM RoadSmart UK (2019)",
      "Категорія B, C, D, E — 20 років без ДТП"
    ]
  },
  {
    slug: "oleksandra-kravets",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=688",
    fullName:  { uk: "Олександра Кравець", ru: "Александра Кравец", en: "Oleksandra Kravets", de: "Oleksandra Kravets" },
    shortName: { uk: "О. Кравець",         ru: "А. Кравец",         en: "O. Kravets",         de: "O. Kravets" },
    position:  { uk: "Менеджер з бронювань та обслуговування клієнтів", ru: "Менеджер по бронированиям и обслуживанию клиентов", en: "Bookings & Customer Service Manager", de: "Buchungs- & Kundendienst-Managerin" },
    specializations: [
      { uk: "Корпоративні договори та флотова оренда", ru: "Корпоративные договоры и флотовая аренда", en: "Corporate contracts and fleet rental", de: "Unternehmensverträge und Flottenmiete" },
      { uk: "Клієнтська комунікація: uk/ru/en", ru: "Клиентская коммуникация: uk/ru/en", en: "Client communication: uk/ru/en", de: "Kundenkommunikation: uk/ru/en" },
      { uk: "Диспетчеризація та координація водіїв", ru: "Диспетчеризация и координация водителей", en: "Dispatching and driver coordination", de: "Disposition und Fahrerkoordination" }
    ],
    education: [
      { uk: "КНЕУ — Менеджмент та маркетинг у сфері послуг (2014)", ru: "КНЕУ — Менеджмент и маркетинг в сфере услуг (2014)", en: "KNEU — Service Management and Marketing (2014)", de: "KNEU — Dienstleistungsmanagement und Marketing (2014)" }
    ],
    certificates: [
      "Customer Experience Excellence — Coursera (2021)",
      "CRM: Bitrix24 Advanced User (2022)",
      "Ділова англійська C1 — EF Certificate (2020)"
    ]
  },
  {
    slug: "vasyl-melnyk",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=687",
    fullName:  { uk: "Василь Мельник",     ru: "Василий Мельник",    en: "Vasyl Melnyk",     de: "Vasyl Melnyk" },
    shortName: { uk: "В. Мельник",         ru: "В. Мельник",         en: "V. Melnyk",        de: "V. Melnyk" },
    position:  { uk: "Головний механік автопарку", ru: "Главный механик автопарка", en: "Head Fleet Mechanic", de: "Chefmechaniker des Fuhrparks" },
    specializations: [
      { uk: "Діагностика та ТО японської, корейської та німецької техніки", ru: "Диагностика и ТО японской, корейской и немецкой техники", en: "Diagnostics and service of Japanese, Korean and German vehicles", de: "Diagnose und Wartung japanischer, koreanischer und deutscher Fahrzeuge" },
      { uk: "Підготовка авто до видачі: чистка, перевірка, заправка", ru: "Подготовка авто к выдаче: чистка, проверка, заправка", en: "Car preparation for handover: cleaning, inspection, fuelling", de: "Fahrzeugvorbereitung für die Übergabe: Reinigung, Inspektion, Betanken" },
      { uk: "Шиномонтаж та сезонне обслуговування", ru: "Шиномонтаж и сезонное обслуживание", en: "Tyre service and seasonal maintenance", de: "Reifendienst und Saisonwartung" }
    ],
    education: [
      { uk: "Київський політехнічний коледж — Автомеханік (2006)", ru: "Киевский политехнический колледж — Автомеханик (2006)", en: "Kyiv Polytechnic College — Automotive Mechanic (2006)", de: "Kiewer Polytechnisches College — Kfz-Mechaniker (2006)" }
    ],
    certificates: [
      "Toyota Certified Technician — Toyota Academy (2012)",
      "BMW Group Technician Certification (2016)",
      "Bosch Automotive Diagnostics Professional (2019)"
    ]
  }
];

// ═══════════════════════════════════════════════════════════
// FAQs
// ═══════════════════════════════════════════════════════════
const faqs: Omit<FAQ, "id">[] = [
  {
    question: { uk: "Які документи потрібні для оренди?", ru: "Какие документы нужны для аренды?", en: "What documents do I need to rent?", de: "Welche Dokumente brauche ich für die Miete?" },
    answer: { uk: "Паспорт або ID-карта + посвідчення водія категорії B (мінімум 2 роки стажу). Іноземцям — закордонний паспорт + міжнародне посвідчення водія IDP. Вік водія — від 21 року. Для Premium та SUV — від 23 років.", ru: "Паспорт или ID-карта + водительские права категории B (минимум 2 года стажа). Иностранцам — загранпаспорт + международные права IDP. Возраст водителя — от 21 года. Для Premium и SUV — от 23 лет.", en: "Passport or ID card + category B driving licence (minimum 2 years). Foreigners — international passport + international driving permit IDP. Driver age — from 21. For Premium and SUV — from 23.", de: "Reisepass oder Personalausweis + Führerschein Klasse B (mindestens 2 Jahre). Ausländer — Reisepass + internationaler Führerschein IDP. Fahrealter — ab 21. Für Premium und SUV — ab 23." }
  },
  {
    question: { uk: "Чи потрібна застава?", ru: "Нужен ли залог?", en: "Is a deposit required?", de: "Ist eine Kaution erforderlich?" },
    answer: { uk: "При оплаті кредитною карткою Visa/Mastercard/Amex ми блокуємо суму застави (не списуємо). Після повернення авто без пошкоджень — розблокування протягом 1–3 робочих днів. Без картки — готівковий депозит. Сума застави: Economy €150, Comfort €250, SUV €400, Premium €800.", ru: "При оплате кредитной картой Visa/Mastercard/Amex мы блокируем сумму залога (не списываем). После возврата авто без повреждений — разблокирование в течение 1–3 рабочих дней. Без карты — наличный депозит. Сумма залога: Economy €150, Comfort €250, SUV €400, Premium €800.", en: "With a Visa/Mastercard/Amex credit card we block the deposit amount (don't charge it). After returning the car without damage — unblocked within 1–3 business days. Without a card — cash deposit. Deposit amounts: Economy €150, Comfort €250, SUV €400, Premium €800.", de: "Mit einer Visa/Mastercard/Amex-Kreditkarte sperren wir den Kautionsbetrag (belasten ihn nicht). Nach Rückgabe ohne Schäden — Entsperrung innerhalb 1–3 Werktagen. Ohne Karte — Barkaution. Kautionsbeträge: Economy €150, Comfort €250, SUV €400, Premium €800." }
  },
  {
    question: { uk: "Чи можна повернути авто в іншому місті?", ru: "Можно ли вернуть авто в другом городе?", en: "Can I return the car in a different city?", de: "Kann ich das Auto in einer anderen Stadt zurückgeben?" },
    answer: { uk: "Так, one-way оренда доступна між нашими точками: Київ, Одеса, Харків, Дніпро, Львів. Вартість one-way відрізняється залежно від відстані та класу авто. Уточнюйте при бронюванні — менеджер розрахує фінальну ціну.", ru: "Да, one-way аренда доступна между нашими точками: Киев, Одесса, Харьков, Днепр, Львов. Стоимость one-way отличается в зависимости от расстояния и класса авто. Уточняйте при бронировании — менеджер рассчитает финальную цену.", en: "Yes, one-way rental is available between our locations: Kyiv, Odesa, Kharkiv, Dnipro, Lviv. One-way costs vary depending on distance and vehicle class. Ask at booking — the manager will calculate the final price.", de: "Ja, Einweg-Miete ist zwischen unseren Standorten verfügbar: Kiew, Odessa, Charkiw, Dnipro, Lwiw. Einwegkosten variieren je nach Entfernung und Fahrzeugklasse. Fragen Sie bei der Buchung — der Manager berechnet den Endpreis." }
  },
  {
    question: { uk: "Що якщо авто зламалось під час оренди?", ru: "Что если авто сломалось во время аренды?", en: "What if the car breaks down during the rental?", de: "Was wenn das Auto während der Miete eine Panne hat?" },
    answer: { uk: "Дзвоніть на гарячу лінію 24/7: +38 (044) 400-66-88. Якщо поломка сталась не з вашої вини — безкоштовна заміна авто протягом 60 хвилин у межах міста. За містом — технічна допомога або евакуатор. Ви не залишитесь без авто і без підтримки.", ru: "Звоните на горячую линию 24/7: +38 (044) 400-66-88. Если поломка произошла не по вашей вине — бесплатная замена авто в течение 60 минут в пределах города. За городом — техническая помощь или эвакуатор. Вы не останетесь без авто и без поддержки.", en: "Call the 24/7 hotline: +38 (044) 400-66-88. If the breakdown is not your fault — free replacement car within 60 minutes in the city. Outside the city — roadside assistance or tow truck. You won't be left without a car or support.", de: "Rufen Sie die 24/7-Hotline an: +38 (044) 400-66-88. Wenn die Panne nicht Ihre Schuld ist — kostenloses Ersatzfahrzeug innerhalb 60 Minuten in der Stadt. Außerhalb der Stadt — Pannenhilfe oder Abschleppwagen. Sie bleiben nicht ohne Auto und Unterstützung." }
  },
  {
    question: { uk: "Чи можна взяти авто з нижчим пробігом обмеженням?", ru: "Можно ли взять авто с меньшим ограничением пробега?", en: "Can I rent a car without a mileage limit?", de: "Kann ich ein Auto ohne Kilometerbegrenzung mieten?" },
    answer: { uk: "Стандартні тарифи Economy та Comfort включають необмежений пробіг. Для SUV і Premium — 400 км/добу включено, кожен зайвий кілометр: 3 грн. Для тривалої оренди (від 7 діб) — повний безліміт для всіх класів.", ru: "Стандартные тарифы Economy и Comfort включают неограниченный пробег. Для SUV и Premium — 400 км/сутки включено, каждый лишний километр: 3 грн. Для длительной аренды (от 7 суток) — полный безлимит для всех классов.", en: "Standard Economy and Comfort rates include unlimited mileage. For SUV and Premium — 400 km/day included, each extra km: ₴3. For long-term rental (7+ days) — full unlimited for all classes.", de: "Standard Economy und Comfort Tarife beinhalten unbegrenzte Kilometer. Für SUV und Premium — 400 km/Tag inklusive, jeder zusätzliche km: 3 UAH. Bei Langzeitmiete (ab 7 Tage) — volle Unbegrenztheit für alle Klassen." }
  },
  {
    question: { uk: "Чи можна взяти дитяче крісло?", ru: "Можно ли взять детское кресло?", en: "Can I rent a child seat?", de: "Kann ich einen Kindersitz mieten?" },
    answer: { uk: "Так, безкоштовно за попереднім запитом. Маємо крісла для дітей від 0 до 12 років (0–36 кг). Доступні: Group 0+ (0–13 кг), Group 1 (9–18 кг), Group 2/3 (15–36 кг), бустер. Вкажіть вік та вагу дитини при бронюванні.", ru: "Да, бесплатно по предварительному запросу. Имеем кресла для детей от 0 до 12 лет (0–36 кг). Доступны: Group 0+ (0–13 кг), Group 1 (9–18 кг), Group 2/3 (15–36 кг), бустер. Укажите возраст и вес ребёнка при бронировании.", en: "Yes, free of charge on prior request. We have seats for children from 0 to 12 years (0–36 kg). Available: Group 0+ (0–13 kg), Group 1 (9–18 kg), Group 2/3 (15–36 kg), booster. Please specify the child's age and weight at booking.", de: "Ja, kostenlos auf Voranfrage. Wir haben Sitze für Kinder von 0 bis 12 Jahren (0–36 kg). Verfügbar: Gruppe 0+ (0–13 kg), Gruppe 1 (9–18 kg), Gruppe 2/3 (15–36 kg), Booster. Bitte Alter und Gewicht des Kindes bei der Buchung angeben." }
  }
];

// ═══════════════════════════════════════════════════════════
// SPECIALS
// ═══════════════════════════════════════════════════════════
const specials: Omit<Special, "id">[] = [
  {
    slug: "week-deal-minus-25",
    title: { uk: "Тижневий Deal: –25% на Economy та Comfort", ru: "Недельный Deal: –25% на Economy и Comfort", en: "Weekly Deal: –25% on Economy & Comfort", de: "Wöchentlicher Deal: –25% auf Economy & Comfort" },
    subtitle: { uk: "Орендуйте на 7+ діб та заощаджуйте чверть вартості. Обмежений час.", ru: "Арендуйте на 7+ суток и экономьте четверть стоимости. Ограниченное время.", en: "Rent for 7+ days and save a quarter of the cost. Limited time.", de: "Mieten Sie für 7+ Tage und sparen Sie ein Viertel der Kosten. Zeitlich begrenzt." },
    mainImage: "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=2070",
    content: [
      { type: "paragraph", align: "left", content: { uk: "Акція діє на всі Economy та Comfort авто при бронюванні від 7 діб. Знижка застосовується автоматично при вказані терміну 7 або більше днів. Пальне, страховка та доставка включені.", ru: "Акция действует на все Economy и Comfort авто при бронировании от 7 суток. Скидка применяется автоматически при указании срока 7 или более дней. Топливо, страховка и доставка включены.", en: "Offer applies to all Economy and Comfort cars when booking for 7+ days. Discount applied automatically when selecting 7 or more days. Fuel, insurance and delivery included.", de: "Angebot gilt für alle Economy- und Comfort-Autos bei Buchung ab 7 Tagen. Rabatt wird automatisch bei Auswahl von 7 oder mehr Tagen angewendet. Kraftstoff, Versicherung und Lieferung inklusive." } }
    ],
    serviceId: [],
    prices: [],
    blogs: []
  },
  {
    slug: "airport-express",
    title: { uk: "Airport Express: трансфер + 1 доба оренди = пакетна ціна", ru: "Airport Express: трансфер + 1 сутки аренды = пакетная цена", en: "Airport Express: transfer + 1 day rental = package price", de: "Airport Express: Transfer + 1 Tag Miete = Paketpreis" },
    subtitle: { uk: "Зустрічаємо в Борисполі та одразу оформлюємо оренду — зі знижкою 20%", ru: "Встречаем в Борисполе и сразу оформляем аренду — со скидкой 20%", en: "We meet you at Boryspil and arrange the rental on the spot — with 20% off", de: "Wir empfangen Sie in Boryspil und arrangieren die Miete sofort — mit 20% Rabatt" },
    mainImage: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074",
    content: [
      { type: "paragraph", align: "left", content: { uk: "Наш представник зустрічає вас з табличкою в залі прильотів Бориспіль. Ви підписуєте договір прямо тут і їдете на орендованому авто без зупинок. Ідеально якщо плануєте дорогу відразу з аеропорту.", ru: "Наш представитель встречает вас с табличкой в зале прилётов Борисполь. Вы подписываете договор прямо здесь и едете на арендованном авто без остановок. Идеально если планируете дорогу сразу из аэропорта.", en: "Our representative meets you with a sign in the Boryspil arrivals hall. You sign the contract right there and drive off in the rental car without stops. Perfect if you plan to head straight from the airport.", de: "Unser Vertreter empfängt Sie mit einem Schild in der Boryspil-Ankunftshalle. Sie unterzeichnen den Vertrag gleich dort und fahren im Mietwagen ohne Stopps los. Perfekt wenn Sie direkt vom Flughafen aufbrechen wollen." } }
    ],
    serviceId: [],
    prices: [],
    blogs: []
  },
  {
    slug: "corporate-fleet",
    title: { uk: "Корпоративний флот: від 3 авто — ваші умови", ru: "Корпоративный флот: от 3 авто — ваши условия", en: "Corporate Fleet: from 3 cars — your terms", de: "Unternehmensflotte: ab 3 Autos — Ihre Bedingungen" },
    subtitle: { uk: "Знижка до 30%, щомісячний рахунок, особистий менеджер та пріоритетне обслуговування", ru: "Скидка до 30%, ежемесячный счёт, личный менеджер и приоритетное обслуживание", en: "Discount up to 30%, monthly invoicing, personal manager and priority service", de: "Rabatt bis 30%, monatliche Rechnung, persönlicher Manager und Prioritätsservice" },
    mainImage: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070",
    content: [
      { type: "paragraph", align: "left", content: { uk: "Для компаній що регулярно потребують авто для співробітників, делегацій або відряджень. Підписуємо корпоративний договір, виставляємо рахунок раз на місяць. Ніяких застав і готівкових розрахунків.", ru: "Для компаний которые регулярно нуждаются в авто для сотрудников, делегаций или командировок. Подписываем корпоративный договор, выставляем счёт раз в месяц. Никаких залогов и наличных расчётов.", en: "For companies that regularly need cars for staff, delegations or business trips. We sign a corporate contract and invoice once a month. No deposits or cash payments.", de: "Für Unternehmen die regelmäßig Autos für Mitarbeiter, Delegationen oder Dienstreisen benötigen. Wir unterzeichnen einen Unternehmensvertrag und stellen einmal monatlich eine Rechnung aus. Keine Kautionen oder Barzahlungen." } }
    ],
    serviceId: [],
    prices: [],
    blogs: []
  }
];

// ═══════════════════════════════════════════════════════════
// PHOTOS
// ═══════════════════════════════════════════════════════════
const photos: Omit<Photo, "id">[] = [
  {
    title: { uk: "Автопарк DrivePoint", ru: "Автопарк DrivePoint", en: "DrivePoint Fleet", de: "DrivePoint Fuhrpark" },
    description: { uk: "Реальні фото наших авто — зовні та всередині", ru: "Реальные фото наших авто — снаружи и внутри", en: "Real photos of our cars — outside and inside", de: "Echte Fotos unserer Autos — außen und innen" },
    mainImage: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=2070",
    imgArr: [
      { src: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=2070", title: { uk: "BMW 5 Series", ru: "BMW 5 Series", en: "BMW 5 Series", de: "BMW 5 Series" }, description: { uk: "Premium клас — завжди у бездоганному стані", ru: "Premium класс — всегда в безупречном состоянии", en: "Premium class — always in impeccable condition", de: "Premium-Klasse — immer in tadelloser Verfassung" } },
      { src: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=2071", title: { uk: "Toyota RAV4", ru: "Toyota RAV4", en: "Toyota RAV4", de: "Toyota RAV4" }, description: { uk: "Флагман SUV парку — Toyota RAV4 2023", ru: "Флагман SUV парка — Toyota RAV4 2023", en: "SUV fleet flagship — Toyota RAV4 2023", de: "SUV-Flotten-Flaggschiff — Toyota RAV4 2023" } },
      { src: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=2025", title: { uk: "Volkswagen Polo", ru: "Volkswagen Polo", en: "Volkswagen Polo", de: "Volkswagen Polo" }, description: { uk: "Economy клас — популярний вибір для міста", ru: "Economy класс — популярный выбор для города", en: "Economy class — popular city choice", de: "Economy-Klasse — beliebte Stadtwahl" } },
      { src: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069", title: { uk: "Mercedes Vito", ru: "Mercedes Vito", en: "Mercedes Vito", de: "Mercedes Vito" }, description: { uk: "Mercedes Vito 7+1 — комфортний трансфер для великих компаній", ru: "Mercedes Vito 7+1 — комфортный трансфер для больших компаний", en: "Mercedes Vito 7+1 — comfortable transfer for large groups", de: "Mercedes Vito 7+1 — komfortabler Transfer für große Gruppen" } },
      { src: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070", title: { uk: "Наші водії", ru: "Наши водители", en: "Our drivers", de: "Unsere Fahrer" }, description: { uk: "Команда DrivePoint — завжди пунктуальна та ввічлива", ru: "Команда DrivePoint — всегда пунктуальная и вежливая", en: "The DrivePoint team — always punctual and courteous", de: "Das DrivePoint-Team — immer pünktlich und höflich" } },
      { src: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074", title: { uk: "Аеропорт Бориспіль", ru: "Аэропорт Борисполь", en: "Boryspil Airport", de: "Flughafen Boryspil" }, description: { uk: "Зустрічаємо та проводжаємо 24/7", ru: "Встречаем и провожаем 24/7", en: "Meeting and seeing off passengers 24/7", de: "Empfangen und Verabschieden von Passagieren rund um die Uhr" } }
    ]
  }
];

// ═══════════════════════════════════════════════════════════
// BLOGS (route: "blogs" = tab "roadnotes") — розширений контент
// ═══════════════════════════════════════════════════════════
const blogs: Omit<Blog, "id">[] = [
  {
    slug: "kyiv-to-carpathians-by-car-complete-guide",
    mainImage: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021",
    title: { uk: "Київ → Карпати на орендованому авто: повний гід 2024", ru: "Киев → Карпаты на арендованном авто: полный гид 2024", en: "Kyiv → Carpathians by rental car: complete 2024 guide", de: "Kyiw → Karpaten mit dem Mietwagen: vollständiger Guide 2024" },
    subtitle: { uk: "Маршрут, зупинки, дороги і реальні поради від наших клієнтів", ru: "Маршрут, остановки, дороги и реальные советы от наших клиентов", en: "Route, stops, road conditions and real tips from our clients", de: "Route, Stopps, Straßenbedingungen und echte Tipps von unseren Kunden" },
    content: [
      {
        type: "heading", align: "left",
        content: { uk: "Відстань і час: Київ до Буковелю — ~470 км, 6–7 годин", ru: "Расстояние и время: Киев до Буковеля — ~470 км, 6–7 часов", en: "Distance and time: Kyiv to Bukovel — ~470 km, 6–7 hours", de: "Entfernung und Zeit: Kiew nach Bukovel — ~470 km, 6–7 Stunden" }
      },
      {
        type: "paragraph", align: "left",
        content: {
          uk: "Маршрут через Житомир → Рівне → Луцьк → Мукачево → Буковель вважається найбільш комфортним. Дорога Е40 Київ–Рівне — відмінний асфальт, можна їхати 110–120 км/год. Від Луцька через Карпати — якість дороги знижується, але краєвиди компенсують усе. Рекомендуємо стартувати о 5–6 ранку щоб уникнути київських пробок і приїхати засвітла.",
          ru: "Маршрут через Житомир → Ровно → Луцк → Мукачево → Буковель считается наиболее комфортным. Дорога Е40 Киев–Ровно — отличный асфальт, можно ехать 110–120 км/ч. От Луцка через Карпаты — качество дороги снижается, но виды компенсируют всё. Рекомендуем стартовать в 5–6 утра чтобы избежать киевских пробок и приехать засветло.",
          en: "The route via Zhytomyr → Rivne → Lutsk → Mukachevo → Bukovel is considered the most comfortable. The E40 Kyiv–Rivne road has excellent tarmac, you can do 110–120 km/h. From Lutsk through the Carpathians — road quality decreases but the views make up for everything. We recommend departing at 5–6am to avoid Kyiv traffic and arrive while it's still light.",
          de: "Die Route über Zhytomyr → Rivne → Lutsk → Mukachevo → Bukovel gilt als die komfortabelste. Die E40 Kiew–Rivne hat ausgezeichneten Asphalt, man kann 110–120 km/h fahren. Von Lutsk durch die Karpaten — Straßenqualität nimmt ab, aber die Aussichten machen alles wett. Empfehlen um 5–6 Uhr morgens abzufahren um Kiewer Staus zu vermeiden und bei Tageslicht anzukommen."
        }
      },
      {
        type: "image", align: "left",
        media: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021",
        widthPercent: 50,
        children: [
          { type: "heading", align: "left", content: { uk: "Зупинки рекомендовані нашими клієнтами", ru: "Остановки рекомендованные нашими клиентами", en: "Stops recommended by our clients", de: "Von unseren Kunden empfohlene Stopps" } },
          {
            type: "list", align: "left",
            content: {
              uk: "Житомир (2 год від Києва) — кава та туалет, АЗС WOG\nРівне (3.5 год) — обід, зупинка 30–40 хв\nТунель під Карпатами — обов'язкова зупинка для фото\nМукачево (5.5 год) — старий замок Паланок, каву в центрі\nЯремче — ресторан «Гуцульська хата», форель і деруни\nБуковель — парковка коштує 100 грн/добу",
              ru: "Житомир (2 ч от Киева) — кофе и туалет, АЗС WOG\nРовно (3.5 ч) — обед, остановка 30–40 мин\nТоннель под Карпатами — обязательная остановка для фото\nМукачево (5.5 ч) — старый замок Паланок, кофе в центре\nЯремче — ресторан «Гуцульская хата», форель и деруны\nБуковель — парковка стоит 100 грн/сутки",
              en: "Zhytomyr (2 hrs from Kyiv) — coffee and toilet, WOG fuel station\nRivne (3.5 hrs) — lunch, 30–40 min stop\nCarpathian tunnel — mandatory photo stop\nMukachevo (5.5 hrs) — Palanok castle, coffee in the centre\nYaremche — 'Hutsulska Khata' restaurant, trout and potato pancakes\nBukovel — parking costs ₴100/day",
              de: "Zhytomyr (2 Std von Kiew) — Kaffee und Toilette, WOG Tankstelle\nRivne (3,5 Std) — Mittagessen, 30–40 Min Pause\nKarpaten-Tunnel — obligatorischer Foto-Stopp\nMukachevo (5,5 Std) — Burg Palanok, Kaffee im Zentrum\nYaremche — Restaurant 'Hutsulska Khata', Forelle und Kartoffelpuffer\nBukovel — Parken kostet 100 UAH/Tag"
            }
          }
        ]
      },
      {
        type: "image", align: "right",
        media: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2070",
        widthPercent: 50,
        children: [
          { type: "heading", align: "left", content: { uk: "Яке авто брати в Карпати", ru: "Какое авто брать в Карпаты", en: "Which car to take to the Carpathians", de: "Welches Auto für die Karpaten nehmen" } },
          {
            type: "paragraph", align: "left",
            content: {
              uk: "Для гірських доріг і потенційного бездоріжжя настійливо рекомендуємо SUV — Toyota RAV4 або Hyundai Tucson. Кліренс 200+ мм рятує на кам'янистих підйомах. Взимку і в міжсезоння — тільки повний привод. Economy клас теж доїде, але нервів витратите більше.",
              ru: "Для горных дорог и потенциального бездорожья настоятельно рекомендуем SUV — Toyota RAV4 или Hyundai Tucson. Клиренс 200+ мм спасает на каменистых подъёмах. Зимой и в межсезонье — только полный привод. Economy класс тоже доедет, но нервов потратите больше.",
              en: "For mountain roads and potential off-road conditions, we strongly recommend an SUV — Toyota RAV4 or Hyundai Tucson. 200+ mm clearance saves you on rocky climbs. In winter and shoulder season — all-wheel drive only. Economy class will get there too, but at the cost of your nerves.",
              de: "Für Bergstraßen und potenzielle Geländebedingungen empfehlen wir dringend ein SUV — Toyota RAV4 oder Hyundai Tucson. 200+ mm Bodenfreiheit rettet bei steinigen Anstiegen. Im Winter und in der Nebensaison — nur Allradantrieb. Economy-Klasse kommt auch an, aber auf Kosten der Nerven."
            }
          }
        ]
      },
      {
        type: "heading", align: "left",
        content: { uk: "Практичні поради перед поїздкою", ru: "Практические советы перед поездкой", en: "Practical tips before the trip", de: "Praktische Tipps vor der Reise" }
      },
      {
        type: "list", align: "left",
        content: {
          uk: "Заправтесь на WOG або ОККО перед Карпатами — в горах АЗС рідше\nСкачайте Maps.me офлайн — в горах може не бути зв'язку\nВізьміть готівку — не всі кафе і паркінги приймають картки\nПеревірте тиск у шинах — гірська дорога дає навантаження\nДодаткова страховка КАСКО — варта 150–200 грн/добу та спокою нервів\nТелефон DrivePoint 24/7 — зберіть в контакти на випадок",
          ru: "Заправьтесь на WOG или ОККО перед Карпатами — в горах АЗС реже\nСкачайте Maps.me офлайн — в горах может не быть связи\nВозьмите наличные — не все кафе и парковки принимают карты\nПроверьте давление в шинах — горная дорога даёт нагрузку\nДополнительная страховка КАСКО — стоит 150–200 грн/сутки и спокойствия нервов\nТелефон DrivePoint 24/7 — сохраните в контакты на случай",
          en: "Fill up at WOG or OKKO before the Carpathians — fuel stations are scarcer in the mountains\nDownload Maps.me offline — there may be no signal in the mountains\nTake cash — not all cafés and car parks accept cards\nCheck tyre pressure — mountain roads put strain on tyres\nExtra CASCO insurance — worth ₴150–200/day for peace of mind\nDrivePoint 24/7 number — save it in your contacts just in case",
          de: "Tanken Sie bei WOG oder OKKO vor den Karpaten — in den Bergen gibt es weniger Tankstellen\nLaden Sie Maps.me offline herunter — in den Bergen kann es kein Netz geben\nNehmen Sie Bargeld mit — nicht alle Cafés und Parkplätze nehmen Karten\nReifendruck prüfen — Bergstraßen belasten die Reifen\nZusätzliche Kaskoversicherung — 150–200 UAH/Tag für Seelenfrieden wert\nDrivePoint 24/7 Nummer — im Kontakte speichern für alle Fälle"
        }
      }
    ]
  },
  {
    slug: "how-to-pick-up-rental-car-checklist",
    mainImage: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070",
    title: { uk: "Чеклист: що перевірити при отриманні орендованого авто", ru: "Чеклист: что проверить при получении арендованного авто", en: "Checklist: what to inspect when picking up a rental car", de: "Checkliste: Was bei der Abholung eines Mietwagens zu prüfen ist" },
    subtitle: { uk: "12 пунктів які збережуть вашу заставу і нерви — перевірено нашими клієнтами", ru: "12 пунктов которые сохранят ваш залог и нервы — проверено нашими клиентами", en: "12 points that will save your deposit and nerves — proven by our clients", de: "12 Punkte die Ihre Kaution und Nerven retten werden — von unseren Kunden erprobt" },
    content: [
      {
        type: "heading", align: "left",
        content: { uk: "Більшість проблем із заставою починаються через непомічені дрібниці при прийомі авто", ru: "Большинство проблем с залогом начинаются из-за незамеченных мелочей при приёме авто", en: "Most deposit issues start from unnoticed small things when picking up the car", de: "Die meisten Kautionsprobleme beginnen mit unbeachteten Kleinigkeiten bei der Fahrzeugabholung" }
      },
      {
        type: "paragraph", align: "left",
        content: {
          uk: "Ми зібрали 12 пунктів які наші клієнти перевіряють при кожному отриманні авто. Займає 5–7 хвилин. Захищає від ситуацій «це не я поцарапав» і дозволяє спокійно виїхати знаючи що всі пошкодження зафіксовані.",
          ru: "Мы собрали 12 пунктов которые наши клиенты проверяют при каждом получении авто. Занимает 5–7 минут. Защищает от ситуаций «это не я поцарапал» и позволяет спокойно выехать зная что все повреждения зафиксированы.",
          en: "We've compiled 12 points our clients check every time they pick up a car. Takes 5–7 minutes. Protects against 'I didn't scratch that' situations and lets you drive off knowing all damage is documented.",
          de: "Wir haben 12 Punkte zusammengestellt die unsere Kunden bei jeder Fahrzeugabholung prüfen. Dauert 5–7 Minuten. Schützt vor 'Das habe ich nicht zerkratzt'-Situationen und lässt Sie beruhigt abfahren in dem Wissen dass alle Schäden dokumentiert sind."
        }
      },
      {
        type: "image", align: "left",
        media: "https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=2070",
        widthPercent: 50,
        children: [
          { type: "heading", align: "left", content: { uk: "Зовнішній огляд (7 пунктів)", ru: "Внешний осмотр (7 пунктов)", en: "Exterior inspection (7 points)", de: "Außeninspektion (7 Punkte)" } },
          {
            type: "list", align: "left",
            content: {
              uk: "1. Сфотографуйте КОЖЕН кут авто — передній, задній, 2 бокові\n2. Перевірте всі 4 диски — чи немає потертостей та тріщин\n3. Лобове скло — мікротріщини видно на сонці під кутом\n4. Дзеркала — подряпини та цілісність кришки\n5. Бампери — нижня частина часто затерта\n6. Дах — піднімайтесь на шкарпетках або знімайте на телефон\n7. Зафіксуйте в акті приймання КОЖНЕ пошкодження",
              ru: "1. Сфотографируйте КАЖДЫЙ угол авто — передний, задний, 2 боковых\n2. Проверьте все 4 диска — нет ли потёртостей и трещин\n3. Лобовое стекло — микротрещины видны на солнце под углом\n4. Зеркала — царапины и целостность крышки\n5. Бамперы — нижняя часть часто затёрта\n6. Крыша — поднимайтесь на носочках или снимайте на телефон\n7. Зафиксируйте в акте приёма КАЖДОЕ повреждение",
              en: "1. Photograph EVERY angle of the car — front, rear, 2 sides\n2. Check all 4 alloys — for scratches and cracks\n3. Windscreen — micro-cracks are visible in sunlight at an angle\n4. Mirrors — scratches and cover integrity\n5. Bumpers — lower section is often scuffed\n6. Roof — stand on tiptoes or take a phone photo\n7. Record EVERY damage in the handover document",
              de: "1. Fotografieren Sie JEDEN Winkel des Autos — vorne, hinten, 2 Seiten\n2. Alle 4 Felgen prüfen — auf Kratzer und Risse\n3. Windschutzscheibe — Mikrorisse sind in der Sonne im Winkel sichtbar\n4. Spiegel — Kratzer und Deckelintegrität\n5. Stoßstangen — Unterseite ist oft abgescheuert\n6. Dach — auf Zehenspitzen stehen oder mit dem Telefon fotografieren\n7. JEDEN Schaden im Übergabeprotokoll festhalten"
            }
          }
        ]
      },
      {
        type: "image", align: "right",
        media: "https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=2070",
        widthPercent: 50,
        children: [
          { type: "heading", align: "left", content: { uk: "Внутрішній огляд та технічна перевірка (5 пунктів)", ru: "Внутренний осмотр и техническая проверка (5 пунктов)", en: "Interior check and technical inspection (5 points)", de: "Inneninspektion und technische Prüfung (5 Punkte)" } },
          {
            type: "list", align: "left",
            content: {
              uk: "8. Рівень пального — має бути повний бак. Відразу при виїзді\n9. Навігація та мультимедіа — перевірте чи все вмикається\n10. Кондиціонер — увімкніть і перевірте всі виходи\n11. Акумулятор — не повинно бути жодних помаранчевих індикаторів\n12. Зарядник USB — перевірте обидва USB-порти телефоном",
              ru: "8. Уровень топлива — должен быть полный бак. Сразу при выезде\n9. Навигация и мультимедиа — проверьте включается ли всё\n10. Кондиционер — включите и проверьте все выходы\n11. Аккумулятор — не должно быть никаких оранжевых индикаторов\n12. Зарядник USB — проверьте оба USB-порта телефоном",
              en: "8. Fuel level — should be a full tank. Check right when you pick up\n9. Navigation and multimedia — check everything switches on\n10. Air conditioning — turn on and test all vents\n11. Battery — no orange indicator lights should be on\n12. USB charger — test both USB ports with your phone",
              de: "8. Kraftstoffstand — sollte ein voller Tank sein. Sofort bei der Abholung prüfen\n9. Navigation und Multimedia — prüfen ob alles einschaltet\n10. Klimaanlage — einschalten und alle Lüftungsöffnungen testen\n11. Batterie — keine orangen Kontrollleuchten sollten leuchten\n12. USB-Ladegerät — beide USB-Anschlüsse mit dem Telefon testen"
            }
          }
        ]
      }
    ]
  },
  {
    slug: "economy-vs-suv-which-to-choose",
    mainImage: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=2070",
    title: { uk: "Economy vs SUV: яке авто орендувати для вашого маршруту", ru: "Economy vs SUV: какое авто арендовать для вашего маршрута", en: "Economy vs SUV: which car to rent for your route", de: "Economy vs SUV: welches Auto für Ihre Route mieten" },
    subtitle: { uk: "Розбираємо 6 типових ситуацій і даємо чесну рекомендацію — без маркетингу", ru: "Разбираем 6 типичных ситуаций и даём честную рекомендацию — без маркетинга", en: "Breaking down 6 typical situations and giving an honest recommendation — no marketing spin", de: "6 typische Situationen analysiert mit ehrlicher Empfehlung — ohne Marketing" },
    content: [
      {
        type: "heading", align: "left",
        content: { uk: "Нас часто запитують: «чи варто переплачувати за SUV?» Відповідь залежить від маршруту", ru: "Нас часто спрашивают: «стоит ли переплачивать за SUV?» Ответ зависит от маршрута", en: "We're often asked: 'is it worth paying extra for an SUV?' The answer depends on the route", de: "Wir werden oft gefragt: 'Lohnt es sich für ein SUV mehr zu bezahlen?' Die Antwort hängt von der Route ab" }
      },
      {
        type: "image", align: "left",
        media: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070",
        widthPercent: 50,
        children: [
          { type: "heading", align: "left", content: { uk: "Economy — правильний вибір коли:", ru: "Economy — правильный выбор когда:", en: "Economy — right choice when:", de: "Economy — richtige Wahl wenn:" } },
          {
            type: "list", align: "left",
            content: {
              uk: "Їдете тільки містом і асфальтом\nПоїздка 1–2 доби і мета — просто доїхати\nЄ 1–2 пасажири і мінімум багажу\nБюджет обмежений — різниця суттєва\nПаркуєтеся в центрі або на підземному паркінгу\nПлануєте часто заправлятися — Economy п'є вдвічі менше",
              ru: "Едете только городом и асфальтом\nПоездка 1–2 суток и цель — просто доехать\nЕсть 1–2 пассажира и минимум багажа\nБюджет ограничен — разница существенна\nПаркуетесь в центре или на подземном паркинге\nПланируете часто заправляться — Economy пьёт вдвое меньше",
              en: "You're driving city roads only\nTrip of 1–2 days with the sole goal of getting there\nYou have 1–2 passengers and minimal luggage\nBudget is tight — the difference is significant\nYou're parking in the centre or underground\nYou plan to fill up often — Economy uses half the fuel",
              de: "Sie fahren nur auf Stadt- und Asphaltstraßen\nReise von 1–2 Tagen und Ziel ist nur anzukommen\nSie haben 1–2 Passagiere und minimales Gepäck\nBudget ist begrenzt — der Unterschied ist erheblich\nSie parken im Zentrum oder im Untergeschoss\nSie planen häufig zu tanken — Economy verbraucht halb so viel"
            }
          }
        ]
      },
      {
        type: "image", align: "right",
        media: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2070",
        widthPercent: 50,
        children: [
          { type: "heading", align: "left", content: { uk: "SUV — правильний вибір коли:", ru: "SUV — правильный выбор когда:", en: "SUV — right choice when:", de: "SUV — richtige Wahl wenn:" } },
          {
            type: "list", align: "left",
            content: {
              uk: "Карпати, Полісся або інші нерівні дороги\nСім'я 4+ осіб або 2+ валізи в багажнику\nПоїздка 3+ доби — комфорт на трасі вартий різниці\nВелика компанія де потрібен простір ззаду\nЗима або міжсезоння на гірських дорогах — тільки SUV\nВи хочете просто їхати в задоволення а не терпіти",
              ru: "Карпаты, Полесье или другие неровные дороги\nСемья 4+ человек или 2+ чемодана в багажнике\nПоездка 3+ суток — комфорт на трассе стоит разницы\nБольшая компания где нужно пространство сзади\nЗима или межсезонье на горных дорогах — только SUV\nВы хотите просто ехать в удовольствие а не терпеть",
              en: "Carpathians, Polisia or other uneven roads\nFamily of 4+ or 2+ suitcases in the boot\nTrip of 3+ days — highway comfort is worth the difference\nA large group where rear space is needed\nWinter or shoulder season on mountain roads — SUV only\nYou want to enjoy the drive rather than endure it",
              de: "Karpaten, Polissja oder andere unebene Straßen\nFamilie mit 4+ Personen oder 2+ Koffer im Kofferraum\nReise von 3+ Tagen — Autobahnkomfort ist den Aufpreis wert\nEine große Gruppe bei der hinten Platz gebraucht wird\nWinter oder Nebensaison auf Bergstraßen — nur SUV\nSie wollen die Fahrt genießen statt sie zu ertragen"
            }
          }
        ]
      }
    ]
  }
];

// ═══════════════════════════════════════════════════════════
// ABOUT PAGE (route: "about" = tab "garage")
// ═══════════════════════════════════════════════════════════
const aboutPage: PageContent = {
  routeKey: "about",
  content: [
    {
      type: "heading", align: "left",
      content: { uk: "DrivePoint — прокат авто без обіцянок які не виконуються", ru: "DrivePoint — прокат авто без обещаний которые не выполняются", en: "DrivePoint — car rental without promises that don't get kept", de: "DrivePoint — Autovermietung ohne Versprechen die nicht gehalten werden" }
    },
    {
      type: "paragraph", align: "left",
      content: {
        uk: "Ми заснували DrivePoint у 2017 році після того як самі мали неприємний досвід оренди авто: брудне авто «зі слідами ремонту», прихована комісія за «обробку», і неможливість отримати допомогу о 2 ночі. Вирішили що так не має бути — і побудували компанію де кожна обіцянка виконується.",
        ru: "Мы основали DrivePoint в 2017 году после того как сами имели неприятный опыт аренды авто: грязное авто «со следами ремонта», скрытая комиссия за «обработку», и невозможность получить помощь в 2 ночи. Решили что так не должно быть — и построили компанию где каждое обещание выполняется.",
        en: "We founded DrivePoint in 2017 after having an unpleasant car rental experience ourselves: a dirty car 'with traces of repair', a hidden 'processing' fee, and no way to get help at 2am. We decided this isn't how it should be — and built a company where every promise is kept.",
        de: "Wir gründeten DrivePoint im Jahr 2017 nachdem wir selbst eine unangenehme Autovermietungserfahrung gemacht hatten: ein dreckiges Auto 'mit Spuren einer Reparatur', eine versteckte 'Bearbeitungsgebühr' und keine Möglichkeit um 2 Uhr nachts Hilfe zu bekommen. Wir entschieden dass das nicht so sein sollte — und bauten ein Unternehmen wo jedes Versprechen gehalten wird."
      }
    },
    {
      type: "image", align: "left",
      media: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2070",
      widthPercent: 50,
      children: [
        { type: "heading", align: "left", content: { uk: "DrivePoint у цифрах", ru: "DrivePoint в цифрах", en: "DrivePoint by the numbers", de: "DrivePoint in Zahlen" } },
        {
          type: "list", align: "left",
          content: {
            uk: "120+ автомобілів в парку\n14 000+ успішних оренд\nСередній вік авто — 2.3 роки\nКлієнти з 18 країн\nNPS клієнтів — 71\nРейтинг Google: 4.8/5 (520+ відгуків)\n5 міст присутності",
            ru: "120+ автомобилей в парке\n14 000+ успешных аренд\nСредний возраст авто — 2.3 года\nКлиенты из 18 стран\nNPS клиентов — 71\nРейтинг Google: 4.8/5 (520+ отзывов)\n5 городов присутствия",
            en: "120+ cars in the fleet\n14,000+ successful rentals\nAverage car age — 2.3 years\nClients from 18 countries\nClient NPS — 71\nGoogle rating: 4.8/5 (520+ reviews)\n5 cities of presence",
            de: "120+ Autos in der Flotte\n14.000+ erfolgreiche Vermietungen\nDurchschnittliches Fahrzeugalter — 2,3 Jahre\nKunden aus 18 Ländern\nKunden-NPS — 71\nGoogle-Bewertung: 4,8/5 (520+ Bewertungen)\n5 Präsenzstädte"
          }
        }
      ]
    },
    {
      type: "image", align: "right",
      media: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=2070",
      widthPercent: 50,
      children: [
        { type: "heading", align: "left", content: { uk: "Як ми готуємо авто до кожної оренди", ru: "Как мы готовим авто к каждой аренде", en: "How we prepare every car for rental", de: "Wie wir jedes Auto für die Vermietung vorbereiten" } },
        {
          type: "list", align: "left",
          content: {
            uk: "Зовнішня мийка + мийка під тиском колісних арок\nПолірування кузова що 2 тижні\nПрибирання салону з дезінфекцією\nПеревірка рівня масла, тосолу, гальмівної рідини\nПеревірка тиску в усіх 4 шинах\nПеревірка роботи всіх фар та поворотників\nЗаправка до повного бака\nЦифрова фіксація стану авто — фото 360°",
            ru: "Внешняя мойка + мойка под давлением колёсных арок\nПолировка кузова раз в 2 недели\nУборка салона с дезинфекцией\nПроверка уровня масла, тосола, тормозной жидкости\nПроверка давления во всех 4 шинах\nПроверка работы всех фар и поворотников\nЗаправка до полного бака\nЦифровая фиксация состояния авто — фото 360°",
            en: "Exterior wash + pressure wash of wheel arches\nBodywork polish every 2 weeks\nInterior cleaning with disinfection\nOil, coolant, brake fluid level check\nAll 4 tyre pressure check\nAll lights and indicators function check\nFuelling to a full tank\nDigital condition log — 360° photos",
            de: "Außenwäsche + Hochdruckreinigung der Radkästen\nKarosseriepolitur alle 2 Wochen\nInnenraumreinigung mit Desinfektion\nÖl-, Kühlmittel-, Bremsflüssigkeitsstand prüfen\nReifendruck aller 4 Reifen prüfen\nFunktion aller Lichter und Blinker prüfen\nAuftanken bis voll\nDigitale Zustandserfassung — 360°-Fotos"
          }
        }
      ]
    },
    {
      type: "heading", align: "center",
      content: { uk: "Як забронювати авто за 3 хвилини", ru: "Как забронировать авто за 3 минуты", en: "How to book a car in 3 minutes", de: "Wie man ein Auto in 3 Minuten bucht" }
    },
    {
      type: "list", align: "left",
      content: {
        uk: "1. Оберіть клас авто та дати на сайті або у месенджері\n2. Вкажіть місце отримання: наш офіс, аеропорт, готель або ваша адреса\n3. Підтвердіть бронювання — ми надішлемо підтвердження на email\n4. У день оренди — пред'явіть паспорт та посвідчення водія\n5. Підпишіть договір, отримайте ключі — і в дорогу",
        ru: "1. Выберите класс авто и даты на сайте или в мессенджере\n2. Укажите место получения: наш офис, аэропорт, отель или ваш адрес\n3. Подтвердите бронирование — мы пришлём подтверждение на email\n4. В день аренды — предъявите паспорт и водительские права\n5. Подпишите договор, получите ключи — и в путь",
        en: "1. Choose the car class and dates on the website or messenger\n2. Specify the pickup location: our office, airport, hotel or your address\n3. Confirm the booking — we'll send a confirmation to your email\n4. On the rental day — present your passport and driving licence\n5. Sign the contract, get the keys — and off you go",
        de: "1. Wählen Sie die Fahrzeugklasse und Daten auf der Website oder im Messenger\n2. Abholort angeben: unser Büro, Flughafen, Hotel oder Ihre Adresse\n3. Buchung bestätigen — wir senden eine Bestätigung an Ihre E-Mail\n4. Am Miettag — Reisepass und Führerschein vorlegen\n5. Vertrag unterschreiben, Schlüssel erhalten — und los geht's"
      }
    }
  ]
};

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

    console.log("\n🎉 DrivePoint — all data uploaded successfully!");
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