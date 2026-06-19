import { Head, useForm } from '@inertiajs/react';
import { Save, ShieldCheck } from 'lucide-react';
import { FormField, TextField } from '@/Components/FormField';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Form({ userModel, roles }) {
    const editing = Boolean(userModel);
    const { data, setData, post, processing, errors } = useForm({
        name: userModel?.name || '', email: userModel?.email || '', password: '', avatar: null, roles: userModel?.roles || [], email_verified_at: userModel?.email_verified_at || '', _method: editing ? 'put' : 'post',
    });

    function submit(e) {
        e.preventDefault();
        post(editing ? `/admin/users/${userModel.id}` : '/admin/users', { forceFormData: true });
    }

    return (
        <AdminLayout title={editing ? 'Edit User' : 'Create User'}>
            <Head title={editing ? 'Edit User' : 'Create User'} />
            <form onSubmit={submit} className="space-y-5">
                <Card>
                    <CardHeader>
                        <div className="flex items-start gap-3">
                            <div className="flex size-9 items-center justify-center rounded-md border bg-muted/45 text-primary"><ShieldCheck className="size-4" /></div>
                            <div>
                                <CardTitle>Data user</CardTitle>
                                <CardDescription>Atur identitas, avatar, dan akses role.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-5 md:grid-cols-2">
                        <TextField label="Name" required placeholder="Masukkan name" error={errors.name} value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        <TextField label="Email" required placeholder="Masukkan email" type="email" error={errors.email} value={data.email} onChange={(e) => setData('email', e.target.value)} />
                        <TextField label="Password" required={!editing} type="password" error={errors.password} value={data.password} onChange={(e) => setData('password', e.target.value)} placeholder={editing ? 'Kosongkan jika tidak diganti' : ''} description={editing ? 'Isi hanya jika ingin mengganti password.' : undefined} />
                        <TextField label="Email Verified At" placeholder="Pilih tanggal verifikasi email" type="datetime-local" error={errors.email_verified_at} value={data.email_verified_at || ''} onChange={(e) => setData('email_verified_at', e.target.value)} />
                        <FormField label="Avatar" error={errors.avatar} description="Gunakan gambar profil yang jelas."><Input type="file" onChange={(e) => setData('avatar', e.target.files[0])} /></FormField>
                        <div className="space-y-2">
                            <Label>Roles</Label>
                            <div className="flex flex-wrap gap-2">{roles.map((role) => <label key={role} className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm transition-colors hover:bg-accent"><Checkbox checked={data.roles.includes(role)} onCheckedChange={(checked) => setData('roles', checked ? [...data.roles, role] : data.roles.filter((v) => v !== role))} />{role}</label>)}</div>
                        </div>
                    </CardContent>
                </Card>
                <div className="flex justify-end"><Button disabled={processing}><Save className="size-4" /> Save</Button></div>
            </form>
        </AdminLayout>
    );
}
