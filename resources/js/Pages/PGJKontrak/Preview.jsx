import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Preview({ contract, pdfContent }) {
    const actions = (
        <>
            <Button asChild variant="outline"><Link href="/admin/pengajuan-kontrak"><ArrowLeft className="size-4" /> Back</Link></Button>
            <Button asChild variant="success"><a href={`/admin/pengajuan-kontrak/${contract.id}/pdf`}><Download className="size-4" /> Download PDF</a></Button>
        </>
    );

    return (
        <AdminLayout title="Preview Kontrak PDF" actions={actions}>
            <Head title="Preview Kontrak PDF" />
            <Card>
                <CardHeader>
                    <div className="flex items-start gap-3">
                        <div className="flex size-10 items-center justify-center rounded-md border bg-muted/45 text-primary">
                            <FileText className="size-5" />
                        </div>
                        <div>
                            <CardTitle>{contract.nama_pk_kda}</CardTitle>
                            <CardDescription>Preview dokumen kontrak sebelum diunduh atau dibagikan.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-hidden rounded-md border bg-muted/25 p-2">
                        <iframe title="Preview Kontrak PDF" src={`data:application/pdf;base64,${pdfContent}`} className="h-[80vh] w-full rounded-md border bg-card" />
                    </div>
                </CardContent>
            </Card>
        </AdminLayout>
    );
}
