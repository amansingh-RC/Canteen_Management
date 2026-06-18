import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
// import { FilterSelect } from "@/components/shared/FilterSelect";
import { DataState } from "@/components/shared/DataState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Switch } from "@/components/ui/switch";
import { useAsyncData } from "@/hooks/useAsyncData";
import { getSystemSettings, saveSettings } from "@/services/settingsService";

export default function SettingsPage() {
  const { data, loading, error, refetch } = useAsyncData(getSystemSettings, []);
  // Editable copy, synced from loaded data during render (no effect needed).
  const [form, setForm] = useState(null);
  const [syncedFrom, setSyncedFrom] = useState(null);
  const [saving, setSaving] = useState(false);

  if (data && data !== syncedFrom) {
    setSyncedFrom(data);
    setForm(data);
  }

  const patch = (section, values) =>
    setForm((prev) => ({ ...prev, [section]: { ...prev[section], ...values } }));

  const handleSave = async () => {
    setSaving(true);
    await saveSettings(form);
    setSaving(false);
  };

  return (
    <>
      <PageHeader
        title="System Settings"
        description="Coupon format "
        actions={<Button size="sm" onClick={handleSave} disabled={saving || !form}>{saving ? "Saving…" : "Save changes"}</Button>}
      />

      <DataState loading={loading} error={error} onRetry={refetch}>
        {form && (
          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-1">
              <CouponFormatCard format={form.couponFormat} onChange={(v) => patch("couponFormat", v)} />
              {/* <FaceRecognitionCard config={form.faceRecognition} onChange={(v) => patch("faceRecognition", v)} /> */}
            </div>
            {/* <div className="grid gap-4 lg:grid-cols-2">
              <NotificationsCard config={form.notifications} onChange={(v) => patch("notifications", v)} />
              <RoleAccessCard roles={form.roleAccess} />
            </div> */}
          </div>
        )}
      </DataState>
    </>
  );
}

function CouponFormatCard({ format, onChange }) {
  const fields = [
    { key: "breakfastPrefix", label: "Breakfast Prefix" },
    { key: "lunchPrefix", label: "Lunch Prefix" },
    { key: "snackPrefix", label: "Evening Snack Prefix" },
    { key: "dinnerPrefix", label: "Dinner Prefix" },
  ];
  const preview = `${format.breakfastPrefix}20230001 · ${format.lunchPrefix}20230001 · ${format.snackPrefix}20230001 · ${format.dinnerPrefix}20230001`;

  return (
    <Card>
      <CardHeader><CardTitle>Coupon Format Configuration</CardTitle></CardHeader>
      <CardContent className="grid grid-cols-2 gap-3.5">
        {fields.map((f) => (
          <div key={f.key} className="flex flex-col gap-1">
            <Label>{f.label}</Label>
            <Input value={format[f.key]} onChange={(e) => onChange({ [f.key]: e.target.value })} />
          </div>
        ))}
        <div className="col-span-2 flex flex-col gap-1">
          <Label>Preview</Label>
          <div className="text-sm text-muted-foreground">{preview}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// function FaceRecognitionCard({ config, onChange }) {
//   return (
//     <Card>
//       <CardHeader><CardTitle>Face Recognition</CardTitle></CardHeader>
//       <CardContent className="space-y-4">
//         <div className="flex flex-col gap-2">
//           <Label>Confidence Threshold — <b>{config.confidenceThreshold}%</b></Label>
//           <input
//             type="range"
//             min="50"
//             max="99"
//             value={config.confidenceThreshold}
//             onChange={(e) => onChange({ confidenceThreshold: Number(e.target.value) })}
//             className="w-full accent-primary"
//           />
//         </div>
//         <FilterSelect
//           label="Retry Limit"
//           className="w-full"
//           value={`${config.retryLimit} retries`}
//           onChange={(v) => onChange({ retryLimit: Number(v.split(" ")[0]) })}
//           options={config.retryOptions.map((n) => `${n} retries`)}
//         />
//       </CardContent>
//     </Card>
//   );
// }

// function NotificationsCard({ config, onChange }) {
//   const toggles = [
//     { key: "smsAlerts", label: "SMS Alerts" },
//     { key: "emailAlerts", label: "Email Alerts" },
//   ];
//   return (
//     <Card>
//       <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
//       <CardContent className="divide-y">
//         {toggles.map((t) => (
//           <div key={t.key} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
//             <span>{t.label}</span>
//             <Switch checked={config[t.key]} onCheckedChange={(val) => onChange({ [t.key]: val })} />
//           </div>
//         ))}
//       </CardContent>
//     </Card>
//   );
// }

// function RoleAccessCard({ roles }) {
//   return (
//     <Card>
//       <CardHeader><CardTitle>Role-Based Access Control</CardTitle></CardHeader>
//       <CardContent className="divide-y">
//         {roles.map((r) => (
//           <div key={r.role} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
//             <b>{r.role}</b>
//             <span className="text-muted-foreground">{r.access}</span>
//           </div>
//         ))}
//       </CardContent>
//     </Card>
//   );
// }
