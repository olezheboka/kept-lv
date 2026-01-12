import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });
config({ path: ".env" });

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

// Map mock status to Prisma enum
function mapStatus(status: string) {
  const statusMap: Record<string, "KEPT" | "NOT_KEPT" | "IN_PROGRESS" | "ABANDONED" | "PARTIAL"> = {
    'kept': 'KEPT',
    'broken': 'NOT_KEPT',
    'in-progress': 'IN_PROGRESS',
    'partially-kept': 'PARTIAL',
    'not-rated': 'IN_PROGRESS',
  };
  return statusMap[status] || 'IN_PROGRESS';
}

// Map mock category to slug
function getCategorySlug(category: string) {
  const categoryMap: Record<string, string> = {
    'economy-finance': 'economy',
    'healthcare': 'healthcare',
    'education-science': 'education',
    'defense-security': 'security',
    'foreign-affairs': 'foreign-affairs',
    'social-welfare': 'social-welfare',
    'environment-energy': 'environment',
    'transport-infrastructure': 'infrastructure',
    'justice-law': 'justice',
    'culture-heritage': 'culture',
    'agriculture-rural': 'agriculture',
    'digital-technology': 'digital',
    'housing-regional': 'regional',
    'youth-sports': 'youth',
  };
  return categoryMap[category] || 'economy';
}

async function main() {
  console.log("Seeding database with all mock data...");

  // Create admin user
  const adminPassword = await hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@kept.lv" },
    update: {},
    create: {
      email: "admin@kept.lv",
      passwordHash: adminPassword,
      name: "Admin",
      role: "ADMIN",
    },
  });
  console.log("Created admin user:", admin.email);

  // Create all categories (14 total)
  const categoriesData = [
    { slug: "economy", name: { lv: "Ekonomika un finanses", en: "Economy & Finance", ru: "Экономика и финансы" }, color: "from-blue-500 to-blue-600" },
    { slug: "healthcare", name: { lv: "Veselības aprūpe", en: "Healthcare", ru: "Здравоохранение" }, color: "from-pink-500 to-rose-600" },
    { slug: "education", name: { lv: "Izglītība un zinātne", en: "Education & Science", ru: "Образование и наука" }, color: "from-purple-500 to-violet-600" },
    { slug: "security", name: { lv: "Aizsardzība un drošība", en: "Defense & Security", ru: "Оборона и безопасность" }, color: "from-red-500 to-orange-600" },
    { slug: "foreign-affairs", name: { lv: "Ārlietas", en: "Foreign Affairs", ru: "Внешняя политика" }, color: "from-indigo-500 to-blue-600" },
    { slug: "social-welfare", name: { lv: "Sociālā labklājība", en: "Social Welfare", ru: "Социальное обеспечение" }, color: "from-amber-500 to-yellow-600" },
    { slug: "environment", name: { lv: "Vide un enerģētika", en: "Environment & Energy", ru: "Окружающая среда и энергетика" }, color: "from-green-500 to-emerald-600" },
    { slug: "infrastructure", name: { lv: "Satiksme un infrastruktūra", en: "Transport & Infrastructure", ru: "Транспорт и инфраструктура" }, color: "from-cyan-500 to-teal-600" },
    { slug: "justice", name: { lv: "Tieslietas un korupcijas apkarošana", en: "Justice & Anti-Corruption", ru: "Правосудие и борьба с коррупцией" }, color: "from-slate-500 to-gray-600" },
    { slug: "culture", name: { lv: "Kultūra un mantojums", en: "Culture & Heritage", ru: "Культура и наследие" }, color: "from-fuchsia-500 to-pink-600" },
    { slug: "agriculture", name: { lv: "Lauksaimniecība", en: "Agriculture", ru: "Сельское хозяйство" }, color: "from-lime-500 to-green-600" },
    { slug: "digital", name: { lv: "Tehnoloģijas un inovācijas", en: "Technology & Innovation", ru: "Технологии и инновации" }, color: "from-violet-500 to-purple-600" },
    { slug: "regional", name: { lv: "Reģionāla attīstība", en: "Regional Development", ru: "Региональное развитие" }, color: "from-orange-500 to-amber-600" },
    { slug: "youth", name: { lv: "Jaunatne un sports", en: "Youth & Sports", ru: "Молодежь и спорт" }, color: "from-sky-500 to-cyan-600" },
  ];

  const categories: Record<string, { id: string }> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, color: cat.color },
      create: cat,
    });
    categories[cat.slug] = created;
  }
  console.log("Created categories:", Object.keys(categories).length);

  // Create all parties (9 total)
  const partiesData = [
    { slug: "jv", name: { lv: "Jaunā Vienotība", en: "New Unity", ru: "Новое Единство" }, color: "#8AB73E", logoUrl: "/logos/jv.png" },
    { slug: "zzs", name: { lv: "Zaļo un Zemnieku savienība", en: "Union of Greens and Farmers", ru: "Союз зелёных и крестьян" }, color: "#026036", logoUrl: "/logos/zzs.png" },
    { slug: "na", name: { lv: "Nacionālā apvienība", en: "National Alliance", ru: "Национальное объединение" }, color: "#932330", logoUrl: "/logos/na.png" },
    { slug: "ap", name: { lv: "Attīstībai/Par!", en: "Development/For!", ru: "Развитие/За!" }, color: "#000000", logoUrl: "/logos/ap.png" },
    { slug: "prog", name: { lv: "Progresīvie", en: "Progressives", ru: "Прогрессивные" }, color: "#E63915", logoUrl: "/logos/prog.png" },
    { slug: "lra", name: { lv: "Latvijas Reģionu apvienība", en: "Latvian Regions Association", ru: "Объединение регионов Латвии" }, color: "#982632", logoUrl: "/logos/lra.png" },
    { slug: "stab", name: { lv: "Stabilitātei!", en: "For Stability!", ru: "За стабильность!" }, color: "#fd7e14", logoUrl: "/logos/stab.png" },
    { slug: "lpv", name: { lv: "Latvija pirmajā vietā", en: "Latvia First", ru: "Латвия на первом месте" }, color: "#9E3139", logoUrl: "/logos/lpv.png" },
    { slug: "sask", name: { lv: "Saskaņa", en: "Harmony", ru: "Согласие" }, color: "#E31D23", logoUrl: "/logos/sask.png" },
  ];

  const parties: Record<string, { id: string }> = {};
  for (const party of partiesData) {
    const created = await prisma.party.upsert({
      where: { slug: party.slug },
      update: { name: party.name, color: party.color, logoUrl: party.logoUrl },
      create: party,
    });
    parties[party.slug] = created;
  }
  console.log("Created parties:", Object.keys(parties).length);

  // Create all politicians (10 total)
  const politiciansData = [
    { slug: "evika-silina", name: "Evika Siliņa", bio: { lv: "Ministru prezidente", en: "Prime Minister of Latvia since 2023", ru: "Премьер-министр Латвии с 2023 года" }, partySlug: "jv" },
    { slug: "arvils-aseradens", name: "Arvils Ašeradens", bio: { lv: "Ekonomikas ministrs", en: "Minister of Economics", ru: "Министр экономики" }, partySlug: "jv" },
    { slug: "anda-caksa", name: "Anda Čakša", bio: { lv: "Izglītības un zinātnes ministre", en: "Minister of Education and Science", ru: "Министр образования и науки" }, partySlug: "jv" },
    { slug: "andris-spruds", name: "Andris Sprūds", bio: { lv: "Aizsardzības ministrs", en: "Minister of Defense", ru: "Министр обороны" }, partySlug: "prog" },
    { slug: "baiba-braze", name: "Baiba Braže", bio: { lv: "Ārlietu ministre", en: "Minister of Foreign Affairs", ru: "Министр иностранных дел" }, partySlug: "jv" },
    { slug: "hosams-abu-meri", name: "Hosams Abu Meri", bio: { lv: "Veselības ministrs", en: "Minister of Health", ru: "Министр здравоохранения" }, partySlug: "jv" },
    { slug: "raimonds-bergmanis", name: "Raimonds Bergmanis", bio: { lv: "Saeimas deputāts", en: "Member of Parliament", ru: "Депутат Сейма" }, partySlug: "zzs" },
    { slug: "raivis-dzintars", name: "Raivis Dzintars", bio: { lv: "Nacionālās apvienības līderis", en: "Leader of National Alliance", ru: "Лидер Национального объединения" }, partySlug: "na" },
    { slug: "agnese-logina", name: "Agnese Logina", bio: { lv: "Saeimas deputāte", en: "Member of Parliament", ru: "Депутат Сейма" }, partySlug: "prog" },
    { slug: "edvards-smiltens", name: "Edvards Smiltēns", bio: { lv: "Saeimas priekšsēdētājs", en: "Speaker of Parliament", ru: "Председатель Сейма" }, partySlug: "na" },
  ];

  const politicians: Record<string, { id: string }> = {};
  for (const pol of politiciansData) {
    const created = await prisma.politician.upsert({
      where: { slug: pol.slug },
      update: { name: pol.name, bio: pol.bio },
      create: {
        slug: pol.slug,
        name: pol.name,
        bio: pol.bio,
        partyId: parties[pol.partySlug].id,
      },
    });
    politicians[pol.slug] = created;
  }
  console.log("Created politicians:", Object.keys(politicians).length);

  // Create all promises (18 total) - first delete existing to avoid duplicates
  await prisma.source.deleteMany({});
  await prisma.evidence.deleteMany({});
  await prisma.promise.deleteMany({});

  const promisesData = [
    {
      text: { lv: "Paaugstināt skolotāju algas par 20% līdz 2025. gadam", en: "Raise teacher salaries by 20% by 2025", ru: "Повысить зарплаты учителей на 20% к 2025 году" },
      status: "in-progress" as const,
      explanation: { lv: "Valdība ir īstenojusi 10% palielinājumu no 2024. gada janvāra, vēl 10% plānots 2025. gada budžetā.", en: "Government implemented 10% increase from January 2024, another 10% planned in 2025 budget.", ru: "Правительство ввело увеличение на 10% с января 2024 года, еще 10% планируется в бюджете 2025 года." },
      dateOfPromise: new Date("2022-09-15"),
      politicianSlug: "anda-caksa",
      categorySlug: "education",
    },
    {
      text: { lv: "Sasniegt 2.5% no IKP aizsardzības izdevumiem", en: "Achieve 2.5% of GDP for defense spending", ru: "Достичь 2,5% ВВП на расходы на оборону" },
      status: "kept" as const,
      explanation: { lv: "Latvija 2024. gadā sasniedza 2.4% no IKP aizsardzībai un 2025. gada budžetā apstiprināja 2.5% mērķi.", en: "Latvia reached 2.4% of GDP for defense in 2024 and approved 2.5% target in 2025 budget.", ru: "Латвия достигла 2,4% ВВП на оборону в 2024 году и утвердила цель в 2,5% в бюджете 2025 года." },
      dateOfPromise: new Date("2023-01-20"),
      politicianSlug: "andris-spruds",
      categorySlug: "security",
    },
    {
      text: { lv: "Ieviest ģimenes ārstu pieejamību 48 stundu laikā", en: "Ensure family doctor availability within 48 hours", ru: "Обеспечить доступ к семейному врачу в течение 48 часов" },
      status: "broken" as const,
      explanation: { lv: "Neskatoties uz reformām, vidējais gaidīšanas laiks joprojām pārsniedz 5 darba dienas lielākajā daļā reģionu.", en: "Despite reforms, average waiting time still exceeds 5 business days in most regions.", ru: "Несмотря на реформы, среднее время ожидания все еще превышает 5 рабочих дней в большинстве регионов." },
      dateOfPromise: new Date("2022-10-01"),
      politicianSlug: "hosams-abu-meri",
      categorySlug: "healthcare",
    },
    {
      text: { lv: "Rail Baltica pabeigšana līdz 2030. gadam", en: "Complete Rail Baltica by 2030", ru: "Завершить Rail Baltica к 2030 году" },
      status: "in-progress" as const,
      explanation: { lv: "Būvdarbi turpinās, bet projekts saskaras ar kavējumiem un budžeta pārsniegumiem.", en: "Construction continues but project faces delays and budget overruns.", ru: "Строительство продолжается, но проект сталкивается с задержками и перерасходом бюджета." },
      dateOfPromise: new Date("2023-03-15"),
      politicianSlug: "evika-silina",
      categorySlug: "infrastructure",
    },
    {
      text: { lv: "Samazināt PVN pārtikas produktiem līdz 5%", en: "Reduce VAT on food products to 5%", ru: "Снизить НДС на продукты питания до 5%" },
      status: "partially-kept" as const,
      explanation: { lv: "PVN samazināts līdz 12% noteiktiem produktiem, bet pilnīgs 5% samazinājums nav ieviests.", en: "VAT reduced to 12% for certain products, but full 5% reduction not implemented.", ru: "НДС снижен до 12% для определенных продуктов, но полное снижение до 5% не внедрено." },
      dateOfPromise: new Date("2022-08-20"),
      politicianSlug: "arvils-aseradens",
      categorySlug: "economy",
    },
    {
      text: { lv: "Izveidot 10,000 jaunas bērnudārza vietas", en: "Create 10,000 new kindergarten places", ru: "Создать 10 000 новых мест в детских садах" },
      status: "in-progress" as const,
      explanation: { lv: "Izveidotas 4,200 jaunas vietas. Programma turpinās, bet temps ir lēnāks nekā plānots.", en: "Created 4,200 new places. Program continues but pace is slower than planned.", ru: "Создано 4200 новых мест. Программа продолжается, но темпы медленнее запланированных." },
      dateOfPromise: new Date("2022-10-10"),
      politicianSlug: "anda-caksa",
      categorySlug: "education",
    },
    {
      text: { lv: "Panākt 50% atjaunojamās enerģijas īpatsvaru", en: "Achieve 50% renewable energy share", ru: "Достичь 50% доли возобновляемой энергии" },
      status: "in-progress" as const,
      explanation: { lv: "Pašreizējais līmenis ir aptuveni 42%. Vairāki vēja parku projekti ir izstrādes stadijā.", en: "Current level is approximately 42%. Several wind farm projects are in development.", ru: "Текущий уровень составляет примерно 42%. Несколько проектов ветропарков находятся в разработке." },
      dateOfPromise: new Date("2023-06-01"),
      politicianSlug: "evika-silina",
      categorySlug: "environment",
    },
    {
      text: { lv: "Palielināt minimālo algu līdz 700 EUR", en: "Increase minimum wage to €700", ru: "Увеличить минимальную зарплату до 700 евро" },
      status: "kept" as const,
      explanation: { lv: "Minimālā alga palielināta līdz 700 EUR no 2024. gada 1. janvāra.", en: "Minimum wage increased to €700 from January 1, 2024.", ru: "Минимальная зарплата увеличена до 700 евро с 1 января 2024 года." },
      dateOfPromise: new Date("2022-09-01"),
      politicianSlug: "arvils-aseradens",
      categorySlug: "economy",
    },
    {
      text: { lv: "Ieviest e-veselības karti visiem iedzīvotājiem", en: "Introduce e-health card for all residents", ru: "Ввести электронную карту здоровья для всех жителей" },
      status: "in-progress" as const,
      explanation: { lv: "Sistēma ir izstrādes stadijā. Pilotprojekts sākts Rīgā ar 50,000 lietotājiem.", en: "System is in development. Pilot project started in Riga with 50,000 users.", ru: "Система находится в разработке. Пилотный проект запущен в Риге с 50 000 пользователей." },
      dateOfPromise: new Date("2023-02-15"),
      politicianSlug: "hosams-abu-meri",
      categorySlug: "digital",
    },
    {
      text: { lv: "Cīņa pret korupciju - KNAB budžeta dubultošana", en: "Fight corruption - double KNAB budget", ru: "Борьба с коррупцией - удвоить бюджет KNAB" },
      status: "partially-kept" as const,
      explanation: { lv: "KNAB budžets palielināts par 40%, bet ne dubultots.", en: "KNAB budget increased by 40%, but not doubled.", ru: "Бюджет KNAB увеличен на 40%, но не удвоен." },
      dateOfPromise: new Date("2022-08-30"),
      politicianSlug: "raivis-dzintars",
      categorySlug: "justice",
    },
    {
      text: { lv: "Nodrošināt 100% valsts valodas prasmi skolās", en: "Ensure 100% state language proficiency in schools", ru: "Обеспечить 100% владение государственным языком в школах" },
      status: "kept" as const,
      explanation: { lv: "Reforma pilnībā ieviesta. Kopš 2024./2025. mācību gada visas skolas strādā latviešu valodā.", en: "Reform fully implemented. Since 2024/2025 academic year all schools operate in Latvian.", ru: "Реформа полностью внедрена. С 2024/2025 учебного года все школы работают на латышском языке." },
      dateOfPromise: new Date("2022-07-15"),
      politicianSlug: "raivis-dzintars",
      categorySlug: "education",
    },
    {
      text: { lv: "Izveidot atbalsta programmu jaunajiem lauksaimniekiem", en: "Create support program for young farmers", ru: "Создать программу поддержки молодых фермеров" },
      status: "kept" as const,
      explanation: { lv: "Programma 'Jaunais lauksaimnieks' darbojas ar kopējo finansējumu 15 milj. EUR.", en: "The 'Young Farmer' program operates with total funding of €15 million.", ru: "Программа 'Молодой фермер' действует с общим финансированием 15 млн евро." },
      dateOfPromise: new Date("2022-09-25"),
      politicianSlug: "raimonds-bergmanis",
      categorySlug: "agriculture",
    },
    {
      text: { lv: "Pensiju indeksācija virs inflācijas līmeņa", en: "Pension indexation above inflation", ru: "Индексация пенсий выше уровня инфляции" },
      status: "broken" as const,
      explanation: { lv: "Pensiju indeksācija 2024. gadā bija zemāka par inflāciju.", en: "Pension indexation in 2024 was below inflation.", ru: "Индексация пенсий в 2024 году была ниже инфляции." },
      dateOfPromise: new Date("2023-09-15"),
      politicianSlug: "evika-silina",
      categorySlug: "social-welfare",
    },
    {
      text: { lv: "Atcelt obligāto militāro dienestu", en: "Cancel mandatory military service", ru: "Отменить обязательную военную службу" },
      status: "broken" as const,
      explanation: { lv: "Saeima 2024. gadā apstiprināja Valsts aizsardzības dienesta likumu ar obligāto militāro dienestu no 2027. gada.", en: "Parliament approved the National Defense Service law with mandatory military service from 2027.", ru: "Парламент утвердил закон о государственной службе обороны с обязательной военной службой с 2027 года." },
      dateOfPromise: new Date("2022-08-15"),
      politicianSlug: "agnese-logina",
      categorySlug: "security",
    },
    {
      text: { lv: "Investēt 1 miljardu EUR reģionu attīstībā", en: "Invest €1 billion in regional development", ru: "Инвестировать 1 миллиард евро в развитие регионов" },
      status: "in-progress" as const,
      explanation: { lv: "Līdz šim investēti aptuveni 320 milj. EUR.", en: "Approximately €320 million invested so far.", ru: "На данный момент инвестировано около 320 млн евро." },
      dateOfPromise: new Date("2023-05-20"),
      politicianSlug: "evika-silina",
      categorySlug: "regional",
    },
    {
      text: { lv: "Atvērt Latvijas tirgu Ukrainas precēm", en: "Open Latvian market to Ukrainian goods", ru: "Открыть латвийский рынок для украинских товаров" },
      status: "kept" as const,
      explanation: { lv: "Latvija aktīvi atbalsta Ukrainas ES kandidātvalsts statusu.", en: "Latvia actively supports Ukraine's EU candidate status.", ru: "Латвия активно поддерживает статус Украины как кандидата в ЕС." },
      dateOfPromise: new Date("2022-11-01"),
      politicianSlug: "baiba-braze",
      categorySlug: "foreign-affairs",
    },
    {
      text: { lv: "Nodrošināt bezmaksas ēdināšanu visiem skolēniem", en: "Provide free meals to all students", ru: "Обеспечить бесплатное питание всем школьникам" },
      status: "partially-kept" as const,
      explanation: { lv: "Bezmaksas ēdināšana pieejama 1.-4. klašu skolēniem.", en: "Free meals available for grades 1-4 students.", ru: "Бесплатное питание доступно для учеников 1-4 классов." },
      dateOfPromise: new Date("2022-10-20"),
      politicianSlug: "anda-caksa",
      categorySlug: "education",
    },
    {
      text: { lv: "Digitalizēt 100% valsts pakalpojumus", en: "Digitize 100% of government services", ru: "Оцифровать 100% государственных услуг" },
      status: "in-progress" as const,
      explanation: { lv: "Aptuveni 75% valsts pakalpojumu pieejami digitāli.", en: "Approximately 75% of government services available digitally.", ru: "Примерно 75% государственных услуг доступны в цифровом виде." },
      dateOfPromise: new Date("2023-01-10"),
      politicianSlug: "evika-silina",
      categorySlug: "digital",
    },
  ];

  for (const promise of promisesData) {
    await prisma.promise.create({
      data: {
        text: promise.text,
        status: mapStatus(promise.status),
        explanation: promise.explanation,
        dateOfPromise: promise.dateOfPromise,
        politicianId: politicians[promise.politicianSlug].id,
        categoryId: categories[promise.categorySlug].id,
      },
    });
  }
  console.log("Created promises:", promisesData.length);

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
