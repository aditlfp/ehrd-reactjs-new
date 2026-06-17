import { Head, useForm } from '@inertiajs/react';
import { Lock, Mail, ShieldCheck } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import { FieldError, Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        login: '',
        password: '',
        remember: false,
    });

    function submit(e) {
        e.preventDefault();
        post('/login');
    }

    return (
        <>
            <Head title="Login" />
            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <Card className="w-full max-w-4xl overflow-hidden md:grid md:grid-cols-[0.92fr_1.08fr]">
                    <div className="hidden border-r bg-muted/35 p-8 md:flex md:flex-col md:justify-between">
                        <div>
                            <div className="mb-6 flex size-10 items-center justify-center rounded-md border bg-card text-sm font-bold text-primary">
                                HR
                            </div>
                            <h1 className="text-2xl font-semibold tracking-tight">MY HRD Online</h1>
                            <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                Ruang kerja admin untuk data karyawan, kontrak, dan konfirmasi user.
                            </p>
                        </div>
                        <div className="rounded-md border bg-card p-4">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <ShieldCheck className="size-4 text-primary" />
                                Secure admin access
                            </div>
                            <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                Gunakan akun yang sudah terdaftar untuk melanjutkan pengelolaan HRD.
                            </p>
                        </div>
                    </div>
                    <CardContent className="p-6 sm:p-8 lg:p-10">
                        <CardHeader className="px-0 pb-7 pt-0">
                            <CardTitle className="text-2xl">Login Admin</CardTitle>
                            <CardDescription>Masuk menggunakan name atau email.</CardDescription>
                        </CardHeader>
                        <form onSubmit={submit} className="space-y-5">
                            <div className="space-y-2">
                                <Label>Name / Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                                    <Input className="pl-9" value={data.login} onChange={(e) => setData('login', e.target.value)} autoFocus aria-invalid={Boolean(errors.login)} />
                                </div>
                                <FieldError message={errors.login} />
                            </div>
                            <div className="space-y-2">
                                <Label>Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                                    <Input className="pl-9" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} aria-invalid={Boolean(errors.password)} />
                                </div>
                                <FieldError message={errors.password} />
                            </div>
                            <label className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Checkbox checked={data.remember} onCheckedChange={(checked) => setData('remember', Boolean(checked))} />
                                Remember me
                            </label>
                            <Button className="w-full" disabled={processing}>{processing ? 'Checking...' : 'Login'}</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
