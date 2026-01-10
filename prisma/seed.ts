import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

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

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "economy" },
      update: {},
      create: {
        name: { lv: "Ekonomika", en: "Economy", ru: "Экономика" },
        slug: "economy",
        color: "from-blue-500 to-blue-600",
      },
    }),
    prisma.category.upsert({
      where: { slug: "healthcare" },
      update: {},
      create: {
        name: { lv: "Veselības aprūpe", en: "Healthcare", ru: "Здравоохранение" },
        slug: "healthcare",
        color: "from-pink-500 to-rose-600",
      },
    }),
    prisma.category.upsert({
      where: { slug: "environment" },
      update: {},
      create: {
        name: { lv: "Vide", en: "Environment", ru: "Окружающая среда" },
        slug: "environment",
        color: "from-green-500 to-emerald-600",
      },
    }),
    prisma.category.upsert({
      where: { slug: "infrastructure" },
      update: {},
      create: {
        name: { lv: "Infrastruktūra", en: "Infrastructure", ru: "Инфраструктура" },
        slug: "infrastructure",
        color: "from-cyan-500 to-teal-600",
      },
    }),
    prisma.category.upsert({
      where: { slug: "education" },
      update: {},
      create: {
        name: { lv: "Izglītība", en: "Education", ru: "Образование" },
        slug: "education",
        color: "from-purple-500 to-violet-600",
      },
    }),
    prisma.category.upsert({
      where: { slug: "security" },
      update: {},
      create: {
        name: { lv: "Drošība", en: "Security", ru: "Безопасность" },
        slug: "security",
        color: "from-red-500 to-orange-600",
      },
    }),
  ]);
  console.log("Created categories:", categories.length);

  // Create parties
  const parties = await Promise.all([
    prisma.party.upsert({
      where: { slug: "jaunā-vienotiba" },
      update: {},
      create: {
        name: { lv: "Jaunā Vienotība", en: "New Unity", ru: "Новое Единство" },
        slug: "jauna-vienotiba",
        color: "#0066CC",
      },
    }),
    prisma.party.upsert({
      where: { slug: "zaļo-un-zemnieku-savieniba" },
      update: {},
      create: {
        name: { lv: "Zaļo un Zemnieku savienība", en: "Union of Greens and Farmers", ru: "Союз зелёных и крестьян" },
        slug: "zalo-un-zemnieku-savieniba",
        color: "#228B22",
      },
    }),
    prisma.party.upsert({
      where: { slug: "nacionala-apvieniba" },
      update: {},
      create: {
        name: { lv: "Nacionālā apvienība", en: "National Alliance", ru: "Национальное объединение" },
        slug: "nacionala-apvieniba",
        color: "#8B0000",
      },
    }),
  ]);
  console.log("Created parties:", parties.length);

  // Create politicians
  const politicians = await Promise.all([
    prisma.politician.upsert({
      where: { slug: "krisjanis-karins" },
      update: {},
      create: {
        name: "Krišjānis Kariņš",
        slug: "krisjanis-karins",
        bio: {
          lv: "Latvijas politiķis, bijušais Ministru prezidents.",
          en: "Latvian politician, former Prime Minister.",
          ru: "Латвийский политик, бывший премьер-министр.",
        },
        partyId: parties[0].id,
      },
    }),
    prisma.politician.upsert({
      where: { slug: "aivars-lembergs" },
      update: {},
      create: {
        name: "Aivars Lembergs",
        slug: "aivars-lembergs",
        bio: {
          lv: "Latvijas politiķis, bijušais Ventspils mērs.",
          en: "Latvian politician, former Mayor of Ventspils.",
          ru: "Латвийский политик, бывший мэр Вентспилса.",
        },
        partyId: parties[1].id,
      },
    }),
    prisma.politician.upsert({
      where: { slug: "raivis-dzintars" },
      update: {},
      create: {
        name: "Raivis Dzintars",
        slug: "raivis-dzintars",
        bio: {
          lv: "Latvijas politiķis, Nacionālās apvienības biedrs.",
          en: "Latvian politician, member of National Alliance.",
          ru: "Латвийский политик, член Национального объединения.",
        },
        partyId: parties[2].id,
      },
    }),
  ]);
  console.log("Created politicians:", politicians.length);

  // Create sample promises
  const promises = await Promise.all([
    prisma.promise.create({
      data: {
        text: {
          lv: "Paaugstināsim minimālo algu līdz 700 eiro mēnesī",
          en: "We will raise the minimum wage to 700 euros per month",
          ru: "Мы повысим минимальную зарплату до 700 евро в месяц",
        },
        status: "IN_PROGRESS",
        explanation: {
          lv: "Minimālā alga tiek pakāpeniski paaugstināta.",
          en: "The minimum wage is being gradually increased.",
          ru: "Минимальная зарплата постепенно повышается.",
        },
        dateOfPromise: new Date("2022-09-15"),
        politicianId: politicians[0].id,
        categoryId: categories[0].id,
        sources: {
          create: {
            type: "INTERVIEW",
            url: "https://example.com/interview-1",
            title: { lv: "Intervija LTV", en: "LTV Interview", ru: "Интервью LTV" },
          },
        },
      },
    }),
    prisma.promise.create({
      data: {
        text: {
          lv: "Uzlabosim veselības aprūpes pieejamību reģionos",
          en: "We will improve healthcare accessibility in regions",
          ru: "Мы улучшим доступность здравоохранения в регионах",
        },
        status: "PARTIAL",
        dateOfPromise: new Date("2022-08-20"),
        politicianId: politicians[0].id,
        categoryId: categories[1].id,
      },
    }),
    prisma.promise.create({
      data: {
        text: {
          lv: "Attīstīsim Rail Baltica projektu",
          en: "We will develop the Rail Baltica project",
          ru: "Мы разовьём проект Rail Baltica",
        },
        status: "IN_PROGRESS",
        dateOfPromise: new Date("2023-01-10"),
        politicianId: politicians[1].id,
        categoryId: categories[3].id,
      },
    }),
    prisma.promise.create({
      data: {
        text: {
          lv: "Samazināsim nodokļus mazajiem uzņēmumiem",
          en: "We will reduce taxes for small businesses",
          ru: "Мы снизим налоги для малого бизнеса",
        },
        status: "KEPT",
        explanation: {
          lv: "Nodokļu atvieglojumi mazajiem uzņēmumiem tika ieviesti 2023. gadā.",
          en: "Tax relief for small businesses was introduced in 2023.",
          ru: "Налоговые льготы для малого бизнеса были введены в 2023 году.",
        },
        dateOfPromise: new Date("2022-06-15"),
        politicianId: politicians[2].id,
        categoryId: categories[0].id,
      },
    }),
    prisma.promise.create({
      data: {
        text: {
          lv: "Palielināsim aizsardzības budžetu līdz 3% no IKP",
          en: "We will increase the defense budget to 3% of GDP",
          ru: "Мы увеличим оборонный бюджет до 3% от ВВП",
        },
        status: "KEPT",
        dateOfPromise: new Date("2022-03-01"),
        politicianId: politicians[2].id,
        categoryId: categories[5].id,
      },
    }),
    prisma.promise.create({
      data: {
        text: {
          lv: "Ieviesīsim bezmaksas pusdienas visās skolās",
          en: "We will introduce free lunches in all schools",
          ru: "Мы введём бесплатные обеды во всех школах",
        },
        status: "NOT_KEPT",
        explanation: {
          lv: "Budžeta ierobežojumu dēļ solījums netika izpildīts.",
          en: "Due to budget constraints, the promise was not fulfilled.",
          ru: "Из-за бюджетных ограничений обещание не было выполнено.",
        },
        dateOfPromise: new Date("2022-07-20"),
        politicianId: politicians[0].id,
        categoryId: categories[4].id,
      },
    }),
  ]);
  console.log("Created promises:", promises.length);

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
