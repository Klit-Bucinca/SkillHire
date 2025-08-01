import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

import Sidebar from "components/Sidebar/ClientSidebar.js";
import AdminNavbar from "components/Navbars/AdminNavbar.js";
import HeaderStats from "components/Headers/HeaderStats.js";
import FooterAdmin from "components/Footers/FooterAdmin.js";

import HireWorker from "views/client/HireWorker.js";

export default function Client() {
  return (
    <>
      <Sidebar />
      <div className="relative md:ml-64 bg-blueGray-100">
        <AdminNavbar />
        <HeaderStats />
        <div className="px-4 md:px-10 mx-auto w-full -m-24">
          <Switch>
            <Route path="/client/HireWorker" exact component={HireWorker} />
            <Redirect from="/client" to="/client/HireWorker" />
          </Switch>
          <FooterAdmin />
        </div>
      </div>
    </>
  );
}
