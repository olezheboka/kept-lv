import { PrismaClient, PromiseStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { hash } from "bcryptjs";
import { config } from "dotenv";
import { slugify } from "../lib/slugify";

// Load environment variables
config({ path: ".env.local" });
config({ path: ".env" });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false }, // Direct connection for seeding usually needs this or true
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

// Helper to generate long text
const generateLongText = (base: string, minLength: number) => {
  let text = base;
  const fillers = [
    " Šis jautājums ir būtisks Latvijas nākotnei un prasa tūlītēju rīcību, lai nodrošinātu ilgtspējīgu attīstību.",
    " Mēs apņemamies sekot līdzi šī procesa virzībai un regulāri informēt sabiedrību par sasniegtajiem rezultātiem.",
    " Tas ietver plašas diskusijas ar nozares ekspertiem un sabiedrības pārstāvjiem, lai rastu labāko risinājumu.",
    " Mūsu mērķis ir veicināt labklājību un drošību ikvienam Latvijas iedzīvotājam, neatkarīgi no dzīvesvietas.",
    " Reforma tiks īstenota pakāpeniski, ņemot vērā budžeta iespējas un sociālekonomisko situāciju valstī.",
    " Ir svarīgi uzsvērt, ka šis solījums balstās uz rūpīgu situācijas analīzi un starptautisko pieredzi.",
    " Mēs ticam, ka kopīgiem spēkiem mēs varam sasniegt izvirzītos mērķus un stiprināt mūsu valsti.",
    " Šī iniciatīva ir daļa no plašākas stratēģijas, kas vērsta uz valsts konkurētspējas celšanu reģionā.",
  ];

  while (text.length < minLength) {
    text += fillers[Math.floor(Math.random() * fillers.length)];
  }
  return text;
};

// Helper to get random item from array
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Helper to get random subset of array
const randomSubset = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};



async function main() {
  console.log("Seeding database with real Latvia data...");

  // Create admin user
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const adminPassword = await hash("17191719", 12);

  // Cleanup old default admin if exists
  try {
    await prisma.user.deleteMany({ where: { email: "admin@solijums.lv" } });
  } catch {
    // ignore
  }

  const admin = await prisma.user.upsert({
    where: { email: "oleg.jar@gmail.com" },
    update: {
      passwordHash: adminPassword,
    },
    create: {
      email: "oleg.jar@gmail.com",
      passwordHash: adminPassword,
      name: "Admin",
      role: "ADMIN",
    },
  });
  console.log("Created admin user:", admin.email);

  // Clear existing data (Promises, Politicians, Parties)
  console.log("Clearing existing promises, politicians, and parties...");
  await prisma.promise.deleteMany();
  await prisma.politician.deleteMany();
  await prisma.party.deleteMany();
  // Do NOT delete categories as requested


  // Create all categories (14 total) - Removed Color, Added Description
  const categoriesData = [
    { slug: "economy", name: "Ekonomika un finanses", icon: "PiggyBank" },
    { slug: "healthcare", name: "Veselības aprūpe", icon: "Stethoscope" },
    { slug: "education", name: "Izglītība un zinātne", icon: "GraduationCap" },
    { slug: "security", name: "Aizsardzība un drošība", icon: "Shield" },
    { slug: "foreign-affairs", name: "Ārlietas", icon: "Globe" },
    { slug: "social-welfare", name: "Sociālā labklājība", icon: "HeartHandshake" },
    { slug: "environment", name: "Vide un enerģētika", icon: "Leaf" },
    { slug: "infrastructure", name: "Satiksme un infrastruktūra", icon: "Train" },
    { slug: "justice", name: "Tieslietas un korupcijas apkarošana", icon: "Scale" },
    { slug: "culture", name: "Kultūra un mantojums", icon: "Palette" },
    { slug: "agriculture", name: "Lauksaimniecība", icon: "Sprout" },
    { slug: "digital", name: "Tehnoloģijas un inovācijas", icon: "Cpu" },
    { slug: "regional", name: "Reģionāla attīstība", icon: "Map" },
    { slug: "youth", name: "Jaunatne un sports", icon: "Users" },
  ];

  const categories: Record<string, { id: string }> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: `Kategorija, kas aptver visas tēmas saistībā ar ${cat.name.toLowerCase()}. Mēs rūpīgi sekojam līdzi politiķu lēmumiem šajā jomā.`,
      },
      create: {
        slug: cat.slug,
        name: cat.name,
        description: `Kategorija, kas aptver visas tēmas saistībā ar ${cat.name.toLowerCase()}. Mēs rūpīgi sekojam līdzi politiķu lēmumiem šajā jomā.`,
      },
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
      logoUrl: "/logos/jv.png",
      websiteUrl: "https://jaunavienotiba.lv",
      isCoalition: true,
    },
    {
      slug: "zzs",
      name: "Zaļo un Zemnieku savienība",
      description: "Centriska agrāra un zaļā politiskā apvienība",
      logoUrl: "/logos/zzs.png",
      websiteUrl: "https://zzs.lv",
      isCoalition: true,
    },
    {
      slug: "na",
      name: "Nacionālā apvienība",
      description: "Nacionāli konservatīva politiskā partija",
      logoUrl: "/logos/na.png",
      websiteUrl: "https://nacionalaapvieniba.lv",
      isCoalition: false,
    },
    {
      slug: "ap",
      name: "Attīstībai/Par!",
      description: "Liberāla politiskā apvienība",
      logoUrl: "/logos/ap.png",
      websiteUrl: "https://attistibaipar.lv",
      isCoalition: false,
    },
    {
      slug: "prog",
      name: "Progresīvie",
      description: "Sociāldemokrātiska, zaļa un progresīva partija",
      logoUrl: "/logos/prog.png",
      websiteUrl: "https://progresivie.lv",
      isCoalition: true,
    },
    {
      slug: "lra",
      name: "Latvijas Reģionu apvienība",
      description: "Centriska reģionālā partija",
      logoUrl: "/logos/lra.png",
      websiteUrl: "https://latvijasregionuapvieniba.lv",
      isCoalition: false,
    },
    {
      slug: "stab",
      name: "Stabilitātei!",
      description: "Populistiska politiskā partija",
      logoUrl: "/logos/stab.png",
      websiteUrl: "https://stabilitatei.lv",
      isCoalition: false,
    },
    {
      slug: "lpv",
      name: "Latvija pirmajā vietā",
      description: "Labēja populistiska partija",
      logoUrl: "/logos/lpv.png",
      websiteUrl: "https://latvijapirmaja.lv",
      isCoalition: false,
    },
    {
      slug: "sask",
      name: "Saskaņa",
      description: "Sociāldemokrātiska partija",
      logoUrl: "/logos/sask.png",
      websiteUrl: "https://saskana.eu",
      isCoalition: false,
    },
    {
      slug: "lks",
      name: "Latvijas Krievu savienība",
      description: "Politiska partija",
      logoUrl: "/logos/lks.jpg",
      websiteUrl: "https://rusojuz.lv",
      isCoalition: false,
    },
    {
      slug: "sv",
      name: "Suverēnā vara",
      description: "Politiska partija",
      logoUrl: "/logos/sv.png",
      websiteUrl: "https://suverenavara.lv",
      isCoalition: false,
    },
    {
      slug: "as",
      name: "Apvienotais saraksts",
      description: "Latvijas Zaļā partija, Latvijas Reģionu Apvienība, Liepājas partija",
      logoUrl: "/logos/as.png",
      websiteUrl: "https://apvienotaissaraksts.lv",
      isCoalition: false,
    },
    {
      slug: "kons",
      name: "Konservatīvie",
      description: "Konservatīva politiskā partija",
      logoUrl: "/logos/kons.png",
      websiteUrl: "https://konservativie.lv",
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
        logoUrl: party.logoUrl,
        websiteUrl: party.websiteUrl,
        isCoalition: party.isCoalition,
      },
      create: {
        slug: party.slug,
        name: party.name,
        description: party.description,
        logoUrl: party.logoUrl,
        websiteUrl: party.websiteUrl,
        isCoalition: party.isCoalition,
      },
    });
    parties[party.slug] = created;
  }
  console.log("Created parties:", Object.keys(parties).length);

  // Create all politicians (19 total) - Updated with Education and 3 Inactive
  const politiciansData = [
    { slug: "evika-silina", name: "Evika Siliņa", role: "Ministru prezidente", bio: "Latvijas Republikas Ministru prezidente kopš 2023. gada.", education: "Latvijas Universitāte, Juridiskā fakultāte, Maģistra grāds tiesību zinātnē.", partySlug: "jv", isActive: true },
    { slug: "arvils-aseradens", name: "Arvils Ašeradens", role: "Finanšu ministrs", bio: "Finanšu ministrs, partijas 'Vienotība' priekšsēdētājs.", education: "Latvijas Universitāte, Ģeogrāfijas fakultāte.", partySlug: "jv", isActive: true },
    { slug: "anda-caksa", name: "Anda Čakša", role: "Izglītības un zinātnes ministre", bio: "Izglītības un zinātnes ministre.", education: "Rīgas Stradiņa universitāte, Medicīnas fakultāte, ārsts.", partySlug: "jv", isActive: true },
    { slug: "andris-spruds", name: "Andris Sprūds", role: "Aizsardzības ministrs", bio: "Aizsardzības ministrs, profesors.", education: "Centrāleiropas Universitāte, Politikas zinātnes maģistrs.", partySlug: "prog", isActive: true },
    { slug: "baiba-braze", name: "Baiba Braže", role: "Ārlietu ministre", bio: "Ārlietu ministre, diplomāte.", education: "Latvijas Universitāte, Juridiskā fakultāte.", partySlug: "jv", isActive: true },
    { slug: "hosams-abu-meri", name: "Hosams Abu Meri", role: "Veselības ministrs", bio: "Veselības ministrs, ārsts.", education: "Latvijas Medicīnas akadēmija, ārsta grāds.", partySlug: "jv", isActive: true },
    { slug: "raimonds-bergmanis", name: "Raimonds Bergmanis", role: "Saeimas deputāts", bio: "Saeimas deputāts, bijušais aizsardzības ministrs.", education: "Rīgas Tehniskā universitāte, Inženierzinātnes.", partySlug: "zzs", isActive: true },
    { slug: "raivis-dzintars", name: "Raivis Dzintars", role: "NA priekšsēdētājs", bio: "Nacionālās apvienības līderis.", education: "Latvijas Universitāte, Politikas zinātne.", partySlug: "na", isActive: true },
    { slug: "kaspars-briskens", name: "Kaspars Briškens", role: "Satiksmes ministrs", bio: "Satiksmes ministrs, Progresīvie.", education: "Stokholmas Ekonomikas augstskola, Ekonomikas maģistrs.", partySlug: "prog", isActive: true },
    { slug: "edvards-smiltens", name: "Edvards Smiltēns", role: "Saeimas sekretārs", bio: "Saeimas prezidija loceklis, AS līderis.", education: "Latvijas Universitāte, Juridiskā fakultāte.", partySlug: "as", isActive: true }, // Moved to AS
    { slug: "rihards-kozlovskis", name: "Rihards Kozlovskis", role: "Iekšlietu ministrs", bio: "Iekšlietu ministrs, Saeimas deputāts.", education: "Latvijas Policijas akadēmija, Jurists.", partySlug: "jv", isActive: true },
    { slug: "inese-libina-egnere", name: "Inese Lībiņa-Egnere", role: "Tieslietu ministre", bio: "Tieslietu ministre, juriste.", education: "Latvijas Universitāte, Tiesību zinātņu doktore.", partySlug: "jv", isActive: true },
    { slug: "viktors-valainis", name: "Viktors Valainis", role: "Ekonomikas ministrs", bio: "Ekonomikas ministrs, ZZS valdes priekšsēdētājs.", education: "Rīgas Tehniskā universitāte, Būvniecība.", partySlug: "zzs", isActive: true },
    { slug: "uldis-augulis", name: "Uldis Augulis", role: "Labklājības ministrs", bio: "Labklājības ministrs, ilggadējs politiķis.", education: "Latvijas Universitāte, Finanšu vadība.", partySlug: "zzs", isActive: true },
    { slug: "janis-dombrava", name: "Jānis Dombrava", role: "Saeimas deputāts", bio: "Nacionālās apvienības valdes loceklis.", education: "Latvijas Universitāte, Vēsture.", partySlug: "na", isActive: true },
    { slug: "juris-puce", name: "Juris Pūce", role: "Bijušais Ministrs", bio: "Bijušais VARAM ministrs.", education: "Latvijas Universitāte, Tiesību zinātne.", partySlug: "ap", isActive: false }, // Inactive 1
    { slug: "ainars-slesers", name: "Ainārs Šlesers", role: "Saeimas deputāts", bio: "Partijas 'Latvija pirmajā vietā' līderis.", education: "Norvēģijas Kristīgā vadības augstskola.", partySlug: "lpv", isActive: true },
    { slug: "aleksejs-roslikovs", name: "Aleksejs Rosļikovs", role: "Saeimas deputāts", bio: "Partijas 'Stabilitātei!' līderis.", education: "Baltijas Starptautiskā akadēmija.", partySlug: "stab", isActive: true },
    { slug: "nils-usakovs", name: "Nils Ušakovs", role: "Eiroparlamenta deputāts", bio: "Bijušais Rīgas mērs, 'Saskaņa' līderis.", education: "Latvijas Universitāte, Ekonomika.", partySlug: "sask", isActive: true },
    { slug: "kristjanis-karins", name: "Krišjānis Kariņš", role: "Bijušais Ministru prezidents", bio: "Bijušais premjers, tagad ierindas deputāts.", education: "Pensilvānijas Universitāte, Lingvistika.", partySlug: "jv", isActive: false }, // Inactive 2
    { slug: "egils-levits", name: "Egils Levits", role: "Bijušais Valsts Prezidents", bio: "Bijušais Valsts prezidents, jurists.", education: "Hamburgas Universitāte, Tiesību zinātne.", partySlug: "na", isActive: false }, // Inactive 3
    // LRA (New to ensure promises)
    { slug: "janis-vilnitis", name: "Jānis Vilnītis", role: "LRA valdes priekšsēdētājs", bio: "Bijušais Liepājas domes priekšsēdētājs.", education: "Latvijas Lauksaimniecības kameras neklātienes lauksaimniecības tehnikums.", partySlug: "lra", isActive: true },
    // LKS
    { slug: "miroslavs-mitrofanovs", name: "Miroslavs Mitrofanovs", role: "LKS līdzpriekšsēdētājs", bio: "Bijušais Saeimas un Eiroparlamenta deputāts.", education: "Latvijas Universitāte, Bioloģija.", partySlug: "lks", isActive: true },
    { slug: "tatjana-zdanoka", name: "Tatjana Ždanoka", role: "LKS līdere", bio: "Bijušā Eiroparlamenta deputāte.", education: "Latvijas Valsts universitāte, Matemātika.", partySlug: "lks", isActive: false },
    // SV
    { slug: "julija-stepanenko", name: "Jūlija Stepaņenko", role: "Partijas vadītāja", bio: "Saeimas deputāte, juriste.", education: "Latvijas Universitāte, Tiesību zinātnes.", partySlug: "sv", isActive: true },
    { slug: "lubova-svecova", name: "Ļubova Švecova", role: "Saeimas deputāte", bio: "Juriste, bijusī deputāte.", education: "Latvijas Policijas akadēmija, Tiesību zinātnes.", partySlug: "sv", isActive: true },
    // AS
    { slug: "maris-kucinskis", name: "Māris Kučinskis", role: "Saeimas deputāts", bio: "Bijušais Ministru prezidents.", education: "Latvijas Universitāte, Ekonomika.", partySlug: "as", isActive: true },
    // Konservatīvie
    { slug: "janis-bordans", name: "Jānis Bordāns", role: "Bijušais Ministrs", bio: "Bijušais Tieslietu ministrs.", education: "Latvijas Universitāte, Tiesību zinātnes.", partySlug: "kons", isActive: false },
    { slug: "gatis-eglitis", name: "Gatis Eglītis", role: "Valdes loceklis", bio: "Bijušais Labklājības ministrs.", education: "Vīnes Diplomātiskā akadēmija.", partySlug: "kons", isActive: true },
  ];

  const politicians: Record<string, { id: string }> = {};
  for (const pol of politiciansData) {
    const created = await prisma.politician.upsert({
      where: { slug: pol.slug },
      update: { name: pol.name, role: pol.role, bio: pol.bio, education: pol.education, isActive: pol.isActive, partyId: parties[pol.partySlug].id },
      create: {
        slug: pol.slug,
        name: pol.name,
        role: pol.role,
        bio: pol.bio,
        education: pol.education,
        isActive: pol.isActive,
        partyId: parties[pol.partySlug].id,
      },
    });
    politicians[pol.slug] = created;
  }
  console.log("Created politicians:", Object.keys(politicians).length);


  // Generate Promises
  // Constraints: 20 per politician to ensure 4 per status.
  const promiseTemplates = [
    { title: "Paaugstināt skolotāju algas", categorySlug: "education", tags: ["algas", "skola", "izglītība", "pedagogi"] },
    { title: "Samazināt PVN pārtikai", categorySlug: "economy", tags: ["nodokļi", "pārtika", "PVN", "ekonomika"] },
    { title: "Uzlabot veselības aprūpes pieejamību", categorySlug: "healthcare", tags: ["veselība", "slimnīcas", "rinda", "ārsti"] },
    { title: "Stiprināt valsts robežu", categorySlug: "security", tags: ["robeža", "drošība", "aizsardzība", "armija"] },
    { title: "Ieviest digitālo veselību", categorySlug: "digital", tags: ["e-veselība", "it", "digitalizācija"] },
    { title: "Atbalstīt jaunos lauksaimniekus", categorySlug: "agriculture", tags: ["lauki", "atbalsts", "zemnieki"] },
    { title: "Renovēt reģionālos ceļus", categorySlug: "infrastructure", tags: ["ceļi", "remonts", "satiksme", "reģioni"] },
    { title: "Palielināt pensijas", categorySlug: "social-welfare", tags: ["pensijas", "seniori", "labklājība"] },
    { title: "Nodrošināt bērnudārzu pieejamību", categorySlug: "education", tags: ["bērnudārzi", "bērni", "ģimene"] },
    { title: "Mazināt birokrātiju uzņēmējiem", categorySlug: "economy", tags: ["bizness", "birokrātija", "uzņēmējdarbība"] },
    { title: "Veicināt zaļo enerģiju", categorySlug: "environment", tags: ["enerģētika", "zaļais kurss", "klimats"] },
    { title: "Stiprināt korupcijas apkarošanu", categorySlug: "justice", tags: ["korupcija", "tieslietas", "caurspīdīgums"] },
    { title: "Atjaunot kultūras namus", categorySlug: "culture", tags: ["kultūra", "tradīcijas", "novadi"] },
    { title: "Uzlabot sabiedrisko transportu", categorySlug: "infrastructure", tags: ["transports", "autobusi", "vilcieni"] },
    { title: "Palielināt bērnu pabalstus", categorySlug: "social-welfare", tags: ["pabalsti", "bērni", "demogrāfija"] },
    { title: "Ieviest obligāto dienestu", categorySlug: "security", tags: ["dienests", "armija", "jaunieši"] },
    { title: "Samazināt darbaspēka nodokļus", categorySlug: "economy", tags: ["nodokļi", "darbs", "algas"] },
    { title: "Veicināt eksportu", categorySlug: "economy", tags: ["eksports", "ražošana", "tirgus"] },
    { title: "Uzlabot tiesu darbību", categorySlug: "justice", tags: ["tiesas", "likums", "taisnīgums"] },
    { title: "Atbalstīt sporta skolas", categorySlug: "youth", tags: ["sports", "skola", "treniņi"] },
  ];

  const statuses: PromiseStatus[] = ['KEPT', 'NOT_KEPT', 'IN_PROGRESS', 'PARTIAL', 'CANCELLED'];

  let promisesCreated = 0;

  // 1. INDIVIDUAL PROMISES
  console.log("Generating Individual Promises...");
  for (const pol of politiciansData) {
    // Generate exactly 3 promises per politician
    for (let i = 0; i < 3; i++) {
      // Round robin status to ensure distribution
      const status = statuses[(promisesCreated) % statuses.length];
      const template = randomItem(promiseTemplates);

      const longTitleBase = `${template.title} un nodrošināt ilgtermiņa stabilitāti Latvijas iedzīvotājiem ${2024 + i}. gadā`;
      const title = longTitleBase.padEnd(70, " - svarīgs solījums");

      const description = generateLongText(
        `Šis ir individuāls solījums, ko sniedzis ${pol.name} saistībā ar ${template.categorySlug} jomā. `,
        250
      );
      const explanation = generateLongText(
        `Pašreizējais statuss ir ${status}. Mēs esam veikuši vairākus soļus, lai to sasniegtu. `,
        250
      );

      const promiseTags = randomSubset(template.tags, Math.floor(Math.random() * 2) + 2); // 2 or 3 tags

      await prisma.promise.create({
        data: {
          title: title,
          slug: slugify(`${title.substring(0, 50)}-${pol.slug}-ind-${i}`),
          description: description,
          status: status,
          explanation: explanation,
          type: "INDIVIDUAL",
          dateOfPromise: new Date(`2023-${(i % 12) + 1}-15`),
          statusUpdatedAt: new Date(),
          politicianId: politicians[pol.slug].id,
          partyId: parties[pol.partySlug].id, // Also link to party for filtering convenience if desired, or leave null if strictly Individual. 
          // Note: Schema says partyId is for Single Party promises, but linking it for individuals helps "Promises by Ind in Party". 
          // For now, let's keep partyId for PARTY type promises mainly, but linking it is fine too.
          // However, the spec distinguishes "Party Promise" (partyId set, type=PARTY) vs "Ind Promise" (polId set, type=INDIV).
          // Let's NOT set partyId here to simulate strict separation, relying on politician.party relation for filtering.
          categoryId: categories[template.categorySlug].id,
          tags: promiseTags,
          sources: {
            create: {
              type: "ARTICLE", // Use valid SourceType
              url: "https://www.lsm.lv",
              title: "LSM Ziņas: Politiķa paziņojums",
              description: "Intervija ar politiķi par plānotajiem darbiem."
            }
          }
        }
      });
      promisesCreated++;
    }
  }

  // 2. PARTY PROMISES
  console.log("Generating Party Promises...");
  for (const party of partiesData) {
    // Generate 2 promises per party
    for (let i = 0; i < 2; i++) {
      const status = statuses[(promisesCreated) % statuses.length];
      const template = randomItem(promiseTemplates);

      const title = `${template.title} (Partijas programma)`;
      const description = generateLongText(`Šis ir partijas ${party.name} oficiālais solījums vēlētājiem. `, 250);
      const explanation = generateLongText(`Partijas progresa ziņojums: ${status}. `, 250);

      await prisma.promise.create({
        data: {
          title: title,
          slug: slugify(`party-${party.slug}-${template.categorySlug}-${i}`),
          description: description,
          status: status,
          explanation: explanation,
          type: "PARTY",
          dateOfPromise: new Date(`2023-${(i % 12) + 1}-20`),
          statusUpdatedAt: new Date(),
          partyId: parties[party.slug].id, // Set partyId
          categoryId: categories[template.categorySlug].id,
          tags: ["partijas-programma", ...template.tags],
          sources: {
            create: {
              type: "MANIFESTO", // Use new SourceType
              url: party.websiteUrl || "https://cvk.lv",
              title: `${party.name} 4000 zīmju programma`,
              description: "Oficiālā programma CVK mājaslapā."
            }
          }
        }
      });
      promisesCreated++;
    }
  }

  // 3. COALITION PROMISES
  console.log("Generating Coalition Promises...");
  const coalitionPartiesList = partiesData.filter(p => p.isCoalition);
  // Create 5 coalition promises
  for (let i = 0; i < 5; i++) {
    const status = statuses[(promisesCreated) % statuses.length];
    const template = randomItem(promiseTemplates);

    // Pick random 2-3 coalition parties
    const involvedParties = randomSubset(coalitionPartiesList, Math.floor(Math.random() * 2) + 2);
    // Ensure we have at least 2
    if (involvedParties.length < 2) continue;

    const partyIds = involvedParties.map(p => ({ id: parties[p.slug].id }));

    const title = `${template.title} (Koalīcijas līgums)`;
    const description = generateLongText(`Šis ir koalīcijas kopīgs solījums, kurā piedalās: ${involvedParties.map(p => p.name).join(", ")}. `, 250);
    const explanation = generateLongText(`Koalīcijas padomes progresa ziņojums. `, 250);

    await prisma.promise.create({
      data: {
        title: title,
        slug: slugify(`coalition-promise-${i}-${template.categorySlug}`),
        description: description,
        status: status,
        explanation: explanation,
        type: "COALITION",
        dateOfPromise: new Date(`2023-${(i % 12) + 1}-01`),
        statusUpdatedAt: new Date(),
        coalitionParties: {
          connect: partyIds // Connect multiple parties
        },
        categoryId: categories[template.categorySlug].id,
        tags: ["koalīcijas-līgums", "valdības-deklarācija", ...template.tags],
        sources: {
          create: {
            type: "GOVERNMENT_DOC", // Use new SourceType
            url: "https://mk.gov.lv",
            title: "Valdības deklarācija",
            description: "Deklarācija par Evikas Siliņas vadītā Ministru kabineta iecerēto darbību."
          }
        }
      }
    });
    promisesCreated++;
  }

  console.log(`Created ${promisesCreated} promises.`);
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
