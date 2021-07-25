import React from "react";
import { NavLink } from "react-router-dom";
import classes from "./Header.module.scss";

const Header = (props) => {
  return (
    <div className={classes.Header}>
      <NavLink to="/home" activeClassName={classes.Active} exact>
        Home
      </NavLink>
      <NavLink to="/monthly" activeClassName={classes.Active} exact>
        Monthly
      </NavLink>
      <NavLink to="/daily" activeClassName={classes.Active} exact>
        Daily
      </NavLink>
    </div>
  );
};

export default Header;
