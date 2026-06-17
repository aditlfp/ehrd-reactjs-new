import { cn } from '@/lib/utils';

function Textarea({ className, ...props }) {
    return (
        <textarea
            data-slot="textarea"
            className={cn(
                'border-input bg-card placeholder:text-muted-foreground flex min-h-20 w-full rounded-md border px-3 py-2 text-base shadow-xs outline-none transition-[border-color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                'focus-visible:border-ring focus-visible:ring-ring/25 focus-visible:ring-[3px]',
                'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
                className,
            )}
            {...props}
        />
    );
}

export { Textarea };
