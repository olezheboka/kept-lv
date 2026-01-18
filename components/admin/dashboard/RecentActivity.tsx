"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Users, Landmark, Folder, Settings } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { lv } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Activity {
    id: string;
    adminEmail: string;
    action: string;
    entityType: string;
    entityId: string | null;
    entityTitle: string | null;
    createdAt: string;
    details: Record<string, unknown>;
}

export function RecentActivity() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchActivities = async (pageNum: number, append = false) => {
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/activity?page=${pageNum}&limit=10`);
            const data = await res.json();

            if (data.activities) {
                if (append) {
                    setActivities(prev => [...prev, ...data.activities]);
                } else {
                    setActivities(data.activities);
                }
                setHasMore(data.page < data.totalPages);
            }
        } catch (error) {
            console.error("Failed to fetch activities:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities(1);
    }, []);

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchActivities(nextPage, true);
    };

    const getActionBadge = (action: string) => {
        switch (action) {
            case "created":
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-0">Created</Badge>;
            case "updated":
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">Updated</Badge>;
            case "deleted":
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-0">Deleted</Badge>;
            case "login":
                return <Badge variant="secondary">Login</Badge>;
            case "logout":
                return <Badge variant="outline">Logout</Badge>;
            case "configuration_changed":
                return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-0">Config</Badge>;
            default:
                return <Badge variant="outline">{action}</Badge>;
        }
    };

    const getEntityIcon = (type: string) => {
        switch (type) {
            case "Promise": return <FileText className="w-4 h-4" />;
            case "Politician": return <Users className="w-4 h-4" />;
            case "Party": return <Landmark className="w-4 h-4" />;
            case "Category": return <Folder className="w-4 h-4" />;
            case "SystemConfig": return <Settings className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    const getEntityLink = (activity: Activity) => {
        if (!activity.entityId) return null;

        let basePath = "/admin";
        switch (activity.entityType) {
            case "Promise": basePath += `/promises/${activity.entityId}`; break;
            case "Politician": basePath += `/politicians/${activity.entityId}`; break;
            case "Party": basePath += `/parties/${activity.entityId}`; break;
            case "Category": basePath += `/categories/${activity.entityId}`; break;
            default: return null;
        }

        if (activity.action === "deleted") {
            return <span className="font-semibold text-gray-500 line-through">{activity.entityTitle || "Deleted Entity"}</span>;
        }

        return (
            <Link href={basePath} className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                {activity.entityTitle || "Unknown Entity"}
            </Link>
        );
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-base font-semibold text-gray-900">Recent activity</h2>
            </div>
            <div className="divide-y divide-gray-100">
                {activities.map((activity) => (
                    <div key={activity.id} className="p-4 hover:bg-gray-50/50 transition-colors grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        {/* 1. Entity & Author Column - Spans 5 columns */}
                        <div className="md:col-span-5 flex items-start gap-3 overflow-hidden">
                            <div className="p-2 bg-gray-100 text-gray-500 rounded-lg flex-shrink-0 mt-0.5">
                                {getEntityIcon(activity.entityType)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 text-xs uppercase tracking-wide mb-0.5">
                                    <span className="text-gray-500 font-semibold">{activity.entityType}</span>
                                    {getActionBadge(activity.action)}
                                </div>
                                <div className="text-sm font-medium truncate" title={activity.entityTitle || ""}>
                                    {getEntityLink(activity)}
                                </div>
                                <div className="text-xs text-gray-500 truncate mt-0.5" title={activity.adminEmail}>
                                    by {activity.adminEmail}
                                </div>
                            </div>
                        </div>

                        {/* 2. Changes Column - Spans 5 columns */}
                        <div className="md:col-span-5 min-w-0">
                            {activity.action === "updated" && activity.details?.updatedFields && Array.isArray(activity.details.updatedFields) ? (
                                <div className="text-xs text-gray-500 break-words line-clamp-2" title={(activity.details.updatedFields as string[]).join(", ")}>
                                    <span className="font-semibold text-gray-400 mr-1">Updated:</span>
                                    {(activity.details.updatedFields as string[]).join(", ")}
                                </div>
                            ) : (
                                <span className="text-xs text-gray-300">-</span>
                            )}
                        </div>

                        {/* 4. Date Column - Spans 2 columns */}
                        <div className="md:col-span-2">
                            <div className="text-sm text-gray-900 whitespace-nowrap">
                                {new Date(activity.createdAt).toLocaleString("lv-LV", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false
                                })}
                            </div>
                            <div className="text-[10px] text-gray-400 whitespace-nowrap">
                                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true, locale: lv })}
                            </div>
                        </div>
                    </div>
                ))}

                {activities.length === 0 && !loading && (
                    <div className="p-8 text-center text-gray-500 text-sm">No recent activity</div>
                )}

                {loading && (
                    <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
                )}

                {!loading && hasMore && (
                    <div className="p-4 text-center border-t border-gray-100">
                        <Button variant="ghost" size="sm" onClick={loadMore}>
                            Load More
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
