import { PrismaClient, PromiseStatus } from "@prisma/client";
import { hash } from "bcryptjs";
import { config } from "dotenv";
import { slugify } from "../lib/slugify";

// Load environment variables
config({ path: ".env.local" });
config({ path: ".env" });

const prisma = new PrismaClient();

/**
 * SEEDING GUIDELINES:
 * - Do NOT include "Koalīcijas solījums" in promise titles. The promisor/author
 *   will be displayed separately in the UI, so this text would be redundant.
 * - Promise titles should be at least 70 characters long.
 * - Promise descriptions and status explanations should be at least 200 characters.
 */

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


  const promiseTemplates = [
    { title: "Ieviest valsts finansētu bērnu zobārstniecības programmu visos reģionos", categorySlug: "healthcare", tags: ["veselība", "bērni", "zobārstniecība"] },
    { title: "Palielināt valsts aizsardzības budžetu līdz trim procentiem no IKP", categorySlug: "security", tags: ["drošība", "aizsardzība", "IKP", "NATO"] },
    { title: "Samazināt pievienotās vērtības nodokļa likmi svaigiem dārzeņiem un augļiem", categorySlug: "economy", tags: ["ekonomika", "PVN", "pārtika"] },
    { title: "Nodrošināt bezmaksas braukšanu sabiedriskajā transportā visiem Latvijas pensionāriem", categorySlug: "infrastructure", tags: ["transports", "pensionāri", "atvieglojumi"] },
    { title: "Paaugstināt minimālo mēneša darba algu līdz astoņsimt eiro mēnesī", categorySlug: "social-welfare", tags: ["algas", "labklājība", "ekonomika"] },
    { title: "Izveidot jaunu zinātnes un inovāciju centru ar desmit tūkstošiem darba vietu", categorySlug: "digital", tags: ["inovācijas", "zinātne", "tehnoloģijas", "darbs"] },
    { title: "Stiprināt latviešu valodas lomu izglītības sistēmā un valsts pārvaldē", categorySlug: "education", tags: ["valoda", "izglītība", "identitāte"] },
    { title: "Paātrināt pāreju uz atjaunojamajiem energoresursiem visā valsts teritorijā", categorySlug: "environment", tags: ["enerģija", "vide", "klimats"] },
    { title: "Ieviest stingrākus sodus par korupciju un valsts līdzekļu izšķērdēšanu", categorySlug: "justice", tags: ["taisnīgums", "korupcija", "likums"] },
    { title: "Atbalstīt vietējos amatniekus un tradicionālās kultūras pasākumus novados", categorySlug: "culture", tags: ["kultūra", "novadi", "amatniecība"] },
    { title: "Modernizēt lauksaimniecības tehnikas parku un atbalstīt mazās saimniecības", categorySlug: "agriculture", tags: ["lauksaimniecība", "atbalsts", "tehnika"] },
    { title: "Uzlabot interneta pārklājumu un ātrumu attālākajos Latvijas reģionos", categorySlug: "digital", tags: ["internets", "reģioni", "tehnoloģijas"] },
    { title: "Būvēt jaunas īres mājas ar zemu maksu jaunajām speciālistu ģimenēm", categorySlug: "regional", tags: ["mājoklis", "ģimenes", "reģioni"] },
    { title: "Palielināt finanšu atbalstu sporta infrastruktūras attīstībai skolās", categorySlug: "youth", tags: ["sports", "skola", "veselība"] },
    { title: "Samazināt administratīvo slogu mazajiem un vidējiem uzņēmējiem", categorySlug: "economy", tags: ["bizness", "uzņēmējdarbība", "birokrātija"] },
    { title: "Nodrošināt modernu aprīkojumu visām Latvijas ugunsdzēsēju depo vienībām", categorySlug: "security", tags: ["drošība", "ugunsdzēsēji", "aprīkojums"] },
    { title: "Paplašināt onkoloģisko slimību skrīninga programmas un uzlabot ārstēšanu", categorySlug: "healthcare", tags: ["veselība", "ārstēšana", "medicīna"] },
    { title: "Veikt kapitālo remontu galvenajiem valsts autoceļiem un vietējiem ceļiem", categorySlug: "infrastructure", tags: ["ceļi", "transports", "infrastruktūra"] },
    { title: "Ieviest jaunu stipendiju fondu talantīgākajiem studentiem augstskolās", categorySlug: "education", tags: ["stipendijas", "studenti", "augstskola"] },
    { title: "Veicināt ekotūrismu un dabas parku aizsardzību visā valsts teritorijā", categorySlug: "environment", tags: ["tūrisms", "daba", "vide"] },
  ];

  const allStatuses: PromiseStatus[] = Object.values(PromiseStatus);
  const groupPartiesList = partiesData.filter(p => !p.isCoalition);

  let promisesCreated = 0;

  // Helper to generate a unique title for a combination
  const getUniqueTitle = (baseTitle: string, index: number) => {
    const extensions = [
      " un nodrošināt stabilu valsts izaugsmi ilgtermiņā",
      " visiem Latvijas iedzīvotājiem neatkarīgi no dzīvesvietas",
      " sadarbībā ar starptautiskajiem partneriem un ekspertiem",
      " rūpīgi izvērtējot visas pieejamās budžeta iespējas un prioritātes",
      " stiprinot valsts konkurētspēju un iedzīvotāju labklājību",
      " kā vienu no galvenajām valdības darba prioritātēm šajā ciklā",
      " lai veicinātu drošību un tiesiskumu visā sabiedrībā",
      " ievērojot labākās Eiropas prakses un standartus šajā jomā",
      " sniedzot tūlītēju atbalstu mērķa grupām un nozarēm",
      " nodrošinot caurspīdīgu un efektīvu procesu pārvaldību"
    ];
    let title = baseTitle;
    if (title.length < 70) {
      title += extensions[index % extensions.length];
    }
    while (title.length < 70) {
      title += " un veicināt tālāku attīstību.";
    }
    return title;
  };

  // CATEGORY COVERAGE (Every category must have every status)
  console.log("Generating Category Coverage Promises (Every Cat x Every Status)...");
  let polIdx = 0;
  for (const cat of categoriesData) {
    const categoryId = categories[cat.slug].id;
    const catTemplates = promiseTemplates.filter(t => t.categorySlug === cat.slug);

    for (const status of allStatuses) {
      // Rotate promisor types between INDIVIDUAL and PARTY only
      // (Coalition promises are generated separately at the end)
      const typeChoice = (promisesCreated % 2);
      const template = catTemplates.length > 0 ? catTemplates[promisesCreated % catTemplates.length] : randomItem(promiseTemplates);
      const finalTitle = getUniqueTitle(template.title, promisesCreated);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let promiseData: any = {
        title: finalTitle,
        slug: slugify(`cat-coverage-${cat.slug}-${status}-${promisesCreated}`),
        description: generateLongText(`Šis solījums paredz būtiskas izmaiņas ${cat.name.toLowerCase()} jomā. `, 250),
        status: status,
        explanation: generateLongText(`Pašreizējais vērtējums: statusu ${status} pamato fakts, ka darbi turpinās. `, 250),
        dateOfPromise: new Date(`2023-${(promisesCreated % 12) + 1}-15`),
        categoryId: categoryId,
        tags: randomSubset(template.tags, 2),
        sources: {
          create: {
            type: "ARTICLE",
            url: "https://www.lsm.lv",
            title: "Publisks paziņojums medijos",
            description: "Informācija no oficiāliem avotiem."
          }
        }
      };

      if (typeChoice === 0) { // INDIVIDUAL
        const pol = politiciansData[polIdx % politiciansData.length];
        const polId = politicians[pol.slug].id;
        const partyId = parties[pol.partySlug].id;
        promiseData = { ...promiseData, type: "INDIVIDUAL", politicianId: polId, partyId: partyId };
        polIdx++;
      } else { // PARTY
        const p = groupPartiesList[promisesCreated % groupPartiesList.length];
        promiseData = { ...promiseData, type: "PARTY", partyId: parties[p.slug].id };
      }

      await prisma.promise.create({ data: promiseData });
      promisesCreated++;
    }
  }

  // MINIMUM THRESHOLDS (Ensure each politician and party has at least 5 promises)
  console.log("Generating additional promises to meet minimum thresholds (5 per politician/party)...");

  // Additional Individual Promises
  for (const pol of politiciansData) {
    const polId = politicians[pol.slug].id;
    const existingCount = await prisma.promise.count({ where: { politicianId: polId } });

    for (let i = existingCount; i < 5; i++) {
      const cat = randomItem(categoriesData);
      const template = randomItem(promiseTemplates);
      const status = allStatuses[i % allStatuses.length];
      const finalTitle = getUniqueTitle(template.title, promisesCreated);

      await prisma.promise.create({
        data: {
          title: finalTitle,
          slug: slugify(`pol-threshold-${pol.slug}-${promisesCreated}`),
          description: generateLongText(`Specifisks solījums no ${pol.name}. `, 250),
          status,
          explanation: generateLongText(`Vērtējums: `, 250),
          type: "INDIVIDUAL",
          dateOfPromise: new Date(`2024-01-10`),
          politicianId: polId,
          partyId: parties[pol.partySlug].id,
          categoryId: categories[cat.slug].id,
          tags: randomSubset(template.tags, 1),
          sources: { create: { type: "VIDEO", url: "https://youtube.com", title: "Intervija" } }
        }
      });
      promisesCreated++;
    }
  }

  // Additional Party Promises
  for (const party of groupPartiesList) {
    const partyId = parties[party.slug].id;
    const existingCount = await prisma.promise.count({ where: { partyId, type: "PARTY" } });

    for (let i = existingCount; i < 5; i++) {
      const cat = randomItem(categoriesData);
      const template = randomItem(promiseTemplates);
      const status = allStatuses[i % allStatuses.length];
      const finalTitle = getUniqueTitle(template.title, promisesCreated);

      await prisma.promise.create({
        data: {
          title: finalTitle,
          slug: slugify(`party-threshold-${party.slug}-${promisesCreated}`),
          description: generateLongText(`${party.name} priekšvēlēšanu apņemšanās. `, 250),
          status,
          explanation: generateLongText(`Statusa pamatojums: `, 250),
          type: "PARTY",
          dateOfPromise: new Date(`2024-02-15`),
          partyId: partyId,
          categoryId: categories[cat.slug].id,
          tags: randomSubset(template.tags, 1),
          sources: { create: { type: "MANIFESTO", url: "https://cvk.lv", title: "Programma" } }
        }
      });
      promisesCreated++;
    }
  }

  // COALITION PROMISES (Created last, using the governing coalition: JV, ZZS, PROG)
  // Ensure at least 5 Coalition Promises with at least 1 per status
  console.log("Generating Coalition Promises (JV + ZZS + PROG)...");

  // Define the governing coalition: exactly 3 parties
  const governingCoalition = [
    { id: parties["jv"].id },   // Jaunā Vienotība
    { id: parties["zzs"].id },  // Zaļo un Zemnieku savienība  
    { id: parties["prog"].id }  // Progresīvie
  ];

  // First, ensure at least 1 coalition promise per status
  for (const status of allStatuses) {
    const cat = randomItem(categoriesData);
    const template = randomItem(promiseTemplates);
    const finalTitle = getUniqueTitle(template.title, promisesCreated);

    await prisma.promise.create({
      data: {
        title: finalTitle,
        slug: slugify(`coalition-${status}-${promisesCreated}`),
        description: generateLongText(`Valdošās koalīcijas kopīgais solījums ${cat.name.toLowerCase()} jomā. `, 250),
        status,
        explanation: generateLongText(`Koalīcijas saskaņotais vērtējums: `, 250),
        type: "COALITION",
        dateOfPromise: new Date(`2024-03-20`),
        coalitionParties: { connect: governingCoalition },
        categoryId: categories[cat.slug].id,
        tags: ["koalīcija", "valdība", "prioritāte"],
        sources: { create: { type: "GOVERNMENT_DOC", url: "https://mk.gov.lv", title: "Valdības deklarācija" } }
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

