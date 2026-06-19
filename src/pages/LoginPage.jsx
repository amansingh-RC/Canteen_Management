import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { AlertCircle, Loader2, LogIn } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { siteConfig } from "@/config/site";
import { firstPathForRole } from "@/config/navigation";
import { IDLE_FLAG_KEY } from "@/config/auth";

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [idleNotice] = useState(() => sessionStorage.getItem(IDLE_FLAG_KEY) === "1");

  // Already signed in → bounce to the role's home page.
  if (user) return <Navigate to={firstPathForRole(user.role)} replace />;

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const authedUser = await login(form);
      const target = location.state?.from || firstPathForRole(authedUser.role);
      navigate(target, { replace: true });
    } catch (err) {
      setError(err.message || "Unable to sign in");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="grid size-12 place-items-center rounded-xl from-primary to-success text-white">
            <img
            src="https://royalchaingroup.com/wp-content/uploads/2025/09/favicon.png"
            alt="Logo"
            className="h-10"
          />
          </div>
          <h1 className="text-lg font-semibold">{siteConfig.name}</h1>
          <p className="text-sm text-muted-foreground">{siteConfig.subtitle}</p>
        </div>

        <Card>
          <CardContent className="p-6">
            {idleNotice && !error && (
              <Notice tone="warning">You were signed out due to inactivity.</Notice>
            )}
            {error && <Notice tone="danger">{error}</Notice>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="you@royalchains.com"
                  value={form.email}
                  onChange={setField("email")}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={setField("password")}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-[#d4a24e] hover:bg-[#a87b2c]" disabled={submitting}>
                {submitting ? <Loader2 className="animate-spin" /> : <LogIn />}
                {submitting ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Notice({ tone, children }) {
  const tones = {
    danger: "bg-danger-soft text-danger",
    warning: "bg-warning-soft text-warning",
  };
  return (
    <div className={`mb-4 flex items-start gap-2 rounded-md px-3 py-2 text-sm ${tones[tone]}`}>
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

