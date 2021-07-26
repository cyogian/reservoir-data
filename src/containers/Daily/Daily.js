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
      <Sidebar>
        <div className={classes.Nav}>
          <NavLink
            to="/daily"
            className={isStorage ? "" : classes.Active}
            exact
          >
            Reservoir Level
          </NavLink>
          <NavLink
            to="/daily?storage=1"
            className={isStorage ? classes.Active : ""}
            exact
          >
            Storage
          </NavLink>
        </div>
      </Sidebar>
      {isStorage ? <Storage /> : <Reservoir />}
    </div>
  );
};

export default Daily;
