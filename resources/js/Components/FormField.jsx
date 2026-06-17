import { FieldError, Input, NativeSelect } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { cn } from '@/lib/utils';

export function FormField({ label, description, error, className, children }) {
    return (
        <div className={cn('space-y-2', className)}>
            {label && <Label>{label}</Label>}
            {children}
            {description && !error && <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>}
            <FieldError message={error} />
        </div>
    );
}

export function TextField({ label, description, error, className, ...props }) {
    return <FormField label={label} description={description} error={error} className={className}><Input aria-invalid={Boolean(error)} {...props} /></FormField>;
}

export function TextareaField({ label, description, error, className, ...props }) {
    return <FormField label={label} description={description} error={error} className={className}><Textarea aria-invalid={Boolean(error)} {...props} /></FormField>;
}

export function SelectField({ label, description, error, className, children, ...props }) {
    return <FormField label={label} description={description} error={error} className={className}><NativeSelect aria-invalid={Boolean(error)} {...props}>{children}</NativeSelect></FormField>;
}
