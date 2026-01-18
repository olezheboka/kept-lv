import {
    TrendingUp,
    Heart,
    GraduationCap,
    Shield,
    Globe,
    Users,
    Leaf,
    Train,
    Scale,
    Landmark,
    Wheat,
    Laptop,
    Home,
    Trophy,
} from 'lucide-react';

import { type LucideIcon } from 'lucide-react';

export const SLUG_ICON_MAP: Record<string, LucideIcon> = {
    // Economy & Finance
    "economy": TrendingUp,
    "economy-finance": TrendingUp,
    "finance": TrendingUp,

    // Healthcare
    "healthcare": Heart,
    "health": Heart,

    // Education
    "education": GraduationCap,
    "education-science": GraduationCap,
    "science": GraduationCap,

    // Security
    "security": Shield,
    "defense": Shield,
    "defense-security": Shield,

    // Foreign Affairs
    "foreign-affairs": Globe,
    "foreign": Globe,

    // Social Welfare
    "social-welfare": Users,
    "social": Users,
    "welfare": Users,

    // Environment
    "environment": Leaf,
    "environment-energy": Leaf,
    "energy": Leaf,

    // Transport
    "infrastructure": Train,
    "transport": Train,
    "transport-infrastructure": Train,

    // Justice
    "justice": Scale,
    "justice-law": Scale,
    "law": Scale,

    // Culture
    "culture": Landmark,
    "culture-heritage": Landmark,

    // Agriculture
    "agriculture": Wheat,
    "agriculture-rural": Wheat,

    // Digital
    "digital": Laptop,
    "digital-technology": Laptop,
    "technology": Laptop,

    // Regional
    "regional": Home,
    "housing-regional": Home,
    "housing": Home,

    // Youth
    "youth": Trophy,
    "youth-sports": Trophy,
    "sports": Trophy
};
