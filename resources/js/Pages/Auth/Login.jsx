import { Head, useForm } from '@inertiajs/react';
import { Coffee, Lock, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Checkbox } from '@/Components/ui/checkbox';
import { FieldError, Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import LogoTrans from '../../../../public/assets/myhrd-logo-transparent.png';

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
            <div className="relative min-h-screen overflow-hidden bg-[#f6efe4] px-4 py-8 text-[#382719] sm:px-6 lg:px-8">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(186,130,72,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(111,78,55,0.18),transparent_32%),linear-gradient(135deg,rgba(255,250,243,0.9),rgba(237,219,196,0.7))]" />
                <div className="pointer-events-none absolute -left-24 top-16 size-72 rounded-full bg-[#d9b58d]/30 blur-3xl" />
                <div className="pointer-events-none absolute -right-20 bottom-8 size-80 rounded-full bg-[#8c6239]/20 blur-3xl" />
                <div className="pointer-events-none absolute left-1/2 top-1/4 size-48 -translate-x-1/2 rounded-full bg-white/40 blur-3xl" />

                <main className="relative z-10 flex min-h-[calc(100vh-4rem)] items-center justify-center">
                    <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/55 shadow-[0_24px_80px_rgba(74,49,29,0.18)] backdrop-blur-xl md:grid-cols-[0.95fr_1.05fr]">
                        <section className="relative hidden min-h-[680px] overflow-hidden bg-gradient-to-br from-[#7b4f2c] via-[#9d744c] to-[#ddbd93] p-10 text-white md:flex md:flex-col md:justify-between">
                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.26),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(255,244,225,0.18),transparent_24%)]" />
                            <img
                                src={LogoTrans}
                                alt="MY HRD Logo"
                                className="pointer-events-none absolute -right-14 top-16 w-72 opacity-20 mix-blend-screen"
                            />
                            <div className="relative">
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/18 px-4 py-2 text-sm font-medium shadow-sm backdrop-blur-md">
                                    <Sparkles className="size-4" />
                                    HR workspace
                                </div>
                                <div className="mt-20 max-w-sm">
                                    <h1 className="text-4xl font-semibold leading-tight tracking-[-0.03em]">
                                        Kelola ritme kerja dengan tenang.
                                    </h1>
                                    <p className="mt-5 text-base leading-7 text-white/78">
                                        Akses admin MY HRD untuk data karyawan, kontrak, dan konfirmasi user dalam ruang kerja yang lebih nyaman.
                                    </p>
                                </div>
                            </div>

                            <div className="relative rounded-3xl border border-white/25 bg-white/16 p-5 shadow-2xl backdrop-blur-md">
                                <div className="flex items-start gap-4">
                                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/22">
                                        <ShieldCheck className="size-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/65">Secure access</p>
                                        <p className="mt-2 text-lg font-medium">Admin MY HRD</p>
                                        <p className="mt-2 text-sm leading-6 text-white/72">
                                            Masuk aman, fokus rapi, ditemani nuansa coffee calm.
                                        </p>
                                    </div>
                                    <Coffee className="ml-auto size-6 text-white/70" />
                                </div>
                            </div>
                        </section>

                        <section className="bg-[#fffaf2]/92 p-6 sm:p-9 lg:p-12">
                            <div className="mx-auto flex min-h-[600px] w-full max-w-md flex-col justify-center">
                                <div className="mb-9 flex items-center gap-3 md:hidden">
                                    <div className="flex size-12 items-center justify-center rounded-2xl border border-[#e9dac8] bg-white shadow-sm">
                                        <img src={LogoTrans} alt="MY HRD Logo" className="size-10 object-contain opacity-80" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-[#6f4e37]">MY HRD</p>
                                        <p className="text-xs text-[#8a715d]">Admin workspace</p>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-[#ead9c2] bg-[#f4e8d8] px-4 py-2 text-sm font-medium text-[#7b4f2c]">
                                        <Coffee className="size-4" />
                                        Welcome back
                                    </div>
                                    <h2 className="mt-6 text-3xl font-semibold tracking-[-0.03em] text-[#2f2118] sm:text-4xl">
                                        Masuk ke MY HRD
                                    </h2>
                                    <p className="mt-4 text-sm leading-6 text-[#7c6655]">
                                        Gunakan name atau email yang sudah terdaftar untuk melanjutkan pengelolaan HRD.
                                    </p>
                                </div>

                                <form onSubmit={submit} className="space-y-5">
                                    <div className="space-y-2.5">
                                        <Label className="text-sm font-medium text-[#4b3526]">Name / Email <span className="text-red-500">*</span></Label>
                                        <div className="relative">
                                            <span className="pointer-events-none absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-xl bg-[#f1e3d1] text-[#8a5d37]">
                                                <Mail className="size-4" />
                                            </span>
                                            <Input
                                                className="h-14 rounded-2xl border-[#ead9c2] bg-white/85 pl-14 text-[#332319] shadow-sm placeholder:text-[#b09a86] focus-visible:ring-[#9d744c]"
                                                value={data.login}
                                                placeholder="Masukkan name atau email"
                                                required
                                                onChange={(e) => setData('login', e.target.value)}
                                                autoFocus
                                                aria-invalid={Boolean(errors.login)}
                                            />
                                        </div>
                                        <FieldError message={errors.login} />
                                    </div>

                                    <div className="space-y-2.5">
                                        <Label className="text-sm font-medium text-[#4b3526]">Password <span className="text-red-500">*</span></Label>
                                        <div className="relative">
                                            <span className="pointer-events-none absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-xl bg-[#f1e3d1] text-[#8a5d37]">
                                                <Lock className="size-4" />
                                            </span>
                                            <Input
                                                className="h-14 rounded-2xl border-[#ead9c2] bg-white/85 pl-14 text-[#332319] shadow-sm placeholder:text-[#b09a86] focus-visible:ring-[#9d744c]"
                                                type="password"
                                                value={data.password}
                                                placeholder="Masukkan password"
                                                required
                                                onChange={(e) => setData('password', e.target.value)}
                                                aria-invalid={Boolean(errors.password)}
                                            />
                                        </div>
                                        <FieldError message={errors.password} />
                                    </div>

                                    <div className="flex items-center justify-between pt-1">
                                        <label className="flex items-center gap-3 text-sm text-[#705744]">
                                            <Checkbox
                                                checked={data.remember}
                                                onCheckedChange={(checked) => setData('remember', Boolean(checked))}
                                                className="border-[#c9ad8e] data-[state=checked]:border-[#7b4f2c] data-[state=checked]:bg-[#7b4f2c]"
                                            />
                                            Remember me
                                        </label>
                                    </div>

                                    <Button
                                        className="h-14 w-full rounded-2xl bg-[#7b4f2c] text-base font-semibold text-white shadow-[0_16px_32px_rgba(123,79,44,0.25)] transition hover:bg-[#6f4525] disabled:opacity-70"
                                        disabled={processing}
                                    >
                                        {processing ? 'Checking...' : 'Login'}
                                    </Button>
                                </form>
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </>
    );
}
