import { cn } from '@/lib/utils';

function Input({ className, type, ...props }) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                'border-input bg-card file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs outline-none transition-[border-color,box-shadow] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                'focus-visible:border-ring focus-visible:ring-ring/25 focus-visible:ring-[3px]',
                'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
                className,
            )}
            {...props}
        />
    );
}

function NativeSelect({ className, children, ...props }) {
    return (
        <select
            data-slot="native-select"
            className={cn(
                'border-input bg-card ring-offset-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none transition-[border-color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50',
                'focus-visible:border-ring focus-visible:ring-ring/25 focus-visible:ring-[3px]',
                className,
            )}
            {...props}
        >
            {children}
        </select>
    );
}

function FieldError({ message }) {
    if (!message) return null;
    return <p className="text-destructive mt-1 text-xs font-medium">{message}</p>;
}

export { FieldError, Input, NativeSelect, NativeSelect as Select };
