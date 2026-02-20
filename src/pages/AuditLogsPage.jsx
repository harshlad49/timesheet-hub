import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { auditLogs, users } from "@/data/mockData";

export default function AuditLogsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");

    const filteredLogs = auditLogs.filter((log) => {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
            log.user.toLowerCase().includes(term) ||
            log.action.toLowerCase().includes(term) ||
            log.target.toLowerCase().includes(term);

        if (roleFilter === "all") return matchesSearch;

        const userObj = users.find(u => u.name === log.user);
        const userRole = userObj ? userObj.role : "system"; // Default to system if not found (e.g. System Worker)

        return matchesSearch && userRole === roleFilter;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Manrope, sans-serif" }}>
                    Audit Logs
                </h2>
                <p className="text-slate-500 mt-1">Tracking all critical system actions for compliance.</p>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search by actor, action, target..."
                            className="pl-9 bg-white border-slate-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-[180px] bg-white border-slate-200">
                            <SelectValue placeholder="All Roles" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="employee">Employee</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <span className="text-sm text-slate-500 whitespace-nowrap hidden sm:block">
                    {filteredLogs.length} entries
                </span>
            </div>

            <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[200px]">Timestamp</th>
                                    <th className="py-4 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[180px]">User</th>
                                    <th className="py-4 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[150px]">Action</th>
                                    <th className="py-4 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[180px]">Target</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Metadata</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredLogs.length > 0 ? (
                                    filteredLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="py-3 px-6 text-sm text-slate-500 font-mono text-xs whitespace-nowrap">
                                                {log.timestamp}
                                            </td>
                                            <td className="py-3 px-4 text-sm font-medium text-slate-900">
                                                {log.user}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 font-mono uppercase tracking-wide">
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-slate-600 font-mono text-xs">
                                                {log.target}
                                            </td>
                                            <td className="py-3 px-6 text-sm text-slate-400 font-mono text-xs">
                                                {log.metadata}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-12 text-center text-slate-500 text-sm">
                                            No logs found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
