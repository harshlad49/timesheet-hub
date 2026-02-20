import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Clock, Eye, Filter, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const statusConfig = {
  submitted: { label: "Pending Review", class: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20", icon: Clock },
  approved: { label: "Approved", class: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20", icon: CheckCircle },
  rejected: { label: "Rejected", class: "bg-red-50 text-red-700 ring-1 ring-red-600/20", icon: XCircle },
  draft: { label: "Draft", class: "bg-slate-100 text-slate-600 ring-1 ring-slate-600/20", icon: Clock },
};

const taskNames = { t1: "Development", t2: "UI/UX Design", t3: "Testing & QA", t4: "Meetings", t5: "Documentation", t6: "Research", t7: "Code Review", t8: "Deployment" };

function getWeekDates(weekStart) {
  const monday = new Date(weekStart + "T00:00:00");
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function WeeklyQueue({ timesheets, allUsers, projects, onApprove, onReject }) {
  const [filter, setFilter] = useState("submitted");
  const [selected, setSelected] = useState(null);
  const [remarks, setRemarks] = useState("");

  const relevantTs = timesheets.filter((t) => t.status !== "draft");
  const filtered = filter === "all" ? relevantTs : relevantTs.filter((t) => t.status === filter);

  const counts = {
    all: relevantTs.length,
    submitted: relevantTs.filter((t) => t.status === "submitted").length,
    approved: relevantTs.filter((t) => t.status === "approved").length,
    rejected: relevantTs.filter((t) => t.status === "rejected").length,
  };

  const handleApprove = () => {
    if (!selected) return;
    onApprove(selected.id, remarks);
    toast.success("Timesheet approved successfully!");
    setSelected(null);
    setRemarks("");
  };

  const handleReject = () => {
    if (!selected) return;
    if (!remarks.trim()) {
      toast.error("Please add a rejection reason");
      return;
    }
    onReject(selected.id, remarks);
    toast.success("Timesheet rejected with remarks");
    setSelected(null);
    setRemarks("");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { key: "submitted", label: "Pending", color: "bg-amber-100 text-amber-700", border: "border-amber-200" },
          { key: "approved", label: "Approved", color: "bg-emerald-100 text-emerald-700", border: "border-emerald-200" },
          { key: "rejected", label: "Rejected", color: "bg-red-100 text-red-700", border: "border-red-200" },
          { key: "all", label: "Total", color: "bg-slate-100 text-slate-700", border: "border-slate-200" },
        ].map(({ key, label, color, border }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={cn("p-4 rounded-xl border-2 text-left transition-all hover:shadow-md", filter === key ? border : "border-transparent bg-white border border-slate-200")}
            data-testid={`filter-${key}`}
          >
            <p className="text-xs text-slate-500 font-medium uppercase">{label}</p>
            <p className={cn("text-2xl font-bold mt-1 rounded-lg px-2 py-0.5 inline-block", color)} style={{ fontFamily: "Manrope, sans-serif" }}>{counts[key]}</p>
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="bg-white border border-slate-200 shadow-none">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No timesheets to show</p>
              <p className="text-sm mt-1">All caught up!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="approvals-table">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Employee</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Week</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Hours</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Submitted</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                    <th className="py-3 px-4 text-center text-xs font-semibold text-slate-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((ts) => {
                    const emp = allUsers.find((u) => u.id === ts.userId);
                    const cfg = statusConfig[ts.status];
                    const StatusIcon = cfg?.icon;
                    return (
                      <tr key={ts.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors" data-testid={`approval-row-${ts.id}`}>
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8 flex-shrink-0">
                              <AvatarImage src={emp?.avatar} />
                              <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-bold">{emp?.name?.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{emp?.name}</p>
                              <p className="text-xs text-slate-400">{emp?.department}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600 hidden sm:table-cell">
                          {new Date(ts.weekStart + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-sm font-bold text-slate-900">{ts.totalHours}h</span>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-500 hidden md:table-cell">
                          {ts.submittedAt ? new Date(ts.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full capitalize", cfg?.class)}>
                            {StatusIcon && <StatusIcon className="w-3 h-3" />}
                            {cfg?.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => { setSelected(ts); setRemarks(ts.remarks || ""); }}
                            data-testid={`view-ts-${ts.id}`}
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" /> View
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) { setSelected(null); setRemarks(""); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (() => {
            const emp = allUsers.find((u) => u.id === selected.userId);
            const weekDates = getWeekDates(selected.weekStart);
            const cfg = statusConfig[selected.status];
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={emp?.avatar} />
                      <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-bold">{emp?.name?.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p>{emp?.name}</p>
                      <p className="text-sm font-normal text-slate-500">
                        Week of {new Date(selected.weekStart + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </DialogTitle>
                </DialogHeader>

                {/* Timesheet grid */}
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm min-w-[520px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Project</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Activity</th>
                        {weekDates.map((d, i) => (
                          <th key={i} className={cn("py-2 px-2 text-center text-xs font-semibold text-slate-500", i >= 5 && "bg-slate-100")}>
                            {DAY_NAMES[i]}<br />{d.getDate()}
                          </th>
                        ))}
                        <th className="py-2 px-3 text-center text-xs font-semibold text-slate-500">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.entries.map((entry, i) => {
                        const proj = projects.find((p) => p.id === entry.projectId);
                        const total = entry.hours.reduce((s, h) => s + h, 0);
                        return (
                          <tr key={i} className="border-b border-slate-50">
                            <td className="py-2 px-3 text-sm font-medium text-slate-900">{proj?.name || "—"}</td>
                            <td className="py-2 px-3 text-sm text-slate-600">{taskNames[entry.taskId] || "—"}</td>
                            {entry.hours.map((h, dayIdx) => (
                              <td key={dayIdx} className={cn("py-2 px-2 text-center text-sm", dayIdx >= 5 && "bg-slate-50")}>
                                <span className={cn(h > 0 ? "font-semibold text-indigo-700" : "text-slate-300")}>{h || "—"}</span>
                              </td>
                            ))}
                            <td className="py-2 px-3 text-center font-bold text-slate-900">{total}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 border-t-2 border-slate-200">
                        <td colSpan={2} className="py-2 px-3 text-xs font-bold text-slate-700 uppercase">Total</td>
                        {weekDates.map((_, dayIdx) => {
                          const dayTotal = selected.entries.reduce((s, e) => s + (e.hours[dayIdx] || 0), 0);
                          return (
                            <td key={dayIdx} className={cn("py-2 px-2 text-center", dayIdx >= 5 && "bg-slate-100/50")}>
                              <span className="text-sm font-bold">{dayTotal || "—"}</span>
                            </td>
                          );
                        })}
                        <td className="py-2 px-3 text-center font-bold text-indigo-700">{selected.totalHours}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Status */}
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm text-slate-500">Current status:</span>
                  <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", cfg?.class)}>{cfg?.label}</span>
                </div>

                {/* Remarks */}
                {selected.remarks && (
                  <div className={cn("p-3 rounded-lg text-sm", selected.status === "rejected" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700")}>
                    <strong>Remarks:</strong> {selected.remarks}
                  </div>
                )}

                {/* Actions for submitted timesheets */}
                {selected.status === "submitted" && (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Remarks (required for rejection)</label>
                      <Textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Add comments or rejection reason..."
                        className="mt-1.5 resize-none"
                        rows={3}
                        data-testid="remarks-input"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                        onClick={handleReject}
                        data-testid="reject-btn"
                      >
                        <XCircle className="w-4 h-4 mr-2" /> Reject
                      </Button>
                      <Button
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                        onClick={handleApprove}
                        data-testid="approve-btn"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" /> Approve
                      </Button>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DailyReview({ timesheets, allUsers, projects }) {
  // Use local date for default to match user expectation
  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [selectedTs, setSelectedTs] = useState(null);
  const [remarks, setRemarks] = useState("");
  const { approveTimesheet, rejectTimesheet } = useApp();

  const handleDateChange = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days); // This handles month/year roll-overs correctly with local time object

    // Convert back to YYYY-MM-DD
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${year}-${month}-${day}`);
  };

  // Get all entries for the selected date from submitted timesheets
  const dailyEntries = timesheets
    .filter(t => t.status === "submitted")
    .flatMap(t => {
      // Robust date diffing using UTC to avoid DST issues
      const start = new Date(t.weekStart + "T00:00:00Z");
      const current = new Date(selectedDate + "T00:00:00Z");
      const diffTime = current - start;
      const dayIdx = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (dayIdx >= 0 && dayIdx <= 6) {
        // Return entries for this day if they have hours
        return t.entries
          .filter(e => e.hours[dayIdx] > 0)
          .map(e => ({
            ...e,
            dayHours: e.hours[dayIdx],
            dayNote: e.notes[dayIdx] || "",
            dayProgress: e.progress[dayIdx] || 0,
            timesheetId: t.id,
            userId: t.userId,
            weekStart: t.weekStart
          }));
      }
      return [];
    });

  const handleApprove = () => {
    if (!selectedTs) return;
    approveTimesheet(selectedTs.id, remarks);
    toast.success("Timesheet approved successfully!");
    setSelectedTs(null);
    setRemarks("");
  };

  const handleReject = () => {
    if (!selectedTs) return;
    if (!remarks.trim()) {
      toast.error("Please add a rejection reason");
      return;
    }
    rejectTimesheet(selectedTs.id, remarks);
    toast.success("Timesheet rejected with remarks");
    setSelectedTs(null);
    setRemarks("");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Date Navigator */}
      <Card className="bg-white border border-slate-200 shadow-none">
        <CardContent className="p-4 flex items-center justify-between">
          <button
            onClick={() => handleDateChange(-1)}
            className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous Day
          </button>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="font-bold text-slate-900 border-none bg-transparent focus:ring-0 p-0 cursor-pointer"
            />
          </div>
          <button
            onClick={() => handleDateChange(1)}
            className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            Next Day <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </CardContent>
      </Card>

      {/* Daily Entries Grid */}
      <Card className="bg-white border border-slate-200 shadow-none">
        <CardHeader className="pb-2 border-b border-slate-50">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base font-semibold text-slate-900">
              Entries for {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </CardTitle>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              {dailyEntries.length} entries found
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {dailyEntries.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No pending entries for this date</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50 text-left">
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase w-48">Employee</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase w-48">Project</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase w-32">Task</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Notes</th>
                    <th className="py-3 px-4 text-center text-xs font-semibold text-slate-500 uppercase w-24">Hours</th>
                    <th className="py-3 px-4 text-center text-xs font-semibold text-slate-500 uppercase w-24">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {dailyEntries.map((entry, idx) => {
                    const user = allUsers.find(u => u.id === entry.userId);
                    const project = projects.find(p => p.id === entry.projectId);
                    return (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={user?.avatar} />
                              <AvatarFallback className="bg-indigo-50 text-indigo-600 text-xs font-bold">{user?.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                              <p className="text-xs text-slate-400">{user?.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm font-medium text-slate-900">{project?.name}</p>
                          <p className="text-xs text-slate-500">{project?.client}</p>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {taskNames[entry.taskId] || "General"}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600 max-w-xs truncate" title={entry.dayNote}>
                          {entry.dayNote || "—"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-sm font-bold text-slate-900">{entry.dayHours}h</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs"
                            onClick={() => {
                              const ts = timesheets.find(t => t.id === entry.timesheetId);
                              setSelectedTs(ts);
                              setRemarks(ts?.remarks || "");
                            }}
                          >
                            Review
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Modal Reuse for Daily View */}
      <Dialog open={!!selectedTs} onOpenChange={(o) => { if (!o) { setSelectedTs(null); setRemarks(""); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedTs && (() => {
            const emp = allUsers.find((u) => u.id === selectedTs.userId);
            const weekDates = getWeekDates(selectedTs.weekStart);
            const cfg = statusConfig[selectedTs.status];

            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={emp?.avatar} />
                      <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-bold">{emp?.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p>Review Timesheet: {emp?.name}</p>
                      <p className="text-sm font-normal text-slate-500">
                        Week of {new Date(selectedTs.weekStart + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </DialogTitle>
                </DialogHeader>

                {/* Simplified Grid showing mostly totals */}
                <div className="mt-4 border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="py-2 px-3 text-left">Project</th>
                        <th className="py-2 px-3 text-center">Logs</th>
                        <th className="py-2 px-3 text-center">Total Hours</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedTs.entries.map((e, i) => {
                        const proj = projects.find(p => p.id === e.projectId);
                        return (
                          <tr key={i}>
                            <td className="py-2 px-3 font-medium">{proj?.name}</td>
                            <td className="py-2 px-3 text-center text-slate-500">{e.hours.filter(h => h > 0).length} days</td>
                            <td className="py-2 px-3 text-center font-bold">{e.hours.reduce((a, b) => a + b, 0)}h</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Manager Remarks</label>
                    <Textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Add comments..."
                      className="mt-1.5"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                      onClick={handleReject}
                    >
                      Reject Entire Week
                    </Button>
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      onClick={handleApprove}
                    >
                      Approve Entire Week
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ApprovalPage() {
  const { timesheets, allUsers, projects, approveTimesheet, rejectTimesheet } = useApp();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Manrope, sans-serif" }}>Approval Queue</h2>
        <p className="text-slate-500 text-sm mt-0.5">Review and approve employee timesheets.</p>
      </div>

      <Tabs defaultValue="daily" className="space-y-6">
        <TabsList className="bg-slate-100 p-1 rounded-lg">
          <TabsTrigger value="daily" className="rounded-md px-4">Daily Review</TabsTrigger>
          <TabsTrigger value="weekly" className="rounded-md px-4">Weekly Queue</TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <DailyReview
            timesheets={timesheets}
            allUsers={allUsers}
            projects={projects}
          />
        </TabsContent>

        <TabsContent value="weekly">
          <WeeklyQueue
            timesheets={timesheets}
            allUsers={allUsers}
            projects={projects}
            onApprove={approveTimesheet}
            onReject={rejectTimesheet}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
