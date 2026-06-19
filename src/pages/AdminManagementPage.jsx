import { useState } from "react";
import { UserPlus, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataState } from "@/components/shared/DataState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAsyncData } from "@/hooks/useAsyncData";
import { listAdmins, addAdmin } from "@/services/authService";
import { ALL_ROLES, ROLES } from "@/config/auth";

const EMPTY_FORM = { name: "", email: "", password: "", role: ROLES.OPERATOR };
const ROLE_VARIANT = { [ROLES.ADMIN]: "info", [ROLES.OPERATOR]: "warning" };

export default function AdminManagementPage() {
  const { data: admins, loading, error, refetch } = useAsyncData(listAdmins, []);
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message }
  const [submitting, setSubmitting] = useState(false);

  const setField = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setSubmitting(true);
    try {
      const created = await addAdmin(form);
      setStatus({ type: "success", message: `${created.name} added as ${created.role}.` });
      setForm(EMPTY_FORM);
      refetch();
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Could not add admin" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Admin Management"
        description="Create admin accounts and assign access roles"
      />

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        {/* Add admin */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Add Admin</CardTitle>
          </CardHeader>
          <CardContent>
            {status && (
              <div
                className={`mb-4 flex items-start gap-2 rounded-md px-3 py-2 text-sm ${
                  status.type === "success" ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
                }`}
              >
                {status.type === "success" ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                ) : (
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                )}
                <span>{status.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <Field label="Full Name" id="name">
                <Input id="name" value={form.name} onChange={(e) => setField("name")(e.target.value)} placeholder="e.g. Priya Nair" required />
              </Field>
              <Field label="Email" id="email">
                <Input id="email" type="email" value={form.email} onChange={(e) => setField("email")(e.target.value)} placeholder="name@royalchains.com" required />
              </Field>
              <Field label="Password" id="password">
                <Input id="password" type="password" value={form.password} onChange={(e) => setField("password")(e.target.value)} placeholder="Set a password" minLength={6} required />
              </Field>
              <Field label="Role" id="role">
                <Select value={form.role} onValueChange={setField("role")}>
                  <SelectTrigger id="role"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ALL_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Button type="submit" className="w-full bg-[#d4a24e] hover:bg-[#a87b2c]" disabled={submitting}>
                {submitting ? <Loader2 className="animate-spin" /> : <UserPlus />}
                Add Admin
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Existing admins */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Admin Accounts</CardTitle>
            <Badge variant="secondary">{admins?.length ?? 0} total</Badge>
          </CardHeader>
          <DataState loading={loading} error={error} onRetry={refetch}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins?.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-semibold">{admin.id}</TableCell>
                    <TableCell>{admin.name}</TableCell>
                    <TableCell className="text-muted-foreground">{admin.email}</TableCell>
                    <TableCell>
                      <Badge variant={ROLE_VARIANT[admin.role] ?? "secondary"}>{admin.role}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DataState>
        </Card>
      </div>
    </>
  );
}

function Field({ label, id, children }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}
