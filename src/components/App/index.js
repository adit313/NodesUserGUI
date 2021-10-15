import React, { Component } from "react";
import logo from "./titlewologo.png";
import logoImg from "./logo.png";
import { Container, Row, Col, Button } from "react-bootstrap";

import "./style.css";
// import Block from "./../Block";
import Home from "./../Home";
import { BrowserRouter as Router, Route } from "react-router-dom";

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <Container fluid>
            <Row className="justify-content-md-center">
              <Col md="auto">
                <img src={logoImg} className="App-logo" alt="logo" />
              </Col>
              <Col md="auto">
                <img src={logo} className="App-logo" alt="logo" />
              </Col>
            </Row>
            <Row>
              <Col>
                <h1 className="tagline text-white">
                  Next Generation Blockchain Testnet Explorer
                </h1>
              </Col>
            </Row>

            <Row>
              <Col>
                <h6 className="White-paper mb-2 text-white">
                  If you are unfamiliar with our network or the work we are
                  doing, check out our white paper here:
                  <Button
                    variant="outline-light"
                    size="sm"
                    href="https://www.stardust.finance/whitepaper"
                  >
                    White Paper
                  </Button>
                </h6>
              </Col>
            </Row>
          </Container>
        </div>
        <div className="App-nav">
          <Router>
            <div>
              <Route exact path="/" component={Home} />
              {/* <Route
                exact
                path="/block"
                render={() => <h3>Please select a blockHash.</h3>}
              />
              <Route path="/block/:blockHash" component={Block} /> */}
            </div>
          </Router>
        </div>
      </div>
    );
  }
}
export default App;
