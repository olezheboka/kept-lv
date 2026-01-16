import Link from "next/link";
import { FileText, Users, Landmark, Folder } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface RecentActivityProps {
    promises: any[];
}

export function RecentActivity({ promises }: RecentActivityProps) {
    return (
        <div className="bg-white rounded-lg border border-g-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="px-6 py-4 border-b border-g-gray-100 flex justify-between items-center">
                <h2 className="text-base font-semibold text-g-gray-900">Recent Activity</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
                {promises.map((promise, idx) => {
                    const isLast = idx === promises.length - 1;
                    return (
                        <div key={promise.id} className={`flex items-start gap-4 p-4 hover:bg-g-gray-50/50 transition-colors ${!isLast ? 'border-b border-g-gray-100' : ''}`}>
                            {/* Icon Box */}
                            <div className="p-2 bg-g-gray-100 text-g-gray-500 rounded-lg flex-shrink-0">
                                <FileText width={20} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-0.5">
                                        {/* Header Row */}
                                        <div className="flex items-center gap-2 text-xs uppercase tracking-wide">
                                            <span className="text-g-gray-500 font-semibold">PROMISE</span>
                                            <span className="text-g-blue-600 font-bold">Updated</span>
                                        </div>
                                        {/* Content Row */}
                                        <Link href={`/admin/promises/${promise.id}`} className="block">
                                            <h4 className="text-sm font-semibold text-g-gray-900 line-clamp-1 hover:text-g-blue-600 transition-colors">
                                                {promise.title}
                                            </h4>
                                        </Link>
                                    </div>

                                    <div className="text-right flex-shrink-0 ml-4">
                                        <div className="text-xs text-g-gray-500">
                                            {formatDistanceToNow(new Date(promise.createdAt), { addSuffix: true })}
                                        </div>
                                        <div className="text-xs text-g-gray-400 mt-0.5">
                                            by Admin
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {promises.length === 0 && (
                    <div className="p-8 text-center text-g-gray-500 text-sm">No recent activity</div>
                )}
            </div>
        </div>
    );
}
