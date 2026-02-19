import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { users } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Timer, Mail, Lock, ChevronRight } from "lucide-react";

const roleColors = {
  employee: "bg-indigo-600",
  manager: "bg-violet-600",
  admin: "bg-slate-900",
};

export default function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("mike@timepro.com");
  const [password, setPassword] = useState("••••••••");
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = (userId) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    setLoading(true);
    setTimeout(() => {
      login(userId);
      toast.success(`Welcome back, ${user.name}!`);
      navigate("/dashboard");
      setLoading(false);
    }, 600);
  };

  const handleEmailLogin = (e) => {
    e.preventDefault();
    const user = users.find((u) => u.email === email);
    if (user) {
      handleDemoLogin(user.id);
    } else {
      toast.error("No account found with that email");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Geometric pattern */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/15 rounded-full translate-y-1/2 -translate-x-1/4" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 border border-indigo-600/20 rounded-full -translate-y-1/2" />
          <div className="absolute top-1/3 right-1/4 w-32 h-32 border border-indigo-600/10 rounded-full" />
          {/* Grid lines */}
          <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Timer className="w-5 h-5 text-white" />
          </div>
          <span className="text-white text-2xl font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>TimePro</span>
        </div>

        {/* Tagline */}
        <div className="relative space-y-6">
          <h1 className="text-white text-4xl font-bold leading-tight" style={{ fontFamily: "Manrope, sans-serif" }}>
            Track Time.<br />
            <span className="text-indigo-400">Drive Results.</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            The smart timesheet platform for modern teams — log hours, manage approvals, and unlock insights effortlessly.
          </p>
          <div className="flex gap-8 pt-4">
            {[["500+", "Teams"], ["2M+", "Hours Tracked"], ["99.9%", "Uptime"]].map(([val, label]) => (
              <div key={label}>
                <p className="text-white text-2xl font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>{val}</p>
                <p className="text-slate-500 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-slate-600 text-sm">
          © 2025 TimePro. All rights reserved.
        </p>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Timer className="w-4 h-4 text-white" />
            </div>
            <span className="text-slate-900 text-xl font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>TimePro</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-slate-900" style={{ fontFamily: "Manrope, sans-serif" }}>Sign in</h2>
            <p className="mt-2 text-slate-500">Welcome back! Enter your credentials to continue.</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleEmailLogin} className="space-y-5" data-testid="login-form">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  placeholder="you@company.com"
                  data-testid="email-input"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  placeholder="••••••••"
                  data-testid="password-input"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 active:scale-95 transition-all"
              disabled={loading}
              data-testid="login-submit-btn"
            >
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-slate-500">Or try a demo role</span>
            </div>
          </div>

          {/* Demo role buttons */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "u3", role: "Employee", email: "mike@timepro.com", color: "border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50" },
              { id: "u2", role: "Manager", email: "sarah@timepro.com", color: "border-violet-200 hover:border-violet-400 hover:bg-violet-50" },
              { id: "u1", role: "Admin", email: "alex@timepro.com", color: "border-slate-200 hover:border-slate-400 hover:bg-slate-50" },
            ].map((demo) => (
              <button
                key={demo.id}
                onClick={() => handleDemoLogin(demo.id)}
                className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 active:scale-95 ${demo.color}`}
                data-testid={`demo-login-${demo.role.toLowerCase()}`}
              >
                <span className="text-sm font-semibold text-slate-900">{demo.role}</span>
                <span className="text-xs text-slate-400 mt-0.5 hidden sm:block truncate w-full text-center">{demo.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
