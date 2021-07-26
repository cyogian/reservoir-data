import axios from "axios";
import React, { useEffect, useState } from "react";
import { Grid } from "semantic-ui-react";
import csvToArray from "../../../data/csvToArray";
import { DailyStorage } from "../../../data/links";
import classes from "./Storage.module.scss";
import moment from "moment";
import { formatTo3 } from "../../Monthly/Monthly";
const Storage = (props) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [Type, setType] = useState("");
  const [current, setCurrent] = useState({});
  const [forecaste, setForecaste] = useState({});
  const [live, setLive] = useState({});
  const [maximum, setMaximum] = useState(0);
  useEffect(() => {
    setLoading(true);
    axios.get(DailyStorage).then((res) => {
      setLoading(false);
      let storageData = csvToArray(res.data);
      console.log(storageData);
      setType(
        Object.keys(storageData[0] || {}).filter((k) =>
          k.startsWith("Type") ? true : false
        )[0]
      );
      setData(storageData);
    });
  }, []);

  useEffect(() => {
    let forecaste = data.filter((x) => x[Type] === "Forecasted");
    forecaste = forecaste[forecaste.length - 1];
    let live = data.filter((x) => x[Type] === "Observed");
    live = live[live.length - 1];
    setForecaste(forecaste);
    setCurrent(forecaste);
    setLive(live);
  }, [data, Type]);

  useEffect(() => {
    let maximum = data
      .filter((x) => x[Type] === "Observed")
      .reduce(
        (acc, v) =>
          acc > Number(v["Storage[in TMC]"])
            ? acc
            : Number(v["Storage[in TMC]"]),
        0
      );
    setMaximum(maximum);
  }, [data, Type]);
  return (
    <Grid className={classes.Storage}>
      <Grid.Row style={{ fontSize: "1.75rem" }}>
        <Grid.Column width="3">
          <div
            style={{
              backgroundColor: "gold",
              padding: "2.75rem 0.75rem",
            }}
          >
            Date:{" "}
            {(live &&
              live.Dates &&
              moment(live.Dates, "DD-MMMM-YYYY").format("MMM-D-YYYY")) ||
              "NA"}
          </div>
        </Grid.Column>
        <Grid.Column
          width="13"
          style={{ backgroundColor: "#ffff6e", fontWeight: "700" }}
        >
          <Grid>
            <Grid.Row style={{ color: "blue", paddingBottom: 0 }}>
              <Grid.Column
                width="8"
                style={{ padding: "1rem", textAlign: "right" }}
              >
                Live Data{" "}
                {(live &&
                  live.Dates &&
                  moment(live.Dates, "DD-MMMM-YYYY").format("MMM-D-YYYY")) ||
                  "NA"}{" "}
                :{" "}
              </Grid.Column>
              <Grid.Column width="8" style={{ padding: "1rem 1rem 1rem 6rem" }}>
                Reservoir Level :{" "}
                {(live &&
                  live["Storage[in TMC]"] &&
                  formatTo3(live["Storage[in TMC]"])) ||
                  "NA"}{" "}
                metres
              </Grid.Column>
            </Grid.Row>
            <Grid.Row style={{ color: "red", paddingTop: 0 }}>
              <Grid.Column
                width="8"
                style={{ padding: "1rem", textAlign: "right" }}
              >
                30-Days Forecasted Data{" "}
                {(forecaste &&
                  forecaste.Dates &&
                  moment(forecaste.Dates, "DD-MMMM-YYYY").format(
                    "MMM-D-YYYY"
                  )) ||
                  "NA"}{" "}
                :{" "}
              </Grid.Column>
              <Grid.Column width="8" style={{ padding: "1rem 1rem 1rem 6rem" }}>
                Reservoir Level :{" "}
                {(forecaste &&
                  forecaste["Storage[in TMC]"] &&
                  formatTo3(forecaste["Storage[in TMC]"])) ||
                  "NA"}{" "}
                metres
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column width="16">
          <div
            style={{
              backgroundColor: "#ffff6e",
              height: "16rem",
              marginRight: "-1rem",
              marginTop: "-1rem",
              position: "relative",
            }}
          >
            <h1 style={{ padding: "1rem 3rem", fontSize: "6rem" }}>Storage</h1>
            <div
              style={{
                position: "absolute",
                backgroundColor: "gold",
                height: "15rem",
                width: "50rem",
                right: "0.5rem",
                top: "0.5rem",
              }}
            ></div>
          </div>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};

export default Storage;
