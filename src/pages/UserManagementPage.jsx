import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, UserCheck, UserX, Edit2, Users, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const roleConfig = {
  admin: { label: "Admin", class: "bg-slate-100 text-slate-800" },
  manager: { label: "Manager", class: "bg-violet-100 text-violet-800" },
  employee: { label: "Employee", class: "bg-indigo-100 text-indigo-800" },
};

export default function UserManagementPage() {
  const { allUsers, addUser, updateUser, removeUser, updateUserStatus } = useApp();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", role: "employee" });

  // Mock list of employees who are not yet users
  const availableEmployees = [
    { name: "John Doe", email: "john@timepro.com" },
    { name: "Jane Smith", email: "jane@timepro.com" },
    { name: "Robert Fox", email: "robert@timepro.com" },
    { name: "Bessie Cooper", email: "bessie@timepro.com" },
  ];

  const filtered = allUsers.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const counts = {
    all: allUsers.length,
    admin: allUsers.filter(u => u.role === "admin").length,
    manager: allUsers.filter(u => u.role === "manager").length,
    employee: allUsers.filter(u => u.role === "employee").length,
    active: allUsers.filter(u => u.status === "active").length,
    inactive: allUsers.filter(u => u.status === "inactive").length,
  };

  const handleAddUser = () => {
    if (!form.name) {
      toast.error("Please select an employee");
      return;
    }

    if (editingId) {
      const existingUser = allUsers.find(u => u.id === editingId);
      updateUser({ ...existingUser, ...form });
      toast.success(`${form.name} updated successfully!`);
    } else {
      const emp = availableEmployees.find(e => e.name === form.name) || { email: `${form.name.toLowerCase().replace(" ", ".")}@timepro.com` };
      addUser({
        name: form.name,
        email: emp.email,
        role: form.role,
        avatar: null,
        joinDate: new Date().toISOString().split("T")[0],
        department: "General",
        status: "active"
      });
      toast.success(`${form.name} added successfully!`);
    }
    setOpen(false);
    setEditingId(null);
    setForm({ name: "", role: "employee" });
  };

  const handleEdit = (user) => {
    setForm({
      name: user.name,
      role: user.role,
    });
    setEditingId(user.id);
    setOpen(true);
  };

  const handleRemoveUser = (user) => {
    if (window.confirm(`Are you sure you want to remove ${user.name}?`)) {
      removeUser(user.id);
      toast.success(`${user.name} removed successfully`);
    }
  };

  const handleToggleStatus = (user) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    updateUserStatus(user.id, newStatus);
    toast.success(`${user.name} ${newStatus === "active" ? "activated" : "deactivated"}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Manrope, sans-serif" }}>User Management</h2>
          <p className="text-slate-500 text-sm mt-0.5">{allUsers.length} registered users across all departments.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-slate-900 hover:bg-slate-800 active:scale-95 transition-all" data-testid="add-user-btn" onClick={() => { setEditingId(null); setForm({ name: "", role: "employee" }); }}>
              <Plus className="w-4 h-4 mr-2" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[440px] p-8 rounded-2xl border-none shadow-2xl">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-xl font-bold text-slate-900" style={{ fontFamily: "Manrope, sans-serif" }}>
                {editingId ? "Edit User" : "Add New User"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Select Employee *</Label>
                <Select value={form.name} onValueChange={(v) => setForm({ ...form, name: v })}>
                  <SelectTrigger className="h-12 border-slate-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-slate-400 transition-all">
                    <SelectValue placeholder="Choose an employee" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    {availableEmployees.map(emp => (
                      <SelectItem key={emp.name} value={emp.name} className="py-2.5 rounded-lg focus:bg-slate-50">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">{emp.name}</span>
                          <span className="text-xs text-slate-500">{emp.email}</span>
                        </div>
                      </SelectItem>
                    ))}
                    {editingId && !availableEmployees.find(e => e.name === form.name) && (
                      <SelectItem value={form.name} className="py-2.5 rounded-lg focus:bg-slate-50">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">{form.name}</span>
                          <span className="text-xs text-slate-500">{allUsers.find(u => u.name === form.name)?.email}</span>
                        </div>
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Role</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                  <SelectTrigger className="h-12 border-slate-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-slate-400 transition-all">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    <SelectItem value="employee" className="py-2.5 rounded-lg focus:bg-slate-50">Employee</SelectItem>
                    <SelectItem value="manager" className="py-2.5 rounded-lg focus:bg-slate-50">Manager</SelectItem>
                    <SelectItem value="admin" className="py-2.5 rounded-lg focus:bg-slate-50">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 h-12 text-sm font-bold border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all"
                  onClick={() => { setOpen(false); setEditingId(null); }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 h-12 text-sm font-bold bg-[#828691] hover:bg-[#717580] text-white rounded-xl shadow-lg shadow-slate-200 transition-all"
                  onClick={handleAddUser}
                  data-testid="add-user-submit-btn"
                >
                  {editingId ? "Save Changes" : "Add User"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: counts.all, icon: Users, color: "bg-indigo-100 text-indigo-600" },
          { label: "Active", value: counts.active, icon: UserCheck, color: "bg-emerald-100 text-emerald-600" },
          { label: "Inactive", value: counts.inactive, icon: UserX, color: "bg-slate-100 text-slate-600" },
          { label: "Managers", value: counts.manager + counts.admin, icon: Users, color: "bg-violet-100 text-violet-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="bg-white border border-slate-200 shadow-none">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">{label}</p>
                <p className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Manrope, sans-serif" }}>{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input className="pl-9" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} data-testid="user-search-input" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40" data-testid="role-filter-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="employee">Employee</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card className="bg-white border border-slate-200 shadow-none">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="users-table">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase">User</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Email</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Role</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase hidden lg:table-cell">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => {
                  const roleCfg = roleConfig[user.role] || roleConfig.employee;
                  return (
                    <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors" data-testid={`user-row-${user.id}`}>
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-9 h-9">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="bg-indigo-100 text-indigo-700 text-sm font-bold">{user.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                              {user.name}
                              <button
                                onClick={() => handleEdit(user)}
                                className="text-slate-400 hover:text-indigo-600 transition-colors"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleRemoveUser(user)}
                                className="text-slate-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-500 hidden md:table-cell">{user.email}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={cn("text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize", roleCfg.class)}>{roleCfg.label}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={cn("text-xs font-semibold px-2.5 py-0.5 rounded-full", user.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500")}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-500 hidden lg:table-cell">{user.joinDate}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No users found matching your search.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div >
  );
}
