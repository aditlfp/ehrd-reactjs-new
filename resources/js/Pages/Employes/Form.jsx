import { Head, useForm } from '@inertiajs/react';
import { FileText, Save, UserRound } from 'lucide-react';
import { useEffect } from 'react';
import { FormField, SelectField, TextField, TextareaField } from '@/Components/FormField';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Form({ employe, clients }) {
    const editing = Boolean(employe);
    const { data, setData, post, processing, errors } = useForm({
        name: employe?.name || '', ttl: employe?.ttl || '', no_kk: employe?.no_kk || '', no_ktp: employe?.no_ktp || '', client_id: employe?.client_id || '', initials: employe?.initials || '', numbers: employe?.numbers || '', date_real: employe?.date_real || '', img: null, img_ktp_dpn: null, no_bpjs_kesehatan: employe?.no_bpjs_kesehatan || '', file_bpjs_kesehatan: null, no_bpjs_ketenaga: employe?.no_bpjs_ketenaga || '', file_bpjs_ketenaga: null, jenis_bpjs: employe?.jenis_bpjs || [], alamat: employe?.alamat || '', _method: editing ? 'put' : 'post',
    });

    useEffect(() => {
        if (!data.client_id || editing) return;
        fetch(`/admin/employes/client-meta?client_id=${data.client_id}`).then((r) => r.json()).then((meta) => {
            setData((values) => ({ ...values, initials: meta.initials, numbers: meta.numbers }));
        });
    }, [data.client_id]);

    function submit(e) {
        e.preventDefault();
        post(editing ? `/admin/employes/${employe.id}` : '/admin/employes', { forceFormData: true });
    }

    const bpjs = ['jkk', 'jkm', 'jht', 'jp', 'jkp'];

    return (
        <AdminLayout title={editing ? 'Edit Employe' : 'Create Employe'}>
            <Head title={editing ? 'Edit Employe' : 'Create Employe'} />
            <form onSubmit={submit} className="space-y-5">
                <Card>
                    <CardHeader>
                        <div className="flex items-start gap-3">
                            <div className="flex size-9 items-center justify-center rounded-md border bg-muted/45 text-primary"><UserRound className="size-4" /></div>
                            <div>
                                <CardTitle>Data karyawan</CardTitle>
                                <CardDescription>Lengkapi identitas utama dan relasi mitra.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-5 md:grid-cols-3">
                        <TextField label="Masukkan Nama" required placeholder="Masukkan nama" error={errors.name} value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        <TextField label="Tempat Tanggal Lahir" placeholder="Contoh: Jakarta, 01 Januari 1990" error={errors.ttl} value={data.ttl} onChange={(e) => setData('ttl', e.target.value)} className="md:col-span-2" />
                        <TextField label="Masukkan No KK" required placeholder="Masukkan nomor KK" error={errors.no_kk} value={data.no_kk} onChange={(e) => setData('no_kk', e.target.value)} />
                        <TextField label="Masukkan No KTP" required placeholder="Masukkan nomor KTP" error={errors.no_ktp} value={data.no_ktp} onChange={(e) => setData('no_ktp', e.target.value)} />
                        <SelectField label="Pilih Mitra" required error={errors.client_id} value={data.client_id} onChange={(e) => setData('client_id', e.target.value)}><option value="">Pilih Mitra</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</SelectField>
                        <TextField label="Inisial" required placeholder="Terisi otomatis" error={errors.initials} value={data.initials} readOnly onChange={(e) => setData('initials', e.target.value)} description={!editing ? 'Terisi otomatis dari mitra.' : undefined} />
                        <TextField label="Nomor Urut" required placeholder="Terisi otomatis" error={errors.numbers} value={data.numbers} readOnly onChange={(e) => setData('numbers', e.target.value)} description={!editing ? 'Terisi otomatis dari mitra.' : undefined} />
                        <TextField label="Tanggal Masuk" required placeholder="Pilih tanggal masuk" type="date" error={errors.date_real} value={data.date_real} onChange={(e) => setData('date_real', e.target.value)} />
                        <TextareaField label="Alamat" placeholder="Masukkan alamat lengkap" error={errors.alamat} value={data.alamat} onChange={(e) => setData('alamat', e.target.value)} className="md:col-span-3" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-start gap-3">
                            <div className="flex size-9 items-center justify-center rounded-md border bg-muted/45 text-primary"><FileText className="size-4" /></div>
                            <div>
                                <CardTitle>Dokumen dan BPJS</CardTitle>
                                <CardDescription>Upload dokumen pendukung dan pilih jenis BPJS.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-5 md:grid-cols-2">
                        <FormField label="Foto KTP (Depan)" error={errors.img_ktp_dpn}><Input type="file" onChange={(e) => setData('img_ktp_dpn', e.target.files[0])} /></FormField>
                        <FormField label="Foto Profile" error={errors.img}><Input type="file" onChange={(e) => setData('img', e.target.files[0])} /></FormField>
                        <TextField label="No BPJS Kesehatan" placeholder="Masukkan nomor BPJS Kesehatan" error={errors.no_bpjs_kesehatan} value={data.no_bpjs_kesehatan} onChange={(e) => setData('no_bpjs_kesehatan', e.target.value)} />
                        <FormField label="File BPJS Kesehatan" error={errors.file_bpjs_kesehatan}><Input type="file" accept="application/pdf" onChange={(e) => setData('file_bpjs_kesehatan', e.target.files[0])} /></FormField>
                        <TextField label="No BPJS Ketenaga Kerjaan" placeholder="Masukkan nomor BPJS Ketenagakerjaan" error={errors.no_bpjs_ketenaga} value={data.no_bpjs_ketenaga} onChange={(e) => setData('no_bpjs_ketenaga', e.target.value)} />
                        <FormField label="File BPJS Ketenaga Kerjaan" error={errors.file_bpjs_ketenaga}><Input type="file" accept="application/pdf" onChange={(e) => setData('file_bpjs_ketenaga', e.target.files[0])} /></FormField>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Jenis BPJS</Label>
                            <div className="flex flex-wrap gap-2">{bpjs.map((item) => <label key={item} className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm transition-colors hover:bg-accent"><Checkbox checked={data.jenis_bpjs.includes(item)} onCheckedChange={(checked) => setData('jenis_bpjs', checked ? [...data.jenis_bpjs, item] : data.jenis_bpjs.filter((v) => v !== item))} />{item.toUpperCase()}</label>)}</div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end"><Button disabled={processing}><Save className="size-4" /> Save</Button></div>
            </form>
        </AdminLayout>
    );
}
