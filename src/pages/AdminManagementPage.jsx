import { useState } from "react";
import { toast } from "sonner";
import { UserPlus, Loader2, Trash2 } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useAuth } from "@/auth/AuthProvider";
import { listAdmins, addAdmin, deleteAdmin } from "@/services/authService";
import { ALL_ROLES, ROLES } from "@/config/auth";

const EMPTY_FORM = { name: "", email: "", password: "", role: ROLES.OPERATOR };
const ROLE_VARIANT = { [ROLES.ADMIN]: "info", [ROLES.OPERATOR]: "warning" };

export default function AdminManagementPage() {
  const { user } = useAuth();
  const { data: admins, loading, error, refetch } = useAsyncData(listAdmins, []);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const setField = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const handleDelete = async (admin) => {
    const promise = deleteAdmin(admin.id);
    toast.promise(promise, {
      loading: `Removing ${admin.name}…`,
      success: `${admin.name} removed.`,
      error: (err) => err.message || "Could not remove admin",
    });
    try {
      await promise;
      refetch();
    } catch {
      /* error surfaced via toast */
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const promise = addAdmin(form);
    toast.promise(promise, {
      loading: "Adding admin…",
      success: (created) => `${created.name} added as ${created.role}.`,
      error: (err) => err.message || "Could not add admin",
    });
    try {
      await promise;
      setForm(EMPTY_FORM);
      refetch();
    } catch {
      /* error surfaced via toast */
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
                  <TableHead className="text-right">Actions</TableHead>
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
                    <TableCell className="text-right">
                      {admin.id === user?.id ? (
                        <span className="text-xs text-muted-foreground">You</span>
                      ) : (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-danger hover:bg-danger-soft hover:text-danger"
                              aria-label={`Delete ${admin.name}`}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove admin?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This permanently removes <b>{admin.name}</b> ({admin.email}) and revokes their access. This can&apos;t be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleDelete(admin)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
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
