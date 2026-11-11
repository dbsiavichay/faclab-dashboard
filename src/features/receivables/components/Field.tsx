import type { ReactNode } from 'react'

/** Un dato con su etiqueta, para leer (no un control) */
const Field = ({ label, children }: { label: string; children: ReactNode }) => (
    <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <div className="font-medium">{children}</div>
    </div>
)

export default Field
