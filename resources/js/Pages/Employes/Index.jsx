import { Head, Link, router, useForm } from "@inertiajs/react";
import { Download, Edit, Filter, Plus, Search, Trash2 } from "lucide-react";
import { DataTable, Pagination } from "@/Components/DataTable";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card";
import { Input, NativeSelect } from "@/Components/ui/input";
import AdminLayout from "@/Layouts/AdminLayout";
import { asset } from "@/lib/utils";

export default function Index({ employes, filters, clients, positions }) {
  const { data, setData, get } = useForm({
    search: filters.search || "",
    client_id: filters.client_id || "",
    posisi: filters.posisi || "",
  });

  function submit(e) {
    e.preventDefault();
    get("/admin/employes", { preserveState: true });
  }

  const columns = [
    {
      key: "img",
      label: "Foto",
      render: (row) => (
        <img
          src={
            "https://absensi-sac.sac-po.com/storage/user/" + row.img ||
            "https://placehold.co/400x400/png"
          }
          className="size-10 rounded-full border object-cover"
        />
      ),
    },
    {
      key: "name",
      label: "Nama Karyawan",
      render: (row) => (
        <span className="font-medium text-foreground">{row.name}</span>
      ),
    },
    {
      key: "posisi",
      label: "Posisi",
      render: (row) => (
        <Badge
          variant={
            row.posisi === "Data NotFound In Absensi" ? "danger" : "secondary"
          }
        >
          {row.posisi}
        </Badge>
      ),
    },
    { key: "ttl", label: "Tempat Tanggal Lahir" },
    { key: "no_kk", label: "No. KK" },
    { key: "no_ktp", label: "No. KTP" },
    { key: "client", label: "Mitra" },
    { key: "no_bpjs_kesehatan", label: "BPJS Kesehatan" },
    { key: "no_bpjs_ketenaga", label: "BPJS Ketenaga" },
    { key: "no_induk", label: "No Induk Karyawan" },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/admin/employes/${row.id}/edit`}>
              <Edit className="size-4" />
              <span className="sr-only">Edit</span>
            </Link>
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() =>
              confirm("Hapus data?") &&
              router.delete(`/admin/employes/${row.id}`)
            }
          >
            <Trash2 className="size-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      ),
    },
  ];

  const actions = (
    <>
      <Button asChild variant="outline">
        <a href={`/admin/employes/pdf?${new URLSearchParams(data)}`}>
          <Download className="size-4" /> Download PDF
        </a>
      </Button>
      <Button asChild>
        <Link href="/admin/employes/create">
          <Plus className="size-4" /> Create
        </Link>
      </Button>
    </>
  );

  return (
    <AdminLayout title="Employes" actions={actions}>
      <Head title="Employes" />
      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="flex size-9 items-center justify-center rounded-md border bg-muted/45 text-primary">
              <Filter className="size-4" />
            </div>
            <div>
              <CardTitle>Filter data karyawan</CardTitle>
              <CardDescription>
                Cari berdasarkan nama, mitra, atau posisi.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={submit}
            className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_auto]"
          >
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search..."
                value={data.search}
                onChange={(e) => setData("search", e.target.value)}
              />
            </div>
            <NativeSelect
              value={data.client_id}
              onChange={(e) => setData("client_id", e.target.value)}
            >
              <option value="">Semua Mitra</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </NativeSelect>
            <NativeSelect
              value={data.posisi}
              onChange={(e) => setData("posisi", e.target.value)}
            >
              <option value="">Semua Posisi</option>
              <option value="not_in_absensi">
                Data Tidak Ditemukan di Absensi
              </option>
              {positions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </NativeSelect>
            <Button>Filter</Button>
          </form>
        </CardContent>
      </Card>
      <DataTable columns={columns} rows={employes.data} />
      <Pagination links={employes.links} />
    </AdminLayout>
  );
}
