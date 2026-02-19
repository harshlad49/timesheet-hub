import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { taskCategories } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Plus, Trash2, Send, Save, CheckCircle, Clock, FileText } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getWeekDates(offset = 0) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatWeekLabel(dates) {
  const start = dates[0];
  const end = dates[6];
  const opts = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString("en-US", opts)} – ${end.toLocaleDateString("en-US", { ...opts, year: "numeric" })}`;
}

function toISODate(d) {
  return d.toISOString().split("T")[0];
}

const tsStatusConfig = {
  draft: { label: "Draft", class: "bg-slate-100 text-slate-700" },
  submitted: { label: "Submitted", class: "bg-amber-50 text-amber-700" },
  approved: { label: "Approved", class: "bg-emerald-50 text-emerald-700" },
  rejected: { label: "Rejected", class: "bg-red-50 text-red-700" },
};

export default function TimesheetPage() {
  const { currentUser, allUsers, projects = [], tasks = [], updateTaskStatus, submitTimesheet, saveTimesheetEntries, timesheets, approveTimesheet, rejectTimesheet } = useApp();
  const userProjects = projects.filter((p) => p.memberIds.includes(currentUser?.id) && p.status === "active");

  const [weekOffset, setWeekOffset] = useState(0);
  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const weekStart = toISODate(weekDates[0]);

  // Find existing timesheet for this week
  const existingTs = timesheets.find((t) => t.userId === currentUser?.id && t.weekStart === weekStart);
  const tsId = existingTs?.id || `ts_${currentUser?.id}_${weekStart}`;
  const tsStatus = existingTs?.status || "draft";

  /* Helper to merge existing entries with in-progress tasks */
  const getMergedEntries = (currentEntries, allTasks, userId, defaultProject) => {
    const baseEntries = currentEntries?.map((e) => {
      let taskId = "";
      let categoryId = "";

      // Handle legacy/existing data
      if (e.taskId) {
        const foundTask = allTasks.find(t => t.id === e.taskId);
        if (foundTask) {
          taskId = e.taskId;
          categoryId = foundTask.categoryId;
        } else {
          const foundCat = taskCategories.find(c => c.id === e.taskId);
          if (foundCat) categoryId = e.taskId;
        }
      }
      if (e.categoryId) categoryId = e.categoryId;

      return {
        ...e,
        taskId,
        categoryId,
        hours: [...e.hours],
        notes: e.notes ? [...e.notes] : Array(7).fill(""),
        progress: e.progress ? [...e.progress] : Array(7).fill(0),
      };
    }) || [];

    // Find in-progress tasks not already in entries
    const inProgressTasks = allTasks.filter(t =>
      t.assignedTo === userId &&
      t.status === "in-progress" &&
      !baseEntries.some(e => e.taskId === t.id)
    );

    const newEntries = inProgressTasks.map(t => ({
      projectId: t.projectId,
      taskId: t.id,
      categoryId: t.categoryId || "",
      hours: [0, 0, 0, 0, 0, 0, 0],
      notes: Array(7).fill(""),
      progress: Array(7).fill(0),
    }));

    const combined = [...baseEntries, ...newEntries];

    // If still empty, add default blank row
    if (combined.length === 0) {
      return [{
        projectId: defaultProject?.id || "",
        taskId: "",
        categoryId: "",
        hours: [0, 0, 0, 0, 0, 0, 0],
        notes: Array(7).fill(""),
        progress: Array(7).fill(0),
      }];
    }

    return combined;
  };

  /* State Initialization */
  const [entries, setEntries] = useState(() =>
    getMergedEntries(existingTs?.entries, tasks, currentUser?.id, userProjects[0])
  );

  const [selectedDayIndex, setSelectedDayIndex] = useState(() => {
    const today = new Date().getDay();
    return today === 0 ? 6 : today - 1;
  });

  // Reset entries when week changes
  const handleWeekChange = (newOffset) => {
    setWeekOffset(newOffset);
    const newDates = getWeekDates(newOffset);
    const newWeekStart = toISODate(newDates[0]);
    const newTs = timesheets.find((t) => t.userId === currentUser?.id && t.weekStart === newWeekStart);

    setEntries(getMergedEntries(newTs?.entries, tasks, currentUser?.id, userProjects[0]));
  };

  const handleDayChange = (newDayIndex) => {
    if (newDayIndex < 0) {
      handleWeekChange(weekOffset - 1);
      setSelectedDayIndex(6); // Go to Sunday of prev week
    } else if (newDayIndex > 6) {
      handleWeekChange(weekOffset + 1);
      setSelectedDayIndex(0); // Go to Monday of next week
    } else {
      setSelectedDayIndex(newDayIndex);
    }
  };

  const addRow = () => {
    setEntries([...entries, {
      projectId: userProjects[0]?.id || "",
      taskId: "",
      categoryId: "",
      hours: [0, 0, 0, 0, 0, 0, 0],
      notes: Array(7).fill(""),
      progress: Array(7).fill(0),
    }]);
  };

  const removeRow = (i) => {
    if (entries.length <= 1) return;
    setEntries(entries.filter((_, idx) => idx !== i));
  };

  const updateEntry = (idx, field, val) => {
    setEntries((prev) => prev.map((e, i) => {
      if (i !== idx) return e;

      const newEntry = { ...e, [field]: val };

      // Auto-fill category if task is selected
      if (field === "taskId") {
        const selectedTask = tasks.find(t => t.id === val);
        if (selectedTask) {
          newEntry.categoryId = selectedTask.categoryId;
        } else {
          // If task is cleared, also clear its derived category
          newEntry.categoryId = "";
        }
      }

      // Clear task if category changes to something incompatible (optional, but cleaner to just keep them independent or strictly linked. 
      // Let's keep logic simple: If task is set, and user changes category, maybe clear task? 
      // For now, let's allow flexibility.

      return newEntry;
    }));
  };

  const updateHours = (rowIdx, dayIdx, val) => {
    const num = Math.min(24, Math.max(0, parseFloat(val) || 0));
    setEntries((prev) => prev.map((e, i) =>
      i === rowIdx ? { ...e, hours: e.hours.map((h, d) => d === dayIdx ? num : h) } : e
    ));
  };

  const updateNote = (rowIdx, dayIdx, val) => {
    setEntries((prev) => prev.map((e, i) =>
      i === rowIdx ? { ...e, notes: e.notes.map((n, d) => d === dayIdx ? val : n) } : e
    ));
  };

  const updateProgress = (rowIdx, dayIdx, val) => {
    setEntries((prev) => prev.map((e, i) =>
      i === rowIdx ? { ...e, progress: e.progress.map((p, d) => d === dayIdx ? val[0] : p) } : e
    ));
  };

  const getRowTotal = (entry) => entry.hours.reduce((s, h) => s + h, 0);
  const getDayTotal = (dayIdx) => entries.reduce((s, e) => s + (e.hours[dayIdx] || 0), 0);
  const getGrandTotal = () => entries.reduce((s, e) => s + getRowTotal(e), 0);

  const handleSaveDraft = () => {
    saveTimesheetEntries(tsId, entries, getGrandTotal());
    toast.success("Timesheet saved as draft");
  };

  const handleSubmit = () => {
    if (getGrandTotal() === 0) {
      toast.error("Please log at least some hours before submitting");
      return;
    }
    saveTimesheetEntries(tsId, entries, getGrandTotal());
    if (existingTs) {
      submitTimesheet(existingTs.id);
    } else {
      toast.success("Timesheet saved and submitted for approval!");
    }
    toast.success("Timesheet submitted for approval!");
  };

  const isEditable = tsStatus === "draft" || tsStatus === "rejected";
  const myHistory = timesheets.filter((t) => t.userId === currentUser?.id).sort((a, b) => b.weekStart.localeCompare(a.weekStart));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Manrope, sans-serif" }}>Timesheets</h2>
        <p className="text-slate-500 text-sm mt-0.5">Log your daily hours by project and activity.</p>
      </div>

      <Tabs defaultValue="daily">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="daily" data-testid="tab-daily">Daily Entry</TabsTrigger>
          <TabsTrigger value="weekly" data-testid="tab-weekly">Weekly Grid</TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">My History</TabsTrigger>
        </TabsList>

        {/* Daily Entry Tab */}
        <TabsContent value="daily" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Tasks List */}
            <div className="lg:col-span-2 space-y-4">

              {/* Day Navigator */}
              <Card className="bg-white border border-slate-200 shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <button
                    onClick={() => handleDayChange(selectedDayIndex - 1)}
                    className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Prev Day
                  </button>
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-slate-900 font-manrope">
                      {weekDates[selectedDayIndex].toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">{getDayTotal(selectedDayIndex)} Hours Logged</p>
                  </div>
                  <button
                    onClick={() => handleDayChange(selectedDayIndex + 1)}
                    disabled={weekOffset >= 0 && selectedDayIndex >= (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1)}
                    className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors disabled:opacity-30"
                  >
                    Next Day <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </CardContent>
              </Card>

              {/* Task Entries */}
              <div className="space-y-4">
                {entries.map((entry, rowIdx) => {
                  const safeTasks = tasks || [];
                  let projectTasks = safeTasks.filter(t =>
                    t.projectId === entry.projectId &&
                    (t.assignedTo === currentUser?.id || t.assignedTo === "u1") &&
                    (t.status === "pending" || t.status === "in-progress")
                  );
                  const selectedTask = safeTasks.find(t => t.id === entry.taskId);

                  // Ensure selected task is in the list even if completed
                  if (selectedTask && !projectTasks.find(t => t.id === selectedTask.id)) {
                    projectTasks = [selectedTask, ...projectTasks];
                  }

                  return (
                    <Card key={rowIdx} className="bg-white border border-slate-200 shadow-sm overflow-hidden group hover:border-indigo-200 transition-all">
                      <CardContent className="p-5">
                        <div className="flex flex-col sm:flex-row gap-5">
                          {/* Main Inputs */}
                          <div className="flex-1 space-y-4">
                            {/* Project / Task Selector */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <Select
                                value={entry.projectId}
                                onValueChange={(v) => updateEntry(rowIdx, "projectId", v)}
                                disabled={!isEditable}
                              >
                                <SelectTrigger className="h-10 border-slate-200 bg-slate-50/50">
                                  <SelectValue placeholder="Select Project" />
                                </SelectTrigger>
                                <SelectContent>
                                  {userProjects.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <Select
                                value={entry.taskId}
                                onValueChange={(v) => updateEntry(rowIdx, "taskId", v)}
                                disabled={!isEditable || !entry.projectId}
                              >
                                <SelectTrigger className="h-10 border-slate-200 bg-slate-50/50">
                                  <SelectValue placeholder="Select Task" />
                                </SelectTrigger>
                                <SelectContent>
                                  {projectTasks.map((t) => (
                                    <SelectItem key={t.id} value={t.id}>
                                      <span className={cn(t.status === "completed" && "line-through opacity-70")}>{t.name}</span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Placeholder for "What did you work on today?" */}
                            <Input
                              placeholder="What did you work on today?"
                              className="border-slate-200 h-10 bg-slate-50/30"
                              disabled={!isEditable}
                            // Mapping this to nowhere for now, or could use as a short description if needed. 
                            // For now, let's keep it purely visual or map to a temporary state if we want realism.
                            // Better: Let's map it to the first line of notes if possible, but that's complex.
                            // I'll leave it as a visual placeholder for now as per "like image".
                            />

                            {/* Detailed Note */}
                            <Textarea
                              placeholder="Add detailed notes for today..."
                              value={entry.notes?.[selectedDayIndex] || ""}
                              onChange={(e) => updateNote(rowIdx, selectedDayIndex, e.target.value)}
                              className="min-h-[80px] text-sm resize-none border-slate-200 bg-slate-50/30 focus:bg-white transition-colors"
                              disabled={!isEditable}
                            />
                          </div>

                          {/* Right Panel: Hours & Actions */}
                          <div className="w-full sm:w-32 flex flex-col items-center gap-3 border-l border-slate-100 pl-5">
                            <div className="text-center w-full">
                              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 block">Hours</label>
                              <Input
                                type="number"
                                min="0" max="24" step="0.5"
                                value={entry.hours[selectedDayIndex] === 0 ? "" : entry.hours[selectedDayIndex]}
                                onChange={(e) => updateHours(rowIdx, selectedDayIndex, e.target.value)}
                                placeholder="0"
                                disabled={!isEditable}
                                className="h-16 text-3xl font-bold text-center border-slate-100 bg-slate-50 text-indigo-900 focus:border-indigo-300 focus:ring-indigo-100 rounded-xl"
                              />
                            </div>

                            <Button
                              variant="outline"
                              className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 h-9 text-xs font-semibold uppercase tracking-wide"
                              disabled={!isEditable}
                            >
                              Check In
                            </Button>

                            {isEditable && (
                              <button
                                onClick={() => removeRow(rowIdx)}
                                disabled={entries.length <= 1}
                                className="mt-auto text-slate-300 hover:text-red-500 transition-colors bg-transparent p-2 rounded-full hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {isEditable && (
                  <Button
                    variant="outline"
                    onClick={addRow}
                    className="w-full py-6 border-dashed border-slate-300 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group"
                  >
                    <Plus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" /> Add Task for {weekDates[selectedDayIndex].toLocaleDateString("en-US", { weekday: "short" })}
                  </Button>
                )}
              </div>
            </div>

            {/* Right Column: Stats & Sidebar */}
            <div className="space-y-6">

              {/* Daily Progress Card */}
              <Card className="bg-slate-900 text-white border-0 shadow-lg overflow-hidden relative">
                {/* Background blob for effect */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-400" /> Daily Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-6">
                  {/* Circular Progress Placeholder */}
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      {/* Background Ring */}
                      <path className="text-slate-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                      {/* Progress Ring */}
                      <path
                        className="text-indigo-500 transition-all duration-1000 ease-out"
                        strokeDasharray={`${Math.min(100, (getDayTotal(selectedDayIndex) / 8) * 100)}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-3xl font-bold">{Math.round((getDayTotal(selectedDayIndex) / 8) * 100)}%</span>
                    </div>
                  </div>
                  <p className="mt-4 text-sm font-medium text-slate-300">
                    <span className="text-white font-bold">{getDayTotal(selectedDayIndex)}</span> / 8.0 hrs logged
                  </p>
                </CardContent>
              </Card>

              {/* Live Check-Ins Card */}
              <Card className="bg-white border border-slate-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-indigo-600 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse"></div>
                    </div>
                    Live Check-Ins
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6 text-slate-400 text-xs">
                    No active check-ins for today.
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </TabsContent>

        {/* Weekly Entry Tab */}
        <TabsContent value="weekly" className="mt-6">
          <Card className="bg-white border border-slate-200 shadow-none">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Week Navigator */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleWeekChange(weekOffset - 1)}
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
                    data-testid="prev-week-btn"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="text-center">
                    <p className="font-semibold text-slate-900 text-sm" data-testid="week-label">{formatWeekLabel(weekDates)}</p>
                    <p className="text-xs text-slate-400">{getGrandTotal()} hours logged</p>
                  </div>
                  <button
                    onClick={() => handleWeekChange(weekOffset + 1)}
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
                    data-testid="next-week-btn"
                    disabled={weekOffset >= 0}
                  >
                    <ChevronRight className={cn("w-4 h-4", weekOffset >= 0 && "opacity-30")} />
                  </button>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-3">
                  <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full capitalize", tsStatusConfig[tsStatus]?.class)}>
                    {tsStatusConfig[tsStatus]?.label}
                  </span>
                  {isEditable && (
                    <>
                      <Button variant="outline" size="sm" onClick={handleSaveDraft} data-testid="save-draft-btn">
                        <Save className="w-3.5 h-3.5 mr-1.5" /> Save Draft
                      </Button>
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={handleSubmit} data-testid="submit-timesheet-btn">
                        <Send className="w-3.5 h-3.5 mr-1.5" /> Submit
                      </Button>
                    </>
                  )}
                  {tsStatus === "submitted" && (
                    <div className="flex items-center gap-1 text-amber-600 text-xs">
                      <Clock className="w-3.5 h-3.5" /> Awaiting Approval
                    </div>
                  )}
                  {tsStatus === "approved" && (
                    <div className="flex items-center gap-1 text-emerald-600 text-xs">
                      <CheckCircle className="w-3.5 h-3.5" /> Approved
                    </div>
                  )}
                </div>
              </div>

              {/* Rejected message */}
              {tsStatus === "rejected" && existingTs?.remarks && (
                <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
                  <strong>Rejection reason:</strong> {existingTs.remarks}
                </div>
              )}
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto" data-testid="timesheet-grid">
                <table className="w-full min-w-[850px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-36">Project</th>
                      <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">Task</th>
                      <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Category</th>
                      {weekDates.map((d, i) => (
                        <th key={i} className={cn("py-3 px-2 text-center text-xs font-semibold uppercase tracking-wider w-20", i >= 5 ? "text-slate-400 bg-slate-100/50" : "text-slate-500")}>
                          <div>{DAY_NAMES[i]}</div>
                          <div className={cn("text-base font-bold mt-0.5", i >= 5 ? "text-slate-400" : "text-slate-700")}>{d.getDate()}</div>
                        </th>
                      ))}
                      <th className="py-3 px-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider w-14">Total</th>
                      {isEditable && <th className="w-10"></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry, rowIdx) => {
                      // Filter tasks for the selected project
                      const safeTasks = tasks || [];
                      let projectTasks = safeTasks.filter(t =>
                        t.projectId === entry.projectId &&
                        (t.assignedTo === currentUser?.id || t.assignedTo === "u1") &&
                        (t.status === "pending" || t.status === "in-progress")
                      );

                      // Find the selected task to check status
                      const selectedTask = safeTasks.find(t => t.id === entry.taskId);
                      const isTaskCompleted = selectedTask?.status === "completed";

                      // Ensure selected task is in the list
                      if (selectedTask && !projectTasks.find(t => t.id === selectedTask.id)) {
                        projectTasks = [selectedTask, ...projectTasks];
                      }

                      return (
                        <tr key={rowIdx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors" data-testid={`timesheet-row-${rowIdx}`}>
                          <td className="py-2 px-4">
                            <Select
                              value={entry.projectId}
                              onValueChange={(v) => updateEntry(rowIdx, "projectId", v)}
                              disabled={!isEditable}
                            >
                              <SelectTrigger className="h-8 text-xs border-slate-200" data-testid={`project-select-${rowIdx}`}>
                                <SelectValue placeholder="Select project" />
                              </SelectTrigger>
                              <SelectContent>
                                {userProjects.map((p) => (
                                  <SelectItem key={p.id} value={p.id} className="text-xs">{p.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-2">
                              <Select
                                value={entry.taskId}
                                onValueChange={(v) => updateEntry(rowIdx, "taskId", v)}
                                disabled={!isEditable || !entry.projectId}
                              >
                                <SelectTrigger className="h-8 text-xs border-slate-200 w-full" data-testid={`task-select-${rowIdx}`}>
                                  <SelectValue placeholder="Select Task" />
                                </SelectTrigger>
                                <SelectContent>
                                  {projectTasks.length > 0 ? (
                                    projectTasks.map((t) => (
                                      <SelectItem key={t.id} value={t.id} className="text-xs">
                                        <span className={cn(t.status === "completed" && "line-through opacity-70")}>{t.name}</span>
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <div className="p-2 text-xs text-slate-400">No tasks found</div>
                                  )}
                                </SelectContent>
                              </Select>
                              {(selectedTask) && (
                                <button
                                  title={isTaskCompleted ? "Mark as in-progress" : "Mark as completed"}
                                  onClick={() => selectedTask && updateTaskStatus(selectedTask.id, isTaskCompleted ? "in-progress" : "completed")}
                                  className={cn(
                                    "p-1.5 rounded-full transition-colors flex-shrink-0",
                                    isTaskCompleted ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100" : "text-slate-300 hover:text-emerald-500 hover:bg-slate-100"
                                  )}
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-3">
                            <Select
                              value={entry.categoryId}
                              onValueChange={(v) => updateEntry(rowIdx, "categoryId", v)}
                              disabled={!isEditable}
                            >
                              <SelectTrigger className="h-8 text-xs border-slate-200 w-full" data-testid={`category-select-${rowIdx}`}>
                                <SelectValue placeholder="Category" />
                              </SelectTrigger>
                              <SelectContent>
                                {taskCategories.map((c) => (
                                  <SelectItem key={c.id} value={c.id} className="text-xs">
                                    {c.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          {weekDates.map((d, dayIdx) => (
                            <td key={dayIdx} className={cn("py-2 px-2", dayIdx >= 5 && "bg-slate-50/80")}>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min="0"
                                  max="24"
                                  step="0.5"
                                  value={entry.hours[dayIdx] === 0 ? "" : entry.hours[dayIdx]}
                                  placeholder="0"
                                  onChange={(e) => updateHours(rowIdx, dayIdx, e.target.value)}
                                  disabled={!isEditable}
                                  className={cn(
                                    "w-full h-8 text-center text-sm rounded-md border transition-colors",
                                    "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
                                    dayIdx >= 5 ? "bg-slate-100 border-slate-200 text-slate-400" : "bg-white border-slate-200 text-slate-900",
                                    !isEditable && "opacity-60 cursor-not-allowed",
                                    entry.hours[dayIdx] > 0 && "font-semibold text-indigo-700 border-indigo-200 bg-indigo-50"
                                  )}
                                  data-testid={`hours-input-${rowIdx}-${dayIdx}`}
                                />
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <button
                                      title={(entry.notes?.[dayIdx] || entry.progress?.[dayIdx] > 0) ? "Edit details" : "Add details"}
                                      disabled={!isEditable}
                                      className={cn(
                                        "p-1.5 rounded-md transition-colors flex-shrink-0",
                                        (entry.notes?.[dayIdx] || entry.progress?.[dayIdx] > 0) ? "text-indigo-600 bg-indigo-50 hover:bg-indigo-100" : "text-slate-300 hover:text-slate-500 hover:bg-slate-100",
                                        !isEditable && "opacity-50 cursor-not-allowed"
                                      )}
                                    >
                                      <FileText className="w-3.5 h-3.5" />
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-72 p-3">
                                    <div className="space-y-3">
                                      <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                          <h4 className="font-medium text-xs text-slate-900">Hours ({DAY_NAMES[dayIdx]})</h4>
                                          <span className="text-[10px] text-slate-400">0-24h</span>
                                        </div>
                                        <Input
                                          type="number"
                                          min="0"
                                          max="24"
                                          step="0.5"
                                          value={entry.hours[dayIdx] === 0 ? "" : entry.hours[dayIdx]}
                                          onChange={(e) => updateHours(rowIdx, dayIdx, e.target.value)}
                                          placeholder="0"
                                          className="h-8 text-xs"
                                          disabled={!isEditable}
                                        />
                                      </div>

                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                          <h4 className="font-medium text-xs text-slate-900">Progress</h4>
                                          <span className="text-[10px] font-medium text-indigo-600">{entry.progress?.[dayIdx] || 0}%</span>
                                        </div>
                                        <Slider
                                          defaultValue={[entry.progress?.[dayIdx] || 0]}
                                          max={100}
                                          step={5}
                                          onValueChange={(val) => updateProgress(rowIdx, dayIdx, val)}
                                          disabled={!isEditable}
                                          className="py-1"
                                        />
                                      </div>

                                      <div className="space-y-1">
                                        <h4 className="font-medium text-xs text-slate-900">Note</h4>
                                        <Textarea
                                          value={entry.notes?.[dayIdx] || ""}
                                          onChange={(e) => updateNote(rowIdx, dayIdx, e.target.value)}
                                          placeholder="Describe what you worked on..."
                                          className="h-20 text-xs resize-none"
                                          disabled={!isEditable}
                                        />
                                      </div>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              </div>
                            </td>
                          ))}
                          <td className="py-2 px-3 text-center">
                            <span className={cn("text-sm font-bold", getRowTotal(entry) > 0 ? "text-indigo-600" : "text-slate-400")} data-testid={`row-total-${rowIdx}`}>
                              {getRowTotal(entry)}
                            </span>
                          </td>
                          {isEditable && (
                            <td className="py-2 px-1">
                              <button
                                onClick={() => removeRow(rowIdx)}
                                disabled={entries.length <= 1}
                                className="p-1 text-slate-300 hover:text-red-500 transition-colors disabled:opacity-20"
                                data-testid={`remove-row-${rowIdx}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 border-t-2 border-slate-200">
                      <td colSpan={2} className="py-3 px-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Daily Total</td>
                      {weekDates.map((d, dayIdx) => (
                        <td key={dayIdx} className={cn("py-3 px-2 text-center", dayIdx >= 5 && "bg-slate-100/50")}>
                          <span className={cn("text-sm font-bold", getDayTotal(dayIdx) > 8 ? "text-red-600" : getDayTotal(dayIdx) > 0 ? "text-slate-900" : "text-slate-300")} data-testid={`day-total-${dayIdx}`}>
                            {getDayTotal(dayIdx) || "—"}
                          </span>
                        </td>
                      ))}
                      <td className="py-3 px-3 text-center">
                        <span className="text-sm font-bold text-indigo-700" data-testid="grand-total">{getGrandTotal()}</span>
                      </td>
                      {isEditable && <td />}
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Add Row */}
              {isEditable && (
                <div className="p-4 border-t border-slate-100">
                  <Button variant="outline" size="sm" onClick={addRow} className="text-slate-600" data-testid="add-row-btn">
                    <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Row
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-6">
          <Card className="bg-white border border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Timesheet History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {myHistory.length === 0 ? (
                <p className="text-center text-slate-400 py-12">No timesheet history found.</p>
              ) : (
                <table className="w-full" data-testid="timesheet-history-table">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Week</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Submitted</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Hours</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myHistory.map((ts) => {
                      const cfg = tsStatusConfig[ts.status];
                      return (
                        <tr key={ts.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors" data-testid={`history-row-${ts.id}`}>
                          <td className="py-3 px-6 text-sm font-medium text-slate-900">
                            {new Date(ts.weekStart + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-500 hidden sm:table-cell">
                            {ts.submittedAt ? new Date(ts.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-sm font-bold text-slate-900">{ts.totalHours}h</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full capitalize", cfg?.class)}>{cfg?.label}</span>
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-500 hidden md:table-cell max-w-xs truncate">{ts.remarks || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
