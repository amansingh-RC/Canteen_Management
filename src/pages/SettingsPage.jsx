import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataState } from "@/components/shared/DataState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAsyncData } from "@/hooks/useAsyncData";
import { getSystemSettings, saveSettings } from "@/services/settingsService";

export default function SettingsPage() {
  const { data, loading, error, refetch } = useAsyncData(getSystemSettings, []);
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
        actions={<Button className="bg-[#d4a24e] hover:bg-[#a87b2c]" size="sm" onClick={handleSave} disabled={saving || !form}>{saving ? "Saving…" : "Save changes"}</Button>}
      />

      <DataState loading={loading} error={error} onRetry={refetch}>
        {form && (
          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-1">
              <CouponFormatCard format={form.couponFormat} onChange={(v) => patch("couponFormat", v)} />
            </div>
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
