import { Head, Link, router, useForm } from "@inertiajs/react";
import {
  ArrowLeft,
  Building2,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Download,
  Edit,
  Eye,
  Filter,
  Plus,
  RotateCcw,
  Search,
  Send,
  Trash2,
  XCircle,
} from "lucide-react";
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
import { Input } from "@/Components/ui/input";
import AdminLayout from "@/Layouts/AdminLayout";
import { asset } from "@/lib/utils";

export default function Index({
  users,
  contracts,
  clients = [],
  selectedClient,
  filters,
  filterOptions,
}) {
  const { data, setData, get } = useForm({
    search: filters.search || "",
    client_id: filters.client_id || "",
  });

  const openClient = (client) =>
    router.get(
      "/admin/pengajuan-kontrak",
      { client_id: client.id },
      { preserveState: true, replace: true },
    );
  const closeClient = () =>
    router.get("/admin/pengajuan-kontrak", {}, { preserveState: true, replace: true });
  const clientImage = (client) => asset(client?.logo);
  const ClientIcon = ({ client, size = "md" }) => {
    const src = clientImage(client);
    const className = size === "lg" ? "size-10" : "size-10";

    if (!src) {
      return (
        <div
          className={`${className} flex items-center justify-center rounded-md border bg-muted/45 text-primary`}
        >
          <Building2 className="size-5" />
        </div>
      );
    }

    return (
      <>
        <img
          src={src}
          alt={client?.name || "Client"}
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.nextElementSibling?.classList.remove("hidden");
          }}
          className={`${className} rounded-md border bg-muted object-cover`}
        />
        <ClientFallback />
      </>
    );
  };

  const ClientFallback = () => (
    <div className="hidden size-10 items-center justify-center rounded-md border bg-muted/45 text-primary">
      <Building2 className="size-5" />
    </div>
  );

  const columns = [
    {
      key: "nama_lengkap",
      label: "Nama Lengkap",
      render: (row) => (
        <span className="font-medium text-foreground">{row.nama_lengkap}</span>
      ),
    },
    { key: "mitra", label: "Mitra" },
    { key: "jabatan", label: "Jabatan" },
    {
      key: "masa_berlaku",
      label: "Masa Berlaku",
      render: (row) => (
        <Badge
          variant={row.expired ? "danger" : row.masa_berlaku ? "success" : "outline"}
          title={row.expired ? "Expired" : undefined}
        >
          {row.masa_berlaku ?? "-"}
        </Badge>
      ),
    },
    {
      key: "ttd",
      label: "TTD",
      render: (row) => (
        <Badge variant={row.ttd ? "success" : "danger"}>
          {row.ttd ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
          {row.ttd ? "Pihak 2" : "Belum TTD"}
        </Badge>
      ),
    },
    {
      key: "send_to_operator",
      label: "Sent Status",
      render: (row) => (
        <Badge variant={row.send_to_operator ? "success" : "danger"}>
          {row.send_to_operator ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
          {row.send_to_operator ? "Sent" : "Belum Sent"}
        </Badge>
      ),
    },
    {
      key: "status_pengajuan_kontrak",
      label: "Status Pengajuan Kontrak",
      render: (row) => (
        <Badge
          variant={row.expired ? "danger" : row.contract ? "secondary" : "outline"}
          title={row.expired ? "Expired" : undefined}
        >
          {row.expired ? "Kontrak Habis / expired" : row.status_pengajuan_kontrak}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => {
        const contract = row.contract;

        if (!contract) {
          return (
            <Button asChild size="sm" variant="outline">
              <Link href={`/admin/pengajuan-kontrak/create?u=${encodeURIComponent(row.create_token)}`}>
                <Plus className="size-4" />
                <span className="sr-only">Create</span>
              </Link>
            </Button>
          );
        }

        return (
          <div className="flex flex-wrap gap-2">
            {contract.deleted_at ? (
              <Button
                size="sm"
                variant="success"
                onClick={() =>
                  router.post(`/admin/pengajuan-kontrak/${contract.id}/restore`)
                }
              >
                <RotateCcw className="size-4" />
                <span className="sr-only">Restore</span>
              </Button>
            ) : (
              <>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/pengajuan-kontrak/${contract.id}/edit`}>
                    <Edit className="size-4" />
                    <span className="sr-only">Edit</span>
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <a href={`/admin/pengajuan-kontrak/${contract.id}/pdf`}>
                    <Download className="size-4" />
                    <span className="sr-only">PDF</span>
                  </a>
                </Button>
                <Button asChild size="sm" variant="info">
                  <Link href={`/admin/pengajuan-kontrak/${contract.id}/preview`}>
                    <Eye className="size-4" />
                    <span className="sr-only">Preview</span>
                  </Link>
                </Button>
                {!contract.send_to_operator && (
                  <Button
                    size="sm"
                    variant="info"
                    onClick={() =>
                      confirm("Send to operator?") &&
                      router.post(
                        `/admin/pengajuan-kontrak/${contract.id}/send-to-operator`,
                      )
                    }
                  >
                    <Send className="size-4" />
                    <span className="sr-only">Send</span>
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() =>
                    confirm("Hapus data?") &&
                    router.delete(`/admin/pengajuan-kontrak/${contract.id}`)
                  }
                >
                  <Trash2 className="size-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <AdminLayout
      title="Pengajuan Kontrak"
      actions={
        <Button asChild>
          <Link href="/admin/pengajuan-kontrak/create">
            <Plus className="size-4" /> Create
          </Link>
        </Button>
      }
    >
      <Head title="Pengajuan Kontrak" />
      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="flex size-9 items-center justify-center rounded-md border bg-muted/45 text-primary">
              <Filter className="size-4" />
            </div>
            <div>
              <CardTitle>Filter pengajuan</CardTitle>
              <CardDescription>
                Kelola status kontrak, masa berlaku, dan dokumen terkirim.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              get("/admin/pengajuan-kontrak", { preserveState: true, replace: true });
            }}
            className="grid gap-3 md:grid-cols-[1fr_auto]"
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
            <Button>Filter</Button>
          </form>
        </CardContent>
      </Card>
      {selectedClient ? (
        <div className="space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-fit"
            onClick={closeClient}
          >
            <ArrowLeft className="size-4" /> Back
          </Button>
          <Card className="overflow-hidden">
            <button
              type="button"
              onClick={closeClient}
              className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-muted/35"
            >
              <div className="flex items-center gap-3">
                <ClientIcon client={selectedClient} />
                <div>
                  <div className="flex items-center gap-2">
                    <ChevronDown className="size-4 text-muted-foreground" />
                    <h3 className="font-semibold text-foreground">
                      {selectedClient.name}
                    </h3>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Klik untuk kembali ke daftar mitra/client.
                  </p>
                </div>
              </div>
              <Badge variant="secondary">
                {selectedClient.pending_contracts_count ?? 0} pengajuan
              </Badge>
            </button>
          </Card>
          <DataTable
            columns={columns}
            rows={users?.data ?? []}
            rowClassName={(row) => row.expired ? "bg-destructive/10 hover:bg-destructive/15" : undefined}
          />
          <Pagination links={users?.links} />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {clients.length ? (
            clients.map((client) => (
              <Card key={client.id} className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => openClient(client)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-muted/35"
                >
                  <div className="flex items-center gap-3">
                    <ClientIcon client={client} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">
                          {client.name}
                        </h3>
                        {!!client.pending_contracts_count && (
                          <Badge
                            variant="danger"
                            className="rounded-full px-2 py-0.5 text-xs"
                          >
                            {client.pending_contracts_count}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Buka pengajuan kontrak client ini.
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </button>
              </Card>
            ))
          ) : (
            <Card className="md:col-span-2 xl:col-span-3">
              <CardContent className="flex h-40 items-center justify-center text-sm font-medium text-muted-foreground">
                Data client kosong.
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
