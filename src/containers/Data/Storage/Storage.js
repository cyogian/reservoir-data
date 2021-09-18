import axios from "axios";
import React, { useEffect, useState } from "react";
import { Grid } from "semantic-ui-react";
import csvToArray from "../../../data/csvToArray";
import { DailyStorage } from "../../../data/links";
import classes from "./Storage.module.scss";
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
    axisY: {
      title: "Storage (in TMC)",
      suffix: " TMC",
    },
    axisX: {
      title: "Date",
    },
    data: [
      {
        type: "line",
        toolTipContent: "{x}<br/>{y} TMC",
        dataPoints: data.map((d) => {
          let date = moment(d.Dates, "D-MMMM-YYYY").toDate();
          let rl = Number(d["Storage[in TMC]"]);
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

  // useEffect(() => {
  //   data.length > 0 && drawChart(data, setCurrent, Type);
  // }, [data, setCurrent, Type]);

  return (
    <Grid className={classes.Storage}>
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
            {(live &&
              live.Dates &&
              moment(live.Dates, "D-MMMM-YYYY").format("MMM-D-YYYY")) ||
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
                  moment(live.Dates, "D-MMMM-YYYY").format("MMM-D-YYYY")) ||
                  "NA"}{" "}
                :{" "}
              </Grid.Column>
              <Grid.Column width="8" style={{ padding: "1rem 1rem 1rem 6rem" }}>
                Storage :{" "}
                {(live &&
                  live["Storage[in TMC]"] &&
                  formatTo3(live["Storage[in TMC]"])) ||
                  "NA"}{" "}
                TMC
              </Grid.Column>
            </Grid.Row>
            <Grid.Row style={{ color: "red", paddingTop: 0 }}>
              <Grid.Column
                width="8"
                style={{ padding: "1rem", textAlign: "right" }}
              >
                1 Month ahead Forecasted Data{" "}
                {(forecaste &&
                  forecaste.Dates &&
                  moment(forecaste.Dates, "D-MMMM-YYYY").format(
                    "MMM-D-YYYY"
                  )) ||
                  "NA"}{" "}
                :{" "}
              </Grid.Column>
              <Grid.Column width="8" style={{ padding: "1rem 1rem 1rem 6rem" }}>
                Storage :{" "}
                {(forecaste &&
                  forecaste["Storage[in TMC]"] &&
                  formatTo3(forecaste["Storage[in TMC]"])) ||
                  "NA"}{" "}
                TMC
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
            STORAGE LEVELS
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
                    <h1>Date : {(current && current.Dates) || "NA"}</h1>
                    <h1>
                      Storage :{" "}
                      {(current &&
                        current["Storage[in TMC]"] &&
                        formatTo3(current["Storage[in TMC]"])) ||
                        "NA"}{" "}
                      TMC
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
                      % Fill :{" "}
                      {(current &&
                        current["%Fill"] &&
                        formatTo3(current["%Fill"])) ||
                        "NA"}{" "}
                      %
                    </h1>
                    <h1>
                      Last Year Storage :{" "}
                      {(current &&
                        current["Last Year Storage [in TMC]"] &&
                        formatTo3(current["Last Year Storage [in TMC]"])) ||
                        "NA"}{" "}
                      TMC
                    </h1>
                    <h1>Maximum Storage: {maximum || "NA"} TMC</h1>
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
          {data.length && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                width: "1425px",
              }}
            >
              <CanvasJSChart options={drawChart(data, setCurrent, Type)} />
            </div>
          )}
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};

export default Storage;
