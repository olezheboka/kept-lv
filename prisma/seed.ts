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
    { slug: "economy", name: { lv: "Ekonomika un finanses", en: "Economy & Finance", ru: "Экономика и финансы" }, color: "from-blue-500 to-blue-600", icon: "PiggyBank" },
    { slug: "healthcare", name: { lv: "Veselības aprūpe", en: "Healthcare", ru: "Здравоохранение" }, color: "from-pink-500 to-rose-600", icon: "Stethoscope" },
    { slug: "education", name: { lv: "Izglītība un zinātne", en: "Education & Science", ru: "Образование и наука" }, color: "from-purple-500 to-violet-600", icon: "GraduationCap" },
    { slug: "security", name: { lv: "Aizsardzība un drošība", en: "Defense & Security", ru: "Оборона и безопасность" }, color: "from-red-500 to-orange-600", icon: "Shield" },
    { slug: "foreign-affairs", name: { lv: "Ārlietas", en: "Foreign Affairs", ru: "Внешняя политика" }, color: "from-indigo-500 to-blue-600", icon: "Globe" },
    { slug: "social-welfare", name: { lv: "Sociālā labklājība", en: "Social Welfare", ru: "Социальное обеспечение" }, color: "from-amber-500 to-yellow-600", icon: "HeartHandshake" },
    { slug: "environment", name: { lv: "Vide un enerģētika", en: "Environment & Energy", ru: "Окружающая среда и энергетика" }, color: "from-green-500 to-emerald-600", icon: "Leaf" },
    { slug: "infrastructure", name: { lv: "Satiksme un infrastruktūra", en: "Transport & Infrastructure", ru: "Транспорт и инфраструктура" }, color: "from-cyan-500 to-teal-600", icon: "Train" },
    { slug: "justice", name: { lv: "Tieslietas un korupcijas apkarošana", en: "Justice & Anti-Corruption", ru: "Правосудие и борьба с коррупцией" }, color: "from-slate-500 to-gray-600", icon: "Scale" },
    { slug: "culture", name: { lv: "Kultūra un mantojums", en: "Culture & Heritage", ru: "Культура и наследие" }, color: "from-fuchsia-500 to-pink-600", icon: "Palette" },
    { slug: "agriculture", name: { lv: "Lauksaimniecība", en: "Agriculture", ru: "Сельское хозяйство" }, color: "from-lime-500 to-green-600", icon: "Sprout" },
    { slug: "digital", name: { lv: "Tehnoloģijas un inovācijas", en: "Technology & Innovation", ru: "Технологии и инновации" }, color: "from-violet-500 to-purple-600", icon: "Cpu" },
    { slug: "regional", name: { lv: "Reģionāla attīstība", en: "Regional Development", ru: "Региональное развитие" }, color: "from-orange-500 to-amber-600", icon: "Map" },
    { slug: "youth", name: { lv: "Jaunatne un sports", en: "Youth & Sports", ru: "Молодежь и спорт" }, color: "from-sky-500 to-cyan-600", icon: "Users" },
  ];

  const categories: Record<string, { id: string }> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, color: cat.color, icon: cat.icon },
      create: cat,
    });
    categories[cat.slug] = created;
  }
  console.log("Created categories:", Object.keys(categories).length);

  // Create all parties (9 total)
  const partiesData = [
    {
      slug: "jv",
      name: { lv: "Jaunā Vienotība", en: "New Unity", ru: "Новое Единство" },
      description: { lv: "Liberāli konservatīva politiskā partija", en: "Liberal-conservative political party", ru: "Либерально-консервативная политическая партия" },
      color: "#8AB73E",
      logoUrl: "/logos/jv.png",
      websiteUrl: "https://jaunavienotiba.lv",
      isCoalition: true,
    },
    {
      slug: "zzs",
      name: { lv: "Zaļo un Zemnieku savienība", en: "Union of Greens and Farmers", ru: "Союз зелёных и крестьян" },
      description: { lv: "Centriska agrāra un zaļā politiskā apvienība", en: "Centrist agrarian and green political alliance", ru: "Центристский аграрный и зеленый политический союз" },
      color: "#026036",
      logoUrl: "/logos/zzs.png",
      websiteUrl: "https://zzs.lv",
      isCoalition: true,
    },
    {
      slug: "na",
      name: { lv: "Nacionālā apvienība", en: "National Alliance", ru: "Национальное объединение" },
      description: { lv: "Nacionāli konservatīva politiskā partija", en: "National-conservative political party", ru: "Национально-консервативная политическая партия" },
      color: "#932330",
      logoUrl: "/logos/na.png",
      websiteUrl: "https://nacionalaapvieniba.lv",
      isCoalition: false,
    },
    {
      slug: "ap",
      name: { lv: "Attīstībai/Par!", en: "Development/For!", ru: "Развитие/За!" },
      description: { lv: "Liberāla politiskā apvienība", en: "Liberal political alliance", ru: "Либеральный политический союз" },
      color: "#000000",
      logoUrl: "/logos/ap.png",
      websiteUrl: "https://attistibaipar.lv",
      isCoalition: false,
    },
    {
      slug: "prog",
      name: { lv: "Progresīvie", en: "Progressives", ru: "Прогрессивные" },
      description: { lv: "Sociāldemokrātiska, zaļa un progresīva partija", en: "Social democratic, green and progressive party", ru: "Социал-демократическая, зеленая и прогрессивная партия" },
      color: "#E63915",
      logoUrl: "/logos/prog.png",
      websiteUrl: "https://progresivie.lv",
      isCoalition: true,
    },
    {
      slug: "lra",
      name: { lv: "Latvijas Reģionu apvienība", en: "Latvian Regions Association", ru: "Объединение регионов Латвии" },
      description: { lv: "Centriska reģionālā partija", en: "Centrist regional party", ru: "Центристская региональная партия" },
      color: "#982632",
      logoUrl: "/logos/lra.png",
      websiteUrl: "https://latvijasregionuapvieniba.lv",
      isCoalition: false,
    },
    {
      slug: "stab",
      name: { lv: "Stabilitātei!", en: "For Stability!", ru: "За стабильность!" },
      description: { lv: "Populistiska politiskā partija", en: "Populist political party", ru: "Популистская политическая партия" },
      color: "#fd7e14",
      logoUrl: "/logos/stab.png",
      websiteUrl: "https://stabilitatei.lv",
      isCoalition: false,
    },
    {
      slug: "lpv",
      name: { lv: "Latvija pirmajā vietā", en: "Latvia First", ru: "Латвия на первом месте" },
      description: { lv: "Labēja populistiska partija", en: "Right-wing populist party", ru: "Правая популистская партия" },
      color: "#9E3139",
      logoUrl: "/logos/lpv.png",
      websiteUrl: "https://latvijapirmaja.lv",
      isCoalition: false,
    },
    {
      slug: "sask",
      name: { lv: "Saskaņa", en: "Harmony", ru: "Согласие" },
      description: { lv: "Sociāldemokrātiska partija", en: "Social democratic party", ru: "Социал-демократическая партия" },
      color: "#E31D23",
      logoUrl: "/logos/sask.png",
      websiteUrl: "https://saskana.eu",
      isCoalition: false,
    },
  ];

  const parties: Record<string, { id: string }> = {};
  for (const party of partiesData) {
    const created = await prisma.party.upsert({
      where: { slug: party.slug },
      update: {
        name: party.name,
        description: party.description,
        color: party.color,
        logoUrl: party.logoUrl,
        websiteUrl: party.websiteUrl,
        isCoalition: party.isCoalition,
      },
      create: party,
    });
    parties[party.slug] = created;
  }
  console.log("Created parties:", Object.keys(parties).length);

  // Create all politicians (10 total)
  const politiciansData = [
    { slug: "evika-silina", name: "Evika Siliņa", role: { lv: "Ministru prezidente", en: "Prime Minister", ru: "Премьер-министр" }, bio: { lv: "Latvijas Republikas Ministru prezidente kopš 2023. gada.", en: "Prime Minister of Latvia since 2023.", ru: "Премьер-министр Латвии с 2023 года." }, partySlug: "jv", isActive: true },
    { slug: "arvils-aseradens", name: "Arvils Ašeradens", role: { lv: "Ekonomikas ministrs", en: "Minister of Economics", ru: "Министр экономики" }, bio: { lv: "Ekonomikas ministrs, iepriekš Saeimas deputāts.", en: "Minister of Economics, former MP.", ru: "Министр экономики, ранее депутат Сейма." }, partySlug: "jv", isActive: true },
    { slug: "anda-caksa", name: "Anda Čakša", role: { lv: "Izglītības un zinātnes ministre", en: "Minister of Education and Science", ru: "Министр образования и науки" }, bio: { lv: "Izglītības un zinātnes ministre.", en: "Minister of Education and Science.", ru: "Министр образования и науки." }, partySlug: "jv", isActive: true },
    { slug: "andris-spruds", name: "Andris Sprūds", role: { lv: "Aizsardzības ministrs", en: "Minister of Defense", ru: "Министр обороны" }, bio: { lv: "Aizsardzības ministrs, profesors.", en: "Minister of Defense, professor.", ru: "Министр обороны, профессор." }, partySlug: "prog", isActive: true },
    { slug: "baiba-braze", name: "Baiba Braže", role: { lv: "Ārlietu ministre", en: "Minister of Foreign Affairs", ru: "Министр иностранных дел" }, bio: { lv: "Ārlietu ministre, diplomāte.", en: "Minister of Foreign Affairs, diplomat.", ru: "Министр иностранных дел, дипломат." }, partySlug: "jv", isActive: true },
    { slug: "hosams-abu-meri", name: "Hosams Abu Meri", role: { lv: "Veselības ministrs", en: "Minister of Health", ru: "Министр здравоохранения" }, bio: { lv: "Veselības ministrs, ārsts.", en: "Minister of Health, doctor.", ru: "Министр здравоохранения, врач." }, partySlug: "jv", isActive: true },
    { slug: "raimonds-bergmanis", name: "Raimonds Bergmanis", role: { lv: "Saeimas deputāts", en: "Member of Parliament", ru: "Депутат Сейма" }, bio: { lv: "Saeimas deputāts, bijušais aizsardzības ministrs.", en: "MP, former Minister of Defense.", ru: "Депутат Сейма, бывший министр обороны." }, partySlug: "zzs", isActive: true },
    { slug: "raivis-dzintars", name: "Raivis Dzintars", role: { lv: "NA priekšsēdētājs", en: "NA Chairman", ru: "Председатель НА" }, bio: { lv: "Nacionālās apvienības līderis.", en: "Leader of National Alliance.", ru: "Лидер Национального объединения." }, partySlug: "na", isActive: true },
    { slug: "agnese-logina", name: "Agnese Logina", role: { lv: "Saeimas deputāte", en: "Member of Parliament", ru: "Депутат Сейма" }, bio: { lv: "Saeimas deputāte, bijusī kultūras ministre.", en: "MP, former Minister of Culture.", ru: "Депутат Сейма, бывший министр культуры." }, partySlug: "prog", isActive: true },
    { slug: "edvards-smiltens", name: "Edvards Smiltēns", role: { lv: "Saeimas priekšsēdētāja biedrs", en: "Deputy Speaker of Parliament", ru: "Заместитель председателя Сейма" }, bio: { lv: "Saeimas sekretārs, bijušais spīkers.", en: "Parliament secretary, former speaker.", ru: "Секретарь Сейма, бывший спикер." }, partySlug: "na", isActive: true },
  ];

  const politicians: Record<string, { id: string }> = {};
  for (const pol of politiciansData) {
    const created = await prisma.politician.upsert({
      where: { slug: pol.slug },
      update: { name: pol.name, role: pol.role, bio: pol.bio, isActive: pol.isActive },
      create: {
        slug: pol.slug,
        name: pol.name,
        role: pol.role,
        bio: pol.bio,
        isActive: pol.isActive,
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
      title: { lv: "Paaugstināt skolotāju algas", en: "Raise teacher salaries", ru: "Повысить зарплаты учителей" },
      description: { lv: "Paaugstināt skolotāju algas par 20% līdz 2025. gadam", en: "Raise teacher salaries by 20% by 2025", ru: "Повысить зарплаты учителей на 20% к 2025 году" },
      status: "in-progress" as const,
      explanation: { lv: "Valdība ir īstenojusi 10% palielinājumu no 2024. gada janvāra, vēl 10% plānots 2025. gada budžetā.", en: "Government implemented 10% increase from January 2024, another 10% planned in 2025 budget.", ru: "Правительство ввело увеличение на 10% с января 2024 года, еще 10% планируется в бюджете 2025 года." },
      dateOfPromise: new Date("2022-09-15"),
      politicianSlug: "anda-caksa",
      categorySlug: "education",
    },
    {
      title: { lv: "2.5% no IKP aizsardzībai", en: "2.5% GDP for defense", ru: "2.5% ВВП на оборону" },
      description: { lv: "Sasniegt 2.5% no IKP aizsardzības izdevumiem", en: "Achieve 2.5% of GDP for defense spending", ru: "Достичь 2,5% ВВП на расходы на оборону" },
      status: "kept" as const,
      explanation: { lv: "Latvija 2024. gadā sasniedza 2.4% no IKP aizsardzībai un 2025. gada budžetā apstiprināja 2.5% mērķi.", en: "Latvia reached 2.4% of GDP for defense in 2024 and approved 2.5% target in 2025 budget.", ru: "Латвия достигла 2,4% ВВП на оборону в 2024 году и утвердила цель в 2,5% в бюджете 2025 года." },
      dateOfPromise: new Date("2023-01-20"),
      politicianSlug: "andris-spruds",
      categorySlug: "security",
    },
    {
      title: { lv: "Ģimenes ārsti 48h laikā", en: "GPs within 48h", ru: "Семейные врачи за 48ч" },
      description: { lv: "Ieviest ģimenes ārstu pieejamību 48 stundu laikā", en: "Ensure family doctor availability within 48 hours", ru: "Обеспечить доступ к семейному врачу в течение 48 часов" },
      status: "broken" as const,
      explanation: { lv: "Neskatoties uz reformām, vidējais gaidīšanas laiks joprojām pārsniedz 5 darba dienas lielākajā daļā reģionu.", en: "Despite reforms, average waiting time still exceeds 5 business days in most regions.", ru: "Несмотря на реформы, среднее время ожидания все еще превышает 5 рабочих дней в большинстве регионов." },
      dateOfPromise: new Date("2022-10-01"),
      politicianSlug: "hosams-abu-meri",
      categorySlug: "healthcare",
    },
    {
      title: { lv: "Rail Baltica līdz 2030", en: "Rail Baltica by 2030", ru: "Rail Baltica к 2030" },
      description: { lv: "Rail Baltica pabeigšana līdz 2030. gadam", en: "Complete Rail Baltica by 2030", ru: "Завершить Rail Baltica к 2030 году" },
      status: "in-progress" as const,
      explanation: { lv: "Būvdarbi turpinās, bet projekts saskaras ar kavējumiem un budžeta pārsniegumiem.", en: "Construction continues but project faces delays and budget overruns.", ru: "Строительство продолжается, но проект сталкивается с задержками и перерасходом бюджета." },
      dateOfPromise: new Date("2023-03-15"),
      politicianSlug: "evika-silina",
      categorySlug: "infrastructure",
    },
    {
      title: { lv: "PVN pārtikai 5%", en: "5% VAT on food", ru: "НДС 5% на продукты" },
      description: { lv: "Samazināt PVN pārtikas produktiem līdz 5%", en: "Reduce VAT on food products to 5%", ru: "Снизить НДС на продукты питания до 5%" },
      status: "partially-kept" as const,
      explanation: { lv: "PVN samazināts līdz 12% noteiktiem produktiem, bet pilnīgs 5% samazinājums nav ieviests.", en: "VAT reduced to 12% for certain products, but full 5% reduction not implemented.", ru: "НДС снижен до 12% для определенных продуктов, но полное снижение до 5% не внедрено." },
      dateOfPromise: new Date("2022-08-20"),
      politicianSlug: "arvils-aseradens",
      categorySlug: "economy",
    },
    {
      title: { lv: "10,000 bērnudārza vietas", en: "10,000 kindergarten places", ru: "10 000 мест в детсадах" },
      description: { lv: "Izveidot 10,000 jaunas bērnudārza vietas", en: "Create 10,000 new kindergarten places", ru: "Создать 10 000 новых мест в детских садах" },
      status: "in-progress" as const,
      explanation: { lv: "Izveidotas 4,200 jaunas vietas. Programma turpinās, bet temps ir lēnāks nekā plānots.", en: "Created 4,200 new places. Program continues but pace is slower than planned.", ru: "Создано 4200 новых мест. Программа продолжается, но темпы медленнее запланированных." },
      dateOfPromise: new Date("2022-10-10"),
      politicianSlug: "anda-caksa",
      categorySlug: "education",
    },
    {
      title: { lv: "50% atjaunojamā enerģija", en: "50% renewable energy", ru: "50% возобновляемой энергии" },
      description: { lv: "Panākt 50% atjaunojamās enerģijas īpatsvaru", en: "Achieve 50% renewable energy share", ru: "Достичь 50% доли возобновляемой энергии" },
      status: "in-progress" as const,
      explanation: { lv: "Pašreizējais līmenis ir aptuveni 42%. Vairāki vēja parku projekti ir izstrādes stadijā.", en: "Current level is approximately 42%. Several wind farm projects are in development.", ru: "Текущий уровень составляет примерно 42%. Несколько проектов ветропарков находятся в разработке." },
      dateOfPromise: new Date("2023-06-01"),
      politicianSlug: "evika-silina",
      categorySlug: "environment",
    },
    {
      title: { lv: "Minimālā alga 700 EUR", en: "Minimum wage €700", ru: "Минимальная зарплата 700 евро" },
      description: { lv: "Palielināt minimālo algu līdz 700 EUR", en: "Increase minimum wage to €700", ru: "Увеличить минимальную зарплату до 700 евро" },
      status: "kept" as const,
      explanation: { lv: "Minimālā alga palielināta līdz 700 EUR no 2024. gada 1. janvāra.", en: "Minimum wage increased to €700 from January 1, 2024.", ru: "Минимальная зарплата увеличена до 700 евро с 1 января 2024 года." },
      dateOfPromise: new Date("2022-09-01"),
      politicianSlug: "arvils-aseradens",
      categorySlug: "economy",
    },
    {
      title: { lv: "E-veselības karte", en: "E-health card", ru: "Карта e-здоровья" },
      description: { lv: "Ieviest e-veselības karti visiem iedzīvotājiem", en: "Introduce e-health card for all residents", ru: "Ввести электронную карту здоровья для всех жителей" },
      status: "in-progress" as const,
      explanation: { lv: "Sistēma ir izstrādes stadijā. Pilotprojekts sākts Rīgā ar 50,000 lietotājiem.", en: "System is in development. Pilot project started in Riga with 50,000 users.", ru: "Система находится в разработке. Пилотный проект запущен в Риге с 50 000 пользователей." },
      dateOfPromise: new Date("2023-02-15"),
      politicianSlug: "hosams-abu-meri",
      categorySlug: "digital",
    },
    {
      title: { lv: "Dubultot KNAB budžetu", en: "Double KNAB budget", ru: "Удвоить бюджет KNAB" },
      description: { lv: "Cīņa pret korupciju - KNAB budžeta dubultošana", en: "Fight corruption - double KNAB budget", ru: "Борьба с коррупцией - удвоить бюджет KNAB" },
      status: "partially-kept" as const,
      explanation: { lv: "KNAB budžets palielināts par 40%, bet ne dubultots.", en: "KNAB budget increased by 40%, but not doubled.", ru: "Бюджет KNAB увеличен на 40%, но не удвоен." },
      dateOfPromise: new Date("2022-08-30"),
      politicianSlug: "raivis-dzintars",
      categorySlug: "justice",
    },
    {
      title: { lv: "100% latviešu valoda skolās", en: "100% Latvian in schools", ru: "100% латышский в школах" },
      description: { lv: "Nodrošināt 100% valsts valodas prasmi skolās", en: "Ensure 100% state language proficiency in schools", ru: "Обеспечить 100% владение государственным языком в школах" },
      status: "kept" as const,
      explanation: { lv: "Reforma pilnībā ieviesta. Kopš 2024./2025. mācību gada visas skolas strādā latviešu valodā.", en: "Reform fully implemented. Since 2024/2025 academic year all schools operate in Latvian.", ru: "Реформа полностью внедрена. С 2024/2025 учебного года все школы работают на латышском языке." },
      dateOfPromise: new Date("2022-07-15"),
      politicianSlug: "raivis-dzintars",
      categorySlug: "education",
    },
    {
      title: { lv: "Atbalsts jaunajiem lauksaimniekiem", en: "Support for young farmers", ru: "Поддержка молодых фермеров" },
      description: { lv: "Izveidot atbalsta programmu jaunajiem lauksaimniekiem", en: "Create support program for young farmers", ru: "Создать программу поддержки молодых фермеров" },
      status: "kept" as const,
      explanation: { lv: "Programma 'Jaunais lauksaimnieks' darbojas ar kopējo finansējumu 15 milj. EUR.", en: "The 'Young Farmer' program operates with total funding of €15 million.", ru: "Программа 'Молодой фермер' действует с общим финансированием 15 млн евро." },
      dateOfPromise: new Date("2022-09-25"),
      politicianSlug: "raimonds-bergmanis",
      categorySlug: "agriculture",
    },
    {
      title: { lv: "Pensiju indeksācija", en: "Pension indexation", ru: "Индексация пенсий" },
      description: { lv: "Pensiju indeksācija virs inflācijas līmeņa", en: "Pension indexation above inflation", ru: "Индексация пенсий выше уровня инфляции" },
      status: "broken" as const,
      explanation: { lv: "Pensiju indeksācija 2024. gadā bija zemāka par inflāciju.", en: "Pension indexation in 2024 was below inflation.", ru: "Индексация пенсий в 2024 году была ниже инфляции." },
      dateOfPromise: new Date("2023-09-15"),
      politicianSlug: "evika-silina",
      categorySlug: "social-welfare",
    },
    {
      title: { lv: "Atcelt OMD", en: "Cancel conscription", ru: "Отменить призыв" },
      description: { lv: "Atcelt obligāto militāro dienestu", en: "Cancel mandatory military service", ru: "Отменить обязательную военную службу" },
      status: "broken" as const,
      explanation: { lv: "Saeima 2024. gadā apstiprināja Valsts aizsardzības dienesta likumu ar obligāto militāro dienestu no 2027. gada.", en: "Parliament approved the National Defense Service law with mandatory military service from 2027.", ru: "Парламент утвердил закон о государственной службе обороны с обязательной военной службой с 2027 года." },
      dateOfPromise: new Date("2022-08-15"),
      politicianSlug: "agnese-logina",
      categorySlug: "security",
    },
    {
      title: { lv: "1 mlrd. reģioniem", en: "1bn for regions", ru: "1 млрд регионам" },
      description: { lv: "Investēt 1 miljardu EUR reģionu attīstībā", en: "Invest €1 billion in regional development", ru: "Инвестировать 1 миллиард евро в развитие регионов" },
      status: "in-progress" as const,
      explanation: { lv: "Līdz šim investēti aptuveni 320 milj. EUR.", en: "Approximately €320 million invested so far.", ru: "На данный момент инвестировано около 320 млн евро." },
      dateOfPromise: new Date("2023-05-20"),
      politicianSlug: "evika-silina",
      categorySlug: "regional",
    },
    {
      title: { lv: "Tirgus Ukrainas precēm", en: "Market for Ukraine goods", ru: "Рынок для товаров Украины" },
      description: { lv: "Atvērt Latvijas tirgu Ukrainas precēm", en: "Open Latvian market to Ukrainian goods", ru: "Открыть латвийский рынок для украинских товаров" },
      status: "kept" as const,
      explanation: { lv: "Latvija aktīvi atbalsta Ukrainas ES kandidātvalsts statusu.", en: "Latvia actively supports Ukraine's EU candidate status.", ru: "Латвия активно поддерживает статус Украины как кандидата в ЕС." },
      dateOfPromise: new Date("2022-11-01"),
      politicianSlug: "baiba-braze",
      categorySlug: "foreign-affairs",
    },
    {
      title: { lv: "Bezmaksas pusdienas", en: "Free school meals", ru: "Бесплатные обеды" },
      description: { lv: "Nodrošināt bezmaksas ēdināšanu visiem skolēniem", en: "Provide free meals to all students", ru: "Обеспечить бесплатное питание всем школьникам" },
      status: "partially-kept" as const,
      explanation: { lv: "Bezmaksas ēdināšana pieejama 1.-4. klašu skolēniem.", en: "Free meals available for grades 1-4 students.", ru: "Бесплатное питание доступно для учеников 1-4 классов." },
      dateOfPromise: new Date("2022-10-20"),
      politicianSlug: "anda-caksa",
      categorySlug: "education",
    },
    {
      title: { lv: "100% e-pakalpojumi", en: "100% e-services", ru: "100% е-услуг" },
      description: { lv: "Digitalizēt 100% valsts pakalpojumus", en: "Digitize 100% of government services", ru: "Оцифровать 100% государственных услуг" },
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
        title: promise.title,
        description: promise.description,
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
