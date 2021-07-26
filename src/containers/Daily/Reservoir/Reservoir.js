import axios from "axios";
import React, { useEffect, useState } from "react";
import { Grid } from "semantic-ui-react";
import csvToArray from "../../../data/csvToArray";
import { DailyReservoirLevel } from "../../../data/links";
import classes from "./Reservoir.module.scss";
import moment from "moment";
import { formatTo3 } from "../../Monthly/Monthly";
import * as d3 from "d3";
import "../chart.scss";
import CanvasJSReact from "../canvasjs.react";

const CanvasJS = CanvasJSReact.CanvasJS;
const CanvasJSChart = CanvasJSReact.CanvasJSChart;

function drawChart(data, setCurrent, Type) {
  return {
    animationEnabled: true,
    exportEnabled: true,
    theme: "light2",
    title: {
      text: "Reservior Level by Date",
    },
    axisY: {
      title: "Reservoir Level",
      suffix: "metres",
    },
    axisX: {
      title: "Date",
    },
    data: [
      {
        type: "line",
        toolTipContent: "Date {x}: {y}metres",
        dataPoints: data.map((d) => {
          let date = moment(d.Date, "MMM-D-YYYY").toDate();
          let rl = Number(d["RL [in metres]"]);
          return d[Type] === "Observed"
            ? {
                x: date,
                y: rl,
              }
            : {
                x: date,
                y: rl,
                color: "Red",
                lineColor: "Red",
              };
        }),
      },
    ],
  };
}
const Reservoir = (props) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [Type, setType] = useState("");
  const [current, setCurrent] = useState({});
  const [forecaste, setForecaste] = useState({});
  const [live, setLive] = useState({});
  const [maximum, setMaximum] = useState(0);
  useEffect(() => {
    setLoading(true);
    axios.get(DailyReservoirLevel).then((res) => {
      setLoading(false);
      let reservoirData = csvToArray(res.data);
      console.log(reservoirData);
      setType(
        Object.keys(reservoirData[0] || {}).filter((k) =>
          k.startsWith("Type") ? true : false
        )[0]
      );
      setData(reservoirData);
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
          acc > Number(v["RL [in metres]"]) ? acc : Number(v["RL [in metres]"]),
        0
      );
    setMaximum(maximum);
  }, [data, Type]);

  // useEffect(() => {
  //   data.length > 0 && drawChart(data, setCurrent, Type);
  // }, [data, setCurrent, Type]);

  return (
    <Grid className={classes.Reservoir}>
      <Grid.Row style={{ fontSize: "1.75rem" }}>
        <Grid.Column width="3">
          <div
            style={{
              backgroundColor: "gold",
              padding: "2.75rem 0.75rem",
            }}
          >
            Date: {(live && live.Date) || "NA"}
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
                Live Data {(live && live.Date) || "NA"} :{" "}
              </Grid.Column>
              <Grid.Column width="8" style={{ padding: "1rem 1rem 1rem 6rem" }}>
                Reservoir Level :{" "}
                {(live &&
                  live["RL [in metres]"] &&
                  formatTo3(live["RL [in metres]"])) ||
                  "NA"}{" "}
                metres
              </Grid.Column>
            </Grid.Row>
            <Grid.Row style={{ color: "red", paddingTop: 0 }}>
              <Grid.Column
                width="8"
                style={{ padding: "1rem", textAlign: "right" }}
              >
                30-Days Forecasted Data {(forecaste && forecaste.Date) || "NA"}{" "}
                :{" "}
              </Grid.Column>
              <Grid.Column width="8" style={{ padding: "1rem 1rem 1rem 6rem" }}>
                Reservoir Level :{" "}
                {(forecaste &&
                  forecaste["RL [in metres]"] &&
                  formatTo3(forecaste["RL [in metres]"])) ||
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
            <h1 style={{ padding: "1rem 3rem", fontSize: "6rem" }}>
              Reservoir Level
            </h1>
            <div
              style={{
                position: "absolute",
                backgroundColor: "gold",
                height: "15rem",
                width: "50rem",
                right: "0.5rem",
                top: "0.5rem",
                padding: "0.5rem 1rem",
              }}
              className={classes.Display}
            >
              <h4>Date : {(current && current.Date) || "NA"}</h4>
              <h4>
                Reservoir Level :{" "}
                {(current &&
                  current["RL [in metres]"] &&
                  formatTo3(current["RL [in metres]"])) ||
                  "NA"}{" "}
                metres
              </h4>
              <h4>
                Last Year Level :{" "}
                {(current &&
                  current["Last Year Level (m)"] &&
                  formatTo3(current["Last Year Level (m)"])) ||
                  "NA"}{" "}
                metres
              </h4>
              <h4>
                Last 10 Year Average Level :{" "}
                {(current &&
                  current["Last 10 Year Average Level (m)"] &&
                  formatTo3(current["Last 10 Year Average Level (m)"])) ||
                  "NA"}{" "}
                metres
              </h4>
              {current && current[Type] === "Observed" && <h4>Observed</h4>}
              {current && current[Type] === "Forecasted" && (
                <h4 style={{ color: "red" }}>Forecasted</h4>
              )}
              <h4>Maximum Reservoir Level : {maximum || "NA"} meteres</h4>
            </div>
          </div>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column width="16">
          {loading && (
            <h2 style={{ color: "gold", paddingTop: "3rem" }}>Loading...</h2>
          )}
          {data.length && (
            <CanvasJSChart options={drawChart(data, setCurrent, Type)} />
          )}
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};

export default Reservoir;
