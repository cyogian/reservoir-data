import React from "react";
import { NavLink } from "react-router-dom";
import Sidebar from "../../hocs/Layout/Sidebar/Sidebar";
import classes from "./Daily.module.scss";
import Reservoir from "./Reservoir/Reservoir";
import Storage from "./Storage/Storage";

const Daily = (props) => {
  let isStorage = new URLSearchParams(window.location.search).get("storage", 0);
  return (
    <div className={classes.Daily}>
      <Sidebar />
      Daily
      {isStorage ? <Storage /> : <Reservoir />}
      <NavLink to="/daily">Reservoir Level</NavLink>
      <NavLink to="/daily?storage=1">Storage</NavLink>
    </div>
  );
};

export default Daily;
