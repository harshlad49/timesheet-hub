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
import { employeeHoursData, projectUtilizationData, monthlyData, teamContributionData, projectEmployeeMatrix } from "@/data/mockData";

const COLORS = ["#4F46E5", "#7C3AED", "#0891B2", "#059669", "#D97706", "#DC2626"];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
      <p className="font-semibold text-slate-900 text-sm">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm mt-0.5" style={{ color: p.color || p.fill }}>
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function ReportsPage() {
  const { allUsers, projects } = useApp();
  const [month, setMonth] = useState("2025-02");
  const [view, setView] = useState("detail"); // "detail" or "utilization"

  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState([
    { name: "Website Redesign", hours: 95, percent: 42, heads: 3 },
    { name: "Mobile App Dev", hours: 70, percent: 31, heads: 3 },
    { name: "Dashboard UI", hours: 60, percent: 27, heads: 3 },
  ]);

  const [reportType, setReportType] = useState("summary");
  const [selectedMonth, setSelectedMonth] = useState("February");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [filterContext, setFilterContext] = useState("all");

  const handleGeneratePreview = () => {
    setIsGenerating(true);
    // Simulate API call using all filter values
    console.log("Generating report with:", { reportType, selectedMonth, selectedYear, filterContext });

    setTimeout(() => {
      setIsGenerating(false);
      toast.success("Report preview generated successfully");
      // Randomize data slightly to show effect
      setReportData(prev => prev.map(item => ({
        ...item,
        hours: Math.floor(item.hours * (0.9 + Math.random() * 0.2)),
        percent: Math.floor(Math.random() * 100)
      })));
    }, 1500);
  };

  const handleDownload = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Preparing download...',
        success: 'Report downloaded successfully',
        error: 'Error downloading report',
      }
    );
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

      <Tabs defaultValue="detail" className="w-full" onValueChange={setView} value={view}>
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="detail">Report Detail</TabsTrigger>
          <TabsTrigger value="utilization">Project Utilization</TabsTrigger>
        </TabsList>

        <TabsContent value="detail" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Report Detail Configuration */}
            <Card className="bg-white border border-slate-200 shadow-none h-fit">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-900">Report Detail</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Report Type</label>
                  <div className="space-y-2">
                    <div
                      onClick={() => setReportType("summary")}
                      className={`flex items-center space-x-2 p-3 rounded-lg border transition-all cursor-pointer ${reportType === "summary"
                        ? "border-indigo-200 bg-indigo-50/50 ring-1 ring-indigo-200"
                        : "border-slate-200 hover:bg-slate-50"
                        }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-[5px] bg-white transition-colors ${reportType === "summary" ? "border-indigo-600" : "border-slate-300"
                        }`}></div>
                      <span className={`text-sm font-medium ${reportType === "summary" ? "text-indigo-900" : "text-slate-700"
                        }`}>Monthly Summary</span>
                    </div>

                    <div
                      onClick={() => setReportType("utilization")}
                      className={`flex items-center space-x-2 p-3 rounded-lg border transition-all cursor-pointer ${reportType === "utilization"
                        ? "border-indigo-200 bg-indigo-50/50 ring-1 ring-indigo-200"
                        : "border-slate-200 hover:bg-slate-50"
                        }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-[5px] bg-white transition-colors ${reportType === "utilization" ? "border-indigo-600" : "border-slate-300"
                        }`}></div>
                      <span className={`text-sm font-medium ${reportType === "utilization" ? "text-indigo-900" : "text-slate-700"
                        }`}>Project Utilization</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500">MONTH</label>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="January">January</SelectItem>
                        <SelectItem value="February">February</SelectItem>
                        <SelectItem value="March">March</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500">YEAR</label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2024">2024</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">FILTER CONTEXT</label>
                  <Select value={filterContext} onValueChange={setFilterContext}>
                    <SelectTrigger><SelectValue placeholder="All Projects" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      <SelectItem value="backend">Backend Team</SelectItem>
                      <SelectItem value="frontend">Frontend Team</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                  size="lg"
                  onClick={handleGeneratePreview}
                  disabled={isGenerating}
                >
                  {isGenerating ? "Generating..." : "Generate Preview"}
                </Button>
              </CardContent>
            </Card>

            {/* Report Preview */}
            <Card className="lg:col-span-2 bg-white border border-slate-200 shadow-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">Report Preview</CardTitle>
                  <p className="text-xs text-slate-400 mt-1">Generated on 2/19/2026</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                  onClick={handleDownload}
                >
                  <Download className="w-3.5 h-3.5 mr-2" /> .XLSX
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Project</th>
                        <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">Total Hours</th>
                        <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider w-48">% Total</th>
                        <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Headcount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {reportData.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-6 text-sm font-medium text-slate-900">{row.name}</td>
                          <td className="py-4 px-6 text-sm text-slate-600">{row.hours}</td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${row.percent}%` }} />
                              </div>
                              <span className="text-xs text-slate-500 font-medium">{row.percent}%</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm text-slate-600">{row.heads}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="utilization" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Hours Contribution Chart */}
            <Card className="bg-white border border-slate-200 shadow-none">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-900">Team Hours Contribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={teamContributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {teamContributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-slate-900">766h</span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Team Hours</span>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {teamContributionData.map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-sm text-slate-600 font-medium">{d.name} {Math.round(d.value / 100 * 100)}%</span> {/* Value is basically % in this mock */}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Project vs Employee Hours Chart */}
            <Card className="bg-white border border-slate-200 shadow-none">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-900">Project vs Employee Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={projectEmployeeMatrix}
                      margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                      barSize={20}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }} width={120} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px" }} />
                      <Bar dataKey="alex" name="Alex Chen" stackId="a" fill="#4F46E5" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="jamie" name="Jamie Smith" stackId="a" fill="#7C3AED" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="taylor" name="Taylor Kim" stackId="a" fill="#0891B2" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="casey" name="Casey Brown" stackId="a" fill="#D97706" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="jordan" name="Jordan Lee" stackId="a" fill="#059669" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
