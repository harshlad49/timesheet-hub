import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { taskCategories } from "@/data/mockData";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Plus, Calendar, Clock, Users, Search, Pencil, CheckCircle, Circle, AlertCircle, FolderKanban, FileText, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const statusConfig = {
  active: { label: "Active", class: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20" },
  completed: { label: "Completed", class: "bg-slate-100 text-slate-700 ring-1 ring-slate-600/20" },
  "on-hold": { label: "On Hold", class: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20" },
  planning: { label: "Planning", class: "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20" },
};

function ProjectDetailsSheet({ project, isOpen, onClose, users, tasks, timesheets, files }) {
  const stats = useMemo(() => {
    if (!project) return { totalHoursLogged: 0, memberStats: [], projectTasks: [], completedTasks: 0, totalTasks: 0, budget: 0, projectFiles: [] };

    // Calculate total hours from timesheets for this project
    const projectEntries = timesheets.flatMap(t => t.entries || []).filter(e => e.projectId === project.id);
    const totalHoursLogged = projectEntries.reduce((acc, e) => acc + e.hours.reduce((sum, h) => sum + (h || 0), 0), 0);

    // Calculate hours per member
    const memberHours = {};
    timesheets.forEach(t => {
      const pEntries = (t.entries || []).filter(e => e.projectId === project.id);
      const hours = pEntries.reduce((acc, e) => acc + e.hours.reduce((sum, h) => sum + (h || 0), 0), 0);
      if (hours > 0) {
        memberHours[t.userId] = (memberHours[t.userId] || 0) + hours;
      }
    });

    const memberStats = users
      .filter(u => project.memberIds.includes(u.id))
      .map(u => ({
        ...u,
        loggedHours: memberHours[u.id] || 0
      }))
      .sort((a, b) => b.loggedHours - a.loggedHours);

    // Task stats
    const projectTasks = tasks.filter(t => t.projectId === project.id);
    const completedTasks = projectTasks.filter(t => t.status === "completed").length;

    // File stats
    const projectFiles = files ? files.filter(f => f.projectId === project.id) : [];

    return {
      totalHoursLogged,
      memberStats,
      projectTasks,
      completedTasks,
      totalTasks: projectTasks.length,
      budget: project.totalHours || project.budget || 0,
      projectFiles
    };
  }, [project, timesheets, tasks, users, files]);

  if (!project) return null;

  const budgetProgress = stats.budget > 0 ? Math.min((stats.totalHoursLogged / stats.budget) * 100, 100) : 0;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className={cn("capitalize", statusConfig[project.status]?.class)}>
              {statusConfig[project.status]?.label}
            </Badge>
            <span className="text-xs text-slate-500">{project.client}</span>
          </div>
          <SheetTitle className="text-2xl font-bold text-slate-900">{project.name}</SheetTitle>
          <SheetDescription>{project.description}</SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-100 w-full justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 animate-in slide-in-from-left-2 duration-300">
            {/* Progress Card */}
            <Card className="bg-slate-50 border-slate-200 shadow-sm">
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-slate-700">Budget Utilization</span>
                    <span className={cn(budgetProgress > 100 ? "text-red-600" : "text-slate-900")}>
                      {stats.totalHoursLogged.toFixed(1)} / {stats.budget} h
                    </span>
                  </div>
                  <Progress value={budgetProgress} className={cn("h-2", budgetProgress > 100 ? "[&>div]:bg-red-500" : budgetProgress > 80 ? "[&>div]:bg-amber-500" : "")} />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-white p-3 rounded-lg border border-slate-100">
                    <div className="text-xs text-slate-500 mb-1">Start Date</div>
                    <div className="font-medium text-slate-900 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(project.startDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-100">
                    <div className="text-xs text-slate-500 mb-1">End Date</div>
                    <div className="font-medium text-slate-900 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(project.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Task Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-slate-200 rounded-xl bg-white">
                <div className="text-2xl font-bold text-slate-900 mb-1">{stats.completedTasks}</div>
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Completed Tasks
                </div>
              </div>
              <div className="p-4 border border-slate-200 rounded-xl bg-white">
                <div className="text-2xl font-bold text-slate-900 mb-1">{stats.totalTasks - stats.completedTasks}</div>
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Circle className="w-3.5 h-3.5 text-amber-500" /> Pending Tasks
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="members" className="space-y-4 animate-in slide-in-from-left-2 duration-300">
            <h3 className="text-sm font-semibold text-slate-900">Project Team ({stats.memberStats.length})</h3>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {stats.memberStats.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="bg-slate-100 text-slate-600 text-xs">{member.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium text-slate-900">{member.name}</div>
                        <div className="text-xs text-slate-500 capitalize">{member.role}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-700">{member.loggedHours}h</div>
                      <div className="text-[10px] text-slate-400">contribution</div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4 animate-in slide-in-from-left-2 duration-300">
            <h3 className="text-sm font-semibold text-slate-900">Tasks ({stats.totalTasks})</h3>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {stats.projectTasks.length > 0 ? (
                  stats.projectTasks.map(task => (
                    <div key={task.id} className="p-3 border border-slate-200 rounded-lg bg-white flex items-start gap-3">
                      {task.status === "completed" ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className={cn("text-sm font-medium truncate", task.status === "completed" && "text-slate-500 line-through")}>
                          {task.name}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal bg-slate-100 text-slate-500">
                            {task.priority}
                          </Badge>
                          <span className="text-[10px] text-slate-400">Est. {task.estimate}h</span>
                        </div>
                      </div>
                      <Avatar className="w-5 h-5 flex-shrink-0">
                        <AvatarFallback className="text-[9px] bg-slate-100">
                          {users.find(u => u.id === task.assignedTo)?.name?.[0] || "?"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    No tasks created for this project yet.
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="files" className="space-y-4 animate-in slide-in-from-left-2 duration-300">
            <h3 className="text-sm font-semibold text-slate-900">Project Files ({stats.projectFiles.length})</h3>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {stats.projectFiles.length > 0 ? (
                  stats.projectFiles.map(file => (
                    <div key={file.id} className="p-3 border border-slate-200 rounded-lg bg-white flex items-center justify-between group hover:border-slate-300 transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-slate-900 truncate">{file.name}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-2">
                            <span className="uppercase">{file.type}</span>
                            <span>•</span>
                            <span>{file.size}</span>
                            <span>•</span>
                            <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <FolderKanban className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                    <p className="text-sm text-slate-500 font-medium">No files uploaded</p>
                    <p className="text-xs text-slate-400 mt-1">Upload documents, designs, or assets</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function ProjectCard({ project, users, onEdit, onClick, canEdit }) {
  const members = users.filter((u) => project.memberIds.includes(u.id));
  const totalHours = project.totalHours || project.budget || 0; // Fallback to budget for mock data compatibility
  const budgetPct = totalHours > 0 ? Math.min(Math.round((project.spent / totalHours) * 100), 100) : 0;
  const cfg = statusConfig[project.status] || statusConfig.active;

  return (
    <Card
      onClick={onClick}
      className="bg-white border border-slate-200 shadow-none hover:shadow-md hover:border-slate-300 transition-all duration-200 group cursor-pointer"
      data-testid={`project-card-${project.id}`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
            <div>
              <h3 className="font-semibold text-slate-900 text-sm leading-tight">{project.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{project.client}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${cfg.class}`}>
              {cfg.label}
            </span>
            {canEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(project); }}
                className="text-slate-400 hover:text-indigo-600 transition-colors"
                data-testid={`edit-project-${project.id}`}
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-4 line-clamp-2">{project.description}</p>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Time Spent</span>
              <span className="font-medium text-slate-700">{project.spent}h / {totalHours}h</span>
            </div>
            <Progress value={budgetPct} className={`h-1.5 ${budgetPct > 90 ? "[&>div]:bg-red-500" : budgetPct > 70 ? "[&>div]:bg-amber-500" : ""}`} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Calendar className="w-3 h-3" />
              <span>{new Date(project.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            </div>
            <div className="flex -space-x-1.5">
              {members.slice(0, 3).map((m) => (
                <Avatar key={m.id} className="w-6 h-6 border-2 border-white">
                  <AvatarImage src={m.avatar} />
                  <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700">{m.name[0]}</AvatarFallback>
                </Avatar>
              ))}
              {members.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs text-slate-600 font-medium">
                  +{members.length - 3}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProjectsPage() {
  const { projects, addProject, updateProject, allUsers, currentUser, tasks, addTask, addFile, timesheets, files } = useApp();
  const [editingId, setEditingId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", client: "", status: "active", description: "",
    startDate: "", endDate: "", totalHours: "", color: "#4F46E5",
    memberIds: [],
  });

  // Staging state for new items
  const [stagedTasks, setStagedTasks] = useState([]);
  const [stagedFiles, setStagedFiles] = useState([]);
  const [newTaskForm, setNewTaskForm] = useState({ name: "", assignedTo: "", priority: "medium", categoryId: "t1" });

  const canCreate = currentUser?.role === "admin" || currentUser?.role === "manager";

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.client.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    all: filtered.length,
    active: filtered.filter((p) => p.status === "active").length,
    completed: filtered.filter((p) => p.status === "completed").length,
    "on-hold": filtered.filter((p) => p.status === "on-hold").length,
  };

  const handleAddTaskToForm = () => {
    if (!newTaskForm.name) return toast.error("Task name required");
    setStagedTasks([...stagedTasks, { ...newTaskForm, id: `temp_${Date.now()}` }]);
    setNewTaskForm({ name: "", assignedTo: "", priority: "medium", categoryId: "t1" });
  };

  const removeStagedTask = (idx) => {
    setStagedTasks(stagedTasks.filter((_, i) => i !== idx));
  };

  const handleCreate = () => {
    if (!form.name || !form.client) {
      toast.error("Project name and client are required");
      return;
    }
    const projectData = { ...form, totalHours: Number(form.totalHours) || 0 };
    let projectId = editingId;

    if (editingId) {
      updateProject({ ...projectData, id: editingId });
      toast.success("Project updated successfully!");
    } else {
      projectId = `p${Date.now()}`;
      addProject({ ...projectData, id: projectId, spent: 0, memberIds: form.memberIds.length ? form.memberIds : [currentUser?.id] });
      toast.success("Project created successfully!");
    }

    // Process staged tasks
    stagedTasks.forEach(task => {
      addTask({
        id: `t_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        projectId: projectId,
        name: task.name,
        assignedTo: task.assignedTo || null,
        status: "pending",
        priority: task.priority,
        dueDate: projectData.endDate,
        categoryId: task.categoryId || "t1"
      });
    });

    // Process staged files
    stagedFiles.forEach(file => {
      addFile({
        ...file,
        projectId: projectId,
        uploadedBy: currentUser?.id
      });
    });

    setOpen(false);
    setEditingId(null);
    setForm({ name: "", client: "", status: "active", description: "", startDate: "", endDate: "", totalHours: "", color: "#4F46E5", memberIds: [] });
    setStagedTasks([]);
    setStagedFiles([]);
  };

  const handleEdit = (project) => {
    setForm({
      name: project.name,
      client: project.client,
      status: project.status,
      description: project.description || "",
      startDate: project.startDate || "",
      endDate: project.endDate || "",
      totalHours: project.totalHours || project.budget || "",
      color: project.color || "#4F46E5",
      memberIds: project.memberIds || [],
    });
    setStagedTasks([]);
    setStagedFiles([]);
    setEditingId(project.id);
    setOpen(true);
  };

  const toggleMember = (userId) => {
    setForm(prev => ({
      ...prev,
      memberIds: prev.memberIds.includes(userId)
        ? prev.memberIds.filter(id => id !== userId)
        : [...prev.memberIds, userId]
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Manrope, sans-serif" }}>Projects</h2>
          <p className="text-slate-500 text-sm mt-0.5">{projects.length} total projects across all clients</p>
        </div>
        {canCreate && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-slate-900 hover:bg-slate-800 active:scale-95 transition-all" data-testid="create-project-btn">
                <Plus className="w-4 h-4 mr-2" /> New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Project" : "Create New Project"}</DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="details" className="flex-1 overflow-hidden flex flex-col">
                <TabsList className="bg-slate-100 w-full justify-start mb-4 flex-shrink-0">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="members">Team</TabsTrigger>
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  <TabsTrigger value="files">Files</TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-y-auto px-1">
                  {/* Details Tab */}
                  <TabsContent value="details" className="space-y-4 mt-0">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5 col-span-2">
                        <Label>Project Name *</Label>
                        <Input placeholder="e.g., Website Redesign" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="project-name-input" />
                      </div>
                      <div className="space-y-1.5 col-span-2">
                        <Label>Client *</Label>
                        <Input placeholder="e.g., TechCorp Inc." value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} data-testid="project-client-input" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Start Date</Label>
                        <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} data-testid="project-start-input" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>End Date</Label>
                        <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} data-testid="project-end-input" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Allocated Hours</Label>
                        <Input type="number" placeholder="120" value={form.totalHours} onChange={(e) => setForm({ ...form, totalHours: e.target.value })} data-testid="project-hours-input" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Status</Label>
                        <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                          <SelectTrigger data-testid="project-status-select"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="planning">Planning</SelectItem>
                            <SelectItem value="on-hold">On Hold</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5 col-span-2">
                        <Label>Description</Label>
                        <Input placeholder="Brief description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} data-testid="project-desc-input" />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Team Members Tab */}
                  <TabsContent value="members" className="space-y-4 mt-0">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Select Team Members</Label>
                        <span className="text-xs text-slate-500">{form.memberIds.length} selected</span>
                      </div>
                      <ScrollArea className="h-[300px] w-full rounded-md border p-2">
                        <div className="space-y-2">
                          {allUsers.map((user) => (
                            <div key={user.id} className="flex items-start space-x-3 p-2 hover:bg-slate-50 rounded transition-colors">
                              <Checkbox
                                id={`user-${user.id}`}
                                checked={form.memberIds.includes(user.id)}
                                onCheckedChange={() => toggleMember(user.id)}
                                className="mt-1"
                              />
                              <Label htmlFor={`user-${user.id}`} className="flex items-center gap-3 cursor-pointer w-full font-normal">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={user.avatar} />
                                  <AvatarFallback className="text-xs">{user.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-slate-900">{user.name}</div>
                                  <div className="text-xs text-slate-500 truncate">{user.email || "no-email@example.com"}</div>
                                </div>
                                <Badge variant="outline" className="text-[10px] h-5 capitalize">{user.role}</Badge>
                              </Label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </TabsContent>

                  {/* Tasks Tab */}
                  <TabsContent value="tasks" className="space-y-4 mt-0">
                    <div className="space-y-3">
                      <div className="grid grid-cols-12 gap-2 items-end bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="col-span-12 sm:col-span-4 space-y-1.5">
                          <Label className="text-xs">Task Name</Label>
                          <Input
                            placeholder="New task name"
                            className="h-8 text-sm"
                            value={newTaskForm.name}
                            onChange={(e) => setNewTaskForm({ ...newTaskForm, name: e.target.value })}
                          />
                        </div>
                        <div className="col-span-6 sm:col-span-3 space-y-1.5">
                          <Label className="text-xs">Category</Label>
                          <Select
                            value={newTaskForm.categoryId}
                            onValueChange={(v) => setNewTaskForm({ ...newTaskForm, categoryId: v })}
                          >
                            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
                            <SelectContent>
                              {taskCategories.map(c => (
                                <SelectItem key={c.id} value={c.id}>
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                                    {c.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-6 sm:col-span-3 space-y-1.5">
                          <Label className="text-xs">Assigned To</Label>
                          <Select
                            value={newTaskForm.assignedTo}
                            onValueChange={(v) => setNewTaskForm({ ...newTaskForm, assignedTo: v })}
                          >
                            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Member" /></SelectTrigger>
                            <SelectContent>
                              {allUsers.filter(u => form.memberIds.includes(u.id)).map(u => (
                                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-12 sm:col-span-2">
                          <Button size="sm" className="w-full h-8 bg-indigo-600 hover:bg-indigo-700" onClick={handleAddTaskToForm}>
                            <Plus className="w-3.5 h-3.5 mr-1" /> Add
                          </Button>
                        </div>
                      </div>

                      <ScrollArea className="h-[250px] w-full rounded-md border border-slate-200">
                        {stagedTasks.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <p className="text-sm">No tasks added yet.</p>
                            <p className="text-xs">Add tasks to kickstart the project.</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-100">
                            {stagedTasks.map((task, idx) => {
                              const cat = taskCategories.find(c => c.id === task.categoryId);
                              return (
                                <div key={idx} className="p-3 flex items-center justify-between hover:bg-slate-50">
                                  <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat?.color || "#cbd5e1" }}></div>
                                    <div>
                                      <div className="text-sm font-medium text-slate-900">{task.name}</div>
                                      <div className="text-xs text-slate-500">
                                        {cat?.name || "Uncategorized"} • {allUsers.find(u => u.id === task.assignedTo)?.name || "Unassigned"} • {task.priority}
                                      </div>
                                    </div>
                                  </div>
                                  <Button variant="ghost" size="sm" onClick={() => removeStagedTask(idx)} className="text-red-500 h-8 w-8 p-0">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </ScrollArea>
                    </div>
                  </TabsContent>

                  {/* Files Tab */}
                  <TabsContent value="files" className="space-y-4 mt-0">
                    <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => document.getElementById('file-upload-sim').click()}>
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-2">
                        <FileText className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-medium text-slate-900">Click to upload files</p>
                      <p className="text-xs text-slate-500 mt-1">SVG, PNG, JPG or PDF (max. 10MB)</p>
                      <input
                        id="file-upload-sim"
                        type="file"
                        className="hidden"
                        multiple
                        onChange={(e) => {
                          if (e.target.files?.length) {
                            const newFiles = Array.from(e.target.files).map(f => ({
                              name: f.name,
                              size: `${(f.size / 1024).toFixed(1)} KB`,
                              type: f.name.split('.').pop().toUpperCase(),
                              uploadedAt: new Date().toISOString()
                            }));
                            setStagedFiles([...stagedFiles, ...newFiles]);
                          }
                        }}
                      />
                    </div>

                    {stagedFiles.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-500 uppercase font-semibold">Attached Files</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {stagedFiles.map((f, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2 border border-slate-200 rounded-md bg-white">
                              <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-slate-500 font-bold text-[10px]">
                                {f.type}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium truncate">{f.name}</div>
                                <div className="text-[10px] text-slate-400">{f.size}</div>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => setStagedFiles(stagedFiles.filter((_, i) => i !== idx))} className="h-6 w-6 p-0 text-slate-400 hover:text-red-500">
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </div>

                <div className="flex gap-3 pt-4 mt-auto border-t border-slate-100 flex-shrink-0">
                  <Button variant="outline" className="flex-1" onClick={() => { setOpen(false); setEditingId(null); }}>Cancel</Button>
                  <Button className="flex-1 bg-slate-900 hover:bg-slate-800" onClick={handleCreate} data-testid="create-project-submit-btn">
                    {editingId ? "Save Changes" : "Create Project"}
                  </Button>
                </div>
              </Tabs>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          className="pl-9"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-testid="project-search-input"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList className="bg-slate-100">
          {["all", "active", "completed", "on-hold"].map((status) => (
            <TabsTrigger key={status} value={status} className="capitalize" data-testid={`project-tab-${status}`}>
              {status.replace("-", " ")} <span className="ml-1.5 text-xs opacity-60">({counts[status]})</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {["all", "active", "completed", "on-hold"].map((status) => (
          <TabsContent key={status} value={status}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
              {(status === "all" ? filtered : filtered.filter((p) => p.status === status)).map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  users={allUsers}
                  onEdit={handleEdit}
                  onClick={() => setSelectedProject(project)}
                  canEdit={canCreate}
                />
              ))}
              {(status === "all" ? filtered : filtered.filter((p) => p.status === status)).length === 0 && (
                <div className="col-span-3 text-center py-16 text-slate-400">
                  <FolderKanban className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>No {status !== "all" ? status : ""} projects found</p>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <ProjectDetailsSheet
        project={selectedProject}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        users={allUsers}
        tasks={tasks}
        timesheets={timesheets}
        files={files}
      />
    </div>
  );
}
