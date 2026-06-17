import { Head, Link, router, useForm } from '@inertiajs/react';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import { DataTable, Pagination } from '@/Components/DataTable';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import AdminLayout from '@/Layouts/AdminLayout';
import { asset } from '@/lib/utils';

export default function Index({ users, filters }) {
    const { data, setData, get } = useForm({ search: filters.search || '' });

    const columns = [
        { key: 'avatar', label: 'Avatar', render: (row) => <img src={asset(row.avatar) || 'https://placehold.co/400x400/png'} className="size-10 rounded-full border object-cover" /> },
        { key: 'name', label: 'Name', render: (row) => <span className="font-medium text-foreground">{row.name}</span> },
        { key: 'email', label: 'Email' },
        { key: 'roles', label: 'Roles', render: (row) => <div className="flex flex-wrap gap-1">{row.roles.map((role) => <Badge key={role} variant={role === 'super_admin' ? 'success' : 'primary'}>{role}</Badge>)}</div> },
        { key: 'actions', label: 'Actions', render: (row) => <div className="flex gap-2"><Button asChild size="sm" variant="outline"><Link href={`/admin/users/${row.id}/edit`}><Edit className="size-4" /><span className="sr-only">Edit</span></Link></Button><Button size="sm" variant="destructive" onClick={() => confirm('Hapus user?') && router.delete(`/admin/users/${row.id}`)}><Trash2 className="size-4" /><span className="sr-only">Delete</span></Button></div> },
    ];

    return (
        <AdminLayout title="Users" actions={<Button asChild><Link href="/admin/users/create"><Plus className="size-4" /> Create</Link></Button>}>
            <Head title="Users" />
            <Card>
                <CardHeader>
                    <CardTitle>Filter user</CardTitle>
                    <CardDescription>Cari user berdasarkan nama atau email.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={(e) => { e.preventDefault(); get('/admin/users', { preserveState: true }); }} className="grid gap-3 sm:grid-cols-[1fr_auto]">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                            <Input className="pl-9" placeholder="Search name/email..." value={data.search} onChange={(e) => setData('search', e.target.value)} />
                        </div>
                        <Button>Filter</Button>
                    </form>
                </CardContent>
            </Card>
            <DataTable columns={columns} rows={users.data} />
            <Pagination links={users.links} />
        </AdminLayout>
    );
}
