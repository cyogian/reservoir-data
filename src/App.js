import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import "./App.css";
import Daily from "./containers/Daily/Daily";
import Home from "./containers/Home/Home";
import Monthly from "./containers/Monthly/Monthly";
import Layout from "./hocs/Layout/Layout";

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Layout>
            <Route path="/home" exact component={Home} />
            <Route path="/monthly" exact component={Monthly} />
            <Route path="/daily" exact component={Daily} />
            <Route path="/" component={() => <Redirect to="/home" />} exact />
          </Layout>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
