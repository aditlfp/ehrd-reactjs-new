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

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md border bg-card px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-foreground">{label}</p>
      <p className="mt-1 text-muted-foreground">
        <span className="font-semibold text-primary">{payload[0].value}</span>{" "}
        employe dibuat
      </p>
    </div>
  );
}

export default function Dashboard({ stats, chart }) {
  const cards = [
    [
      "Employes",
      stats.employes,
      UserGroup,
      "success",
      "Active employee records",
    ],
    ["Kontrak", stats.contracts, FileWarning, "info", "Contract submissions"],
    [
      "Pending Confirmation",
      stats.pendingTempUsers,
      Fingerprint,
      "warning",
      "Waiting verification",
    ],
    ["Users", stats.users, Users, "primary", "Admin accounts"],
  ];
  const totalCreated = chart.reduce((total, item) => total + item.count, 0);
  const peak = chart.reduce(
    (best, item) => (item.count > best.count ? item : best),
    chart[0] || { month: "-", count: 0 },
  );
  const latest = [...chart].reverse().find((item) => item.count > 0) || {
    month: "-",
    count: 0,
  };

  return (
    <AdminLayout title="Dashboard">
      <Head title="Dashboard" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, Icon, variant, description]) => (
          <Card key={label}>
            <CardContent className="flex items-start justify-between gap-4 pt-5">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {label}
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight">
                  {value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {description}
                </p>
              </div>
              <Badge variant={variant} className="size-10 p-0">
                <Icon className="size-4" />
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-md border bg-amber-500/10 text-amber-700">
              <Fingerprint className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">
                Karyawan Yang Membutuhkan Konfirmasi
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Review data user/karyawan yang masih menunggu approval.
              </p>
            </div>
          </div>
          <div className="rounded-md border bg-muted/35 px-4 py-3 text-right">
            <p className="text-2xl font-semibold tracking-tight">
              {stats.pendingTempUsers}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex size-10 items-center justify-center rounded-md border bg-primary/10 text-primary">
                <TrendingUp className="size-5" />
              </div>
              <div>
                <CardTitle>Employe Created Count</CardTitle>
                <CardDescription>
                  Jumlah employe baru per bulan pada tahun berjalan.
                </CardDescription>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center sm:min-w-80">
              <div className="rounded-md border bg-muted/35 px-3 py-2">
                <p className="text-lg font-semibold">{totalCreated}</p>
                <p className="text-[11px] text-muted-foreground">Total</p>
              </div>
              <div className="rounded-md border bg-muted/35 px-3 py-2">
                <p className="text-lg font-semibold">{peak.count}</p>
                <p className="text-[11px] text-muted-foreground">
                  Peak {peak.month}
                </p>
              </div>
              <div className="rounded-md border bg-muted/35 px-3 py-2">
                <p className="text-lg font-semibold">{latest.count}</p>
                <p className="text-[11px] text-muted-foreground">
                  Latest {latest.month}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border bg-muted/20 p-3">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chart}
                  margin={{ top: 16, right: 18, left: -10, bottom: 4 }}
                >
                  <CartesianGrid
                    stroke="var(--border)"
                    strokeDasharray="4 4"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="currentColor"
                    className="text-xs text-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                    dy={8}
                  />
                  <YAxis
                    allowDecimals={false}
                    stroke="currentColor"
                    className="text-xs text-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                    width={34}
                  />
                  <Tooltip
                    content={<ChartTooltip />}
                    cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="var(--primary)"
                    strokeWidth={2.5}
                    dot={{
                      r: 4,
                      strokeWidth: 2,
                      fill: "var(--card)",
                      stroke: "var(--primary)",
                    }}
                    activeDot={{ r: 6, strokeWidth: 2, fill: "var(--primary)" }}
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
