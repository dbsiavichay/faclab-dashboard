import { Component, ErrorInfo, ReactNode } from 'react'

class ErrorBoundary extends Component<
    { children: ReactNode },
    { hasError: boolean }
> {
    constructor(props: { children: ReactNode }) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError() {
        return { hasError: true }
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('ErrorBoundary:', error, info)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                    <h2 className="text-xl font-semibold">Algo salió mal</h2>
                    <button
                        className="text-primary underline"
                        onClick={() => this.setState({ hasError: false })}
                    >
                        Reintentar
                    </button>
                </div>
            )
        }
        return this.props.children
    }
}

export default ErrorBoundary
