'use client';

import { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

/**
 * Catches unhandled rendering errors in child components
 * and displays a recoverable fallback UI instead of a blank screen.
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message || 'Something went wrong' };
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="app" style={{ display: 'grid', placeItems: 'center', padding: 24 }}>
          <div className="app-error" role="alert" style={{ maxWidth: 520, justifyContent: 'space-between', flexWrap: 'wrap', background: 'var(--app-sheet)' }}>
            <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <AlertCircle className="w-4 h-4" aria-hidden="true" />
              <span>{this.props.fallbackMessage || 'Something went wrong on this screen.'}</span>
            </span>
            <button type="button" onClick={this.handleRetry} className="app-button app-button--text">
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
