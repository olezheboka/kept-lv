import { ComponentDoc } from "./ComponentDoc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// Domain Imports
import { PromiseCard } from "@/components/PromiseCard";
import { RankingCard } from "@/components/RankingCard";
import { StatusBadge } from "@/components/StatusBadge";

// Icons
import {
    ArrowRight, Settings, Trash2, Mail, Loader2, Plus, Info, CheckCircle2, AlertCircle,
    Calendar, User, Search, Menu, X, ChevronDown, ChevronUp, ChevronRight, ChevronLeft,
    ExternalLink, Share2, Filter, Download
} from "lucide-react";
import type { PromiseUI, PartyWithStats, CategoryWithStats, PoliticianWithStats } from "@/lib/db";
import { PartyCard } from "@/components/PartyCard";
import { CategoryCard } from "@/components/CategoryCard";
import { PoliticianCard } from "@/components/PoliticianCard";
import { StatsPieChart } from "@/components/StatsPieChart";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// --- MOCK DATA ---
const mockPromise: PromiseUI = {
    id: "mock-1",
    title: "Uzlabot interneta pārklājumu un ātrumu attālākajos Latvijas reģionos stiprinot valsts konkurētspēju",
    status: "pending",
    datePromised: "2024-01-15",
    politicianName: "Evika Siliņa",
    politicianRole: "Ministru prezidente",
    politicianImageUrl: undefined,
    politicianIsInOffice: true,
    partyName: "Jaunā Vienotība",
    partySlug: "jauna-vienotiba",
    partyColor: "#ff0000",
    categorySlug: "transports",
    type: "INDIVIDUAL",
    slug: "internet-coverage",
    createdAt: new Date(),
    updatedAt: new Date(),
    politicianId: "p1",
    partyId: "party1",
    categoryId: "cat1",
    sourceUrl: "https://example.com",
    sourceTitle: "Government Plan",
    explanation: null,
    tags: [],
    timeline: [],
    coalitionParties: []
};

const mockRankingData = [
    { id: "p1", name: "Evika Siliņa", role: "Ministru prezidente", keptPromises: 5, totalPromises: 10, keptPercentage: 50, isInOffice: true },
    { id: "p2", name: "Edgars Rinkēvičs", role: "Prezidents", keptPromises: 8, totalPromises: 10, keptPercentage: 80, isInOffice: true },
    { id: "p3", name: "Ainārs Šlesers", role: "Opozīcijas līderis", keptPromises: 1, totalPromises: 10, keptPercentage: 10, isInOffice: true },
];

const mockStats = {
    total: 10,
    kept: 3,
    partiallyKept: 2,
    pending: 4,
    broken: 1,
    cancelled: 0,
    keptPercentage: 30,
    brokenPercentage: 10
};

const mockPartyWithStats: PartyWithStats = {
    id: "party1",
    name: "Jaunā Vienotība",
    slug: "jauna-vienotiba",
    abbreviation: "JV",
    color: "#2695FE",
    logoUrl: undefined,
    isCoalition: true,
    isInCoalition: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    description: "Centriska partija",
    mpCount: 26,
    stats: mockStats
};

const mockCategoryWithStats: CategoryWithStats = {
    id: "cat1",
    name: "Transports",
    slug: "transports",
    description: "Transpors un infrastruktūra",
    color: "#ff0000",
    icon: undefined,
    imageUrl: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    stats: mockStats
};

const mockPoliticianWithStats: PoliticianWithStats = {
    id: "p1",
    name: "Evika Siliņa",
    slug: "evika-silina",
    role: "Ministru prezidente",
    isActive: true,
    partyId: "party1",
    imageUrl: undefined,
    isInOffice: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    party: {
        id: "party1",
        name: "Jaunā Vienotība",
        slug: "jauna-vienotiba",
        color: "#2695FE",
        logoUrl: null
    },
    stats: mockStats
};

const ColorSwatch = ({ name, variable, className }: { name: string, variable: string, className?: string }) => (
    <div className="flex flex-col gap-2">
        <div className={cn("h-16 w-full rounded-md border border-border/50 shadow-sm", className)} style={{ backgroundColor: `hsl(var(${variable}))` }} />
        <div className="space-y-0.5">
            <p className="text-xs font-medium">{name}</p>
            <p className="text-[10px] text-muted-foreground font-mono">{variable}</p>
        </div>
    </div>
);

const IconWrapper = ({ name, icon: Icon }: { name: string, icon: any }) => (
    <div className="flex flex-col items-center gap-2 p-4 rounded-md border border-border/40 hover:bg-muted/50 transition-colors">
        <Icon className="h-6 w-6" />
        <span className="text-xs text-muted-foreground">{name}</span>
    </div>
);

export default function ComponentsInventoryPage() {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 fixed h-screen overflow-y-auto border-r border-border bg-muted/10 p-6 hidden lg:block z-10 scrollbar-thin">
                    <div className="mb-8">
                        <h1 className="font-bold text-xl tracking-tight">Component<br />Inventory</h1>
                        <p className="text-xs text-muted-foreground mt-2">v1.1.0 • Solījums.lv</p>
                    </div>

                    <nav className="space-y-8">
                        <div>
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Settings className="w-3 h-3" /> System
                            </h3>
                            <ul className="space-y-1 text-sm">
                                <li><a href="#tokens" className="block px-2 py-1.5 rounded hover:bg-muted/50 text-foreground/80 hover:text-foreground transition-colors">Design Tokens</a></li>
                                <li><a href="#typography" className="block px-2 py-1.5 rounded hover:bg-muted/50 text-foreground/80 hover:text-foreground transition-colors">Typography</a></li>
                                <li><a href="#icons" className="block px-2 py-1.5 rounded hover:bg-muted/50 text-foreground/80 hover:text-foreground transition-colors">Icons</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                                <User className="w-3 h-3" /> Primitives
                            </h3>
                            <ul className="space-y-1 text-sm">
                                <li><a href="#buttons" className="block px-2 py-1.5 rounded hover:bg-muted/50 text-foreground/80 hover:text-foreground transition-colors">Buttons</a></li>
                                <li><a href="#badges" className="block px-2 py-1.5 rounded hover:bg-muted/50 text-foreground/80 hover:text-foreground transition-colors">Badges</a></li>
                                <li><a href="#inputs" className="block px-2 py-1.5 rounded hover:bg-muted/50 text-foreground/80 hover:text-foreground transition-colors">Inputs & Forms</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Calendar className="w-3 h-3" /> Domain
                            </h3>
                            <ul className="space-y-1 text-sm">
                                <li><a href="#domain-badges" className="block px-2 py-1.5 rounded hover:bg-muted/50 text-foreground/80 hover:text-foreground transition-colors">Status Badges</a></li>
                                <li><a href="#cards" className="block px-2 py-1.5 rounded hover:bg-muted/50 text-foreground/80 hover:text-foreground transition-colors">Cards</a></li>
                            </ul>
                        </div>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 lg:ml-64 p-8 lg:p-12 max-w-6xl mx-auto space-y-20">

                    {/* DESIGN TOKENS */}
                    <section id="tokens" className="scroll-mt-24">
                        <div className="mb-6">
                            <h2 className="text-3xl font-bold mb-2">Design Tokens</h2>
                            <p className="text-muted-foreground">Core color palette and theme variables from <code>globals.css</code>.</p>
                        </div>

                        <Card className="border-border/60 shadow-none">
                            <div className="p-6">
                                <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground">Base Colors</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                                    <ColorSwatch name="Background" variable="--background" className="border" />
                                    <ColorSwatch name="Foreground" variable="--foreground" />
                                    <ColorSwatch name="Card" variable="--card" className="border" />
                                    <ColorSwatch name="Card FG" variable="--card-foreground" />
                                    <ColorSwatch name="Muted" variable="--muted" />
                                    <ColorSwatch name="Muted FG" variable="--muted-foreground" />
                                </div>

                                <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground">Accents & UI</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                                    <ColorSwatch name="Primary" variable="--primary" />
                                    <ColorSwatch name="Primary FG" variable="--primary-foreground" />
                                    <ColorSwatch name="Secondary" variable="--secondary" />
                                    <ColorSwatch name="Secondary FG" variable="--secondary-foreground" />
                                    <ColorSwatch name="Accent" variable="--accent" />
                                    <ColorSwatch name="Accent FG" variable="--accent-foreground" />
                                    <ColorSwatch name="Destructive" variable="--destructive" />
                                    <ColorSwatch name="Border" variable="--border" />
                                    <ColorSwatch name="Input" variable="--input" />
                                    <ColorSwatch name="Ring" variable="--ring" />
                                </div>

                                <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground">Promise Statuses</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    <ColorSwatch name="Kept" variable="--status-kept" />
                                    <ColorSwatch name="Kept BG" variable="--status-kept-bg" />
                                    <ColorSwatch name="Partially" variable="--status-partially" />
                                    <ColorSwatch name="Partially BG" variable="--status-partially-bg" />
                                    <ColorSwatch name="Pending" variable="--status-pending" />
                                    <ColorSwatch name="Pending BG" variable="--status-pending-bg" />
                                    <ColorSwatch name="Broken" variable="--status-broken" />
                                    <ColorSwatch name="Broken BG" variable="--status-broken-bg" />
                                    <ColorSwatch name="Unrated" variable="--status-unrated" />
                                    <ColorSwatch name="Unrated Bar" variable="--status-unrated-bar" />
                                </div>
                            </div>
                        </Card>
                    </section>

                    {/* TYPOGRAPHY */}
                    <section id="typography" className="scroll-mt-24">
                        <div className="mb-6">
                            <h2 className="text-3xl font-bold mb-2">Typography</h2>
                            <p className="text-muted-foreground">Headings, body text, and typographic styles.</p>
                        </div>

                        <Card className="border-border/60 shadow-none">
                            <div className="p-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-baseline border-b border-border/50 pb-8">
                                    <div className="text-xs font-mono text-muted-foreground">h1 / 4xl font-extrabold</div>
                                    <div className="md:col-span-3">
                                        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">The quick brown fox</h1>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-baseline border-b border-border/50 pb-8">
                                    <div className="text-xs font-mono text-muted-foreground">h2 / 3xl font-bold</div>
                                    <div className="md:col-span-3">
                                        <h2 className="text-3xl font-bold tracking-tight first:mt-0">Jumps over the lazy dog</h2>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-baseline border-b border-border/50 pb-8">
                                    <div className="text-xs font-mono text-muted-foreground">h3 / 2xl font-semibold</div>
                                    <div className="md:col-span-3">
                                        <h3 className="text-2xl font-semibold tracking-tight">Sphinx of black quartz, judge my vow</h3>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-baseline border-b border-border/50 pb-8">
                                    <div className="text-xs font-mono text-muted-foreground">p / regular</div>
                                    <div className="md:col-span-3 max-w-prose">
                                        <p className="leading-7 [&:not(:first-child)]:mt-6">
                                            The goal of Solījums.lv is to track and visualize political promises.
                                            Consistency in typography ensures readability and trust.
                                            This standard paragraph text uses <code>leading-7</code> for optimal readability.
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-baseline">
                                    <div className="text-xs font-mono text-muted-foreground">text-muted-foreground</div>
                                    <div className="md:col-span-3">
                                        <p className="text-sm text-muted-foreground">Detailed meta-information, dates, or secondary labels.</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </section>

                    {/* ICONS */}
                    <section id="icons" className="scroll-mt-24">
                        <div className="mb-6">
                            <h2 className="text-3xl font-bold mb-2">Icons</h2>
                            <p className="text-muted-foreground">Commonly used icons from <code>lucide-react</code>.</p>
                        </div>

                        <Card className="border-border/60 shadow-none">
                            <div className="p-6">
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                                    <IconWrapper name="ArrowRight" icon={ArrowRight} />
                                    <IconWrapper name="Settings" icon={Settings} />
                                    <IconWrapper name="Trash2" icon={Trash2} />
                                    <IconWrapper name="Mail" icon={Mail} />
                                    <IconWrapper name="Loader2" icon={Loader2} />
                                    <IconWrapper name="Plus" icon={Plus} />
                                    <IconWrapper name="Info" icon={Info} />
                                    <IconWrapper name="CheckCircle2" icon={CheckCircle2} />
                                    <IconWrapper name="AlertCircle" icon={AlertCircle} />
                                    <IconWrapper name="Calendar" icon={Calendar} />
                                    <IconWrapper name="User" icon={User} />
                                    <IconWrapper name="Search" icon={Search} />
                                    <IconWrapper name="Menu" icon={Menu} />
                                    <IconWrapper name="X" icon={X} />
                                    <IconWrapper name="ChevronDown" icon={ChevronDown} />
                                    <IconWrapper name="ChevronUp" icon={ChevronUp} />
                                    <IconWrapper name="ChevronRight" icon={ChevronRight} />
                                    <IconWrapper name="ChevronLeft" icon={ChevronLeft} />
                                    <IconWrapper name="ExternalLink" icon={ExternalLink} />
                                    <IconWrapper name="Share2" icon={Share2} />
                                    <IconWrapper name="Filter" icon={Filter} />
                                    <IconWrapper name="Download" icon={Download} />
                                </div>
                            </div>
                        </Card>
                    </section>

                    <div className="my-16 border-t border-border" />

                    <div className="mb-12 border-b border-border pb-8">
                        <h2 className="text-3xl font-bold mb-4">Primitives: UI Elements</h2>
                    </div>

                    {/* BUTTONS */}
                    <section id="buttons" className="scroll-mt-24">
                        <ComponentDoc
                            title="Button"
                            path="components/ui/button.tsx"
                            description="Primary interactive element. Based on Shadcn UI."
                            usageCode={`import { Button } from "@/components/ui/button"\n\n<Button variant="default">Click me</Button>`}
                        >
                            <div className="flex flex-wrap gap-4 items-center justify-center">
                                <Button variant="default">Default</Button>
                                <Button variant="secondary">Secondary</Button>
                                <Button variant="destructive">Destructive</Button>
                                <Button variant="outline">Outline</Button>
                                <Button variant="ghost">Ghost</Button>
                                <Button variant="link">Link</Button>
                            </div>
                            <div className="flex flex-wrap gap-4 items-center justify-center">
                                <Button size="sm">Small</Button>
                                <Button size="default">Default</Button>
                                <Button size="lg">Large</Button>
                                <Button size="icon"><Settings className="w-4 h-4" /></Button>
                            </div>
                            <div className="flex flex-wrap gap-4 items-center justify-center">
                                <Button disabled>Disabled</Button>
                                <Button disabled>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Please wait
                                </Button>
                                <Button className="gap-2">
                                    <Mail className="w-4 h-4" /> Login with Email
                                </Button>
                            </div>
                        </ComponentDoc>
                    </section>

                    {/* BADGES */}
                    <section id="badges" className="scroll-mt-24">
                        <ComponentDoc
                            title="Badge (Primitive)"
                            path="components/ui/badge.tsx"
                            description="Standard badge component. Used for tags, statuses, etc."
                            usageCode={`import { Badge } from "@/components/ui/badge"\n\n<Badge>New</Badge>`}
                        >
                            <div className="flex gap-4">
                                <Badge variant="default">Default</Badge>
                                <Badge variant="secondary">Secondary</Badge>
                                <Badge variant="outline">Outline</Badge>
                                <Badge variant="destructive">Destructive</Badge>
                            </div>
                        </ComponentDoc>
                    </section>

                    {/* INPUTS */}
                    <section id="inputs" className="scroll-mt-24">
                        <ComponentDoc
                            title="Input"
                            path="components/ui/input.tsx"
                            description="Basic text input fields."
                            usageCode={`import { Input } from "@/components/ui/input"\n\n<Input placeholder="Email" />`}
                        >
                            <div className="flex flex-col gap-4 w-full max-w-sm">
                                <Input type="email" placeholder="Email" />
                                <Input disabled type="email" placeholder="Disabled Input" />
                                <div className="flex w-full max-w-sm items-center space-x-2">
                                    <Input type="email" placeholder="Email" />
                                    <Button type="submit">Subscribe</Button>
                                </div>
                            </div>
                        </ComponentDoc>

                        <ComponentDoc
                            title="Textarea"
                            path="components/ui/textarea.tsx"
                            description="Multi-line text input."
                            usageCode={`import { Textarea } from "@/components/ui/textarea"\n\n<Textarea placeholder="Type your message here." />`}
                        >
                            <div className="flex flex-col gap-4 w-full max-w-sm">
                                <Textarea placeholder="Type your message here." />
                                <Textarea disabled placeholder="Disabled textarea" />
                            </div>
                        </ComponentDoc>
                    </section>

                    <div className="my-16 border-t border-border" />

                    <div className="mb-12 border-b border-border pb-8">
                        <h2 className="text-3xl font-bold mb-4">Domain Components</h2>
                        <p className="text-muted-foreground text-lg">Business logic components specific to Solījums.lv.</p>
                    </div>

                    <section id="domain-badges" className="scroll-mt-24">
                        <ComponentDoc
                            title="StatusBadge"
                            path="components/StatusBadge.tsx"
                            description="Displays promise status with consistent colors/icons."
                            usageCode={`<StatusBadge status="kept" />`}
                            duplicates={["Badge (Primitive)", "PartyBadge"]}
                        >
                            <div className="flex flex-wrap gap-4">
                                <StatusBadge status="kept" />
                                <StatusBadge status="partially-kept" />
                                <StatusBadge status="pending" />
                                <StatusBadge status="broken" />
                                <StatusBadge status="cancelled" />
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <StatusBadge status="kept" size="sm" />
                                <StatusBadge status="kept" size="lg" />
                                <StatusBadge status="kept" variant="solid" />
                            </div>
                        </ComponentDoc>
                    </section>

                    <section id="cards" className="scroll-mt-24">
                        <ComponentDoc
                            title="PromiseCard"
                            path="components/PromiseCard.tsx"
                            description="Main card for displaying promises on lists."
                            usageCode={`<PromiseCard promise={promiseData} />`}
                        >
                            <div className="w-full max-w-md h-[250px] relative">
                                <PromiseCard promise={mockPromise} />
                            </div>
                        </ComponentDoc>

                        <ComponentDoc
                            title="RankingCard"
                            path="components/RankingCard.tsx"
                            description="Used in rankings on homepage. Similar to listings but different layout."
                            usageCode={`<RankingCard title="Top Politiķi" type="politician" data={mockRankingData} />`}
                            duplicates={["PoliticianCard", "PromiseCard"]}
                        >
                            <div className="w-full max-w-[400px]">
                                <RankingCard
                                    title="Top Politiķi"
                                    type="politician"
                                    data={mockRankingData}
                                />
                            </div>
                        </ComponentDoc>

                        <ComponentDoc
                            title="PartyCard"
                            path="components/PartyCard.tsx"
                            description="Card for displaying party information and promise statistics."
                            usageCode={`<PartyCard party={mockPartyWithStats} />`}
                            duplicates={["RankingCard", "PoliticianCard"]}
                        >
                            <div className="w-full max-w-[300px] h-[350px]">
                                <PartyCard party={mockPartyWithStats} />
                            </div>
                        </ComponentDoc>

                        <ComponentDoc
                            title="CategoryCard"
                            path="components/CategoryCard.tsx"
                            description="Card for displaying category status summary."
                            usageCode={`<CategoryCard category={mockCategoryWithStats} />`}
                        >
                            <div className="w-full max-w-[300px] h-[250px]">
                                <CategoryCard category={mockCategoryWithStats} />
                            </div>
                        </ComponentDoc>

                        <ComponentDoc
                            title="PoliticianCard"
                            path="components/PoliticianCard.tsx"
                            description="Card for displaying politician with stats."
                            usageCode={`<PoliticianCard politician={mockPoliticianWithStats} />`}
                        >
                            <div className="w-full max-w-[300px]">
                                <PoliticianCard politician={mockPoliticianWithStats} />
                            </div>
                        </ComponentDoc>

                        {/* --- CHARTS --- */}
                        <div className="col-span-1 md:col-span-2 mt-12 mb-6 border-b border-border/50 pb-4">
                            <h2 id="charts" className="text-2xl font-bold tracking-tight text-foreground">
                                Data Visualization
                            </h2>
                            <p className="text-muted-foreground mt-2">Charts and data representation.</p>
                        </div>

                        <ComponentDoc
                            title="StatsPieChart"
                            path="components/StatsPieChart.tsx"
                            description="Pie chart showing promise status distribution."
                            usageCode={`<StatsPieChart />`}
                        >
                            <div className="w-full max-w-[400px]">
                                <StatsPieChart />
                            </div>
                        </ComponentDoc>

                        {/* --- PROGRESS --- */}
                        <div className="col-span-1 md:col-span-2 mt-12 mb-6 border-b border-border/50 pb-4">
                            <h2 id="progress" className="text-2xl font-bold tracking-tight text-foreground">
                                Progress & States
                            </h2>
                            <p className="text-muted-foreground mt-2">Indicators of progress and activity.</p>
                        </div>

                        <ComponentDoc
                            title="Progress"
                            path="components/ui/progress.tsx"
                            description="Default progress bar."
                            usageCode={`<Progress value={66} className="w-[60%]" />`}
                        >
                            <div className="w-full max-w-md space-y-4">
                                <Progress value={33} />
                                <Progress value={66} />
                                <Progress value={90} indicatorClassName="bg-red-500" />
                            </div>
                        </ComponentDoc>

                        {/* --- AVATARS --- */}
                        <div className="col-span-1 md:col-span-2 mt-12 mb-6 border-b border-border/50 pb-4">
                            <h2 id="avatars" className="text-2xl font-bold tracking-tight text-foreground">
                                Avatars
                            </h2>
                        </div>

                        <ComponentDoc
                            title="Avatar"
                            path="components/ui/avatar.tsx"
                            description="User avatars with fallback."
                            usageCode={`<Avatar><AvatarImage src="..." /><AvatarFallback>JD</AvatarFallback></Avatar>`}
                        >
                            <div className="flex gap-4">
                                <Avatar>
                                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                                <Avatar className="h-12 w-12">
                                    <AvatarFallback>ES</AvatarFallback>
                                </Avatar>
                            </div>
                        </ComponentDoc>

                        {/* --- FORMS --- */}
                        <div className="col-span-1 md:col-span-2 mt-12 mb-6 border-b border-border/50 pb-4">
                            <h2 id="forms" className="text-2xl font-bold tracking-tight text-foreground">
                                Form Elements
                            </h2>
                        </div>

                        <ComponentDoc
                            title="Search Input"
                            path="components/ui/input.tsx"
                            description="Input with search icon."
                            usageCode={`<Input className="pl-10" ... />`}
                        >
                            <div className="relative w-full max-w-xs">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input className="pl-10" placeholder="Search..." />
                            </div>
                        </ComponentDoc>

                        <ComponentDoc
                            title="Select"
                            path="Native HTML"
                            description="Select with custom styling."
                            usageCode={`<select className="..." />`}
                        >
                            <div className="relative w-full max-w-xs">
                                <select className="appearance-none h-10 pl-3 pr-10 w-full rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                                    <option>Option 1</option>
                                    <option>Option 2</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            </div>
                        </ComponentDoc>

                        <ComponentDoc
                            title="Switch"
                            path="components/ui/switch.tsx"
                            description="Toggle switch."
                            usageCode={`<Switch />`}
                        >
                            <div className="flex items-center gap-4">
                                <Switch />
                                <Switch checked />
                            </div>
                        </ComponentDoc>

                    </section>

                </main>
            </div>
        </div>
    );
}
