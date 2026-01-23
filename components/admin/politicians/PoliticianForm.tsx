"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";
import { Flag, GraduationCap, Briefcase, CheckCircle2, XCircle, Plus, Trash2 } from "lucide-react";
import { FormActions } from "@/components/admin/FormActions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/ui/form-error";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Party {
    id: string;
    name: string;
}

interface Job {
    id?: string;
    title: string;
    company: string | null;
    years: string;
}

interface EducationEntry {
    id?: string;
    degree: string;
    institution: string;
    year: string;
}

interface Politician {
    id: string;
    name: string;
    slug: string;
    partyId?: string | null;
    role?: string | null;
    isActive: boolean;
    jobs?: Job[];
    educationEntries?: EducationEntry[];
}

interface PoliticianFormProps {
    initialData?: Politician | null;
    parties: Party[];
    onSuccess: () => void;
    onCancel: () => void;
}

export function PoliticianForm({ initialData, parties, onSuccess, onCancel }: PoliticianFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [origin, setOrigin] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        partyId: "",
        role: "Member of Parliament",
        isActive: true,
        jobs: [] as Job[],
        educationEntries: [] as EducationEntry[],
    });

    useEffect(() => {
        if (typeof window !== "undefined") {
            setOrigin(window.location.origin);
        }
    }, []);

    // Initialize form data
    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                slug: initialData.slug || "",
                partyId: initialData.partyId || "",
                role: initialData.role || "Member of Parliament",
                isActive: initialData.isActive ?? true,
                jobs: initialData.jobs || [],
                educationEntries: initialData.educationEntries || [],
            });
        }
    }, [initialData]);

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Auto-generate slug from name only in create mode or if slug is empty
    useEffect(() => {
        if (!initialData && formData.name && !formData.slug) {
            setFormData((prev) => ({ ...prev, slug: slugify(formData.name) }));
        }
    }, [formData.name, formData.slug, initialData]);

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.name.trim()) newErrors.name = "Full name is required";
        if (!formData.slug.trim()) newErrors.slug = "Slug is required";
        if (!formData.partyId) newErrors.partyId = "Party is required";

        // Basic validation for array items if needed
        formData.jobs.forEach((job, idx) => {
            if (!job.title) newErrors[`jobs.${idx}.title`] = "Title required";
            if (!job.years) newErrors[`jobs.${idx}.years`] = "Years required";
        });
        formData.educationEntries.forEach((edu, idx) => {
            if (!edu.degree) newErrors[`education.${idx}.degree`] = "Degree required";
            if (!edu.institution) newErrors[`education.${idx}.institution`] = "Institution required";
            if (!edu.year) newErrors[`education.${idx}.year`] = "Year required";
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);

        try {
            const url = initialData
                ? `/api/politicians/${initialData.id}`
                : "/api/politicians";

            const method = initialData ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.refresh();
                onSuccess();
            } else {
                const error = await res.json();
                alert("Failed to save: " + JSON.stringify(error));
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const addJob = () => {
        setFormData(prev => ({
            ...prev,
            jobs: [...prev.jobs, { title: "", company: "", years: "" }]
        }));
    };

    const removeJob = (index: number) => {
        setFormData(prev => ({
            ...prev,
            jobs: prev.jobs.filter((_, i) => i !== index)
        }));
    };

    const updateJob = (index: number, field: keyof Job, value: string) => {
        const newJobs = [...formData.jobs];
        newJobs[index] = { ...newJobs[index], [field]: value };
        setFormData(prev => ({ ...prev, jobs: newJobs }));
    };

    const addEducation = () => {
        setFormData(prev => ({
            ...prev,
            educationEntries: [...prev.educationEntries, { degree: "", institution: "", year: "" }]
        }));
    };

    const removeEducation = (index: number) => {
        setFormData(prev => ({
            ...prev,
            educationEntries: prev.educationEntries.filter((_, i) => i !== index)
        }));
    };

    const updateEducation = (index: number, field: keyof EducationEntry, value: string) => {
        const newEdu = [...formData.educationEntries];
        newEdu[index] = { ...newEdu[index], [field]: value };
        setFormData(prev => ({ ...prev, educationEntries: newEdu }));
    };

    const partyOptions = parties.map(p => ({ label: p.name, value: p.id }));

    // Status options matching PromiseForm design
    const STATUS_OPTIONS = [
        {
            value: true,
            label: "In office",
            description: "Currently active",
            icon: CheckCircle2,
            colorClass: "text-green-500",
            bgClass: "bg-green-100",
        },
        {
            value: false,
            label: "Not in office",
            description: "Former politician",
            icon: XCircle,
            colorClass: "text-gray-500",
            bgClass: "bg-gray-100",
        }
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">

                {/* Basic Info */}
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground font-semibold">
                        Full name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => {
                            setFormData({ ...formData, name: e.target.value });
                            if (errors.name) setErrors({ ...errors, name: "" });
                        }}
                        placeholder="e.g. Edgars Rinkēvičs"
                        className={cn("bg-background", errors.name && "border-destructive focus-visible:ring-destructive")}
                    />
                    <FormError message={errors.name} />
                </div>

                {/* Slug */}
                <div className="space-y-2">
                    <Label htmlFor="slug" className="text-foreground font-semibold">
                        Slug <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => {
                            setFormData({ ...formData, slug: e.target.value });
                            if (errors.slug) setErrors({ ...errors, slug: "" });
                        }}
                        placeholder="edgars-rinkevics"
                        className={cn("font-mono text-sm bg-background", errors.slug && "border-destructive focus-visible:ring-destructive")}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <FormError message={errors.slug} />
                        <span>
                            {origin ? `${origin}/politicians/${formData.slug || "[slug]"}` : `http://localhost:3000/politicians/${formData.slug || "[slug]"}`}
                        </span>
                    </div>
                </div>

                {/* Affiliation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="party" className="text-foreground font-semibold">
                            Party <span className="text-destructive">*</span>
                        </Label>
                        <SearchableSelect
                            options={partyOptions}
                            value={formData.partyId}
                            onChange={(val) => {
                                setFormData({ ...formData, partyId: val });
                                if (errors.partyId) setErrors({ ...errors, partyId: "" });
                            }}
                            placeholder="Select Party"
                            searchPlaceholder="Search parties..."
                            icon={Flag}
                            className={cn(errors.partyId && "border-destructive focus-visible:ring-destructive ring-destructive")}
                        />
                        <FormError message={errors.partyId} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role" className="text-foreground font-semibold">
                            Position
                        </Label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="role"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="pl-9 bg-background"
                                placeholder="Member of Parliament"
                            />
                        </div>
                    </div>
                </div>

                {/* Experience & Education */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Experience Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-foreground font-semibold flex items-center gap-2">
                                <Briefcase className="w-4 h-4" /> Experience
                            </Label>
                            <Button type="button" variant="outline" size="sm" onClick={addJob}>
                                <Plus className="w-3 h-3 mr-1" /> Add
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {formData.jobs.map((job, idx) => (
                                <div key={idx} className="p-3 border rounded-lg bg-card relative group">
                                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-destructive hover:bg-destructive/10"
                                            onClick={() => removeJob(idx)}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                    <div className="space-y-2 pr-6">
                                        <div className="grid grid-cols-2 gap-2">
                                            <Input
                                                value={job.title}
                                                onChange={(e) => updateJob(idx, 'title', e.target.value)}
                                                placeholder="Title (e.g. MP)"
                                                className="h-8 text-sm"
                                            />
                                            <Input
                                                value={job.years}
                                                onChange={(e) => updateJob(idx, 'years', e.target.value)}
                                                placeholder="Years (e.g. 2018-Now)"
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                        <Input
                                            value={job.company || ""}
                                            onChange={(e) => updateJob(idx, 'company', e.target.value)}
                                            placeholder="Organization (Optional)"
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                </div>
                            ))}
                            {formData.jobs.length === 0 && (
                                <div className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
                                    No experience entries
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Education Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-foreground font-semibold flex items-center gap-2">
                                <GraduationCap className="w-4 h-4" /> Education
                            </Label>
                            <Button type="button" variant="outline" size="sm" onClick={addEducation}>
                                <Plus className="w-3 h-3 mr-1" /> Add
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {formData.educationEntries.map((edu, idx) => (
                                <div key={idx} className="p-3 border rounded-lg bg-card relative group">
                                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-destructive hover:bg-destructive/10"
                                            onClick={() => removeEducation(idx)}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                    <div className="space-y-2 pr-6">
                                        <Input
                                            value={edu.degree}
                                            onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                                            placeholder="Degree"
                                            className="h-8 text-sm font-medium"
                                        />
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="col-span-2">
                                                <Input
                                                    value={edu.institution}
                                                    onChange={(e) => updateEducation(idx, 'institution', e.target.value)}
                                                    placeholder="Institution"
                                                    className="h-8 text-sm"
                                                />
                                            </div>
                                            <Input
                                                value={edu.year}
                                                onChange={(e) => updateEducation(idx, 'year', e.target.value)}
                                                placeholder="Year"
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {formData.educationEntries.length === 0 && (
                                <div className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
                                    No education entries
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Status */}
                <div className="pt-2">
                    <h2 className="text-lg font-bold text-foreground mb-4">Current status</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {STATUS_OPTIONS.map((option) => {
                            const isSelected = formData.isActive === option.value;
                            const Icon = option.icon;

                            return (
                                <div
                                    key={option.label}
                                    onClick={() => setFormData({ ...formData, isActive: option.value })}
                                    className={cn(
                                        "relative flex flex-col p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md",
                                        isSelected
                                            ? "border-blue-500 bg-white dark:bg-slate-950 shadow-sm"
                                            : "border-border hover:border-gray-300 dark:hover:border-gray-700 bg-white/50"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className={cn("p-2 rounded-lg", option.bgClass)}>
                                            <Icon className={cn("w-5 h-5", option.colorClass)} />
                                        </div>
                                        <div className={cn(
                                            "w-5 h-5 rounded-full border flex items-center justify-center",
                                            isSelected ? "border-blue-500" : "border-gray-300"
                                        )}>
                                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="font-semibold text-sm text-foreground">{option.label}</p>
                                        <p className="text-xs text-muted-foreground">{option.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>

            <FormActions
                loading={loading}
                onCancel={onCancel}
                submitLabel={initialData ? "Update" : "Create"}
            />
        </form>
    );
}
