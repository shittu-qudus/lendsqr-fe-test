import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
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
            color: "#3b82f6",
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
            <h1 style={styles.title}>404 - Page Not Found</h1>
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

export default NotFound;