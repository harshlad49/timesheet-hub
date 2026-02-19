import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users, FolderKanban, Clock, CheckCircle, AlertTriangle,
  TrendingUp, ArrowRight, Plus, XCircle
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";
import { monthlyData, employeeHoursData } from "@/data/mockData";

const statusColors = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  completed: "bg-slate-50 text-slate-700 ring-slate-600/20",
  "on-hold": "bg-amber-50 text-amber-700 ring-amber-600/20",
};

const tsStatusColors = {
  submitted: "bg-amber-50 text-amber-700",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
  draft: "bg-slate-100 text-slate-600",
};

function StatCard({ title, value, icon: Icon, color, sub, testId }) {
  return (
    <Card className="bg-white border border-slate-200 shadow-none hover:shadow-md hover:border-slate-300 transition-all duration-200" data-testid={testId}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1" style={{ fontFamily: "Manrope, sans-serif" }}>{value}</p>
            {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmployeeDashboard({ user, timesheets, projects }) {
  const navigate = useNavigate();
  const myTimesheets = timesheets.filter((t) => t.userId === user.id);
  const myProjects = projects.filter((p) => p.memberIds.includes(user.id));
  const thisWeekTs = myTimesheets.find((t) => t.weekStart === "2025-02-17");
  const weekHours = thisWeekTs?.totalHours || 0;
  const submitted = myTimesheets.filter((t) => t.status === "submitted").length;
  const approved = myTimesheets.filter((t) => t.status === "approved").length;
  const rejected = myTimesheets.filter((t) => t.status === "rejected").length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Manrope, sans-serif" }}>
          Good morning, {user.name.split(" ")[0]}!
        </h2>
        <p className="text-slate-500 mt-1">Here's your timesheet overview for this week.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Hours This Week" value={`${weekHours}/40`} icon={Clock} color="bg-indigo-100 text-indigo-600" sub="Target: 40 hrs" testId="stat-hours-week" />
        <StatCard title="Pending Review" value={submitted} icon={AlertTriangle} color="bg-amber-100 text-amber-600" sub="Awaiting manager" testId="stat-pending" />
        <StatCard title="Approved" value={approved} icon={CheckCircle} color="bg-emerald-100 text-emerald-600" sub="This month" testId="stat-approved" />
        <StatCard title="My Projects" value={myProjects.length} icon={FolderKanban} color="bg-violet-100 text-violet-600" sub="Active assignments" testId="stat-projects" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Progress */}
        <Card className="bg-white border border-slate-200 shadow-none" data-testid="weekly-progress-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-900">This Week Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <div className="text-5xl font-bold text-indigo-600" style={{ fontFamily: "Manrope, sans-serif" }}>{weekHours}</div>
              <div className="text-slate-500 text-sm mt-1">of 40 hours logged</div>
            </div>
            <Progress value={(weekHours / 40) * 100} className="h-2" />
            <Button className="w-full" onClick={() => navigate("/timesheets")} data-testid="log-hours-btn">
              <Plus className="w-4 h-4 mr-2" /> Log Hours
            </Button>
          </CardContent>
        </Card>

        {/* Recent Timesheets */}
        <Card className="lg:col-span-2 bg-white border border-slate-200 shadow-none" data-testid="recent-timesheets-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold text-slate-900">Recent Timesheets</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/timesheets")} data-testid="view-all-timesheets-btn">
              View all <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myTimesheets.slice(0, 4).map((ts) => (
                <div key={ts.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Week of {new Date(ts.weekStart + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                    <p className="text-xs text-slate-500">{ts.totalHours} hours</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${tsStatusColors[ts.status]}`}>
                    {ts.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Projects */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4" style={{ fontFamily: "Manrope, sans-serif" }}>My Projects</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myProjects.map((p) => (
            <Card key={p.id} className="bg-white border border-slate-200 shadow-none hover:shadow-md transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: p.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-900 truncate">{p.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{p.client}</p>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Budget used</span>
                        <span>{Math.round((p.spent / p.budget) * 100)}%</span>
                      </div>
                      <Progress value={(p.spent / p.budget) * 100} className="h-1.5" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function ManagerDashboard({ user, timesheets, projects, allUsers }) {
  const navigate = useNavigate();
  const pending = timesheets.filter((t) => t.status === "submitted");
  const teamSize = allUsers.filter((u) => u.role === "employee").length;
  const activeProjects = projects.filter((p) => p.status === "active").length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Manrope, sans-serif" }}>
          Welcome, {user.name.split(" ")[0]}!
        </h2>
        <p className="text-slate-500 mt-1">You have {pending.length} timesheet{pending.length !== 1 ? "s" : ""} awaiting your review.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Pending Approvals" value={pending.length} icon={AlertTriangle} color="bg-amber-100 text-amber-600" sub="Needs review" testId="stat-pending-approvals" />
        <StatCard title="Team Members" value={teamSize} icon={Users} color="bg-indigo-100 text-indigo-600" sub="Active employees" testId="stat-team-size" />
        <StatCard title="Active Projects" value={activeProjects} icon={FolderKanban} color="bg-violet-100 text-violet-600" sub="In progress" testId="stat-active-projects" />
        <StatCard title="Hours This Month" value="640" icon={Clock} color="bg-emerald-100 text-emerald-600" sub="Team total" testId="stat-team-hours" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals List */}
        <Card className="bg-white border border-slate-200 shadow-none" data-testid="pending-approvals-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold text-slate-900">Pending Approvals</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/approvals")} data-testid="go-approvals-btn">
              View all <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {pending.length === 0 ? (
              <p className="text-slate-500 text-sm py-4 text-center">All caught up!</p>
            ) : (
              pending.map((ts) => {
                const emp = allUsers.find((u) => u.id === ts.userId);
                return (
                  <div key={ts.id} className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-100">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={emp?.avatar} />
                        <AvatarFallback className="bg-amber-200 text-amber-800 text-xs">{emp?.name?.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{emp?.name}</p>
                        <p className="text-xs text-slate-500">Week of {new Date(ts.weekStart + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {ts.totalHours}h</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => navigate("/approvals")} data-testid={`review-ts-${ts.id}`}>Review</Button>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Team Utilization Chart */}
        <Card className="bg-white border border-slate-200 shadow-none" data-testid="team-utilization-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-900">Team Hours This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={employeeHoursData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                <Bar dataKey="target" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="Target" />
                <Bar dataKey="hours" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AdminDashboard({ user, timesheets, projects, allUsers }) {
  const navigate = useNavigate();
  const activeUsers = allUsers.filter((u) => u.status === "active").length;
  const activeProjects = projects.filter((p) => p.status === "active").length;
  const pending = timesheets.filter((t) => t.status === "submitted").length;
  const totalHoursMonth = timesheets.reduce((sum, t) => sum + (t.totalHours || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Manrope, sans-serif" }}>
          Admin Dashboard
        </h2>
        <p className="text-slate-500 mt-1">System overview for {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={activeUsers} icon={Users} color="bg-indigo-100 text-indigo-600" sub={`${allUsers.length} registered`} testId="stat-total-users" />
        <StatCard title="Active Projects" value={activeProjects} icon={FolderKanban} color="bg-violet-100 text-violet-600" sub={`${projects.length} total`} testId="stat-admin-projects" />
        <StatCard title="Pending Approvals" value={pending} icon={AlertTriangle} color="bg-amber-100 text-amber-600" sub="Awaiting review" testId="stat-admin-pending" />
        <StatCard title="Hours Tracked" value={totalHoursMonth} icon={TrendingUp} color="bg-emerald-100 text-emerald-600" sub="This period" testId="stat-total-hours" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card className="bg-white border border-slate-200 shadow-none" data-testid="monthly-trend-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-900">Hours Trend (6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                <Area type="monotone" dataKey="hours" stroke="#4F46E5" fill="#eef2ff" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card className="bg-white border border-slate-200 shadow-none" data-testid="recent-users-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold text-slate-900">Users</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/users")} data-testid="go-users-btn">
              Manage <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {allUsers.slice(0, 5).map((u) => (
              <div key={u.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={u.avatar} />
                    <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-bold">{u.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{u.name}</p>
                    <p className="text-xs text-slate-500">{u.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${u.role === "admin" ? "bg-slate-100 text-slate-700" : u.role === "manager" ? "bg-violet-100 text-violet-700" : "bg-indigo-100 text-indigo-700"}`}>
                    {u.role}
                  </span>
                  {u.status === "inactive" && <XCircle className="w-3.5 h-3.5 text-red-400" />}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Project Status */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4" style={{ fontFamily: "Manrope, sans-serif" }}>Project Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <Card key={p.id} className="bg-white border border-slate-200 shadow-none hover:shadow-md transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                    <p className="font-semibold text-sm text-slate-900">{p.name}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ring-1 ring-inset inline-flex capitalize ${statusColors[p.status]}`}>
                    {p.status.replace("-", " ")}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">{p.client}</p>
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Budget: ${p.spent.toLocaleString()} / ${p.budget.toLocaleString()}</span>
                    <span>{Math.round((p.spent / p.budget) * 100)}%</span>
                  </div>
                  <Progress value={(p.spent / p.budget) * 100} className="h-1.5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { currentUser, timesheets, projects, allUsers } = useApp();
  if (!currentUser) return null;

  if (currentUser.role === "admin") return <AdminDashboard user={currentUser} timesheets={timesheets} projects={projects} allUsers={allUsers} />;
  if (currentUser.role === "manager") return <ManagerDashboard user={currentUser} timesheets={timesheets} projects={projects} allUsers={allUsers} />;
  return <EmployeeDashboard user={currentUser} timesheets={timesheets} projects={projects} />;
}
