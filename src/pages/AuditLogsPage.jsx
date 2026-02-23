import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Clock, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { auditLogs, users } from "@/data/mockData";
import { cn } from "@/lib/utils";

const actionConfig = {
    TS_SUBMIT: "bg-amber-50 text-amber-700 border-amber-200",
    TS_APPROVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
    TS_REJECT: "bg-red-50 text-red-700 border-red-200",
    USER_UPDATE: "bg-indigo-50 text-indigo-700 border-indigo-200",
    ROLE_CHANGE: "bg-purple-50 text-purple-700 border-purple-200",
    PROJECT_UPDATE: "bg-blue-50 text-blue-700 border-blue-200",
    DB_BACKUP: "bg-slate-100 text-slate-700 border-slate-200",
    LOGIN: "bg-slate-100 text-slate-600 border-slate-200",
    DEFAULT: "bg-slate-50 text-slate-500 border-slate-200"
};

const formatMetadata = (metadata) => {
    if (!metadata) return null;
    try {
        // Handle string representation of object like {role: "Manager"}
        const cleanJson = metadata.replace(/([{,])\s*(\w+):/g, '$1"$2":');
        const obj = JSON.parse(cleanJson);
        return Object.entries(obj).map(([key, val]) => (
            <Badge key={key} variant="secondary" className="mr-1 mb-1 bg-slate-100 text-slate-600 font-mono text-[9px] hover:bg-slate-200 transition-colors">
                <span className="opacity-50 mr-1">{key}:</span>{val}
            </Badge>
        ));
    } catch (e) {
        return <span className="opacity-70 italic">{metadata}</span>;
    }
};

export default function AuditLogsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, roleFilter]);

    const filteredLogs = auditLogs.filter((log) => {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
            log.user.toLowerCase().includes(term) ||
            log.action.toLowerCase().includes(term) ||
            log.target.toLowerCase().includes(term);

        if (roleFilter === "all") return matchesSearch;

        const userObj = users.find(u => u.name === log.user);
        const userRole = userObj ? userObj.role : "system";

        return matchesSearch && userRole === roleFilter;
    });

    // Pagination logic
    const totalEntries = filteredLogs.length;
    const totalPages = Math.ceil(totalEntries / itemsPerPage);
    const paginatedLogs = filteredLogs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const startIndex = totalEntries === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, totalEntries);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2" style={{ fontFamily: "Manrope, sans-serif" }}>
                        <Shield className="w-6 h-6 text-indigo-600" /> Audit Logs
                    </h2>
                    <p className="text-slate-500 mt-1">Tracking all critical system actions for security and compliance.</p>
                </div>
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-slate-900">{totalEntries}</p>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Entries</p>
                </div>
            </div>

            <Card className="bg-slate-50 border-slate-200 shadow-none">
                <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search by Users, action, target..."
                            className="pl-9 bg-white border-slate-200 h-11 focus-visible:ring-indigo-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-full sm:w-[160px] bg-white border-slate-200 h-11">
                                <SelectValue placeholder="All Roles" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="employee">Employee</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    <th className="py-4 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] w-[200px]">Timestamp</th>
                                    <th className="py-4 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] w-[200px]">Users</th>
                                    <th className="py-4 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] w-[150px]">Action</th>
                                    <th className="py-4 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] w-[180px]">Target</th>
                                    <th className="py-4 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em]">Details / Metadata</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {paginatedLogs.length > 0 ? (
                                    paginatedLogs.map((log) => {
                                        const userObj = users.find(u => u.name === log.user);
                                        const badgeClass = actionConfig[log.action] || actionConfig.DEFAULT;

                                        return (
                                            <tr key={log.id} className="hover:bg-slate-50/70 transition-colors group">
                                                <td className="py-4 px-6 text-slate-500 font-mono text-[11px]">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-3 h-3 opacity-30" />
                                                        {log.timestamp}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="w-8 h-8 rounded-lg shadow-sm">
                                                            <AvatarImage src={userObj?.avatar} />
                                                            <AvatarFallback className="text-[10px] bg-indigo-100 text-indigo-600 font-bold">
                                                                {log.user.split(" ").map(n => n[0]).join("")}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-semibold text-slate-900 leading-tight">{log.user}</span>
                                                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">{userObj?.role || "system"}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={cn(
                                                        "inline-flex items-center px-2 py-1 rounded text-[10px] font-bold font-mono border",
                                                        badgeClass
                                                    )}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <code className="text-[11px] bg-slate-50 px-2 py-0.5 rounded text-slate-600 border border-slate-100">
                                                        {log.target}
                                                    </code>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-wrap max-w-xs sm:max-w-none">
                                                        {formatMetadata(log.metadata)}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <Search className="w-10 h-10 text-slate-200 mb-2" />
                                                <p className="text-slate-500 text-sm font-medium">No logs found matching your criteria.</p>
                                                <button onClick={() => { setSearchTerm(""); setRoleFilter("all"); }} className="text-indigo-600 text-xs mt-2 hover:underline">Clear all filters</button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {totalEntries > 0 && (
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                            <p className="text-xs text-slate-500 font-medium tracking-wide">
                                Showing <span className="text-slate-900 font-bold">{startIndex}</span> to{" "}
                                <span className="text-slate-900 font-bold">{endIndex}</span> of{" "}
                                <span className="text-slate-900 font-bold">{totalEntries}</span> logs
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-3 text-xs bg-white border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all font-semibold"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-3 text-xs bg-white border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all font-semibold"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
