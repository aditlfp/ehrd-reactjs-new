import { Link, router, usePage } from '@inertiajs/react';
import {
    BarChart3,
    FileText,
    Fingerprint,
    LogOut,
    Menu,
    UserRound as UserGroup,
    Users,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/Components/ui/avatar';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/Components/ui/sheet';
import { Flash } from '@/Components/Flash';
import { cn } from '@/lib/utils';
import LogoTransparent from '../../../public/assets/myhrd-logo-transparent.png';

const nav = [
    { label: 'Dashboard', href: '/admin', icon: BarChart3 },
    { group: 'Master Data' },
    { label: 'Employes', href: '/admin/employes', icon: UserGroup },
    {
        label: 'Pengajuan Kontrak',
        href: '/admin/pengajuan-kontrak',
        icon: FileText,
        badge: 'expiredContracts',
    },
    {
        label: 'User Confirmation',
        href: '/admin/temp-users',
        icon: Fingerprint,
        badge: 'pendingTempUsers',
    },
    { group: 'Auth' },
    { label: 'Users', href: '/admin/users', icon: Users },
];

function Sidebar({ auth, badges }) {
    return (
        <aside className="fixed left-0 top-0 z-50 flex h-full w-72 overflow-hidden bg-[#3f271b] text-[#fff7ea]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,231,194,0.18),transparent_32%),linear-gradient(180deg,#6f452c_0%,#3f271b_52%,#2b1a13_100%)]" />
            <div className="pointer-events-none absolute -right-24 top-24 size-56 rounded-full bg-[#d5a66c]/15 blur-3xl" />
            <div className="pointer-events-none absolute -left-20 bottom-20 size-48 rounded-full bg-[#f1d4aa]/10 blur-3xl" />

            <div className="relative flex min-h-0 w-full flex-col">
                <div className="p-4 pb-3">
                    <div className="rounded-3xl border border-white/12 bg-white/10 p-4 shadow-2xl shadow-black/10 backdrop-blur">
                        <div className="flex items-center gap-3">
                            <div className="flex size-11 items-center justify-center rounded-2xl border border-white/15 bg-white/12 shadow-lg shadow-black/10">
                                <img src={LogoTransparent} alt="Logo" className="size-7 object-contain" />
                            </div>
                            <div className="min-w-0">
                                <div className="truncate text-base font-semibold tracking-tight text-[#fff8ec]">MY HRD</div>
                                <div className="text-xs font-medium text-[#e8c898]">Online Admin</div>
                            </div>
                        </div>
                    </div>
                </div>

                <nav className="min-h-0 flex-1 space-y-1.5 overflow-y-auto px-3 pb-3">
                    {nav.map((item, index) => {
                        if (item.group) {
                            return (
                                <div
                                    key={index}
                                    className="px-3 pb-1 pt-4 text-[10px] font-bold uppercase tracking-[0.22em] text-[#e8c898]/75"
                                >
                                    {item.group}
                                </div>
                            );
                        }

                        const active =
                            location.pathname === item.href ||
                            (item.href !== '/admin' && location.pathname.startsWith(item.href));
                        const Icon = item.icon;
                        const count = item.badge ? badges?.[item.badge] : 0;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'group relative flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                                    active
                                        ? 'bg-[#fff3de] text-[#3f271b] shadow-lg shadow-black/10 ring-1 ring-white/20'
                                        : 'text-[#f4dfbf]/82 hover:bg-white/10 hover:text-[#fff8ec]',
                                )}
                            >
                                <span className="flex min-w-0 items-center gap-3">
                                    <span
                                        className={cn(
                                            'flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors',
                                            active
                                                ? 'bg-[#7a5032] text-[#fff8ec]'
                                                : 'bg-white/10 text-[#f1d4aa] group-hover:bg-white/14 group-hover:text-[#ffe7c2]',
                                        )}
                                    >
                                        <Icon className="size-4" />
                                    </span>
                                    <span className="truncate">{item.label}</span>
                                </span>
                                {count > 0 && <Badge variant={active ? 'primary' : 'danger'} className="bg-[#fff3de] font-semibold">{count}</Badge>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-3 pt-2">
                    <div className="mb-3 rounded-3xl border border-white/12 bg-white/10 p-3 shadow-2xl shadow-black/10 backdrop-blur">
                        <div className="flex items-center gap-3">
                            <Avatar className="size-10 border border-white/15">
                                <AvatarFallback className="bg-[#ffe6be]/15 font-semibold text-[#ffe1b0]">
                                    {auth.user?.name?.slice(0, 2)?.toUpperCase() || 'AD'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <div className="truncate text-sm font-semibold text-[#fff8ec]">{auth.user?.name}</div>
                                <div className="truncate text-xs text-[#dec4a1]">{auth.user?.email}</div>
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        className="w-full justify-start rounded-2xl border border-white/12 bg-white/8 text-[#f4dfbf] hover:bg-white/12 hover:text-[#fff8ec]"
                        onClick={() => router.post('/logout')}
                    >
                        <LogOut className="size-4" /> Logout
                    </Button>
                </div>
            </div>
        </aside>
    );
}

export default function AdminLayout({ title, children, actions }) {
    const { auth, badges } = usePage().props;

    return (
        <div className="min-h-screen bg-background lg:flex">
            <div className="hidden border-r border-[#3f271b]/15 bg-[#3f271b] lg:block">
                <Sidebar auth={auth} badges={badges} />
            </div>
            <main className="min-w-0 flex-1 ml-0 lg:ml-72">
                <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
                    <div className="flex min-h-16 flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between lg:px-8">
                        <div className="flex items-center gap-3">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="lg:hidden">
                                        <Menu className="size-5" />
                                        <span className="sr-only">Open menu</span>
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-72 p-0">
                                    <SheetHeader className="sr-only">
                                        <SheetTitle>Navigation</SheetTitle>
                                        <SheetDescription>Admin navigation menu</SheetDescription>
                                    </SheetHeader>
                                    <Sidebar auth={auth} badges={badges} />
                                </SheetContent>
                            </Sheet>
                            <div>
                                <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
                                <p className="text-xs text-muted-foreground">Manage HR data and contract workflow</p>
                            </div>
                        </div>
                        {actions && <div className="flex flex-wrap items-center gap-2 sm:justify-end">{actions}</div>}
                    </div>
                </header>
                <div className="mx-auto max-w-7xl space-y-5 p-4 lg:p-8">
                    <Flash />
                    {children}
                </div>
            </main>
        </div>
    );
}
