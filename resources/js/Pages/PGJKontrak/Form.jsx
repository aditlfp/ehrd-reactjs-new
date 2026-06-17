import { Head, useForm } from '@inertiajs/react';
import { BriefcaseBusiness, FileText, Save, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SelectField, TextField } from '@/Components/FormField';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Form({ contract, clients, jabatans, people, nextNoSurat }) {
    const editing = Boolean(contract);
    const [peopleOptions, setPeopleOptions] = useState(people || []);
    const { data, setData, post, processing, errors } = useForm({
        mitra_id: '',
        no_srt: contract?.no_srt || nextNoSurat,
        tgl_dibuat: contract?.tgl_dibuat || '',
        nama_pk_ptm: contract?.nama_pk_ptm || '',
        alamat_pk_ptm: contract?.alamat_pk_ptm || '',
        jabatan_pk_ptm: contract?.jabatan_pk_ptm || '',
        nama_pk_kda: contract?.nama_pk_kda || '',
        tempat_lahir_pk_kda: contract?.tempat_lahir_pk_kda || '',
        tgl_lahir_pk_kda: contract?.tgl_lahir_pk_kda || '',
        nik_pk_kda: contract?.nik_pk_kda || '',
        alamat_pk_kda: contract?.alamat_pk_kda || '',
        jabatan_pk_kda: contract?.jabatan_pk_kda || '',
        status_pk_kda: contract?.status_pk_kda || '',
        unit_pk_kda: contract?.unit_pk_kda || '',
        tgl_mulai_kontrak: contract?.tgl_mulai_kontrak || '',
        tgl_selesai_kontrak: contract?.tgl_selesai_kontrak || '',
        g_pok: contract?.g_pok || '',
        tj_hadir: contract?.tj_hadir || '',
        kinerja: contract?.kinerja || '',
        lain_lain: contract?.lain_lain || '',
        _method: editing ? 'put' : 'post',
    });

    useEffect(() => {
        if (!data.nama_pk_kda) return;
        fetch(`/admin/pengajuan-kontrak/options?name=${encodeURIComponent(data.nama_pk_kda)}`)
            .then((r) => r.json())
            .then((res) => res.detail && setData((values) => ({ ...values, ...res.detail })));
    }, [data.nama_pk_kda]);

    function submit(e) {
        e.preventDefault();
        post(editing ? `/admin/pengajuan-kontrak/${contract.id}` : '/admin/pengajuan-kontrak');
    }

    return (
        <AdminLayout title={editing ? 'Edit Pengajuan Kontrak' : 'Create Pengajuan Kontrak'}>
            <Head title={editing ? 'Edit Pengajuan Kontrak' : 'Create Pengajuan Kontrak'} />
            <form onSubmit={submit} className="space-y-5">
                <Card>
                    <CardHeader>
                        <div className="flex items-start gap-3">
                            <div className="flex size-9 items-center justify-center rounded-md border bg-muted/45 text-primary"><BriefcaseBusiness className="size-4" /></div>
                            <div>
                                <CardTitle>Filter mitra</CardTitle>
                                <CardDescription>Pilih mitra untuk membantu proses pengisian kontrak.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <SelectField label="Pilih Mitra" value={data.mitra_id} onChange={(e) => setData('mitra_id', e.target.value)}>
                            <option value="">Semua Mitra</option>
                            {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
                        </SelectField>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-start gap-3">
                            <div className="flex size-9 items-center justify-center rounded-md border bg-muted/45 text-primary"><FileText className="size-4" /></div>
                            <div>
                                <CardTitle>Section surat</CardTitle>
                                <CardDescription>Nomor surat, pihak pertama, dan periode kontrak.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-5 md:grid-cols-2">
                        <TextField label="Masukkan No Surat" error={errors.no_srt} value={data.no_srt} onChange={(e) => setData('no_srt', e.target.value)} />
                        <TextField label="Tanggal Surat Dibuat/disepakati" type="date" error={errors.tgl_dibuat} value={data.tgl_dibuat} onChange={(e) => setData('tgl_dibuat', e.target.value)} />
                        <TextField label="Nama Pihak Pertama" error={errors.nama_pk_ptm} value={data.nama_pk_ptm} onChange={(e) => setData('nama_pk_ptm', e.target.value)} />
                        <TextField label="Jabatan Pihak Pertama" error={errors.jabatan_pk_ptm} value={data.jabatan_pk_ptm} onChange={(e) => setData('jabatan_pk_ptm', e.target.value)} />
                        <TextField label="Alamat Pihak Pertama" error={errors.alamat_pk_ptm} value={data.alamat_pk_ptm} onChange={(e) => setData('alamat_pk_ptm', e.target.value)} className="md:col-span-2" />
                        <TextField label="Tanggal Mulai Kontrak" type="date" error={errors.tgl_mulai_kontrak} value={data.tgl_mulai_kontrak} onChange={(e) => setData('tgl_mulai_kontrak', e.target.value)} />
                        <TextField label="Tanggal Selesai Kontrak" type="date" error={errors.tgl_selesai_kontrak} value={data.tgl_selesai_kontrak} onChange={(e) => setData('tgl_selesai_kontrak', e.target.value)} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-start gap-3">
                            <div className="flex size-9 items-center justify-center rounded-md border bg-muted/45 text-primary"><UserRound className="size-4" /></div>
                            <div>
                                <CardTitle>Pihak kedua</CardTitle>
                                <CardDescription>Data karyawan akan terisi otomatis setelah nama dipilih.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-5 md:grid-cols-2">
                        <SelectField label="Nama Pihak Kedua" error={errors.nama_pk_kda} value={data.nama_pk_kda} onChange={(e) => setData('nama_pk_kda', e.target.value)}>
                            <option value="">Pilih Pihak Kedua</option>
                            {peopleOptions.map((person) => <option key={person} value={person}>{person}</option>)}
                        </SelectField>
                        <TextField label="Tempat Lahir" error={errors.tempat_lahir_pk_kda} value={data.tempat_lahir_pk_kda} onChange={(e) => setData('tempat_lahir_pk_kda', e.target.value)} />
                        <TextField label="Tanggal Lahir" type="date" error={errors.tgl_lahir_pk_kda} value={data.tgl_lahir_pk_kda} onChange={(e) => setData('tgl_lahir_pk_kda', e.target.value)} />
                        <TextField label="NIK" error={errors.nik_pk_kda} value={data.nik_pk_kda} onChange={(e) => setData('nik_pk_kda', e.target.value)} />
                        <TextField label="Alamat" error={errors.alamat_pk_kda} value={data.alamat_pk_kda} onChange={(e) => setData('alamat_pk_kda', e.target.value)} className="md:col-span-2" />
                        <SelectField label="Jabatan" error={errors.jabatan_pk_kda} value={data.jabatan_pk_kda} onChange={(e) => setData('jabatan_pk_kda', e.target.value)}>
                            <option value="">Pilih Jabatan</option>
                            {jabatans.map((jabatan) => <option key={jabatan} value={jabatan}>{jabatan}</option>)}
                        </SelectField>
                        <SelectField label="Status" error={errors.status_pk_kda} value={data.status_pk_kda} onChange={(e) => setData('status_pk_kda', e.target.value)}>
                            <option value="">Pilih Status</option>
                            <option value="Karyawan Kontrak">Karyawan Kontrak</option>
                            <option value="Karyawan Tetap">Karyawan Tetap</option>
                        </SelectField>
                        <TextField label="Unit Kerja" error={errors.unit_pk_kda} value={data.unit_pk_kda} onChange={(e) => setData('unit_pk_kda', e.target.value)} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Gaji dan tunjangan</CardTitle>
                        <CardDescription>Masukkan nominal komponen upah sesuai kontrak.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-5 md:grid-cols-4">
                        <TextField label="Gaji Pokok" type="number" error={errors.g_pok} value={data.g_pok} onChange={(e) => setData('g_pok', e.target.value)} />
                        <TextField label="Tunjangan Kehadiran" type="number" error={errors.tj_hadir} value={data.tj_hadir} onChange={(e) => setData('tj_hadir', e.target.value)} />
                        <TextField label="Kinerja" type="number" error={errors.kinerja} value={data.kinerja} onChange={(e) => setData('kinerja', e.target.value)} />
                        <TextField label="Lain Lain" type="number" error={errors.lain_lain} value={data.lain_lain} onChange={(e) => setData('lain_lain', e.target.value)} />
                    </CardContent>
                </Card>

                <div className="flex justify-end"><Button disabled={processing}><Save className="size-4" /> Save</Button></div>
            </form>
        </AdminLayout>
    );
}
