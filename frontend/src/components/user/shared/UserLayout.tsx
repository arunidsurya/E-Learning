import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const UserLayout: React.FC = () => {
  return (
    <div className="flex flex-col bg-neutral-100 h-screen w-screen overflow-hidden">
      <Header />
      <div className="flex-1 px-8">{<Outlet />}</div>
      <Footer />
    </div>
  );
};

export default UserLayout;
