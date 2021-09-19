import React from "react";
import { NavLink } from "react-router-dom";
import classes from "./Header.module.scss";
import DownloadIcon from "../../../assets/images/downloadIcon.svg";

const Header = (props) => {
  return (
    <div className={classes.Header}>
      <NavLink to="/home" activeClassName={classes.Active} exact>
        Home
      </NavLink>
      {/* <NavLink to="/monthly" activeClassName={classes.Active} exact>
        Monthly
      </NavLink> */}
      <NavLink to="/data" activeClassName={classes.Active} exact>
        Reservoir Data
      </NavLink>
      <a
        href="/static/USER_GUIDE.pdf"
        target="_blank"
        style={{ border: "2px solid black" }}
      >
        <img
          src={DownloadIcon}
          alt="Download"
          style={{ height: "0.75em", marginRight: "0.5em" }}
        />
        User Guide
      </a>
    </div>
  );
};

export default Header;
