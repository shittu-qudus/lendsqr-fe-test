import Header from "../../components/header/header";
import Sidebar from "../../components/sidebar/sidebar";
import Users from "../../components/user/Users";
function Dashboard() {
    return (
        <div>
            <Header></Header>
            <Users />
            <Sidebar />

        </div>
    );
}

export default Dashboard