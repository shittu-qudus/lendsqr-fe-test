import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/login/login";
import Dashboard from "./pages/dashboard/dashboard";
import Users from "./components/user/Users";
import UserDetails from "./pages/userdetails/UserDetails";
import NotFound from "./components/redirects/NotFound";
import ErrorBoundary from "./components/redirects/ErrorBoundary";
import DashboardLayout from "./components/redirects/DashboardLayout";
import { SearchProvider } from "./context/SearchContext";

import styles from "./App.module.scss";

const App: React.FC = () => {
  return (
    <div className={styles.app}>
      <ErrorBoundary>
        <SearchProvider>
          <Router>
            <Routes>
              {/* Public route */}
              <Route path="/" element={<Login />} />

              {/* Routes with shared Header + Sidebar shell */}
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/user" element={<Users />} />
                <Route path="/users/:id" element={<UserDetails />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </SearchProvider>
      </ErrorBoundary>
    </div>
  );
};

export default App;