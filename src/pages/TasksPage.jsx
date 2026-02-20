import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Code2, Pen, TestTube, Users, FileText, Search, Upload, BookOpen, CheckSquare, Layers, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { taskCategories as initialCategories } from "@/data/mockData";

const ICON_MAP = {
  t1: Code2, t2: Pen, t3: TestTube, t4: Users,
  t5: FileText, t6: Search, t7: CheckSquare, t8: Upload,
};

const CATEGORY_COLORS = ["#4F46E5", "#7C3AED", "#059669", "#D97706", "#DC2626", "#0891B2", "#9333EA", "#EA580C"];



const priorityConfig = {
  high: "bg-red-50 text-red-700",
  medium: "bg-amber-50 text-amber-700",
  low: "bg-emerald-50 text-emerald-700",
};

const statusConfig = {
  pending: "bg-slate-100 text-slate-600",
  "in-progress": "bg-blue-50 text-blue-700",
  completed: "bg-emerald-50 text-emerald-700",
};

export default function TasksPage({ view = "all" }) {
  const { currentUser, tasks, setTasks, addTask, updateTaskStatus, projects, allUsers } = useApp();
  const [categories, setCategories] = useState(initialCategories);
  const [catOpen, setCatOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [catForm, setCatForm] = useState({ name: "", color: "#4F46E5" });
  const [taskForm, setTaskForm] = useState({ name: "", categoryId: "t1", priority: "medium", estimate: "", status: "pending", projectId: "", assignedTo: "" });
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Reset page when filters change
  useMemo(() => setCurrentPage(1), [view, selectedCategory]);

  const handleAddCategory = () => {
    if (!catForm.name) { toast.error("Category name is required"); return; }
    const newCat = { id: `tc${Date.now()}`, name: catForm.name, color: catForm.color, count: 0 };
    setCategories([...categories, newCat]);
    toast.success("Category added!");
    setCatOpen(false);
    setCatForm({ name: "", color: "#4F46E5" });
  };
  // ... (rest of the file remains same, just inserting state)

  const handleAddTask = () => {
    if (!taskForm.name) { toast.error("Task name is required"); return; }

    if (editingId) {
      setTasks(prev => prev.map(t => t.id === editingId ? { ...t, ...taskForm, estimate: Number(taskForm.estimate) || 0 } : t));
      toast.success("Task updated!");
    } else {
      const newTask = {
        // id generated in context
        ...taskForm,
        estimate: Number(taskForm.estimate) || 0,
        assignedTo: taskForm.assignedTo || (view === "my" ? currentUser?.id : "u1"),
        createdBy: currentUser?.id,
        createdAt: new Date().toISOString()
      };
      addTask(newTask);
      // Update category count
      setCategories((prev) => prev.map((c) => c.id === taskForm.categoryId ? { ...c, count: c.count + 1 } : c));
      toast.success("Task added!");
    }

    setTaskOpen(false);
    setEditingId(null);
    setTaskForm({ name: "", categoryId: "t1", priority: "medium", estimate: "", status: "pending", projectId: "", assignedTo: "" });
  };

  const handleEditTask = (task) => {
    setTaskForm({
      name: task.name,
      categoryId: task.categoryId,
      priority: task.priority,
      estimate: task.estimate || "",
      status: task.status,
      projectId: task.projectId || "",
      assignedTo: task.assignedTo || ""
    });
    setEditingId(task.id);
    setTaskOpen(true);
  };

  const handleStatusChange = (taskId, newStatus) => {
    updateTaskStatus(taskId, newStatus);
    toast.success("Task status updated");
  };

  const handleDeleteTask = (taskId, categoryId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setCategories((prev) => prev.map((c) => c.id === categoryId ? { ...c, count: Math.max(0, c.count - 1) } : c));
    toast.success("Task removed");
  };

  const filteredTasks = useMemo(() => {
    let filtered = tasks;
    if (view === "my" && currentUser) {
      filtered = filtered.filter(t => t.assignedTo === currentUser.id);
    }
    if (selectedCategory !== "all") {
      filtered = filtered.filter(t => t.categoryId === selectedCategory);
    }
    return filtered;
  }, [tasks, view, currentUser, selectedCategory]);

  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const paginatedTasks = filteredTasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Manrope, sans-serif" }}>
            {view === "my" ? "My Tasks" : "Tasks & Categories"}
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            {view === "my" ? "Manage your assigned tasks." : "Manage activity categories and task definitions."}
          </p>
        </div>
        <div className="flex gap-3">
          <Dialog open={catOpen} onOpenChange={setCatOpen}>
            <DialogTrigger asChild>
              {view !== "my" && (
                <Button variant="outline" data-testid="add-category-btn">
                  <Layers className="w-4 h-4 mr-2" /> Add Category
                </Button>
              )}
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader><DialogTitle>New Activity Category</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label>Category Name *</Label>
                  <Input placeholder="e.g., Security Audit" value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} data-testid="category-name-input" />
                </div>
                <div className="space-y-1.5">
                  <Label>Color</Label>
                  <div className="flex gap-2 flex-wrap">
                    {CATEGORY_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setCatForm({ ...catForm, color })}
                        className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${catForm.color === color ? "ring-2 ring-offset-2 ring-slate-900 scale-110" : ""}`}
                        style={{ backgroundColor: color }}
                        data-testid={`color-${color.replace("#", "")}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <Button variant="outline" className="flex-1" onClick={() => setCatOpen(false)}>Cancel</Button>
                  <Button className="flex-1 bg-slate-900 hover:bg-slate-800" onClick={handleAddCategory} data-testid="add-category-submit-btn">Add</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={taskOpen} onOpenChange={(open) => {
            setTaskOpen(open);
            if (!open) {
              setEditingId(null);
              setTaskForm({ name: "", categoryId: "t1", priority: "medium", estimate: "", status: "pending", projectId: "", assignedTo: "" });
            }
          }}>
            <DialogTrigger asChild>
              {view !== "my" && (
                <Button className="bg-slate-900 hover:bg-slate-800 active:scale-95 transition-all" data-testid="add-task-btn">
                  <Plus className="w-4 h-4 mr-2" /> Add Task
                </Button>
              )}
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader><DialogTitle>{editingId ? "Edit Task" : "Add New Task"}</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label>Task Name *</Label>
                  <Input placeholder="e.g., Implement login flow" value={taskForm.name} onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })} data-testid="task-name-input" />
                </div>

                <div className="space-y-1.5">
                  <Label>Project (Optional)</Label>
                  <Select value={taskForm.projectId} onValueChange={(v) => setTaskForm({ ...taskForm, projectId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select Project" /></SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Assigned To</Label>
                  <Select value={taskForm.assignedTo} onValueChange={(v) => setTaskForm({ ...taskForm, assignedTo: v })}>
                    <SelectTrigger><SelectValue placeholder="Select Assignee" /></SelectTrigger>
                    <SelectContent>
                      {allUsers.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select value={taskForm.categoryId} onValueChange={(v) => setTaskForm({ ...taskForm, categoryId: v })}>
                    <SelectTrigger data-testid="task-category-select"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Priority</Label>
                    <Select value={taskForm.priority} onValueChange={(v) => setTaskForm({ ...taskForm, priority: v })}>
                      <SelectTrigger data-testid="task-priority-select"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Est. Hours</Label>
                    <Input type="number" placeholder="8" value={taskForm.estimate} onChange={(e) => setTaskForm({ ...taskForm, estimate: e.target.value })} data-testid="task-estimate-input" />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <Label>Status</Label>
                    <Select value={taskForm.status} onValueChange={(v) => setTaskForm({ ...taskForm, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <Button variant="outline" className="flex-1" onClick={() => setTaskOpen(false)}>Cancel</Button>
                  <Button className="flex-1 bg-slate-900 hover:bg-slate-800" onClick={handleAddTask} data-testid="add-task-submit-btn">
                    {editingId ? "Save Changes" : "Add Task"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Categories Grid */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Activity Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
          {categories.map((cat) => {
            const IconComp = ICON_MAP[cat.id] || BookOpen;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? "all" : cat.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md text-left group ${selectedCategory === cat.id ? "border-slate-900 shadow-md" : "border-slate-200 bg-white hover:border-slate-300"}`}
                data-testid={`category-${cat.id}`}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2 transition-transform group-hover:scale-110" style={{ backgroundColor: cat.color + "20" }}>
                  <IconComp className="w-4 h-4" style={{ color: cat.color }} />
                </div>
                <p className="text-xs font-semibold text-slate-900 leading-tight">{cat.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{cat.count} tasks</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tasks Table */}
      <Card className="bg-white border border-slate-200 shadow-none">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">
              {selectedCategory === "all" ? "All Tasks" : categories.find(c => c.id === selectedCategory)?.name || "Tasks"}
              <span className="ml-2 text-sm font-normal text-slate-400">({filteredTasks.length})</span>
            </CardTitle>
            {selectedCategory !== "all" && (
              <button onClick={() => setSelectedCategory("all")} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Clear filter</button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <CheckSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No tasks in this category</p>
            </div>
          ) : (
            <>
              <table className="w-full" data-testid="tasks-table">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Task</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Category</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Project</th>
                    {!(view === "my" && currentUser?.role === "employee") && (
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Assigned To</th>
                    )}
                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Priority</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Est. Hrs</th>
                    {view !== "my" && <th className="py-3 px-4 w-12"></th>}
                  </tr>
                </thead>
                <tbody>
                  {paginatedTasks.map((task) => {
                    const cat = categories.find((c) => c.id === task.categoryId);
                    const project = projects.find((p) => p.id === task.projectId);
                    const assignee = allUsers.find(u => u.id === task.assignedTo);

                    return (
                      <tr key={task.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors" data-testid={`task-row-${task.id}`}>
                        <td className="py-3 px-6 text-sm font-medium text-slate-900">
                          {task.name}
                          {task.createdAt && <div className="text-[10px] text-slate-400 font-normal mt-0.5">Created {new Date(task.createdAt).toLocaleDateString()}</div>}
                        </td>
                        <td className="py-3 px-4 hidden sm:table-cell">
                          {cat && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: cat.color + "15", color: cat.color }}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                              {cat.name}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 hidden sm:table-cell text-sm text-slate-500">
                          {project ? project.name : "—"}
                        </td>
                        {!(view === "my" && currentUser?.role === "employee") && (
                          <td className="py-3 px-4 hidden md:table-cell text-sm text-slate-500">
                            {assignee ? (
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                  {assignee.name[0]}
                                </div>
                                <span>{assignee.name}</span>
                              </div>
                            ) : "—"}
                          </td>
                        )}
                        <td className="py-3 px-4 text-center">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${priorityConfig[task.priority]}`}>{task.priority}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Select value={task.status} onValueChange={(v) => handleStatusChange(task.id, v)}>
                            <SelectTrigger className={`h-7 text-xs font-medium capitalize border-0 shadow-none focus:ring-0 w-[110px] mx-auto ${statusConfig[task.status]}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-3 px-4 text-center text-sm text-slate-600 hidden md:table-cell">{task.estimate ? `${task.estimate}h` : "—"}</td>
                        {view !== "my" && (
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => handleEditTask(task)} className="text-slate-300 hover:text-indigo-600 transition-colors p-1">
                                <Pen className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleDeleteTask(task.id, task.categoryId)} className="text-slate-300 hover:text-red-500 transition-colors p-1" data-testid={`delete-task-${task.id}`}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/50">
                  <p className="text-xs text-slate-500">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTasks.length)} of {filteredTasks.length} tasks
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="h-8 text-xs"
                    >
                      Previous
                    </Button>
                    <div className="flex items-center px-2">
                      <span className="text-xs font-medium text-slate-700">Page {currentPage} of {totalPages}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="h-8 text-xs"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
