import { FieldError, Input, NativeSelect } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { cn } from '@/lib/utils';

export function FormField({ label, description, error, required, className, children }) {
    return (
        <div className={cn('space-y-2', className)}>
            {label && <Label>{label}{required && <span className="text-destructive"> *</span>}</Label>}
            {children}
            {description && !error && <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>}
            <FieldError message={error} />
        </div>
    );
}

export function TextField({ label, description, error, required, className, ...props }) {
    return <FormField label={label} description={description} error={error} required={required} className={className}><Input aria-invalid={Boolean(error)} required={required} {...props} /></FormField>;
}

export function TextareaField({ label, description, error, required, className, ...props }) {
    return <FormField label={label} description={description} error={error} required={required} className={className}><Textarea aria-invalid={Boolean(error)} required={required} {...props} /></FormField>;
}

export function SelectField({ label, description, error, required, className, children, ...props }) {
    return <FormField label={label} description={description} error={error} required={required} className={className}><NativeSelect aria-invalid={Boolean(error)} required={required} {...props}>{children}</NativeSelect></FormField>;
}
