import React from "react";
import { Container } from "semantic-ui-react";
import Header from "./Header/Header";
import classes from "./Layout.module.scss";

const Layout = (props) => {
  return (
    <Container fluid className={classes.Layout}>
      <Header />
      <div className={classes.Main}>{props.children}</div>
    </Container>
  );
};

export default Layout;
