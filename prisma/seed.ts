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

  // Create all politicians (10 total)
  const politiciansData = [
    { slug: "evika-silina", name: "Evika Siliņa", role: "Ministru prezidente", bio: "Latvijas Republikas Ministru prezidente kopš 2023. gada.", partySlug: "jv", isActive: true },
    { slug: "arvils-aseradens", name: "Arvils Ašeradens", role: "Ekonomikas ministrs", bio: "Ekonomikas ministrs, iepriekš Saeimas deputāts.", partySlug: "jv", isActive: true },
    { slug: "anda-caksa", name: "Anda Čakša", role: "Izglītības un zinātnes ministre", bio: "Izglītības un zinātnes ministre.", partySlug: "jv", isActive: true },
    { slug: "andris-spruds", name: "Andris Sprūds", role: "Aizsardzības ministrs", bio: "Aizsardzības ministrs, profesors.", partySlug: "prog", isActive: true },
    { slug: "baiba-braze", name: "Baiba Braže", role: "Ārlietu ministre", bio: "Ārlietu ministre, diplomāte.", partySlug: "jv", isActive: true },
    { slug: "hosams-abu-meri", name: "Hosams Abu Meri", role: "Veselības ministrs", bio: "Veselības ministrs, ārsts.", partySlug: "jv", isActive: true },
    { slug: "raimonds-bergmanis", name: "Raimonds Bergmanis", role: "Saeimas deputāts", bio: "Saeimas deputāts, bijušais aizsardzības ministrs.", partySlug: "zzs", isActive: true },
    { slug: "raivis-dzintars", name: "Raivis Dzintars", role: "NA priekšsēdētājs", bio: "Nacionālās apvienības līderis.", partySlug: "na", isActive: true },
    { slug: "agnese-logina", name: "Agnese Logina", role: "Saeimas deputāte", bio: "Saeimas deputāte, bijusī kultūras ministre.", partySlug: "prog", isActive: true },
    { slug: "edvards-smiltens", name: "Edvards Smiltēns", role: "Saeimas priekšsēdētāja biedrs", bio: "Saeimas sekretārs, bijušais spīkers.", partySlug: "na", isActive: true },
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
      title: "Paaugstināt skolotāju algas",
      description: "Paaugstināt skolotāju algas par 20% līdz 2025. gadam",
      status: "in-progress" as const,
      explanation: "Valdība ir īstenojusi 10% palielinājumu no 2024. gada janvāra, vēl 10% plānots 2025. gada budžetā.",
      dateOfPromise: new Date("2022-09-15"),
      politicianSlug: "anda-caksa",
      categorySlug: "education",
    },
    {
      title: "2.5% no IKP aizsardzībai",
      description: "Sasniegt 2.5% no IKP aizsardzības izdevumiem",
      status: "kept" as const,
      explanation: "Latvija 2024. gadā sasniedza 2.4% no IKP aizsardzībai un 2025. gada budžetā apstiprināja 2.5% mērķi.",
      dateOfPromise: new Date("2023-01-20"),
      politicianSlug: "andris-spruds",
      categorySlug: "security",
    },
    {
      title: "Ģimenes ārsti 48h laikā",
      description: "Ieviest ģimenes ārstu pieejamību 48 stundu laikā",
      status: "broken" as const,
      explanation: "Neskatoties uz reformām, vidējais gaidīšanas laiks joprojām pārsniedz 5 darba dienas lielākajā daļā reģionu.",
      dateOfPromise: new Date("2022-10-01"),
      politicianSlug: "hosams-abu-meri",
      categorySlug: "healthcare",
    },
    {
      title: "Rail Baltica līdz 2030",
      description: "Rail Baltica pabeigšana līdz 2030. gadam",
      status: "in-progress" as const,
      explanation: "Būvdarbi turpinās, bet projekts saskaras ar kavējumiem un budžeta pārsniegumiem.",
      dateOfPromise: new Date("2023-03-15"),
      politicianSlug: "evika-silina",
      categorySlug: "infrastructure",
    },
    {
      title: "PVN pārtikai 5%",
      description: "Samazināt PVN pārtikas produktiem līdz 5%",
      status: "partially-kept" as const,
      explanation: "PVN samazināts līdz 12% noteiktiem produktiem, bet pilnīgs 5% samazinājums nav ieviests.",
      dateOfPromise: new Date("2022-08-20"),
      politicianSlug: "arvils-aseradens",
      categorySlug: "economy",
    },
    {
      title: "10,000 bērnudārza vietas",
      description: "Izveidot 10,000 jaunas bērnudārza vietas",
      status: "in-progress" as const,
      explanation: "Izveidotas 4,200 jaunas vietas. Programma turpinās, bet temps ir lēnāks nekā plānots.",
      dateOfPromise: new Date("2022-10-10"),
      politicianSlug: "anda-caksa",
      categorySlug: "education",
    },
    {
      title: "50% atjaunojamā enerģija",
      description: "Panākt 50% atjaunojamās enerģijas īpatsvaru",
      status: "in-progress" as const,
      explanation: "Pašreizējais līmenis ir aptuveni 42%. Vairāki vēja parku projekti ir izstrādes stadijā.",
      dateOfPromise: new Date("2023-06-01"),
      politicianSlug: "evika-silina",
      categorySlug: "environment",
    },
    {
      title: "Minimālā alga 700 EUR",
      description: "Palielināt minimālo algu līdz 700 EUR",
      status: "kept" as const,
      explanation: "Minimālā alga palielināta līdz 700 EUR no 2024. gada 1. janvāra.",
      dateOfPromise: new Date("2022-09-01"),
      politicianSlug: "arvils-aseradens",
      categorySlug: "economy",
    },
    {
      title: "E-veselības karte",
      description: "Ieviest e-veselības karti visiem iedzīvotājiem",
      status: "in-progress" as const,
      explanation: "Sistēma ir izstrādes stadijā. Pilotprojekts sākts Rīgā ar 50,000 lietotājiem.",
      dateOfPromise: new Date("2023-02-15"),
      politicianSlug: "hosams-abu-meri",
      categorySlug: "digital",
    },
    {
      title: "Dubultot KNAB budžetu",
      description: "Cīņa pret korupciju - KNAB budžeta dubultošana",
      status: "partially-kept" as const,
      explanation: "KNAB budžets palielināts par 40%, bet ne dubultots.",
      dateOfPromise: new Date("2022-08-30"),
      politicianSlug: "raivis-dzintars",
      categorySlug: "justice",
    },
    {
      title: "100% latviešu valoda skolās",
      description: "Nodrošināt 100% valsts valodas prasmi skolās",
      status: "kept" as const,
      explanation: "Reforma pilnībā ieviesta. Kopš 2024./2025. mācību gada visas skolas strādā latviešu valodā.",
      dateOfPromise: new Date("2022-07-15"),
      politicianSlug: "raivis-dzintars",
      categorySlug: "education",
    },
    {
      title: "Atbalsts jaunajiem lauksaimniekiem",
      description: "Izveidot atbalsta programmu jaunajiem lauksaimniekiem",
      status: "kept" as const,
      explanation: "Programma 'Jaunais lauksaimnieks' darbojas ar kopējo finansējumu 15 milj. EUR.",
      dateOfPromise: new Date("2022-09-25"),
      politicianSlug: "raimonds-bergmanis",
      categorySlug: "agriculture",
    },
    {
      title: "Pensiju indeksācija",
      description: "Pensiju indeksācija virs inflācijas līmeņa",
      status: "broken" as const,
      explanation: "Pensiju indeksācija 2024. gadā bija zemāka par inflāciju.",
      dateOfPromise: new Date("2023-09-15"),
      politicianSlug: "evika-silina",
      categorySlug: "social-welfare",
    },
    {
      title: "Atcelt OMD",
      description: "Atcelt obligāto militāro dienestu",
      status: "broken" as const,
      explanation: "Saeima 2024. gadā apstiprināja Valsts aizsardzības dienesta likumu ar obligāto militāro dienestu no 2027. gada.",
      dateOfPromise: new Date("2022-08-15"),
      politicianSlug: "agnese-logina",
      categorySlug: "security",
    },
    {
      title: "1 mlrd. reģioniem",
      description: "Investēt 1 miljardu EUR reģionu attīstībā",
      status: "in-progress" as const,
      explanation: "Līdz šim investēti aptuveni 320 milj. EUR.",
      dateOfPromise: new Date("2023-05-20"),
      politicianSlug: "evika-silina",
      categorySlug: "regional",
    },
    {
      title: "Tirgus Ukrainas precēm",
      description: "Atvērt Latvijas tirgu Ukrainas precēm",
      status: "kept" as const,
      explanation: "Latvija aktīvi atbalsta Ukrainas ES kandidātvalsts statusu.",
      dateOfPromise: new Date("2022-11-01"),
      politicianSlug: "baiba-braze",
      categorySlug: "foreign-affairs",
    },
    {
      title: "Bezmaksas pusdienas",
      description: "Nodrošināt bezmaksas ēdināšanu visiem skolēniem",
      status: "partially-kept" as const,
      explanation: "Bezmaksas ēdināšana pieejama 1.-4. klašu skolēniem.",
      dateOfPromise: new Date("2022-10-20"),
      politicianSlug: "anda-caksa",
      categorySlug: "education",
    },
    {
      title: "100% e-pakalpojumi",
      description: "Digitalizēt 100% valsts pakalpojumus",
      status: "in-progress" as const,
      explanation: "Aptuveni 75% valsts pakalpojumu pieejami digitāli.",
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
