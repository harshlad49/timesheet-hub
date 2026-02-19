import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area,
} from "recharts";
import { employeeHoursData, projectUtilizationData, monthlyData } from "@/data/mockData";

const COLORS = ["#4F46E5", "#7C3AED", "#0891B2", "#059669", "#D97706", "#DC2626"];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
      <p className="font-semibold text-slate-900 text-sm">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm mt-0.5" style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function ReportsPage() {
  const { allUsers, projects } = useApp();
  const [month, setMonth] = useState("2025-02");

  const handleExport = (type) => {
    toast.success(`${type} report exported successfully!`);
  };

  const projectPieData = projects.slice(0, 5).map((p, i) => ({
    name: p.name,
    value: Math.floor(Math.random() * 300) + 100,
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Manrope, sans-serif" }}>Reports & Analytics</h2>
          <p className="text-slate-500 text-sm mt-0.5">Insights into time utilization across teams and projects.</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-36" data-testid="month-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025-02">Feb 2025</SelectItem>
              <SelectItem value="2025-01">Jan 2025</SelectItem>
              <SelectItem value="2024-12">Dec 2024</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => handleExport("Excel")}
            className="bg-slate-900 hover:bg-slate-800 active:scale-95 transition-all"
            data-testid="export-excel-btn"
          >
            <Download className="w-4 h-4 mr-2" /> Export Excel
          </Button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Hours", value: "766", sub: "Feb 2025", color: "text-indigo-600" },
          { label: "Team Utilization", value: "87%", sub: "vs 85% last month", color: "text-emerald-600" },
          { label: "Avg Daily Hours", value: "7.9", sub: "Per employee", color: "text-violet-600" },
          { label: "Active Projects", value: "3", sub: "Contributing hours", color: "text-amber-600" },
        ].map((s) => (
          <Card key={s.label} className="bg-white border border-slate-200 shadow-none">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 uppercase font-medium tracking-wider">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.color}`} style={{ fontFamily: "Manrope, sans-serif" }}>{s.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="employee">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="employee" data-testid="report-tab-employee">Employee Report</TabsTrigger>
          <TabsTrigger value="project" data-testid="report-tab-project">Project Utilization</TabsTrigger>
          <TabsTrigger value="monthly" data-testid="report-tab-monthly">Monthly Trend</TabsTrigger>
        </TabsList>

        {/* Employee Report */}
        <TabsContent value="employee" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white border border-slate-200 shadow-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold">Hours by Employee</CardTitle>
                <Button variant="outline" size="sm" onClick={() => handleExport("Employee")} data-testid="export-employee-btn">
                  <Download className="w-3.5 h-3.5 mr-1" /> Export
                </Button>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={employeeHoursData} barGap={4} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#94a3b8" }} width={60} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                    <Bar dataKey="target" fill="#e2e8f0" radius={[0, 4, 4, 0]} name="Target" />
                    <Bar dataKey="hours" fill="#4F46E5" radius={[0, 4, 4, 0]} name="Actual" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Employee table */}
            <Card className="bg-white border border-slate-200 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Employee Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm" data-testid="employee-report-table">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase">Employee</th>
                      <th className="text-center py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase">Hours</th>
                      <th className="text-center py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase">Target</th>
                      <th className="text-center py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employeeHoursData.map((emp, i) => {
                      const rate = Math.round((emp.hours / emp.target) * 100);
                      return (
                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-medium text-slate-900">{emp.name}</td>
                          <td className="py-3 px-3 text-center font-bold text-indigo-700">{emp.hours}h</td>
                          <td className="py-3 px-3 text-center text-slate-500">{emp.target}h</td>
                          <td className="py-3 px-3 text-center">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${rate >= 100 ? "bg-emerald-50 text-emerald-700" : rate >= 80 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>
                              {rate}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Project Utilization */}
        <TabsContent value="project" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white border border-slate-200 shadow-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold">Hours by Project</CardTitle>
                <Button variant="outline" size="sm" onClick={() => handleExport("Project")} data-testid="export-project-btn">
                  <Download className="w-3.5 h-3.5 mr-1" /> Export
                </Button>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={projectPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name.split(" ")[0]} ${Math.round(percent * 100)}%`}
                      labelLine={false}
                    >
                      {projectPieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-200 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Project Hours vs Budget</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={projectUtilizationData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                    <Bar dataKey="budget" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="Budget Hrs" />
                    <Bar dataKey="hours" fill="#7C3AED" radius={[4, 4, 0, 0]} name="Actual Hrs" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Monthly Trend */}
        <TabsContent value="monthly" className="mt-6">
          <Card className="bg-white border border-slate-200 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">6-Month Hours Trend</CardTitle>
              <Button variant="outline" size="sm" onClick={() => handleExport("Monthly")} data-testid="export-monthly-btn">
                <Download className="w-3.5 h-3.5 mr-1" /> Export
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} domain={[400, 700]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="hours" stroke="#4F46E5" strokeWidth={2.5} fill="url(#colorHours)" name="Total Hours" dot={{ r: 4, fill: "#4F46E5" }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
