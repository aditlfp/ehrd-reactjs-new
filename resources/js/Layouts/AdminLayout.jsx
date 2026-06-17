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
import { Separator } from '@/Components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/Components/ui/sheet';
import { Flash } from '@/Components/Flash';
import { cn } from '@/lib/utils';

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
        <aside className="flex h-full w-72 flex-col bg-card">
            <div className="flex h-16 items-center px-5">
                <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-md border bg-primary/10 text-sm font-bold text-primary">
                        HR
                    </div>
                    <div>
                        <div className="text-base font-semibold tracking-tight">MY HRD</div>
                        <div className="text-muted-foreground text-xs">Online Admin</div>
                    </div>
                </div>
            </div>
            <Separator />
            <nav className="flex-1 space-y-1 overflow-y-auto p-3">
                {nav.map((item, index) => {
                    if (item.group) {
                        return (
                            <div
                                key={index}
                                className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
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
                                'flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                                active
                                    ? 'bg-primary/10 text-primary ring-1 ring-primary/15'
                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                            )}
                        >
                            <span className="flex items-center gap-3">
                                <Icon className="size-4" />
                                {item.label}
                            </span>
                            {count > 0 && <Badge variant={active ? 'primary' : 'danger'}>{count}</Badge>}
                        </Link>
                    );
                })}
            </nav>
            <Separator />
            <div className="p-3">
                <div className="mb-3 flex items-center gap-3 rounded-md border bg-muted/35 p-3">
                    <Avatar className="size-9">
                        <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                            {auth.user?.name?.slice(0, 2)?.toUpperCase() || 'AD'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">{auth.user?.name}</div>
                        <div className="truncate text-xs text-muted-foreground">{auth.user?.email}</div>
                    </div>
                </div>
                <Button variant="outline" className="w-full justify-start" onClick={() => router.post('/logout')}>
                    <LogOut className="size-4" /> Logout
                </Button>
            </div>
        </aside>
    );
}

export default function AdminLayout({ title, children, actions }) {
    const { auth, badges } = usePage().props;

    return (
        <div className="min-h-screen bg-background lg:flex">
            <div className="hidden border-r bg-card lg:block">
                <Sidebar auth={auth} badges={badges} />
            </div>
            <main className="min-w-0 flex-1">
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
