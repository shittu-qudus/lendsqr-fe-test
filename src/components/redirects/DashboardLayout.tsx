import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../header/header";
import Sidebar from "../sidebar/sidebar";
import styles from "./Dashboard.module.scss";

const DashboardLayout: React.FC = () => {
    return (
        <div className={styles.dashboard}>
            <Header />
            <div className={styles.mainLayout}>
                <Sidebar />
                <main className={styles.mainContent}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
