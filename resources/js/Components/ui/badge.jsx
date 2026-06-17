import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
    'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors [&>svg]:pointer-events-none [&>svg]:size-3',
    {
        variants: {
            variant: {
                default: 'border-transparent bg-primary text-primary-foreground',
                secondary: 'border-transparent bg-secondary text-secondary-foreground',
                destructive: 'border-transparent bg-destructive text-destructive-foreground',
                outline: 'border-border text-foreground',
                primary: 'border-primary/15 bg-primary/10 text-primary',
                success: 'border-emerald-500/15 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
                warning: 'border-amber-500/20 bg-amber-500/12 text-amber-700 dark:text-amber-300',
                danger: 'border-destructive/15 bg-destructive/10 text-destructive',
                info: 'border-sky-500/15 bg-sky-500/10 text-sky-700 dark:text-sky-400',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

function Badge({ className, variant, ...props }) {
    return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
