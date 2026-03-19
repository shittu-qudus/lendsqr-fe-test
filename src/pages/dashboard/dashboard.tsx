import Header from "../../components/header/header";
import Sidebar from "../../components/sidebar/sidebar";
import Users from "../../components/user/Users";
import styles from "./Dashboard.module.scss";
function Dashboard() {
    return (
        <div className={styles.dashboardWrapper}>

            <header className={styles.headerSlot}>
                <Header />
            </header>

            <div className={styles.bodySlot}>

                <aside className={styles.sidebarSlot}>
                    <Sidebar />
                </aside>


                <main className={styles.contentSlot}>
                    <Users />
                </main>
            </div>
        </div>
    );
}

export default Dashboard;