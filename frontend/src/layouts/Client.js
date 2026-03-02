import React, { Suspense, lazy } from "react";
import { Switch, Route, Redirect } from "react-router-dom";

import Sidebar from "components/Sidebar/ClientSidebar.js";
import AdminNavbar from "components/Navbars/AdminNavbar.js";
import HeaderStats from "components/Headers/ClientHeaderStats.js";
import FooterAdmin from "components/Footers/FooterAdmin.js";

const HireWorker = lazy(() => import("views/client/HireWorker.js"));
const MyHires = lazy(() => import("views/client/MyHires.js"));

export default function Client() {
  return (
    <>
      <Sidebar />
      <div className="relative md:ml-64 bg-blueGray-100">
        <AdminNavbar showSearch={false} showUser={false} />
        <HeaderStats />
        <div className="px-4 md:px-10 mx-auto w-full -m-24">
          <Suspense fallback={<div className="p-4 text-blueGray-600">Loading...</div>}>
            <Switch>
              <Route path="/client/HireWorker" exact component={HireWorker} />
              <Route path="/client/MyHires" exact component={MyHires} />
              <Redirect from="/client" to="/client/HireWorker" />
            </Switch>
          </Suspense>
          <FooterAdmin />
        </div>
      </div>
    </>
  );
}
