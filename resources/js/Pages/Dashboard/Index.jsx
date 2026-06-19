import { Head } from "@inertiajs/react";
import {
  FileWarning,
  Fingerprint,
  TrendingUp,
  UserRound as UserGroup,
  Users,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/Components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card";
import AdminLayout from "@/Layouts/AdminLayout";

/* ------------------------------------------------------------------ */
/* Chart tooltip                                                       */
/* ------------------------------------------------------------------ */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm shadow-sm shadow-black/5">
      <p className="font-medium text-stone-900">{label}</p>
      <p className="mt-0.5 text-xs text-stone-500">
        <span className="font-semibold text-orange-600">{payload[0].value}</span>{" "}
        employe dibuat
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Per-card metadata for coffee palette                                */
/* ------------------------------------------------------------------ */
const cardMeta = [
  {
    key: "Employes",
    valueKey: "employes",
    label: "Employes",
    Icon: UserGroup,
    desc: "Active employee records",
    iconBg: "bg-orange-50",
    iconText: "text-orange-700",
    iconBorder: "border-orange-200",
    accent: "from-orange-100 to-transparent",
  },
  {
    key: "Kontrak",
    valueKey: "contracts",
    label: "Kontrak",
    Icon: FileWarning,
    desc: "Contract submissions",
    iconBg: "bg-amber-50",
    iconText: "text-amber-700",
    iconBorder: "border-amber-200",
    accent: "from-amber-100 to-transparent",
  },
  {
    key: "Pending Confirmation",
    valueKey: "pendingTempUsers",
    label: "Pending Confirmation",
    Icon: Fingerprint,
    desc: "Waiting verification",
    iconBg: "bg-amber-50",
    iconText: "text-amber-700",
    iconBorder: "border-amber-200",
    accent: "from-amber-100/80 to-transparent",
  },
  {
    key: "Users",
    valueKey: "users",
    label: "Users",
    Icon: Users,
    desc: "Admin accounts",
    iconBg: "bg-stone-50",
    iconText: "text-stone-700",
    iconBorder: "border-stone-200",
    accent: "from-stone-100 to-transparent",
  },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function Dashboard({ stats, chart }) {
  const totalCreated = chart.reduce((sum, i) => sum + i.count, 0);
  const peak = chart.reduce(
    (best, i) => (i.count > best.count ? i : best),
    chart[0] || { month: "-", count: 0 },
  );
  const latest = [...chart].reverse().find(i => i.count > 0) || {
    month: "-",
    count: 0,
  };

  return (
    <AdminLayout title="Dashboard">
      <Head title="Dashboard" />

      {/* ── Stat cards ──────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cardMeta.map(({ key, valueKey, label, Icon, desc, iconBg, iconText, iconBorder, accent }) => (
          <Card key={key} className="relative overflow-hidden transition-shadow hover:shadow-md">
            {/* warm gradient bar */}
            <div className={`pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${accent}`} />

            <CardContent className="flex items-start justify-between gap-4 pt-5">
              <div>
                <p className="text-[13px] font-medium text-stone-500">{label}</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">
                  {stats[valueKey]}
                </p>
                <p className="mt-1 text-xs text-stone-400">{desc}</p>
              </div>

              <div className={`flex size-10 items-center justify-center rounded-md border ${iconBorder} ${iconBg} ${iconText}`}>
                <Icon className="size-4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Pending confirmation banner ─────────────────────────── */}
      <Card className="mt-4">
        <CardContent className="flex flex-col gap-4 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-700">
              <Fingerprint className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-800">
                Karyawan Yang Membutuhkan Konfirmasi
              </p>
              <p className="mt-0.5 text-sm text-stone-500">
                Review data user/karyawan yang masih menunggu approval.
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50/60 px-4 py-3 text-right">
            <p className="text-2xl font-semibold tracking-tight text-amber-700">
              {stats.pendingTempUsers}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Chart card ──────────────────────────────────────────── */}
      <Card className="mt-4">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-stone-50 text-stone-600">
                <TrendingUp className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-stone-900">
                  Employe Created Count
                </CardTitle>
                <CardDescription>
                  Jumlah employe baru per bulan pada tahun berjalan.
                </CardDescription>
              </div>
            </div>

            {/* summary pills */}
            <div className="grid grid-cols-3 gap-2 text-center sm:min-w-72">
              {[
                { val: totalCreated, lbl: "Total" },
                { val: peak.count, lbl: `Peak ${peak.month}` },
                { val: latest.count, lbl: `Latest ${latest.month}` },
              ].map(({ val, lbl }) => (
                <div key={lbl} className="rounded-lg border border-stone-200 bg-stone-50/60 px-3 py-2">
                  <p className="text-lg font-semibold text-stone-900">{val}</p>
                  <p className="text-[11px] text-stone-500">{lbl}</p>
                </div>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-3">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chart} margin={{ top: 16, right: 18, left: -10, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e7e5e4" />
                  <XAxis dataKey="month" stroke="#a8a29e" tickLine={false} axisLine={false} dy={8} fontSize={12} />
                  <YAxis allowDecimals={false} stroke="#a8a29e" tickLine={false} axisLine={false} width={34} fontSize={12} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#d6d3d1", strokeWidth: 1 }} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "#f59e0b" }}
                    activeDot={{ r: 6, strokeWidth: 2, fill: "#f59e0b" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
