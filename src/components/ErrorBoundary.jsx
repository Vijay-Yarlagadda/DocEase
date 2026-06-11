import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // Could log to monitoring service here
    console.error('ErrorBoundary caught error', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center">
          <h3 className="text-lg font-semibold">Something went wrong</h3>
          <p className="text-sm text-slate-500 mt-2">Unable to display this content. Try refreshing the page.</p>
          <button onClick={() => window.location.reload()} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded bg-fuchsia-600 text-white">Refresh</button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
