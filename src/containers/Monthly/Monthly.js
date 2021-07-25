import React, { useEffect, useState } from "react";
import axios from "axios";
import { Grid } from "semantic-ui-react";
import { MonthlyReservoirLevel, MonthlyStorage } from "../../data/links";
import Sidebar from "../../hocs/Layout/Sidebar/Sidebar";
import classes from "./Monthly.module.scss";
import * as d3 from "d3";
import "./chart.scss";
import csvToArray from "../../data/csvToArray";
const formatTo3 = (y = "0.0") => {
  let x = y;
  if (typeof x === "number") {
    x = x.toString();
  }
  let [pre, post] = x.split(".");
  let result = pre;
  if (post) {
    result += "." + post.substr(0, 3);
  }
  return result;
};

const drawStorageChart = (dataset, setCurrent) => {
  //Check the sample values available in the dataset
  // console.table(dataset);

  const yAccessor = (d) => d["Storage[ BCM]"];
  const dateParser = d3.timeParse("%b-%y");
  const xAccessor = (d) => dateParser(d["Dates"]);

  // Note : Unlike "natural language" date parsers (including JavaScript's built-in parse),
  // this method is strict: if the specified string does not exactly match the
  // associated format specifier, this method returns null.
  // For example, if the associated format is the full ISO 8601
  // string "%Y-%m-%dT%H:%M:%SZ", then the string "2011-07-01T19:15:28Z"
  // will be parsed correctly, but "2011-07-01T19:15:28", "2011-07-01 19:15:28"
  // and "2011-07-01" will return null, despite being valid 8601 dates.

  //Check the value of xAccessor function now
  //console.log(xAccessor(dataset[0]));

  // 2. Create a chart dimension by defining the size of the Wrapper and Margin

  let dimensions = {
    width: 708,
    height: 470,
    margin: {
      top: 115,
      right: 20,
      bottom: 40,
      left: 160,
    },
  };
  dimensions.boundedWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right;
  dimensions.boundedHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

  // 3. Draw Canvas

  const wrapper = d3
    .select("#wrapper")
    .append("svg")
    .style("background-color", "gold")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height);

  //Log our new Wrapper Variable to the console to see what it looks like
  //console.log(wrapper);

  // 4. Create a Bounding Box

  const bounds = wrapper
    .append("g")
    .style(
      "transform",
      `translate(${dimensions.margin.left}px,${dimensions.margin.top}px)`
    );

  // 5. Define Domain and Range for Scales

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(dataset, yAccessor))
    .range([dimensions.boundedHeight, 0]);

  // console.log(yScale(100));
  const referenceBandPlacement = yScale(100);
  const referenceBand = bounds
    .append("rect")
    .attr("x", 0)
    .attr("width", dimensions.boundedWidth)
    .attr("y", referenceBandPlacement)
    .attr("height", dimensions.boundedHeight - referenceBandPlacement)
    .attr("fill", "rgba(0,0,0,0)");

  const xScale = d3
    .scaleTime()
    .domain(d3.extent(dataset, xAccessor))
    .range([0, dimensions.boundedWidth]);

  //6. Convert a datapoints into X and Y value
  // Note : d3.line() method will create a generator that converts
  // a data points into a d string
  // This will transform our datapoints with both the Accessor function
  // and the scale to get the Scaled value in Pixel Space

  const lineGenerator = d3
    .line()
    .x((d) => xScale(xAccessor(d)))
    .y((d) => yScale(yAccessor(d)));
  //.curve(d3.curveBasis);

  // 7. Convert X and Y into Path
  console.log();
  const line = bounds
    .append("path")
    .attr(
      "d",
      lineGenerator(dataset.slice(0, dataset.length - 1)).replace(
        "MNaN,NaN",
        "M0,0"
      )
    )
    .attr("fill", "none")
    .attr("stroke", "dodgerblue")
    .attr("stroke-width", 1);
  const line2 = bounds
    .append("path")
    .attr("d", lineGenerator(dataset.slice(dataset.length - 2, dataset.length)))
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-width", 2);
  //8. Create X axis and Y axis
  // Generate Y Axis

  const yAxisGenerator = d3.axisLeft().scale(yScale);
  const yAxis = bounds.append("g").call(yAxisGenerator);

  const yAxisLabel = yAxis
    .append("text")
    .attr("class", "y-axis-label")
    .attr("x", -dimensions.boundedHeight / 2)
    .attr("y", -dimensions.margin.left + 110)
    .html("Storage (BCM)");

  //9. Generate X Axis
  const xAxisGenerator = d3.axisBottom().scale(xScale);
  const xAxis = bounds
    .append("g")
    .call(xAxisGenerator.tickFormat(d3.timeFormat("%b,%y")))
    .style("transform", `translateY(${dimensions.boundedHeight}px)`);

  //10. Add a Chart Header

  wrapper
    .append("g")
    .style("transform", `translate(${50}px,${15}px)`)
    .append("text")
    .attr("class", "title")
    .attr("x", dimensions.width / 2)
    .attr("y", dimensions.margin.top / 2)
    .attr("text-anchor", "middle")
    .text("Storage (in BCM)")
    .style("font-size", "36px")
    .style("text-decoration", "underline");

  // 11. Set up interactions

  const listeningRect = bounds
    .append("rect")
    .attr("class", "listening-rect")
    .attr("width", dimensions.boundedWidth)
    .attr("height", dimensions.boundedHeight)
    .on("mousemove", onMouseMove)
    .on("mouseleave", onMouseLeave);

  const xAxisLine = bounds
    .append("g")
    .append("rect")
    .attr("class", "dotted")
    .attr("stroke-width", "1px")
    .attr("width", ".5px")
    .attr("height", dimensions.boundedHeight);

  //.style("transform", `translate(${0}px,${-5}px)`);
  function onMouseMove(e) {
    const mousePosition = d3.pointer(e, this);
    const hoveredDate = xScale.invert(mousePosition[0]);

    const getDistanceFromHoveredDate = (d) =>
      Math.abs(xAccessor(d) - hoveredDate);
    const closestIndex = d3.scan(
      dataset,
      (a, b) => getDistanceFromHoveredDate(a) - getDistanceFromHoveredDate(b)
    );
    const closestDataPoint = dataset[closestIndex];
    setCurrent(closestDataPoint);

    const closestXValue = xAccessor(closestDataPoint);
    const closestYValue = yAccessor(closestDataPoint);

    const formatDate = d3.timeFormat("%B 1, %Y");
    tooltip.select("#date").text(formatDate(closestXValue));

    const formatStorage = (d) => `${d3.format(".3f")(d)} BCM`;
    tooltip.select("#storage").html(formatStorage(closestYValue));

    const x = xScale(closestXValue) + dimensions.margin.left;
    const y = yScale(closestYValue) + dimensions.margin.top;

    //Grab the x and y position of our closest point,
    //shift our tooltip, and hide/show our tooltip appropriately

    tooltip.style(
      "transform",
      `translate(` + `calc( -50% + ${x}px),` + `calc(-100% + ${y}px)` + `)`
    );

    tooltip.style("opacity", 1);

    tooltipCircle
      .attr("cx", xScale(closestXValue))
      .attr("cy", yScale(closestYValue))
      .style("opacity", 1);

    xAxisLine.attr("x", xScale(closestXValue));
  }

  function onMouseLeave() {
    tooltip.style("opacity", 0);

    tooltipCircle.style("opacity", 0);
  }

  // Add a circle under our tooltip, right over the “hovered” point
  const tooltip = d3.select("#tooltip");
  const tooltipCircle = bounds
    .append("circle")
    .attr("class", "tooltip-circle")
    .attr("r", 4)
    .attr("stroke", "#af9358")
    .attr("fill", "white")
    .attr("stroke-width", 2)
    .style("opacity", 0);
};

const drawReservoirChart = (dataset, setCurrent) => {
  //Check the sample values available in the dataset
  // console.table(dataset);

  const yAccessor = (d) => d["Reservoir Level [metres]"];
  const dateParser = d3.timeParse("%b-%y");
  const xAccessor = (d) => dateParser(d["Dates"]);

  // Note : Unlike "natural language" date parsers (including JavaScript's built-in parse),
  // this method is strict: if the specified string does not exactly match the
  // associated format specifier, this method returns null.
  // For example, if the associated format is the full ISO 8601
  // string "%Y-%m-%dT%H:%M:%SZ", then the string "2011-07-01T19:15:28Z"
  // will be parsed correctly, but "2011-07-01T19:15:28", "2011-07-01 19:15:28"
  // and "2011-07-01" will return null, despite being valid 8601 dates.

  //Check the value of xAccessor function now
  //console.log(xAccessor(dataset[0]));

  // 2. Create a chart dimension by defining the size of the Wrapper and Margin

  let dimensions = {
    width: 708,
    height: 470,
    margin: {
      top: 115,
      right: 20,
      bottom: 40,
      left: 160,
    },
  };
  dimensions.boundedWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right;
  dimensions.boundedHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

  // 3. Draw Canvas

  const wrapper = d3
    .select("#wrapper-r")
    .append("svg")
    .style("background-color", "gold")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height);

  //Log our new Wrapper Variable to the console to see what it looks like
  //console.log(wrapper);

  // 4. Create a Bounding Box

  const bounds = wrapper
    .append("g")
    .style(
      "transform",
      `translate(${dimensions.margin.left}px,${dimensions.margin.top}px)`
    );

  // 5. Define Domain and Range for Scales

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(dataset, yAccessor))
    .range([dimensions.boundedHeight, 0]);

  // console.log(yScale(100));
  const referenceBandPlacement = yScale(100);
  const referenceBand = bounds
    .append("rect")
    .attr("x", 0)
    .attr("width", dimensions.boundedWidth)
    .attr("y", referenceBandPlacement)
    .attr("height", dimensions.boundedHeight - referenceBandPlacement)
    .attr("fill", "rgba(0,0,0,0)");

  const xScale = d3
    .scaleTime()
    .domain(d3.extent(dataset, xAccessor))
    .range([0, dimensions.boundedWidth]);

  //6. Convert a datapoints into X and Y value
  // Note : d3.line() method will create a generator that converts
  // a data points into a d string
  // This will transform our datapoints with both the Accessor function
  // and the scale to get the Scaled value in Pixel Space

  const lineGenerator = d3
    .line()
    .x((d) => xScale(xAccessor(d)))
    .y((d) => yScale(yAccessor(d)));
  //.curve(d3.curveBasis);

  // 7. Convert X and Y into Path
  const line = bounds
    .append("path")
    .attr(
      "d",
      lineGenerator(dataset.slice(0, dataset.length - 1)).replace(
        "MNaN,NaN",
        "M0,0"
      )
    )
    .attr("fill", "none")
    .attr("stroke", "dodgerblue")
    .attr("stroke-width", 1);
  const line2 = bounds
    .append("path")
    .attr("d", lineGenerator(dataset.slice(dataset.length - 2, dataset.length)))
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-width", 2);
  //8. Create X axis and Y axis
  // Generate Y Axis

  const yAxisGenerator = d3.axisLeft().scale(yScale);
  const yAxis = bounds.append("g").call(yAxisGenerator);

  const yAxisLabel = yAxis
    .append("text")
    .attr("class", "y-axis-label")
    .attr("x", -dimensions.boundedHeight / 2)
    .attr("y", -dimensions.margin.left + 110)
    .html("Reservoir Level (m)");

  //9. Generate X Axis
  const xAxisGenerator = d3.axisBottom().scale(xScale);
  const xAxis = bounds
    .append("g")
    .call(xAxisGenerator.tickFormat(d3.timeFormat("%b,%y")))
    .style("transform", `translateY(${dimensions.boundedHeight}px)`);

  //10. Add a Chart Header

  wrapper
    .append("g")
    .style("transform", `translate(${50}px,${15}px)`)
    .append("text")
    .attr("class", "title")
    .attr("x", dimensions.width / 2)
    .attr("y", dimensions.margin.top / 2)
    .attr("text-anchor", "middle")
    .text("Reservoir Level (in metres)")
    .style("font-size", "36px")
    .style("text-decoration", "underline");

  // 11. Set up interactions

  const listeningRect = bounds
    .append("rect")
    .attr("class", "listening-rect")
    .attr("width", dimensions.boundedWidth)
    .attr("height", dimensions.boundedHeight)
    .on("mousemove", onMouseMove)
    .on("mouseleave", onMouseLeave);

  const xAxisLine = bounds
    .append("g")
    .append("rect")
    .attr("class", "dotted")
    .attr("stroke-width", "1px")
    .attr("width", ".5px")
    .attr("height", dimensions.boundedHeight);

  //.style("transform", `translate(${0}px,${-5}px)`);
  function onMouseMove(e) {
    const mousePosition = d3.pointer(e, this);
    const hoveredDate = xScale.invert(mousePosition[0]);

    const getDistanceFromHoveredDate = (d) =>
      Math.abs(xAccessor(d) - hoveredDate);
    const closestIndex = d3.scan(
      dataset,
      (a, b) => getDistanceFromHoveredDate(a) - getDistanceFromHoveredDate(b)
    );
    const closestDataPoint = dataset[closestIndex];
    setCurrent(closestDataPoint);

    const closestXValue = xAccessor(closestDataPoint);
    const closestYValue = yAccessor(closestDataPoint);

    const formatDate = d3.timeFormat("%B 1, %Y");
    tooltip.select("#date-r").text(formatDate(closestXValue));

    const formatReservoir = (d) => `${d3.format(".3f")(d)} BCM`;
    tooltip.select("#reservoir-r").html(formatReservoir(closestYValue));

    const x = xScale(closestXValue) + dimensions.margin.left;
    const y = yScale(closestYValue) + dimensions.margin.top;

    //Grab the x and y position of our closest point,
    //shift our tooltip, and hide/show our tooltip appropriately

    tooltip.style(
      "transform",
      `translate(` + `calc( -50% + ${x}px),` + `calc(-100% + ${y}px)` + `)`
    );

    tooltip.style("opacity", 1);

    tooltipCircle
      .attr("cx", xScale(closestXValue))
      .attr("cy", yScale(closestYValue))
      .style("opacity", 1);

    xAxisLine.attr("x", xScale(closestXValue));
  }

  function onMouseLeave() {
    tooltip.style("opacity", 0);

    tooltipCircle.style("opacity", 0);
  }

  // Add a circle under our tooltip, right over the “hovered” point
  const tooltip = d3.select("#tooltip-r");
  const tooltipCircle = bounds
    .append("circle")
    .attr("class", "tooltip-circle-r")
    .attr("r", 4)
    .attr("stroke", "#af9358")
    .attr("fill", "white")
    .attr("stroke-width", 2)
    .style("opacity", 0);
};

const convertToDate = (d) => d.substring(0, 3) + "-1-20" + d.substring(4, 6);
const Monthly = (props) => {
  const [reservoir, setReservoir] = useState([]);
  const [storage, setStorage] = useState([]);
  const [reservoirLoading, setReservoirLoading] = useState(false);
  const [storageLoading, setStorageLoading] = useState(false);
  const [reservoirForecast, setReservoirForecast] = useState({});
  const [storageForecast, setStorageForecast] = useState({});
  const [reservoirLive, setReservoirLive] = useState({});
  const [storageLive, setStorageLive] = useState({});
  const [currentStorage, setCurrentStorage] = useState({});
  const [currentReservoir, setCurrentReservoir] = useState({});
  const [maximumStorage, setMaximumStorage] = useState("0");
  const [maximumRL, setMaximumRL] = useState("0");
  const [fill, setFill] = useState("");
  const [avgRL, setAvgRL] = useState("");
  useEffect(() => {
    setStorageLoading(true);
    setReservoirLoading(true);
    axios.get(MonthlyStorage).then((res) => {
      setStorageLoading(false);
      let storageData = csvToArray(res.data);
      // console.log(storageData);
      setStorage(storageData);
    });
    axios.get(MonthlyReservoirLevel).then((res) => {
      setReservoirLoading(false);
      let reservoirData = csvToArray(res.data);
      // console.log(reservoirData);
      setReservoir(reservoirData);
    });
  }, []);
  useEffect(() => {
    setMaximumStorage(
      storage
        .reduce(
          (acc, x) =>
            acc > Number(x["Storage[ BCM]"]) ? acc : Number(x["Storage[ BCM]"]),
          0
        )
        .toString()
    );
    let forecast = storage[storage.length - 1];
    setFill(
      Object.keys(forecast || {}).filter((k) =>
        k.startsWith("%Fill") ? true : false
      )[0]
    );

    // console.log(forecast);
    setCurrentStorage(forecast);
    setStorageForecast(forecast);
    setStorageLive(storage[storage.length - 2]);
  }, [storage]);
  useEffect(() => {
    setMaximumRL(
      reservoir
        .reduce(
          (acc, x) =>
            acc > Number(x["Reservoir Level [metres]"])
              ? acc
              : Number(x["Reservoir Level [metres]"]),
          0
        )
        .toString()
    );
    let forecast = reservoir[reservoir.length - 1];
    // console.log(forecast);
    setAvgRL(
      Object.keys(forecast || {}).filter((k) =>
        k.startsWith("Last 10 Year Average Level") ? true : false
      )[0]
    );

    setCurrentReservoir(forecast);
    setReservoirForecast(forecast);
    setReservoirLive(reservoir[reservoir.length - 2]);
  }, [reservoir]);
  useEffect(() => {
    storage.length && drawStorageChart(storage, setCurrentStorage);
  }, [storage, setCurrentStorage]);
  useEffect(() => {
    reservoir.length && drawReservoirChart(reservoir, setCurrentReservoir);
  }, [reservoir, setCurrentReservoir]);
  return (
    <div className={classes.Monthly}>
      <Sidebar />
      <Grid>
        <Grid.Row style={{ fontSize: "1.75rem" }}>
          <Grid.Column width="3">
            <div
              style={{
                backgroundColor: "gold",
                padding: "2.75rem 0.75rem",
              }}
            >
              Date:{" "}
              {(reservoirForecast &&
                reservoirForecast.Dates &&
                reservoirForecast.Dates.substring(0, 3) +
                  "-1-20" +
                  reservoirForecast.Dates.substring(4, 6)) ||
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
                  style={{ padding: "1rem 1rem", textAlign: "right" }}
                  width="5"
                >
                  Live Data{" "}
                  {(reservoirLive &&
                    reservoirLive.Dates &&
                    reservoirLive.Dates.substring(0, 4) +
                      "20" +
                      reservoirLive.Dates.substring(4, 6)) ||
                    "NA"}
                </Grid.Column>
                <Grid.Column
                  width="5"
                  style={{ padding: "1rem 1rem 1rem 6rem" }}
                >
                  Storage :{" "}
                  {(storageLive && formatTo3(storageLive["Storage[ BCM]"])) ||
                    "NA"}{" "}
                  BCM
                </Grid.Column>
                <Grid.Column
                  width="6"
                  style={{ padding: "1rem 1rem 1rem 3rem" }}
                >
                  Reservoir Level :{" "}
                  {(reservoirLive &&
                    formatTo3(reservoirLive["Reservoir Level [metres]"])) ||
                    "NA"}
                  m
                </Grid.Column>
              </Grid.Row>
              <Grid.Row style={{ color: "red", paddingTop: 0 }}>
                <Grid.Column
                  style={{ padding: "1rem 1rem", textAlign: "right" }}
                  width="5"
                >
                  Forecasted Data{" "}
                  {(reservoirForecast &&
                    reservoirForecast.Dates &&
                    reservoirForecast.Dates.substring(0, 4) +
                      "20" +
                      reservoirForecast.Dates.substring(4, 6)) ||
                    "NA"}
                </Grid.Column>
                <Grid.Column
                  width="5"
                  style={{ padding: "1rem 1rem 1rem 6rem" }}
                >
                  Storage :{" "}
                  {(storageForecast &&
                    formatTo3(storageForecast["Storage[ BCM]"])) ||
                    "NA"}{" "}
                  BCM
                </Grid.Column>
                <Grid.Column
                  width="6"
                  style={{ padding: "1rem 1rem 1rem 3rem" }}
                >
                  Reservoir Level :{" "}
                  {reservoirForecast &&
                    formatTo3(
                      reservoirForecast["Reservoir Level [metres]"] || "NA"
                    )}
                  m
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row style={{ padding: "0 0 0 1rem", height: "240px" }} stretched>
          <Grid.Column
            width="8"
            style={{
              backgroundColor: "#ffff6e",
              borderRight: "0.5rem solid #8b0000",
            }}
          >
            <h1 style={{ fontSize: "2.5rem", margin: "3rem 0.5rem" }}>
              Storage
            </h1>
            <h3
              style={{
                fontSize: "1.25rem",
                marginLeft: "0.75rem",
                marginBottom: "2rem",
              }}
            >
              Maximum Storage: {formatTo3(maximumStorage) || "NA"} BCM
            </h3>
            <div
              style={{
                position: "absolute",
                right: "1rem",
                top: "1rem",
                height: "210px",
                width: "400px",
                backgroundColor: "gold",
                padding: "0.5rem",
              }}
            >
              <h4>
                Date :{" "}
                {(currentStorage &&
                  currentStorage.Dates &&
                  convertToDate(currentStorage.Dates)) ||
                  "NA"}
              </h4>
              <h4>
                Storage :{" "}
                {(currentStorage &&
                  currentStorage["Storage[ BCM]"] &&
                  formatTo3(currentStorage["Storage[ BCM]"])) ||
                  "NA"}{" "}
                BCM
              </h4>
              <h4>
                % Fill :{" "}
                {(currentStorage &&
                  currentStorage[fill] &&
                  formatTo3(currentStorage[fill])) ||
                  "NA"}
                %
              </h4>
              <h4>
                Last Year Storage :{" "}
                {(currentStorage &&
                  currentStorage["Last Year Storage (BCM)"] &&
                  formatTo3(currentStorage["Last Year Storage (BCM)"])) ||
                  "NA"}{" "}
                BCM
              </h4>
              <h4>
                Last 10 Year Average Storage :{" "}
                {(currentStorage &&
                  currentStorage["Last 10 Year Average Storage (BCM)"] &&
                  formatTo3(
                    currentStorage["Last 10 Year Average Storage (BCM)"]
                  )) ||
                  "NA"}{" "}
                BCM
              </h4>
            </div>
          </Grid.Column>
          <Grid.Column
            width="8"
            style={{
              position: "relative",
              backgroundColor: "#ffff6e",
              borderLeft: "0.5rem solid #8b0000",
            }}
          >
            <h1 style={{ fontSize: "2.5rem", margin: "3rem 0.5rem" }}>
              Reservoir Levels
            </h1>
            <h3
              style={{
                fontSize: "1.25rem",
                marginLeft: "0.75rem",
                marginBottom: "2rem",
              }}
            >
              Maximum RL : {formatTo3(maximumRL) || "NA"}m
            </h3>
            <div
              style={{
                position: "absolute",
                right: "1rem",
                top: "1rem",
                height: "210px",
                width: "400px",
                backgroundColor: "gold",
                padding: "0.5rem",
              }}
            >
              <h4>
                Date :{" "}
                {(currentReservoir &&
                  currentReservoir.Dates &&
                  convertToDate(currentReservoir.Dates)) ||
                  "NA"}
              </h4>
              <h4>
                Reservoir Level :{" "}
                {(currentReservoir &&
                  currentReservoir["Reservoir Level [metres]"] &&
                  formatTo3(currentReservoir["Reservoir Level [metres]"])) ||
                  "NA"}
                m
              </h4>
              <h4>
                Last Year RL :{" "}
                {(currentReservoir &&
                  currentReservoir["Last Year Level (m)"] &&
                  formatTo3(currentReservoir["Last Year Level (m)"])) ||
                  "NA"}
                m
              </h4>
              <h4>
                Last 10 yrs Average RL :{" "}
                {(currentReservoir &&
                  currentReservoir[avgRL] &&
                  formatTo3(currentReservoir[avgRL])) ||
                  "NA"}
                m
              </h4>
            </div>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row stretched>
          <Grid.Column width="8">
            {storageLoading && (
              <h2 style={{ color: "whitesmoke" }}>Loading...</h2>
            )}

            <div
              id="wrapper"
              className="wrapper"
              style={{ backgroundColor: "gold" }}
            >
              <div id="tooltip" className="tooltip">
                <div className="tooltip-date">
                  <span id="date"></span>
                </div>
                <div className="tooltip-Storage">
                  Storage: <span id="storage"></span>
                </div>
              </div>
            </div>
          </Grid.Column>
          <Grid.Column width="8">
            {reservoirLoading && (
              <h2 style={{ color: "whitesmoke" }}>Loading...</h2>
            )}
            <div
              id="wrapper-r"
              className="wrapper-r"
              style={{ backgroundColor: "gold" }}
            >
              <div id="tooltip-r" className="tooltip-r">
                <div className="tooltip-date-r">
                  <span id="date-r"></span>
                </div>
                <div className="tooltip-Reservoir-r">
                  Reservoir Level: <span id="reservoir-r"></span>
                </div>
              </div>
            </div>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  );
};

export default Monthly;
