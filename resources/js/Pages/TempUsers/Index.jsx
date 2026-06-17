import { Head, router, useForm } from '@inertiajs/react';
import { CheckCircle, Search, Trash2 } from 'lucide-react';
import { DataTable, Pagination } from '@/Components/DataTable';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Index({ tempUsers, filters }) {
    const { data, setData, get } = useForm({ search: filters.search || '' });
    const columns = [
        { key: 'image', label: 'Foto Profile', render: (row) => <img src={row.image || 'https://placehold.co/400x400/png'} className="size-10 rounded-full border object-cover" /> },
        { key: 'nama_lengkap', label: 'Nama Lengkap', render: (row) => <span className="font-medium text-foreground">{row.nama_lengkap}</span> },
        { key: 'pw', label: 'Password' },
        { key: 'no_hp', label: 'No HP ( Aktif )' },
        { key: 'email', label: 'Email' },
        { key: 'created_at', label: 'Tanggal Input' },
        { key: 'status', label: 'Status', render: (row) => <Badge variant={row.status ? 'success' : 'warning'}>{row.status ? 'Approve' : 'Pending'}</Badge> },
        { key: 'actions', label: 'Actions', render: (row) => <div className="flex gap-2">{!row.status && <Button size="sm" variant="success" onClick={() => confirm('Verifikasi user?') && router.post(`/admin/temp-users/${row.id}/verify`)}><CheckCircle className="size-4" /><span className="sr-only">Verify</span></Button>}<Button size="sm" variant="destructive" onClick={() => confirm('Hapus user?') && router.delete(`/admin/temp-users/${row.id}`)}><Trash2 className="size-4" /><span className="sr-only">Delete</span></Button></div> },
    ];

    return (
        <AdminLayout title="User Confirmation">
            <Head title="User Confirmation" />
            <Card>
                <CardHeader>
                    <CardTitle>Filter request user</CardTitle>
                    <CardDescription>Review akun yang menunggu persetujuan.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={(e) => { e.preventDefault(); get('/admin/temp-users', { preserveState: true }); }} className="grid gap-3 sm:grid-cols-[1fr_auto]">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                            <Input className="pl-9" placeholder="Search..." value={data.search} onChange={(e) => setData('search', e.target.value)} />
                        </div>
                        <Button>Filter</Button>
                    </form>
                </CardContent>
            </Card>
            <DataTable columns={columns} rows={tempUsers.data} />
            <Pagination links={tempUsers.links} />
        </AdminLayout>
    );
}
