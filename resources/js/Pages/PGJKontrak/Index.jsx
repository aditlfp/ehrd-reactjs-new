import { Head, Link, router, useForm } from '@inertiajs/react';
import { Download, Edit, Eye, Filter, Plus, RotateCcw, Search, Send, Trash2 } from 'lucide-react';
import { DataTable, Pagination } from '@/Components/DataTable';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input, NativeSelect } from '@/Components/ui/input';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Index({ contracts, filters, filterOptions }) {
    const { data, setData, get } = useForm({
        search: filters.search || '',
        status_pk_kda: filters.status_pk_kda || '',
        jabatan_pk_kda: filters.jabatan_pk_kda || '',
        unit_pk_kda: filters.unit_pk_kda || '',
        kontrak_habis: filters.kontrak_habis || '',
        trashed: filters.trashed || '',
    });

    const columns = [
        { key: 'no_srt', label: 'No Surat', render: (row) => <span className="font-medium text-foreground">{row.no_srt}</span> },
        { key: 'nama_pk_kda', label: 'Nama Pihak Kedua', render: (row) => <span className={row.expired ? 'font-semibold text-destructive' : 'font-medium text-foreground'}>{row.nama_pk_kda}</span> },
        { key: 'nik_pk_kda', label: 'NIK' },
        { key: 'jabatan_pk_kda', label: 'Jabatan' },
        { key: 'unit_pk_kda', label: 'Unit Kerja' },
        { key: 'status_pk_kda', label: 'Status', render: (row) => <Badge variant="secondary">{row.status_pk_kda}</Badge> },
        { key: 'tgl_mulai_kontrak', label: 'Tanggal Kontrak', render: (row) => <Badge variant={row.expired ? 'danger' : 'success'}>{row.tgl_mulai_kontrak} - {row.tgl_selesai_kontrak}</Badge> },
        { key: 'ttd', label: 'TTD', render: (row) => <Badge variant={row.ttd ? 'success' : 'danger'}>{row.ttd_state}</Badge> },
        { key: 'send_to_operator', label: 'Sent', render: (row) => <Badge variant={row.send_to_operator ? 'success' : 'outline'}>{row.send_to_operator ? 'Sent' : 'Draft'}</Badge> },
        { key: 'actions', label: 'Actions', render: (row) => <div className="flex flex-wrap gap-2">{row.deleted_at ? <Button size="sm" variant="success" onClick={() => router.post(`/admin/pengajuan-kontrak/${row.id}/restore`)}><RotateCcw className="size-4" /><span className="sr-only">Restore</span></Button> : <><Button asChild size="sm" variant="outline"><Link href={`/admin/pengajuan-kontrak/${row.id}/edit`}><Edit className="size-4" /><span className="sr-only">Edit</span></Link></Button><Button asChild size="sm" variant="outline"><a href={`/admin/pengajuan-kontrak/${row.id}/pdf`}><Download className="size-4" /><span className="sr-only">PDF</span></a></Button><Button asChild size="sm" variant="info"><Link href={`/admin/pengajuan-kontrak/${row.id}/preview`}><Eye className="size-4" /><span className="sr-only">Preview</span></Link></Button>{!row.send_to_operator && <Button size="sm" variant="info" onClick={() => confirm('Send to operator?') && router.post(`/admin/pengajuan-kontrak/${row.id}/send-to-operator`)}><Send className="size-4" /><span className="sr-only">Send</span></Button>}<Button size="sm" variant="destructive" onClick={() => confirm('Hapus data?') && router.delete(`/admin/pengajuan-kontrak/${row.id}`)}><Trash2 className="size-4" /><span className="sr-only">Delete</span></Button></>}</div> },
    ];

    return (
        <AdminLayout title="Pengajuan Kontrak" actions={<Button asChild><Link href="/admin/pengajuan-kontrak/create"><Plus className="size-4" /> Create</Link></Button>}>
            <Head title="Pengajuan Kontrak" />
            <Card>
                <CardHeader>
                    <div className="flex items-start gap-3">
                        <div className="flex size-9 items-center justify-center rounded-md border bg-muted/45 text-primary"><Filter className="size-4" /></div>
                        <div>
                            <CardTitle>Filter pengajuan</CardTitle>
                            <CardDescription>Kelola status kontrak, masa berlaku, dan dokumen terkirim.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={(e) => { e.preventDefault(); get('/admin/pengajuan-kontrak', { preserveState: true }); }} className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_auto]">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                            <Input className="pl-9" placeholder="Search..." value={data.search} onChange={(e) => setData('search', e.target.value)} />
                        </div>
                        <NativeSelect value={data.status_pk_kda} onChange={(e) => setData('status_pk_kda', e.target.value)}><option value="">Status</option>{filterOptions.statuses.map((x) => <option key={x} value={x}>{x}</option>)}</NativeSelect>
                        <NativeSelect value={data.jabatan_pk_kda} onChange={(e) => setData('jabatan_pk_kda', e.target.value)}><option value="">Jabatan</option>{filterOptions.jabatans.map((x) => <option key={x} value={x}>{x}</option>)}</NativeSelect>
                        <NativeSelect value={data.unit_pk_kda} onChange={(e) => setData('unit_pk_kda', e.target.value)}><option value="">Unit</option>{filterOptions.units.map((x) => <option key={x} value={x}>{x}</option>)}</NativeSelect>
                        <NativeSelect value={data.trashed} onChange={(e) => setData('trashed', e.target.value)}><option value="">Active</option><option value="with">With Trashed</option><option value="only">Only Trashed</option></NativeSelect>
                        <Button>Filter</Button>
                    </form>
                </CardContent>
            </Card>
            <DataTable columns={columns} rows={contracts.data} />
            <Pagination links={contracts.links} />
        </AdminLayout>
    );
}
