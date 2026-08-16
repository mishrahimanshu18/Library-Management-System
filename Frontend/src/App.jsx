import React from "react";
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";

import ProtectedRoute from "./shared/ProtectedRoute";

import AdminLayout from "./admin/AdminLayout";
import AdminDashboardPage from "./admin/AdminDashboardPage";
import AdminBooksPage from "./admin/AdminBooksPage";
import AdminUserPage from "./admin/AdminUserPage";
import AdminFinesPage from "./admin/AdminFinesPage";

import UserDashboardPage from "./user/UserDashboardPage";
import UserLayout from "./user/UserLayout";
import UserBooksPage from "./user/UserBooksPage";
import UserEditProfilePage from "./user/UserEditProfilePage";

const App = () => {
  return (
    <Routes>

      {/* =====================================
          PUBLIC ROUTES
      ====================================== */}

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/signup"
        element={<Signup />}
      />

      {/* =====================================
          PASSWORD RESET
          Email link:
          /reset-password/:token
      ====================================== */}

      <Route
        path="/reset-password/:token"
        element={<ResetPassword />}
      />

      {/* =====================================
          ADMIN PROTECTED ROUTES
      ====================================== */}

      <Route
        element={
          <ProtectedRoute allowedRole="admin" />
        }
      >
        <Route
          path="/admin"
          element={<AdminLayout />}
        >

          <Route
            index
            element={
              <Navigate
                to="/admin/dashboard"
                replace
              />
            }
          />

          <Route
            path="dashboard"
            element={<AdminDashboardPage />}
          />

          <Route
            path="books"
            element={<AdminBooksPage />}
          />

          <Route
            path="users"
            element={<AdminUserPage />}
          />

          <Route
            path="fines"
            element={<AdminFinesPage />}
          />

        </Route>
      </Route>

      {/* =====================================
          STUDENT / USER PROTECTED ROUTES
      ====================================== */}

      <Route
        element={
          <ProtectedRoute allowedRole="user" />
        }
      >
        <Route
          path="/user"
          element={<UserLayout />}
        >

          <Route
            index
            element={
              <Navigate
                to="/user/dashboard"
                replace
              />
            }
          />

          <Route
            path="dashboard"
            element={<UserDashboardPage />}
          />

          <Route
            path="books"
            element={<UserBooksPage />}
          />

          <Route
            path="profile"
            element={<UserEditProfilePage />}
          />

        </Route>
      </Route>

      {/* =====================================
          404 / UNKNOWN ROUTE
      ====================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
};

export default App;