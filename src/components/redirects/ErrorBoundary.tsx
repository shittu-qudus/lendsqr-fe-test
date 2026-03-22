import { useEffect, Component, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";


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
            return <ErrorFallback />;
        }

        return this.props.children;
    }
}

const ErrorFallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate(-1);
        }, 2000);

        return () => clearTimeout(timer);
    }, [navigate]);

    const styles = {
        container: {
            display: "flex",
            flexDirection: "column" as const,
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            textAlign: "center" as const,
            padding: "2rem",
            animation: "fadeIn 0.5s ease-in-out",
        },
        title: {
            fontSize: "2.5rem",
            color: "#dc2626",
            marginBottom: "1rem",
            "@media (min-width: 768px)": {
                fontSize: "3rem",
            },
        },
        message: {
            fontSize: "1.125rem",
            color: "#6b7280",
            marginTop: "1rem",
            "@media (min-width: 768px)": {
                fontSize: "1.25rem",
            },
        },
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Something went wrong</h2>
            <p style={styles.message}>Redirecting you back in 2 seconds...</p>
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default ErrorBoundary;