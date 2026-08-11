import { Component } from 'react'

// Without this, any render-time throw unmounts the whole tree and leaves
// an empty <div id="root">, which reads to the user as "the site is down".
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('render error', error, info)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="min-h-screen bg-bg text-text-primary flex flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-xl font-semibold">Что-то пошло не так</h1>
        <p className="text-text-secondary max-w-md text-sm">
          Страница не смогла загрузиться. Попробуйте обновить.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg"
        >
          Обновить
        </button>
      </div>
    )
  }
}
