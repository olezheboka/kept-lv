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
  console.log("Seeding database with real Latvia data...");

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
    { slug: "economy", name: "Ekonomika un finanses", color: "from-blue-500 to-blue-600", icon: "PiggyBank" },
    { slug: "healthcare", name: "Veselības aprūpe", color: "from-pink-500 to-rose-600", icon: "Stethoscope" },
    { slug: "education", name: "Izglītība un zinātne", color: "from-purple-500 to-violet-600", icon: "GraduationCap" },
    { slug: "security", name: "Aizsardzība un drošība", color: "from-red-500 to-orange-600", icon: "Shield" },
    { slug: "foreign-affairs", name: "Ārlietas", color: "from-indigo-500 to-blue-600", icon: "Globe" },
    { slug: "social-welfare", name: "Sociālā labklājība", color: "from-amber-500 to-yellow-600", icon: "HeartHandshake" },
    { slug: "environment", name: "Vide un enerģētika", color: "from-green-500 to-emerald-600", icon: "Leaf" },
    { slug: "infrastructure", name: "Satiksme un infrastruktūra", color: "from-cyan-500 to-teal-600", icon: "Train" },
    { slug: "justice", name: "Tieslietas un korupcijas apkarošana", color: "from-slate-500 to-gray-600", icon: "Scale" },
    { slug: "culture", name: "Kultūra un mantojums", color: "from-fuchsia-500 to-pink-600", icon: "Palette" },
    { slug: "agriculture", name: "Lauksaimniecība", color: "from-lime-500 to-green-600", icon: "Sprout" },
    { slug: "digital", name: "Tehnoloģijas un inovācijas", color: "from-violet-500 to-purple-600", icon: "Cpu" },
    { slug: "regional", name: "Reģionāla attīstība", color: "from-orange-500 to-amber-600", icon: "Map" },
    { slug: "youth", name: "Jaunatne un sports", color: "from-sky-500 to-cyan-600", icon: "Users" },
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
      name: "Jaunā Vienotība",
      description: "Liberāli konservatīva politiskā partija",
      color: "#8AB73E",
      logoUrl: "/logos/jv.png",
      websiteUrl: "https://jaunavienotiba.lv",
      isCoalition: true,
    },
    {
      slug: "zzs",
      name: "Zaļo un Zemnieku savienība",
      description: "Centriska agrāra un zaļā politiskā apvienība",
      color: "#026036",
      logoUrl: "/logos/zzs.png",
      websiteUrl: "https://zzs.lv",
      isCoalition: true,
    },
    {
      slug: "na",
      name: "Nacionālā apvienība",
      description: "Nacionāli konservatīva politiskā partija",
      color: "#932330",
      logoUrl: "/logos/na.png",
      websiteUrl: "https://nacionalaapvieniba.lv",
      isCoalition: false,
    },
    {
      slug: "ap",
      name: "Attīstībai/Par!",
      description: "Liberāla politiskā apvienība",
      color: "#000000",
      logoUrl: "/logos/ap.png",
      websiteUrl: "https://attistibaipar.lv",
      isCoalition: false,
    },
    {
      slug: "prog",
      name: "Progresīvie",
      description: "Sociāldemokrātiska, zaļa un progresīva partija",
      color: "#E63915",
      logoUrl: "/logos/prog.png",
      websiteUrl: "https://progresivie.lv",
      isCoalition: true,
    },
    {
      slug: "lra",
      name: "Latvijas Reģionu apvienība",
      description: "Centriska reģionālā partija",
      color: "#982632",
      logoUrl: "/logos/lra.png",
      websiteUrl: "https://latvijasregionuapvieniba.lv",
      isCoalition: false,
    },
    {
      slug: "stab",
      name: "Stabilitātei!",
      description: "Populistiska politiskā partija",
      color: "#fd7e14",
      logoUrl: "/logos/stab.png",
      websiteUrl: "https://stabilitatei.lv",
      isCoalition: false,
    },
    {
      slug: "lpv",
      name: "Latvija pirmajā vietā",
      description: "Labēja populistiska partija",
      color: "#9E3139",
      logoUrl: "/logos/lpv.png",
      websiteUrl: "https://latvijapirmaja.lv",
      isCoalition: false,
    },
    {
      slug: "sask",
      name: "Saskaņa",
      description: "Sociāldemokrātiska partija",
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

  // Create all politicians (19 total)
  const politiciansData = [
    { slug: "evika-silina", name: "Evika Siliņa", role: "Ministru prezidente", bio: "Latvijas Republikas Ministru prezidente kopš 2023. gada.", partySlug: "jv", isActive: true },
    { slug: "arvils-aseradens", name: "Arvils Ašeradens", role: "Finanšu ministrs", bio: "Finanšu ministrs, partijas 'Vienotība' priekšsēdētājs.", partySlug: "jv", isActive: true },
    { slug: "anda-caksa", name: "Anda Čakša", role: "Izglītības un zinātnes ministre", bio: "Izglītības un zinātnes ministre.", partySlug: "jv", isActive: true },
    { slug: "andris-spruds", name: "Andris Sprūds", role: "Aizsardzības ministrs", bio: "Aizsardzības ministrs, profesors.", partySlug: "prog", isActive: true },
    { slug: "baiba-braze", name: "Baiba Braže", role: "Ārlietu ministre", bio: "Ārlietu ministre, diplomāte.", partySlug: "jv", isActive: true },
    { slug: "hosams-abu-meri", name: "Hosams Abu Meri", role: "Veselības ministrs", bio: "Veselības ministrs, ārsts.", partySlug: "jv", isActive: true },
    { slug: "raimonds-bergmanis", name: "Raimonds Bergmanis", role: "Saeimas deputāts", bio: "Saeimas deputāts, bijušais aizsardzības ministrs.", partySlug: "zzs", isActive: true },
    { slug: "raivis-dzintars", name: "Raivis Dzintars", role: "NA priekšsēdētājs", bio: "Nacionālās apvienības līderis.", partySlug: "na", isActive: true },
    { slug: "kaspars-briskens", name: "Kaspars Briškens", role: "Satiksmes ministrs", bio: "Satiksmes ministrs, Progresīvie.", partySlug: "prog", isActive: true },
    { slug: "edvards-smiltens", name: "Edvards Smiltēns", role: "Saeimas sekretārs", bio: "Saeimas prezidija loceklis, AS līderis.", partySlug: "lra", isActive: true },
    { slug: "rihards-kozlovskis", name: "Rihards Kozlovskis", role: "Iekšlietu ministrs", bio: "Iekšlietu ministrs, Saeimas deputāts.", partySlug: "jv", isActive: true },
    { slug: "inese-libina-egnere", name: "Inese Lībiņa-Egnere", role: "Tieslietu ministre", bio: "Tieslietu ministre, juriste.", partySlug: "jv", isActive: true },
    { slug: "viktors-valainis", name: "Viktors Valainis", role: "Ekonomikas ministrs", bio: "Ekonomikas ministrs, ZZS valdes priekšsēdētājs.", partySlug: "zzs", isActive: true },
    { slug: "uldis-augulis", name: "Uldis Augulis", role: "Labklājības ministrs", bio: "Labklājības ministrs, ilggadējs politiķis.", partySlug: "zzs", isActive: true },
    { slug: "janis-dombrava", name: "Jānis Dombrava", role: "Saeimas deputāts", bio: "Nacionālās apvienības valdes loceklis.", partySlug: "na", isActive: true },
    { slug: "juris-puce", name: "Juris Pūce", role: "Partijas 'Latvijas attīstībai' līdzpriekšsēdētājs", bio: "Bijušais VARAM ministrs.", partySlug: "ap", isActive: true },
    { slug: "ainars-slesers", name: "Ainārs Šlesers", role: "Saeimas deputāts", bio: "Partijas 'Latvija pirmajā vietā' līderis.", partySlug: "lpv", isActive: true },
    { slug: "aleksejs-roslikovs", name: "Aleksejs Rosļikovs", role: "Saeimas deputāts", bio: "Partijas 'Stabilitātei!' līderis.", partySlug: "stab", isActive: true },
    { slug: "nils-usakovs", name: "Nils Ušakovs", role: "Eiroparlamenta deputāts", bio: "Bijušais Rīgas mērs, 'Saskaņa' līderis.", partySlug: "sask", isActive: true },
  ];

  const politicians: Record<string, { id: string }> = {};
  for (const pol of politiciansData) {
    const created = await prisma.politician.upsert({
      where: { slug: pol.slug },
      update: { name: pol.name, role: pol.role, bio: pol.bio, isActive: pol.isActive, partyId: parties[pol.partySlug].id },
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

  // Create all promises (38 total)
  await prisma.source.deleteMany({});
  await prisma.evidence.deleteMany({});
  await prisma.promise.deleteMany({});

  const promisesData = [
    // Education & Science
    {
      title: "Paaugstināt skolotāju algas",
      description: "Nodrošināt skolotāju zemākās mēneša darba algas likmes pieaugumu",
      status: "in-progress" as const,
      explanation: "Algu grafiks ir apstiprināts, taču pedagogu arodbiedrība norāda uz slodzes balansēšanas problēmām.",
      dateOfPromise: new Date("2023-01-01"),
      politicianSlug: "anda-caksa",
      categorySlug: "education",
    },
    {
      title: "Pāreja uz mācībām valsts valodā",
      description: "Pilnīga pāreja uz mācībām latviešu valodā vispārējā izglītībā",
      status: "kept" as const,
      explanation: "Reforma tiek īstenota, visas skolas pāriet uz mācībām latviešu valodā.",
      dateOfPromise: new Date("2022-10-01"),
      politicianSlug: "anda-caksa",
      categorySlug: "education",
    },
    {
      title: "Augstākās izglītības finansējums",
      description: "Palielināt augstākās izglītības finansējumu līdz 1.5% no IKP",
      status: "not-rated" as const,
      explanation: "Finansējums pieaudzis, bet mērķis nav sasniegts.",
      dateOfPromise: new Date("2023-05-15"),
      politicianSlug: "anda-caksa",
      categorySlug: "education",
    },

    // Security & Defense
    {
      title: "Aizsardzības budžets 3%",
      description: "Sasniegt 3% no IKP aizsardzībai līdz 2027. gadam",
      status: "kept" as const,
      explanation: "Budžeta plāni apstiprināti ar straujāku pieaugumu, sasniedzot 3% ātrāk.",
      dateOfPromise: new Date("2023-09-20"),
      politicianSlug: "andris-spruds",
      categorySlug: "security",
    },
    {
      title: "Sēlijas poligona izveide",
      description: "Izveidot militāro poligonu Sēlijā",
      status: "in-progress" as const,
      explanation: "Uzsākta zemes atsavināšana un infrastruktūras projektēšana.",
      dateOfPromise: new Date("2023-06-01"),
      politicianSlug: "andris-spruds",
      categorySlug: "security",
    },
    {
      title: "Valsts aizsardzības dienests",
      description: "Ieviest obligāto valsts aizsardzības dienestu",
      status: "kept" as const,
      explanation: "Dienests ieviests, pirmie iesaukumi veiksmīgi aizvadīti.",
      dateOfPromise: new Date("2022-12-01"),
      politicianSlug: "inese-libina-egnere", // Actually Inese Libina-Egnere supported legislation
      categorySlug: "security",
    },

    // Economy & Finance
    {
      title: "Banku virspeļņas nodoklis",
      description: "Ieviest solidaritātes iemaksu bankām",
      status: "kept" as const,
      explanation: "Saeima apstiprināja grozījumus, liekot bankām maksāt avansa nodokli.",
      dateOfPromise: new Date("2023-08-15"),
      politicianSlug: "arvils-aseradens",
      categorySlug: "economy",
    },
    {
      title: "Samazināt birokrātiju nekustamā īpašuma attīstītājiem",
      description: "Vienkāršot būvniecības saskaņošanas procesus",
      status: "in-progress" as const,
      explanation: "Izstrādāti grozījumi Būvniecības likumā, process turpinās.",
      dateOfPromise: new Date("2023-11-01"),
      politicianSlug: "viktors-valainis",
      categorySlug: "economy",
    },
    {
      title: "Eksporta veicināšana",
      description: "Dubultot augstas pievienotās vērtības eksportu",
      status: "not-rated" as const,
      explanation: "Eksporta rādītāji svārstīgi ģeopolitisko apstākļu dēļ.",
      dateOfPromise: new Date("2023-10-10"),
      politicianSlug: "viktors-valainis",
      categorySlug: "economy",
    },

    // Healthcare
    {
      title: "Zāļu cenu samazināšana",
      description: "Pārskatīt zāļu cenu veidošanas mehānismu",
      status: "in-progress" as const,
      explanation: "Ministrija prezentējusi jauno modeli, farmācijas nozare iebilst.",
      dateOfPromise: new Date("2023-12-01"),
      politicianSlug: "hosams-abu-meri",
      categorySlug: "healthcare",
    },
    {
      title: "Vēža skrīninga aptvere",
      description: "Palielināt vēža skrīninga aptveri",
      status: "in-progress" as const,
      explanation: "Ieviesta jauna uzaicināšanas kārtība, rezultāti uzlabojas lēni.",
      dateOfPromise: new Date("2023-11-15"),
      politicianSlug: "hosams-abu-meri",
      categorySlug: "healthcare",
    },

    // Transport & Infrastructure
    {
      title: "Jauni elektrovilcieni",
      description: "Nodrošināt jauno Škoda vilcienu pilnvērtīgu kursēšanu",
      status: "partially-kept" as const,
      explanation: "Vilcieni kursē, bet ar regulārām tehniskām ķibelēm un kavējumiem.",
      dateOfPromise: new Date("2023-12-15"),
      politicianSlug: "kaspars-briskens",
      categorySlug: "infrastructure",
    },
    {
      title: "Rail Baltica audits",
      description: "Veikt pilnu Rail Baltica projekta auditu",
      status: "kept" as const,
      explanation: "Audits veikts, atklājot būtiskas pārvaldības problēmas.",
      dateOfPromise: new Date("2023-09-01"),
      politicianSlug: "kaspars-briskens",
      categorySlug: "infrastructure",
    },
    {
      title: "Pasta nodaļu tīkla saglabāšana",
      description: "Apturēt masveida pasta nodaļu slēgšanu reģionos",
      status: "kept" as const,
      explanation: "Plāns pārskatīts, saglabājot vairāk nodaļu nekā sākotnēji iecerēts.",
      dateOfPromise: new Date("2024-01-20"),
      politicianSlug: "kaspars-briskens",
      categorySlug: "regional",
    },

    // Welfare
    {
      title: "Pensiju piemaksas",
      description: "Atjaunot pensiju piemaksas par stāžu līdz 2012. gadam",
      status: "kept" as const,
      explanation: "Piemaksas atjaunotas pakāpeniski no 2024. gada.",
      dateOfPromise: new Date("2023-10-05"),
      politicianSlug: "uldis-augulis",
      categorySlug: "social-welfare",
    },
    {
      title: "Minimālo ienākumu reforma",
      description: "Pārskatīt minimālo ienākumu sliekšņus katru gadu",
      status: "kept" as const,
      explanation: "Likums pieņemts, sliekšņi tiek pārskatīti ik gadu.",
      dateOfPromise: new Date("2023-02-01"),
      politicianSlug: "uldis-augulis",
      categorySlug: "social-welfare",
    },

    // Foreign Affairs
    {
      title: "Sankcijas Krievijai",
      description: "Stiprināt sankciju apiešanas kontroli",
      status: "in-progress" as const,
      explanation: "Ieviesta deklarēšanās uz robežas, pastiprināta muitas kontrole.",
      dateOfPromise: new Date("2024-02-24"),
      politicianSlug: "baiba-braze",
      categorySlug: "foreign-affairs",
    },
    {
      title: "Latvija ANO Drošības padomē",
      description: "Panākt Latvijas ievēlēšanu ANO Drošības padomē",
      status: "in-progress" as const,
      explanation: "Aktīva kampaņa norit, vēlēšanas plānotas 2025. gadā.",
      dateOfPromise: new Date("2023-09-01"),
      politicianSlug: "baiba-braze",
      categorySlug: "foreign-affairs",
    },

    // Justice & Interior
    {
      title: "Stambulas konvencija",
      description: "Ratificēt Stambulas konvenciju",
      status: "kept" as const,
      explanation: "Saeima ratificēja konvenciju 2023. gada novembrī.",
      dateOfPromise: new Date("2023-01-01"),
      politicianSlug: "evika-silina", // As PM pushed it
      categorySlug: "justice",
    },
    {
      title: "Civilās savienības likums",
      description: "Pieņemt regulējumu visu ģimeņu tiesiskajai aizsardzībai",
      status: "kept" as const,
      explanation: "Partnerības institūts ieviests ar grozījumiem Notariāta likumā.",
      dateOfPromise: new Date("2022-11-01"),
      politicianSlug: "inese-libina-egnere",
      categorySlug: "justice",
    },
    {
      title: "Austrumu robežas izbūve",
      description: "Pabeigt žoga izbūvi uz Baltkrievijas un Krievijas robežas",
      status: "in-progress" as const,
      explanation: "Žogs uz Baltkrievijas robežas pabeigts, uz Krievijas robežas darbi turpinās.",
      dateOfPromise: new Date("2023-05-01"),
      politicianSlug: "rihards-kozlovskis",
      categorySlug: "security",
    },
    {
      title: "Glābšanas dienestu depo",
      description: "Jaunu katastrofu pārvaldības centru būvniecība",
      status: "in-progress" as const,
      explanation: "Vairāki depo nodoti ekspluatācijā, būvniecība turpinās.",
      dateOfPromise: new Date("2023-08-01"),
      politicianSlug: "rihards-kozlovskis",
      categorySlug: "security",
    },

    // Opposition / Others
    {
      title: "Apturēt skolu slēgšanu",
      description: "Neļaut slēgt mazās lauku skolas",
      status: "broken" as const,
      explanation: "Skolu tīkla optimizācija turpinās, vairākas lauku skolas slēgtas.",
      dateOfPromise: new Date("2023-09-01"),
      politicianSlug: "raimonds-bergmanis",
      categorySlug: "education",
    },
    {
      title: "Samazināt PVN apkurei",
      description: "Noteikt samazināto PVN likmi apkurei",
      status: "broken" as const,
      explanation: "Priekšlikums noraidīts budžeta sarunās.",
      dateOfPromise: new Date("2023-10-01"),
      politicianSlug: "ainars-slesers",
      categorySlug: "economy",
    },
    {
      title: "Tautas vēlēts prezidents",
      description: "Ieviest tautas vēlētu prezidentu",
      status: "broken" as const,
      explanation: "Saeimas vairākums neatbalsta šādas konstitucionālas izmaiņas.",
      dateOfPromise: new Date("2022-10-01"),
      politicianSlug: "ainars-slesers",
      categorySlug: "justice",
    },
    {
      title: "Latvijas bankas likvidācija",
      description: "Reorganizēt finanšu sektora uzraudzību",
      status: "broken" as const,
      explanation: "Priekšlikums nav guvis atbalstu.",
      dateOfPromise: new Date("2022-10-01"),
      politicianSlug: "aleksejs-roslikovs",
      categorySlug: "economy",
    },
    {
      title: "Izstāšanās no Stambulas konvencijas",
      description: "Atsaukt parakstu no Stambulas konvencijas",
      status: "broken" as const,
      explanation: "Konvencija ir ratificēta.",
      dateOfPromise: new Date("2023-11-01"),
      politicianSlug: "aleksejs-roslikovs",
      categorySlug: "justice",
    },
    {
      title: "Pensiju neapliekamais minimums",
      description: "Noteikt pensiju neapliekamo minimumu 1000 EUR",
      status: "broken" as const,
      explanation: "Neapliekamais minimums celts, bet nav sasniedzis 1000 EUR.",
      dateOfPromise: new Date("2023-10-01"),
      politicianSlug: "aleksejs-roslikovs",
      categorySlug: "social-welfare",
    },
    {
      title: "Demogrāfijas programma",
      description: "Ieviest 'Trešā bērna' politiku ar būtiskiem pabalstiem",
      status: "broken" as const,
      explanation: "Nav piešķirts finansējums.",
      dateOfPromise: new Date("2022-10-01"),
      politicianSlug: "raivis-dzintars", // NA priority
      categorySlug: "social-welfare",
    },
    {
      title: "Latviska Latvija",
      description: "Stiprināt latvisko kultūrtelpu",
      status: "kept" as const,
      explanation: "Pieņemti dažādi likumi valsts valodas stiprināšanai.",
      dateOfPromise: new Date("2022-10-01"),
      politicianSlug: "raivis-dzintars",
      categorySlug: "culture",
    },
    {
      title: "Imigrācijas ierobežošana",
      description: "Neļaut ievest lētu darbaspēku",
      status: "partially-kept" as const,
      explanation: "Noteikumi ir stingri, bet tiek diskutēts par atvieglojumiem.",
      dateOfPromise: new Date("2023-01-01"),
      politicianSlug: "janis-dombrava",
      categorySlug: "security",
    },
    {
      title: "Robežapsardzības stiprināšana",
      description: "Dot tiesības robežsargiem pielietot ieroci",
      status: "kept" as const,
      explanation: "Likums grozīts, dodot plašākas pilnvaras robežas aizsardzībā.",
      dateOfPromise: new Date("2023-08-01"),
      politicianSlug: "janis-dombrava",
      categorySlug: "security",
    },
    {
      title: "Adminstratīvi teritoriālā reforma",
      description: "Pārskatīt reformu, atgriežot pilnvaras vietējām kopienām",
      status: "in-progress" as const,
      explanation: "Notiek diskusijas, bet būtiskas izmaiņas nav veiktas.",
      dateOfPromise: new Date("2022-10-01"),
      politicianSlug: "edvards-smiltens",
      categorySlug: "regional",
    },
    {
      title: "Krīzes vadības centrs",
      description: "Izveidot vienotu krīzes vadības centru Ministru prezidenta pakļautībā",
      status: "partially-kept" as const,
      explanation: "Centrs tiek veidots, bet pilnībā vēl nefunkcionē.",
      dateOfPromise: new Date("2022-11-01"),
      politicianSlug: "edvards-smiltens",
      categorySlug: "security",
    },
    {
      title: "Azartspēļu ierobežošana",
      description: "Slēgt spēļu zāles dzīvojamos rajonos",
      status: "in-progress" as const,
      explanation: "Rīgas dome pieņēma lēmumu, bet tas tika apturēts tiesā.",
      dateOfPromise: new Date("2023-05-01"),
      politicianSlug: "juris-puce", // LA/AP in Riga coalition context (though Puce is national leader)
      categorySlug: "justice", // Or regional
    },
    {
      title: "Digitālā transformācija",
      description: "Ieguldīt digitālajās prasmēs un infrastruktūrā",
      status: "in-progress" as const,
      explanation: "Projekti tiek realizēti ar ES fondu atbalstu.",
      dateOfPromise: new Date("2022-10-01"),
      politicianSlug: "juris-puce",
      categorySlug: "digital",
    },
    {
      title: "Sociālais atbalsts senioriem",
      description: "Ieviest 13. pensiju",
      status: "broken" as const,
      explanation: "Priekšlikums noraidīts.",
      dateOfPromise: new Date("2022-10-01"),
      politicianSlug: "nils-usakovs",
      categorySlug: "social-welfare",
    },
    {
      title: "Mājokļu atbalsta programma",
      description: "Valsts garantijas mājokļa iegādei jaunajām ģimenēm",
      status: "kept" as const,
      explanation: "Altum programmas darbojas un tiek paplašinātas.",
      dateOfPromise: new Date("2023-01-01"),
      politicianSlug: "evika-silina",
      categorySlug: "social-welfare",
    }
  ];

  for (const promise of promisesData) {
    if (!politicians[promise.politicianSlug]) {
      console.error(`Politician not found: ${promise.politicianSlug}`);
      continue;
    }
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
