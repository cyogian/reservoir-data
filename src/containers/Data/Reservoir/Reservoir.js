import axios from "axios";
import React, { useEffect, useState } from "react";
import { Grid } from "semantic-ui-react";
import csvToArray from "../../../data/csvToArray";
import { DailyReservoirLevel } from "../../../data/links";
import classes from "./Reservoir.module.scss";
import moment from "moment";
import { formatTo3 } from "../../Monthly/Monthly";
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
      title: "Reservoir Level (in metres)",
      suffix: "metres",
    },
    axisX: {
      title: "Date",
    },
    data: [
      {
        type: "line",
        toolTipContent: "{x}<br/>{y}metres",
        dataPoints: data.map((d) => {
          let date = moment(d.Date, "MMM-D-YYYY").toDate();
          let rl = Number(d["RL [in metres]"]);
          let mouseover = (e) => {
            setCurrent(d);
          };
          return d[Type] === "Observed"
            ? {
                x: date,
                y: rl,
                mouseover,
              }
            : {
                x: date,
                y: rl,
                color: "Red",
                lineColor: "Red",
                mouseover,
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
              padding: "1.5rem 0.75rem",
              fontWeight: "bolder",
              fontSize: "2.5rem",
            }}
          >
            Date:
            <br />
            <br />
            {(live && live.Date) || "NA"}
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
                1 Month ahead Forecasted Data{" "}
                {(forecaste && forecaste.Date) || "NA"} :{" "}
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
      <Grid.Row style={{ paddingTop: "0" }}>
        <Grid.Column width="16" style={{ paddingRight: "0" }}>
          <h1
            style={{
              padding: "1rem",
              fontSize: "3rem",
              background: "black",
              color: "white",
              textAlign: "center",
            }}
          >
            RESERVOIR LEVELS
          </h1>
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
            <div
              style={{
                position: "absolute",
                backgroundColor: "gold",
                height: "15rem",
                width: "calc(100% - 1rem)",
                right: "0.5rem",
                top: "0.5rem",
                padding: "0.5rem 1rem",
              }}
              className={classes.Display}
            >
              <Grid>
                <Grid.Row>
                  <Grid.Column width="8">
                    <h1>Date : {(current && current.Date) || "NA"}</h1>
                    <h1>
                      Reservoir Level :{" "}
                      {(current &&
                        current["RL [in metres]"] &&
                        formatTo3(current["RL [in metres]"])) ||
                        "NA"}{" "}
                      metres
                    </h1>
                    {current && current[Type] === "Observed" && (
                      <h1 style={{ color: "blue", fontSize: "3rem" }}>
                        Observed
                      </h1>
                    )}
                    {current && current[Type] === "Forecasted" && (
                      <h1 style={{ color: "red", fontSize: "3rem" }}>
                        Forecasted
                      </h1>
                    )}
                  </Grid.Column>
                  <Grid.Column width="8">
                    <h1>
                      Last Year Level :{" "}
                      {(current &&
                        current["Last Year Level (m)"] &&
                        formatTo3(current["Last Year Level (m)"])) ||
                        "NA"}{" "}
                      metres
                    </h1>
                    <h1>
                      Last 10 Year Average Level :{" "}
                      {(current &&
                        current["Last 10 Year Average Level (m)"] &&
                        formatTo3(current["Last 10 Year Average Level (m)"])) ||
                        "NA"}{" "}
                      metres
                    </h1>
                    <h1>Maximum Reservoir Level : {maximum || "NA"} meteres</h1>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </div>
          </div>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column width="16">
          {loading && (
            <h2 style={{ color: "gold", paddingTop: "3rem" }}>Loading...</h2>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              width: "1425px",
            }}
          >
            {data.length && (
              <CanvasJSChart options={drawChart(data, setCurrent, Type)} />
            )}
          </div>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};

export default Reservoir;
