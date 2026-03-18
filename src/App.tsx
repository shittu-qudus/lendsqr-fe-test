import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/login/login";
import Dashboard from "./pages/dashboard/dashboard";
import Users from "./components/user/Users";
// import Details from "./pages/details/Details";
import NotFound from "./components/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";

import styles from "./App.module.scss";

const App: React.FC = () => {
  return (
    <div className={styles.app}>
      <ErrorBoundary>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/user" element={<Users />} />
            {/* <Route path="/details/:id" element={<Details />} />  */}

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </ErrorBoundary>
    </div>
  );
};

export default App;