import { Component } from 'react';

// Last line of defence: a render crash shows a recoverable message instead of a white screen.
export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { console.error(error); }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="grid min-h-screen place-items-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="mt-2 text-muted">The page hit an unexpected error. Reloading usually fixes it.</p>
          <button onClick={() => window.location.assign('/')} className="mt-4 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-on-brand">Reload the app</button>
        </div>
      </div>
    );
  }
}
