import React from "react";
import Sidebar from "../../hocs/Layout/Sidebar/Sidebar";
import classes from "./Home.module.scss";

const Home = (props) => {
  return (
    <div className={classes.Home}>
      <Sidebar />
      Home
    </div>
  );
};

export default Home;
