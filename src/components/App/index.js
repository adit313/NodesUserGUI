import React, { Component } from "react";
import logo from "./titlewologo.png";
import logoImg from "./logo.png";
import { Container, Row, Col, Button, Image, Figure } from "react-bootstrap";
import whitePaperImg from "./whitePaper.png";

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
              <Col></Col>
              <Col md={6}>
                <Row className="justify-content-md-center">
                  <Col md="auto">
                    <Image src={logoImg} className="App-logo" alt="logo" />
                  </Col>
                  <Col md="auto">
                    <Image src={logo} className="App-logo" fluid alt="logo" />
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <h1 className="tagline">Next Generation Blockchain</h1>
                  </Col>
                </Row>
              </Col>

              <Col>
                <a href="https://www.stardust.finance/whitepaper">
                  <Figure className="white-paper-figure">
                    <Figure.Image width={65} height={100} src={whitePaperImg} />
                    <Figure.Caption text="white">
                      The White Paper
                    </Figure.Caption>
                  </Figure>
                </a>
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
