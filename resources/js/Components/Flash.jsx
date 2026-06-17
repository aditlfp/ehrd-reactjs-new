import { CheckCircle2, CircleAlert, TriangleAlert } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { Alert, AlertDescription, AlertTitle } from '@/Components/ui/alert';

const config = {
    success: ['success', 'Berhasil', CheckCircle2],
    warning: ['warning', 'Perhatian', TriangleAlert],
    error: ['destructive', 'Gagal', CircleAlert],
};

export function Flash() {
    const { flash } = usePage().props;
    const items = [
        flash?.success && ['success', flash.success],
        flash?.error && ['error', flash.error],
        flash?.warning && ['warning', flash.warning],
    ].filter(Boolean);

    if (!items.length) return null;

    return (
        <div className="space-y-2">
            {items.map(([type, message]) => {
                const [variant, title, Icon] = config[type];

                return (
                    <Alert key={type} variant={variant}>
                        <Icon />
                        <AlertTitle>{title}</AlertTitle>
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                );
            })}
        </div>
    );
}
