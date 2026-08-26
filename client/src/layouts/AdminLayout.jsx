import React from "react";
import { Outlet } from "react-router-dom";
import { AdminHeader } from "../components/AdminHeader";
import { Footer } from "../components/Footer";

function AdminLayout() {
  return (
    <>
      <AdminHeader />
      <main className="app-main">
        <Outlet /> 
      </main>
      <Footer />
    </>
  );
}

export default AdminLayout;