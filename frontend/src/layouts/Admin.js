import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

// components

import AdminNavbar from "components/Navbars/AdminNavbar.js";
import Sidebar from "components/Sidebar/Sidebar.js";
import HeaderStats from "components/Headers/HeaderStats.js";
import FooterAdmin from "components/Footers/FooterAdmin.js";

// views


import Categories from "views/admin/Categories.js";
import Services from "views/admin/Services.js";
import Users from "views/admin/Users.js";

export default function Admin() {
  return (
    <>
      <Sidebar />
      <div className="relative md:ml-64 bg-blueGray-100">
        <AdminNavbar />
        {/* Header */}
        <HeaderStats />
        <div className="px-4 md:px-10 mx-auto w-full -m-24">
          <Switch>
            <Route path="/admin/categories" exact component={Categories} />
            <Route path="/admin/services" exact component={Services} />
            <Route path="/admin/users" exact component={Users} />
            <Redirect from="/admin" to="/admin/services" />
          </Switch>
          <FooterAdmin />
        </div>
      </div>
    </>
  );
}
