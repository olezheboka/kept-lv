import { Party, Politician, Promise } from './types';

// Latvian Political Parties
export const parties: Party[] = [
  {
    id: 'jv',
    name: 'Jaunā Vienotība',
    abbreviation: 'JV',
    color: '#8AB73E',
    isInCoalition: true,
    mpCount: 26
  },
  {
    id: 'zzs',
    name: 'Zaļo un Zemnieku savienība',
    abbreviation: 'ZZS',
    color: '#026036',
    isInCoalition: true,
    mpCount: 16
  },
  {
    id: 'na',
    name: 'Nacionālā apvienība',
    abbreviation: 'NA',
    color: '#932330',
    isInCoalition: true,
    mpCount: 13
  },
  {
    id: 'ap',
    name: 'Attīstībai/Par!',
    abbreviation: 'AP!',
    color: '#000000',
    isInCoalition: false,
    mpCount: 0
  },
  {
    id: 'prog',
    name: 'Progresīvie',
    abbreviation: 'P',
    color: '#E63915',
    isInCoalition: false,
    mpCount: 10
  },
  {
    id: 'lra',
    name: 'Latvijas Reģionu apvienība',
    abbreviation: 'LRA',
    color: '#982632',
    isInCoalition: false,
    mpCount: 8
  },
  {
    id: 'stab',
    name: 'Stabilitātei!',
    abbreviation: 'S!',
    color: '#fd7e14',
    isInCoalition: false,
    mpCount: 11
  },
  {
    id: 'lpv',
    name: 'Latvija pirmajā vietā',
    abbreviation: 'LPV',
    color: '#9E3139',
    isInCoalition: false,
    mpCount: 9
  },
  {
    id: 'sask',
    name: 'Saskaņa',
    abbreviation: 'S',
    color: '#E31D23',
    isInCoalition: false,
    mpCount: 0
  }
];

// Sample Politicians
export const politicians: Politician[] = [
  {
    id: 'evika-silina',
    name: 'Evika Siliņa',
    role: 'Ministru prezidente',
    partyId: 'jv',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face',
    isInOffice: true,
    bio: 'Prime Minister of Latvia since 2023'
  },
  {
    id: 'arvils-aseradens',
    name: 'Arvils Ašeradens',
    role: 'Ekonomikas ministrs',
    partyId: 'jv',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    isInOffice: true
  },
  {
    id: 'anda-caksa',
    name: 'Anda Čakša',
    role: 'Izglītības un zinātnes ministre',
    partyId: 'jv',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face',
    isInOffice: true
  },
  {
    id: 'andris-spruds',
    name: 'Andris Sprūds',
    role: 'Aizsardzības ministrs',
    partyId: 'prog',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    isInOffice: true
  },
  {
    id: 'baiba-braze',
    name: 'Baiba Braže',
    role: 'Ārlietu ministre',
    partyId: 'jv',
    photoUrl: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=200&h=200&fit=crop&crop=face',
    isInOffice: true
  },
  {
    id: 'hosams-abu-meri',
    name: 'Hosams Abu Meri',
    role: 'Veselības ministrs',
    partyId: 'jv',
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face',
    isInOffice: true
  },
  {
    id: 'raimonds-bergmanis',
    name: 'Raimonds Bergmanis',
    role: 'Saeimas deputāts',
    partyId: 'zzs',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=face',
    isInOffice: true
  },
  {
    id: 'raivis-dzintars',
    name: 'Raivis Dzintars',
    role: 'Nacionālās apvienības līderis',
    partyId: 'na',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
    isInOffice: true
  },
  {
    id: 'agnese-logina',
    name: 'Agnese Logina',
    role: 'Saeimas deputāte',
    partyId: 'prog',
    photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
    isInOffice: true
  },
  {
    id: 'edvards-smiltens',
    name: 'Edvards Smiltēns',
    role: 'Saeimas priekšsēdētājs',
    partyId: 'na',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face',
    isInOffice: true
  }
];

// Sample Promises
export const promises: Promise[] = [
  {
    id: 'promise-1',
    title: 'Paaugstināt skolotāju algas par 20% līdz 2025. gadam',
    fullText: 'Mēs apņemamies palielināt skolotāju algas par 20% mūsu pilnvaru laikā, lai piesaistītu un noturētu kvalitatīvus pedagogus Latvijas skolās.',
    politicianId: 'anda-caksa',
    partyId: 'jv',
    datePromised: '2022-09-15',
    electionCycle: '2022 Saeima Elections',
    status: 'in-progress',
    statusJustification: 'Valdība ir īstenojusi 10% palielinājumu no 2024. gada janvāra, vēl 10% plānots 2025. gada budžetā, kas gaida Saeimas apstiprinājumu.',
    statusUpdatedAt: '2024-12-15',
    statusUpdatedBy: 'Kept Analytics Team',
    category: 'education-science',
    importance: 'Skolotāju atalgojuma palielināšana ir kritiski svarīga, lai nodrošinātu kvalitatīvu izglītību un piesaistītu jaunus pedagogus nozarei, kurā vērojams būtisks darbaspēka trūkums.',
    tags: ['izglītība', 'algas', 'skolotāji'],
    sources: [
      {
        title: 'Valdība paziņo par izglītības budžeta palielināšanu',
        url: 'https://www.lsm.lv',
        publication: 'LSM.lv',
        date: '2024-01-15'
      }
    ],
    viewCount: 15420,
    featured: true
  },
  {
    id: 'promise-2',
    title: 'Sasniegt 2.5% no IKP aizsardzības izdevumiem',
    fullText: 'Latvija apņemas palielināt aizsardzības izdevumus līdz 2.5% no IKP, lai stiprinātu nacionālo drošību un NATO saistības.',
    politicianId: 'andris-spruds',
    partyId: 'prog',
    datePromised: '2023-01-20',
    electionCycle: '2022 Saeima Elections',
    status: 'kept',
    statusJustification: 'Latvija 2024. gadā sasniedza 2.4% no IKP aizsardzībai un 2025. gada budžetā apstiprināja 2.5% mērķi.',
    statusUpdatedAt: '2025-01-05',
    statusUpdatedBy: 'Kept Analytics Team',
    category: 'defense-security',
    tags: ['aizsardzība', 'NATO', 'budžets'],
    sources: [
      {
        title: 'Latvija sasniedz NATO 2% mērķi',
        url: 'https://www.lsm.lv',
        publication: 'LSM.lv',
        date: '2024-06-10'
      }
    ],
    viewCount: 23150,
    featured: true
  },
  {
    id: 'promise-3',
    title: 'Ieviest ģimenes ārstu pieejamību 48 stundu laikā',
    fullText: 'Katram Latvijas iedzīvotājam būs iespēja nokļūt pie ģimenes ārsta 48 stundu laikā pēc pieteikuma.',
    politicianId: 'hosams-abu-meri',
    partyId: 'jv',
    datePromised: '2022-10-01',
    deadline: '2026-10-01',
    electionCycle: '2022 Saeima Elections',
    status: 'broken',
    statusJustification: 'Neskatoties uz reformām, vidējais gaidīšanas laiks joprojām pārsniedz 5 darba dienas lielākajā daļā reģionu. Ārstu trūkums laukos nav atrisināts.',
    statusUpdatedAt: '2024-11-20',
    statusUpdatedBy: 'Kept Analytics Team',
    category: 'healthcare',
    tags: ['veselība', 'ārsti', 'pieejamība'],
    sources: [
      {
        title: 'Ģimenes ārstu pieejamība joprojām problemātiska',
        url: 'https://www.delfi.lv',
        publication: 'Delfi.lv',
        date: '2024-11-15'
      }
    ],
    viewCount: 31200,
    featured: true
  },
  {
    id: 'promise-4',
    title: 'Rail Baltica pabeigšana līdz 2030. gadam',
    fullText: 'Rail Baltica projekts tiks pabeigts līdz 2030. gadam, savienojot Baltijas valstis ar Eiropu.',
    politicianId: 'evika-silina',
    partyId: 'jv',
    datePromised: '2023-03-15',
    status: 'in-progress',
    statusJustification: 'Būvdarbi turpinās, bet projekts saskaras ar kavējumiem un budžeta pārsniegumiem. Jauns termiņš varētu būt 2031-2032.',
    statusUpdatedAt: '2024-10-01',
    statusUpdatedBy: 'Kept Analytics Team',
    category: 'transport-infrastructure',
    tags: ['transports', 'dzelzceļš', 'infrastruktūra', 'ES'],
    sources: [
      {
        title: 'Rail Baltica progress update',
        url: 'https://www.railbaltica.org',
        publication: 'Rail Baltica',
        date: '2024-09-20'
      }
    ],
    viewCount: 18900,
    featured: false
  },
  {
    id: 'promise-5',
    title: 'Samazināt PVN pārtikas produktiem līdz 5%',
    fullText: 'Mēs samazināsim PVN pamata pārtikas produktiem no 21% līdz 5%, lai mazinātu inflācijas slogu mājsaimniecībām.',
    politicianId: 'arvils-aseradens',
    partyId: 'jv',
    datePromised: '2022-08-20',
    electionCycle: '2022 Saeima Elections',
    status: 'partially-kept',
    statusJustification: 'PVN samazināts līdz 12% noteiktiem produktiem, bet pilnīgs 5% samazinājums nav ieviests budžeta ierobežojumu dēļ.',
    statusUpdatedAt: '2024-08-15',
    statusUpdatedBy: 'Kept Analytics Team',
    category: 'economy-finance',
    tags: ['nodokļi', 'PVN', 'pārtika', 'inflācija'],
    sources: [
      {
        title: 'Saeima apstiprina PVN samazinājumu',
        url: 'https://www.lsm.lv',
        publication: 'LSM.lv',
        date: '2024-06-01'
      }
    ],
    viewCount: 42100,
    featured: true
  },
  {
    id: 'promise-6',
    title: 'Izveidot 10,000 jaunas bērnudārza vietas',
    fullText: 'Valdība izveidos 10,000 jaunas pirmsskolas izglītības vietas, lai novērstu rindu problēmu.',
    politicianId: 'anda-caksa',
    partyId: 'jv',
    datePromised: '2022-10-10',
    electionCycle: '2022 Saeima Elections',
    status: 'in-progress',
    statusJustification: 'Izveidotas 4,200 jaunas vietas. Programma turpinās, bet temps ir lēnāks nekā plānots.',
    statusUpdatedAt: '2024-09-01',
    statusUpdatedBy: 'Kept Analytics Team',
    category: 'education-science',
    tags: ['izglītība', 'bērni', 'pirmsskola'],
    sources: [],
    viewCount: 8700,
    featured: false
  },
  {
    id: 'promise-7',
    title: 'Panākt 50% atjaunojamās enerģijas īpatsvaru',
    fullText: 'Latvija sasniegs 50% atjaunojamās enerģijas īpatsvaru elektroenerģijas ražošanā līdz 2026. gadam.',
    politicianId: 'evika-silina',
    partyId: 'jv',
    datePromised: '2023-06-01',
    status: 'in-progress',
    statusJustification: 'Pašreizējais līmenis ir aptuveni 42%. Vairāki vēja parku projekti ir izstrādes stadijā.',
    statusUpdatedAt: '2024-12-01',
    statusUpdatedBy: 'Kept Analytics Team',
    category: 'environment-energy',
    tags: ['enerģētika', 'klimats', 'zaļā enerģija'],
    sources: [],
    viewCount: 12400,
    featured: false
  },
  {
    id: 'promise-8',
    title: 'Palielināt minimālo algu līdz 700 EUR',
    fullText: 'Minimālā alga tiks palielināta līdz 700 EUR mēnesī, lai uzlabotu dzīves līmeni.',
    politicianId: 'arvils-aseradens',
    partyId: 'jv',
    datePromised: '2022-09-01',
    electionCycle: '2022 Saeima Elections',
    status: 'kept',
    statusJustification: 'Minimālā alga palielināta līdz 700 EUR no 2024. gada 1. janvāra.',
    statusUpdatedAt: '2024-01-15',
    statusUpdatedBy: 'Kept Analytics Team',
    category: 'economy-finance',
    tags: ['algas', 'darbs', 'ekonomika'],
    sources: [
      {
        title: 'Minimālā alga pieaug līdz 700 EUR',
        url: 'https://www.lsm.lv',
        publication: 'LSM.lv',
        date: '2024-01-02'
      }
    ],
    viewCount: 38500,
    featured: false
  },
  {
    id: 'promise-9',
    title: 'Ieviest e-veselības karti visiem iedzīvotājiem',
    fullText: 'Katram Latvijas iedzīvotājam būs pieejama digitāla veselības karte ar pilnu medicīnisko vēsturi.',
    politicianId: 'hosams-abu-meri',
    partyId: 'jv',
    datePromised: '2023-02-15',
    status: 'in-progress',
    statusJustification: 'Sistēma ir izstrādes stadijā. Pilotprojekts sākts Rīgā ar 50,000 lietotājiem.',
    statusUpdatedAt: '2024-11-01',
    statusUpdatedBy: 'Kept Analytics Team',
    category: 'digital-technology',
    tags: ['digitalizācija', 'veselība', 'e-pakalpojumi'],
    sources: [],
    viewCount: 9800,
    featured: false
  },
  {
    id: 'promise-10',
    title: 'Cīņa pret korupciju - KNAB budžeta dubultošana',
    fullText: 'Dubultosim Korupcijas novēršanas un apkarošanas biroja budžetu, lai stiprinātu tā kapacitāti.',
    politicianId: 'raivis-dzintars',
    partyId: 'na',
    datePromised: '2022-08-30',
    electionCycle: '2022 Saeima Elections',
    status: 'partially-kept',
    statusJustification: 'KNAB budžets palielināts par 40%, bet ne dubultots. Papildu finansējums piešķirts 2024. gadā.',
    statusUpdatedAt: '2024-07-20',
    statusUpdatedBy: 'Kept Analytics Team',
    category: 'justice-law',
    tags: ['korupcija', 'tiesiskums', 'KNAB'],
    sources: [],
    viewCount: 15600,
    featured: false
  },
  {
    id: 'promise-11',
    title: 'Nodrošināt 100% valsts valodas prasmi skolās',
    fullText: 'Visas mazākumtautību skolas pilnībā pāries uz latviešu valodu kā mācību valodu.',
    politicianId: 'raivis-dzintars',
    partyId: 'na',
    datePromised: '2022-07-15',
    electionCycle: '2022 Saeima Elections',
    status: 'kept',
    statusJustification: 'Reforma pilnībā ieviesta. Kopš 2024./2025. mācību gada visas skolas strādā latviešu valodā.',
    statusUpdatedAt: '2024-09-10',
    statusUpdatedBy: 'Kept Analytics Team',
    category: 'education-science',
    tags: ['izglītība', 'valoda', 'reforma'],
    sources: [],
    viewCount: 28900,
    featured: false
  },
  {
    id: 'promise-12',
    title: 'Izveidot atbalsta programmu jaunajiem lauksaimniekiem',
    fullText: 'Jaunajiem lauksaimniekiem līdz 40 gadu vecumam būs pieejams līdz 100,000 EUR grants uzņēmējdarbības uzsākšanai.',
    politicianId: 'raimonds-bergmanis',
    partyId: 'zzs',
    datePromised: '2022-09-25',
    electionCycle: '2022 Saeima Elections',
    status: 'kept',
    statusJustification: 'Programma "Jaunais lauksaimnieks" darbojas ar kopējo finansējumu 15 milj. EUR. Pieteikušies vairāk nekā 200 jaunie lauksaimnieki.',
    statusUpdatedAt: '2024-05-15',
    statusUpdatedBy: 'Kept Analytics Team',
    category: 'agriculture-rural',
    tags: ['lauksaimniecība', 'jaunieši', 'atbalsts'],
    sources: [],
    viewCount: 7200,
    featured: false
  },
  {
    id: 'promise-13',
    title: 'Pensiju indeksācija virs inflācijas līmeņa',
    fullText: 'Pensijas tiks indeksētas vismaz par 2 procentpunktiem virs inflācijas līmeņa.',
    politicianId: 'evika-silina',
    partyId: 'jv',
    datePromised: '2023-09-15',
    deadline: '2025-01-01',
    status: 'broken',
    statusJustification: 'Pensiju indeksācija 2024. gadā bija zemāka par inflāciju. Budžeta ierobežojumi neļāva izpildīt solījumu.',
    statusUpdatedAt: '2024-10-20',
    statusUpdatedBy: 'Kept Analytics Team',
    category: 'social-welfare',
    tags: ['pensijas', 'sociālā aizsardzība', 'inflācija'],
    sources: [],
    viewCount: 45200,
    featured: true
  },
  {
    id: 'promise-14',
    title: 'Atcelt obligāto militāro dienestu',
    fullText: 'Mēs iestājamies pret obligātā militārā dienesta atjaunošanu Latvijā.',
    politicianId: 'agnese-logina',
    partyId: 'prog',
    datePromised: '2022-08-15',
    electionCycle: '2022 Saeima Elections',
    status: 'broken',
    statusJustification: 'Saeima 2024. gadā apstiprināja Valsts aizsardzības dienesta likumu ar obligāto militāro dienestu no 2027. gada.',
    statusUpdatedAt: '2024-06-15',
    statusUpdatedBy: 'Kept Analytics Team',
    category: 'defense-security',
    tags: ['aizsardzība', 'militārais dienests'],
    sources: [],
    viewCount: 22100,
    featured: false
  },
  {
    id: 'promise-15',
    title: 'Investēt 1 miljardu EUR reģionu attīstībā',
    fullText: 'Valdība ieguldīs 1 miljardu EUR reģionu attīstībā un ceļu infrastruktūrā līdz 2027. gadam.',
    politicianId: 'evika-silina',
    partyId: 'jv',
    datePromised: '2023-05-20',
    status: 'in-progress',
    statusJustification: 'Līdz šim investēti aptuveni 320 milj. EUR. Projekti turpinās saskaņā ar grafiku.',
    statusUpdatedAt: '2024-12-01',
    statusUpdatedBy: 'Kept Analytics Team',
    category: 'housing-regional',
    tags: ['reģioni', 'investīcijas', 'infrastruktūra'],
    sources: [],
    viewCount: 11300,
    featured: false
  },
  {
    id: 'promise-16',
    title: 'Atvērt Latvijas tirgu Ukrainas precēm',
    fullText: 'Latvija aktīvi atbalstīs Ukrainas integrāciju ES un atvieglotu tirdzniecības režīmu.',
    politicianId: 'baiba-braze',
    partyId: 'jv',
    datePromised: '2022-11-01',
    deadline: '2024-12-31',
    status: 'kept',
    statusJustification: 'Latvija aktīvi atbalsta Ukrainas ES kandidātvalsts statusu un ir viena no vadošajām valstīm Ukrainas atbalstā.',
    statusUpdatedAt: '2024-08-01',
    statusUpdatedBy: 'Kept Analytics Team',
    category: 'foreign-affairs',
    tags: ['Ukraina', 'ES', 'ārpolitika'],
    sources: [],
    viewCount: 8900,
    featured: false
  },
  {
    id: 'promise-17',
    title: 'Nodrošināt bezmaksas ēdināšanu visiem skolēniem',
    fullText: 'Bezmaksas ēdināšana tiks nodrošināta visiem Latvijas skolēniem līdz 9. klasei.',
    politicianId: 'anda-caksa',
    partyId: 'jv',
    datePromised: '2022-10-20',
    electionCycle: '2022 Saeima Elections',
    status: 'partially-kept',
    statusJustification: 'Bezmaksas ēdināšana pieejama 1.-4. klašu skolēniem. Paplašināšana līdz 9. klasei plānota pakāpeniski.',
    statusUpdatedAt: '2024-09-05',
    statusUpdatedBy: 'Kept Analytics Team',
    category: 'education-science',
    tags: ['izglītība', 'ēdināšana', 'skolas'],
    sources: [],
    viewCount: 19400,
    featured: false
  },
  {
    id: 'promise-18',
    title: 'Digitalizēt 100% valsts pakalpojumus',
    fullText: 'Visi valsts pakalpojumi būs pieejami digitāli līdz 2025. gada beigām.',
    politicianId: 'evika-silina',
    partyId: 'jv',
    datePromised: '2023-01-10',
    status: 'in-progress',
    statusJustification: 'Aptuveni 75% valsts pakalpojumu pieejami digitāli. Portāls Latvija.lv turpina attīstīties.',
    statusUpdatedAt: '2024-11-15',
    statusUpdatedBy: 'Kept Analytics Team',
    category: 'digital-technology',
    tags: ['digitalizācija', 'e-pārvalde', 'pakalpojumi'],
    sources: [],
    viewCount: 6800,
    featured: false
  }
];

// Helper functions
export const getPartyById = (id: string): Party | undefined =>
  parties.find(p => p.id === id);

export const getPoliticianById = (id: string): Politician | undefined =>
  politicians.find(p => p.id === id);

export const getPromiseById = (id: string): Promise | undefined =>
  promises.find(p => p.id === id);

export const getPromisesByPolitician = (politicianId: string): Promise[] =>
  promises.filter(p => p.politicianId === politicianId);

export const getPromisesByParty = (partyId: string): Promise[] =>
  promises.filter(p => p.partyId === partyId);

export const getPromisesByCategory = (category: string): Promise[] =>
  promises.filter(p => p.category === category);

export const getPromisesByStatus = (status: string): Promise[] =>
  promises.filter(p => p.status === status);

export const getFeaturedPromises = (): Promise[] =>
  promises.filter(p => p.featured);

export const getPromiseStats = () => {
  const total = promises.length;
  const kept = promises.filter(p => p.status === 'kept').length;
  const partiallyKept = promises.filter(p => p.status === 'partially-kept').length;
  const inProgress = promises.filter(p => p.status === 'in-progress').length;
  const broken = promises.filter(p => p.status === 'broken').length;
  const notRated = promises.filter(p => p.status === 'not-rated').length;

  return {
    total,
    kept,
    partiallyKept,
    inProgress,
    broken,
    notRated,
    keptPercentage: Math.round((kept / total) * 100),
    brokenPercentage: Math.round((broken / total) * 100),
  };
};

export interface RankingItem {
  id: string;
  name: string;
  avatarUrl?: string; // photoUrl for politician, logoUrl for party
  color?: string; // For fallback party avatar or party color
  role?: string; // Only for politician
  partyId?: string; // Only for politician
  totalPromises: number;
  keptPromises: number;
  keptPercentage: number;
  abbreviation?: string; // For parties
}

export const getPoliticianRankings = (): RankingItem[] => {
  return politicians
    .map(politician => {
      const politiciansPromises = getPromisesByPolitician(politician.id);
      const totalPromises = politiciansPromises.length;
      const keptPromises = politiciansPromises.filter(p => p.status === 'kept').length;

      return {
        id: politician.id,
        name: politician.name,
        avatarUrl: politician.photoUrl,
        partyId: politician.partyId,
        role: politician.role,
        totalPromises,
        keptPromises,
        keptPercentage: totalPromises > 0 ? Math.round((keptPromises / totalPromises) * 100) : 0
      };
    })
    .filter(item => item.totalPromises > 0)
    .sort((a, b) => b.keptPercentage - a.keptPercentage);
};

export const getPartyRankings = (): RankingItem[] => {
  return parties
    .map(party => {
      const partyPromises = getPromisesByParty(party.id);
      const totalPromises = partyPromises.length;
      const keptPromises = partyPromises.filter(p => p.status === 'kept').length;

      return {
        id: party.id,
        name: party.name,
        avatarUrl: party.logoUrl,
        abbreviation: party.abbreviation,
        color: party.color,
        totalPromises,
        keptPromises,
        keptPercentage: totalPromises > 0 ? Math.round((keptPromises / totalPromises) * 100) : 0
      };
    })
    .filter(item => item.totalPromises > 0)
    .sort((a, b) => b.keptPercentage - a.keptPercentage);
};
