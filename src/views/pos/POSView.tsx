import ShiftGuard from './components/ShiftGuard'
import POSLayout from './components/POSLayout'

const POSView = () => {
    return (
        <div className="fixed inset-0 z-50 bg-white dark:bg-gray-800 flex flex-col">
            <ShiftGuard>
                <POSLayout />
            </ShiftGuard>
        </div>
    )
}

export default POSView
