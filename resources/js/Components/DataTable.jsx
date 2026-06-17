import { Link } from '@inertiajs/react';
import { Inbox } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';

export function DataTable({ columns, rows, empty = 'Data kosong' }) {
    return (
        <Card className="overflow-hidden">
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((column) => (
                                <TableHead key={column.key}>{column.label}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows?.length ? rows.map((row, index) => (
                            <TableRow key={row.id ?? index}>
                                {columns.map((column) => (
                                    <TableCell key={column.key}>
                                        {column.render ? column.render(row, index) : row[column.key] ?? '-'}
                                    </TableCell>
                                ))}
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell className="h-40 text-center" colSpan={columns.length}>
                                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                        <div className="flex size-10 items-center justify-center rounded-md border bg-muted/40">
                                            <Inbox className="size-5" />
                                        </div>
                                        <p className="text-sm font-medium">{empty}</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export function Pagination({ links }) {
    if (!links?.length) return null;

    return (
        <div className="mt-4 flex flex-wrap items-center gap-2">
            {links.map((link, index) => (
                <Button
                    key={index}
                    asChild
                    variant={link.active ? 'default' : 'outline'}
                    size="sm"
                    className={!link.url ? 'pointer-events-none opacity-45' : ''}
                >
                    <Link
                        href={link.url || '#'}
                        preserveScroll
                        dangerouslySetInnerHTML={{ __html: link.label.replace('Previous', '<').replace('Next', '>') }}
                    />
                </Button>
            ))}
        </div>
    );
}
