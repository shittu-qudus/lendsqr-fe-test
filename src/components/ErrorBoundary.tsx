
import { Component, type ReactNode } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
    state: State = {
        hasError: false,
    };

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error("Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <h2>Something went wrong </h2>;
        }

        return this.props.children;
    }
}

export default ErrorBoundary;