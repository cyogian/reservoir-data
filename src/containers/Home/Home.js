import React from "react";
import { Grid, GridColumn } from "semantic-ui-react";
import Sidebar from "../../hocs/Layout/Sidebar/Sidebar";
import classes from "./Home.module.scss";
import dam from "../../assets/images/dam.png";
const Home = (props) => {
  return (
    <div className={classes.Home}>
      <Sidebar />
      <Grid>
        <Grid.Row>
          <Grid.Column width="16">
            <h1
              style={{
                backgroundColor: "#ffff6e",
                fontSize: "3.5rem",
                padding: "1.5rem",
                textAlign: "center",
              }}
            >
              KRS RESERVOIR FUTURE WATER SCENARIO DASHBOARD
            </h1>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row stretched>
          <GridColumn width="5">
            <p
              style={{
                height: "fit-content",
                backgroundColor: "gold",
                fontSize: "1.75rem",
                padding: "1rem",
              }}
            >
              Bangalore, the capital city of Karnataka fulfills its water supply
              demand by receiving rainfall mainly from the Krishnarajasagar
              (KRS) reservoir and the Kabini reservoir . The Bangalore Water
              Supply and Sewage Board(BWSSB) transports water from Shivasamudra
              (intake point of water 100kms away from Bangalore) which receives
              input from KRS reservoir to the main city.The city requires about
              1445 MLD for flourishing 9.5 million population spread over 800 sq
              km.
            </p>
          </GridColumn>
          <GridColumn width="11">
            <Grid>
              <Grid.Row stretched>
                <Grid.Column width="7">
                  <p
                    style={{
                      height: "fit-content",
                      backgroundColor: "gold",
                      fontSize: "1.75rem",
                      padding: "1rem",
                    }}
                  >
                    From the past data analysis, it has been found that KRS and
                    Kabini reservoir have faced significant stress periods
                    wherein reservoir levels have reached minimum dead storage
                    levels. Thus, pertaining to this rising concern of
                    “uncertainty of water for urban water supply in Bangalore" ,
                    there is a need to monitor and forecast the reservoir water
                    levels and storage volumes.
                  </p>
                </Grid.Column>
                <Grid.Column width="9" style={{ position: "relative" }}>
                  <img
                    src={dam}
                    alt="Krishnaraja Sagar dam in Srirangapatna taluk. Credits: DH Photo"
                  />
                  <p
                    style={{
                      position: "absolute",
                      bottom: "0",
                      left: "1rem",
                      backgroundColor: "#ffff6e",
                      padding: "0.5rem",
                      width: "calc(100% - 2rem)",
                      textAlign: "center",
                      fontWeight: "500",
                    }}
                  >
                    Krishnaraja Sagar dam in Srirangapatna taluk. Credits: DH
                    Photo
                  </p>
                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <Grid.Column width="16">
                  <p
                    style={{
                      backgroundColor: "#e27000",
                      fontSize: "1.75rem",
                      padding: "1rem",
                      color: "black",
                    }}
                  >
                    HydroR, [team of Wave2Web Hackathon-supported by Microsoft
                    and BlackRock and organised by WRI, India] have made an
                    attempt to develop a predictive model to forecast 1 month
                    real time water availability in Krishna Raja Sagar
                    reservoir.
                  </p>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </GridColumn>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width="16">
            <div
              style={{ backgroundColor: "#ffff6e", height: "7.25rem" }}
            ></div>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  );
};

export default Home;
