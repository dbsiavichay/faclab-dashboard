import { Link } from 'react-router-dom'
import Card from '@/components/ui/Card'
import { formatCurrency, formatDatetime } from '@shared/lib/format'
import { formatDay } from '../model/days'
import type { Quote } from '../model/types'

const Field = ({
    label,
    children,
}: {
    label: string
    children: React.ReactNode
}) => (
    <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <div className="font-medium">{children}</div>
    </div>
)

export const QuoteInfo = ({ quote }: { quote: Quote }) => (
    <Card>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Field label="Cliente">
                {quote.customerName ? (
                    <>
                        {quote.customerName}
                        <p className="text-xs font-normal text-gray-500 dark:text-gray-400">
                            {quote.customerTaxId}
                            {quote.customerEmail && ` · ${quote.customerEmail}`}
                        </p>
                    </>
                ) : (
                    'Consumidor final'
                )}
            </Field>
            <Field label="Sucursal">
                {quote.establishmentCode} {quote.branchName}
            </Field>
            <Field label="Emitida / Válida hasta">
                {formatDay(quote.issueDate)} – {formatDay(quote.validUntil)}
            </Field>
            <Field label="Creada por">{quote.createdBy ?? '-'}</Field>
            {quote.sentAt && (
                <Field label="Enviada">{formatDatetime(quote.sentAt)}</Field>
            )}
            {quote.saleId && (
                <Field label="Venta">
                    <Link
                        className="text-primary-600 hover:underline dark:text-primary-400"
                        to={`/sales/${quote.saleId}`}
                    >
                        {quote.saleNumber ?? `#${quote.saleId}`}
                    </Link>
                </Field>
            )}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 border-t pt-4 dark:border-gray-600">
            <Field label="Subtotal">{formatCurrency(quote.subtotal)}</Field>
            <Field label="IVA">{formatCurrency(quote.tax)}</Field>
            <Field label="Total">
                <span className="text-lg font-semibold">
                    {formatCurrency(quote.total)}
                </span>
            </Field>
        </div>
        {quote.notes && (
            <div className="mt-4 border-t pt-4 dark:border-gray-600">
                <Field label="Notas">
                    <span className="whitespace-pre-line">{quote.notes}</span>
                </Field>
            </div>
        )}
    </Card>
)
