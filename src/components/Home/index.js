import React, { Component } from "react";
import {
  Card,
  Form,
  Button,
  Container,
  Row,
  Col,
  Table,
} from "react-bootstrap";
let crypto;
try {
  crypto = require("crypto");
} catch (err) {
  console.log("crypto support is disabled!");
}

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      block_ids: [],
      block_hashes: [],
      curr_commit_node_block: null,
      curr_mining_node_block: null,
      curr_clearing_node_block: null,
      submit_disabled: true,
      show_alert: false,
      amount: null,
      destination: null,
      transaction_hash: null,
      sender: null,
      sender_public_key: null,
      sender_signature: null,
      tx_fee: null,
      nonce: null,
    };

    this.onPrepareBtnClick = this.onPrepareBtnClick.bind(this);
    this.onSubmitBtnClick = this.onSubmitBtnClick.bind(this);
  }

  onPrepareBtnClick() {
    const inputElement = document.getElementById("keyTextInput");
    console.log("clicked");
    if (inputElement.value.startsWith("-----BEGIN RSA PRIVATE KEY-----")) {
      const sign = crypto.createSign("RSA-SHA256");
      let forge = require("node-forge");
      let pki = require("node-forge").pki;
      try {
        let privateKey = pki.privateKeyFromPem(inputElement.value);
        let publicKey = pki.setRsaPublicKey(privateKey.n, privateKey.e);

        let public_key_string = JSON.stringify(
          pki.publicKeyToPem(publicKey)
        ).replaceAll("\\r", "");
        public_key_string = JSON.parse(public_key_string);
        console.log(public_key_string);
        var md2 = forge.md.sha256.create();
        md2.update(public_key_string);
        console.log(
          Buffer.from(md2.digest().toHex(), "hex").toString("base64")
        );

        let sender_public_key = public_key_string;
        let sender = Buffer.from(md2.digest().toHex(), "hex").toString(
          "base64"
        );
        fetch(
          "https://commit.stardust.finance/account/" +
            encodeURIComponent(sender)
        )
          .then((response) => response.json())
          .then((data) =>
            this.setState({ nonce: parseInt(data["highest_nonce"], 10) + 1 })
          );

        var md_transaction_hash = forge.md.sha256.create();
        var amount = 10.0;
        var hash_amount_string = String(amount);
        if (amount % 1 === 0) {
          hash_amount_string = String(amount) + ".0";
        }
        var destination = "0aKRMjy4GmRKZ2Ui4Zc8z9fqYOLTzwu9QD/JkGLd5Qw=";
        var tx_fee = 0.0;
        var hash_tx_fee_string = String(tx_fee);
        if (tx_fee % 1 === 0) {
          hash_tx_fee_string = String(tx_fee) + ".0";
        }
        var nonce = String(4);

        md_transaction_hash.update(
          hash_amount_string +
            destination +
            nonce +
            sender +
            sender_public_key +
            hash_tx_fee_string
        );

        let temp = JSON.stringify(md_transaction_hash.digest().toHex());
        let transaction_hash = JSON.parse(temp);

        sign.write(transaction_hash);
        sign.end();
        let sig = sign.sign(inputElement.value, "hex");
        console.log(sig);
        this.setState({
          amount: null,
          destination: null,
          transaction_hash: transaction_hash,
          sender: sender,
          sender_public_key: sender_public_key,
          sender_signature: sig,
          tx_fee: hash_tx_fee_string,
          nonce: nonce,
          submit_disabled: false,
        });
      } catch (e) {
        console.log("Invalid private key");
      }
    } else {
      console.log("Invalid private key");
    }
  }

  onSubmitBtnClick() {
    const inputElement = document.getElementById("keyTextInput");
    console.log("clicked");
    const sign = crypto.createSign("RSA-SHA256");
    let forge = require("node-forge");
    let pki = require("node-forge").pki;
    let privateKey = pki.privateKeyFromPem(inputElement.value);
    let publicKey = pki.setRsaPublicKey(privateKey.n, privateKey.e);

    let public_key_string = JSON.stringify(
      pki.publicKeyToPem(publicKey)
    ).replaceAll("\\r", "");
    public_key_string = JSON.parse(public_key_string);
    console.log(public_key_string);
    var md2 = forge.md.sha256.create();
    md2.update(public_key_string);
    console.log(Buffer.from(md2.digest().toHex(), "hex").toString("base64"));

    let sender_public_key = public_key_string;
    let sender = Buffer.from(md2.digest().toHex(), "hex").toString("base64");

    var md_transaction_hash = forge.md.sha256.create();
    var amount = 10.0;
    var hash_amount_string = String(amount);
    if (amount % 1 === 0) {
      hash_amount_string = String(amount) + ".0";
    }
    var destination = "0aKRMjy4GmRKZ2Ui4Zc8z9fqYOLTzwu9QD/JkGLd5Qw=";
    var tx_fee = 0.0;
    var hash_tx_fee_string = String(tx_fee);
    if (tx_fee % 1 === 0) {
      hash_tx_fee_string = String(tx_fee) + ".0";
    }
    var nonce = String(4);

    md_transaction_hash.update(
      hash_amount_string +
        destination +
        nonce +
        sender +
        sender_public_key +
        hash_tx_fee_string
    );

    let temp = JSON.stringify(md_transaction_hash.digest().toHex());
    let transaction_hash = JSON.parse(temp);

    sign.write(transaction_hash);
    sign.end();
    let sig = sign.sign(inputElement.value, "hex");
    console.log(sig);

    let payload = {
      amount: null,
      destination: null,
      transaction_hash: transaction_hash,
      sender: sender,
      sender_public_key: sender_public_key,
      sender_signature: sig,
      tx_fee: hash_tx_fee_string,
      nonce: nonce,
    };

    fetch("http://commit.stardust.finance/new_transaction", {
      method: "POST",
      body: JSON.stringify(payload),
    }).then((res) => {
      console.log("Request complete! response:", res);
    });
  }

  componentDidMount() {
    fetch("https://commit.stardust.finance/current_block")
      .then((response) => response.json())
      .then((data) =>
        this.setState({
          curr_commit_node_block: data,
        })
      );
    fetch("https://mining.stardust.finance/current_block")
      .then((response) => response.json())
      .then((data) =>
        this.setState({
          curr_mining_node_block: data,
        })
      );
    fetch("https://clearing.stardust.finance/open_blocks")
      .then((response) => response.json())
      .then((data) =>
        this.setState({
          curr_clearing_node_block: data[0],
        })
      );
  }

  render() {
    return (
      <div className="Home">
        <div>
          <Container fluid>
            <Row>
              <Col>
                <h1 className="Tagline">Block Explorer</h1>
              </Col>
            </Row>
            <Row>
              <Col>
                <h3 className="Current-state">
                  The current state of the node networks
                </h3>
              </Col>
            </Row>
          </Container>
          <Container fluid>
            <Row>
              <Col>
                <Card className="box">
                  <Card.Body>
                    <Card.Title tag="h5">Commit Node Current Block</Card.Title>
                    <Card.Subtitle tag="h6" className="mb-2 text-muted">
                      Block Hash:{" "}
                      {this.state.curr_commit_node_block
                        ? "..." +
                          this.state.curr_commit_node_block.block_hash.slice(
                            -10
                          )
                        : " "}
                    </Card.Subtitle>
                    <Card.Text>
                      Solution Hash:{" "}
                      {this.state.curr_commit_node_block
                        ? "..." +
                          this.state.curr_commit_node_block.solution_hash.slice(
                            -10
                          )
                        : " "}
                    </Card.Text>
                    <Table striped bordered responsive size="sm">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Hash</th>
                          <th>Status</th>
                          <th>Source</th>
                          <th>Amount</th>
                          <th>Destination</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.curr_commit_node_block
                          ? this.state.curr_commit_node_block.confirmed_transactions.map(
                              function (txn, index) {
                                return (
                                  <tr>
                                    <td>{txn.transaction_index}</td>
                                    <td>
                                      {"..." + txn.transaction_hash.slice(-10)}
                                    </td>
                                    <td>{txn.status}</td>
                                    <td>{txn.sender}</td>
                                    <td>
                                      {txn.amount != null
                                        ? txn.amount
                                        : "Not yet disclosed"}
                                    </td>
                                    <td>
                                      {txn.destination
                                        ? txn.destination
                                        : "Not yet disclosed"}
                                    </td>
                                  </tr>
                                );
                              }
                            )
                          : null}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
              <Col>
                <Card className="box">
                  <Card.Body>
                    <Card.Title tag="h5">
                      Clearing Node Current Block
                    </Card.Title>
                    <Card.Subtitle tag="h6" className="mb-2 text-muted">
                      Block Hash:{" "}
                      {this.state.curr_clearing_node_block
                        ? "..." +
                          this.state.curr_clearing_node_block.block_hash.slice(
                            -10
                          )
                        : " "}
                    </Card.Subtitle>
                    <Card.Text>
                      Solution Hash:{" "}
                      {this.state.curr_clearing_node_block
                        ? "..." +
                          this.state.curr_clearing_node_block.solution_hash.slice(
                            -10
                          )
                        : " "}
                    </Card.Text>
                    <Table striped bordered responsive size="sm">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Hash</th>
                          <th>Status</th>
                          <th>Source</th>
                          <th>Amount</th>
                          <th>Destination</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.curr_clearing_node_block
                          ? this.state.curr_clearing_node_block.confirmed_transactions.map(
                              function (txn, index) {
                                return (
                                  <tr>
                                    <td>{txn.transaction_index}</td>
                                    <td>
                                      {"..." + txn.transaction_hash.slice(-10)}
                                    </td>
                                    <td>{txn.status}</td>
                                    <td>{txn.sender}</td>
                                    <td>
                                      {txn.amount != null
                                        ? txn.amount
                                        : "Not yet disclosed"}
                                    </td>
                                    <td>
                                      {txn.destination
                                        ? txn.destination
                                        : "Not yet disclosed"}
                                    </td>
                                  </tr>
                                );
                              }
                            )
                          : null}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
              <Col>
                <Card className="box">
                  <Card.Body>
                    <Card.Title tag="h5">Mining Node Current Block</Card.Title>
                    <Card.Subtitle tag="h6" className="mb-2 text-muted">
                      Block Hash:{" "}
                      {this.state.curr_mining_node_block
                        ? "..." +
                          this.state.curr_mining_node_block.block_hash.slice(
                            -10
                          )
                        : " "}
                    </Card.Subtitle>
                    <Card.Text>
                      Solution Hash:{" "}
                      {this.state.curr_mining_node_block
                        ? "..." +
                          this.state.curr_mining_node_block.solution_hash.slice(
                            -10
                          )
                        : " "}
                    </Card.Text>
                    <Table striped bordered responsive size="sm">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Hash</th>
                          <th>Status</th>
                          <th>Source</th>
                          <th>Amount</th>
                          <th>Destination</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.curr_mining_node_block
                          ? this.state.curr_mining_node_block.confirmed_transactions.map(
                              function (txn, index) {
                                return (
                                  <tr>
                                    <td>{txn.transaction_index}</td>
                                    <td>
                                      {"..." + txn.transaction_hash.slice(-10)}
                                    </td>
                                    <td>{txn.status}</td>
                                    <td>{txn.sender}</td>
                                    <td>
                                      {txn.amount != null
                                        ? txn.amount
                                        : "Not yet disclosed"}
                                    </td>
                                    <td>
                                      {txn.destination
                                        ? txn.destination
                                        : "Not yet disclosed"}
                                    </td>
                                  </tr>
                                );
                              }
                            )
                          : null}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
        <div className="form">
          <h3 className="form-title">
            Create a new transaction using the following form
          </h3>
          <Form>
            <Container fluid>
              <Row>
                <Col>
                  <Form.Group className="mb-3" controlId="txAmount">
                    <Form.Label>Amount</Form.Label>
                    <Form.Control type="email" placeholder="Enter Amount" />
                    <Form.Text className="text-muted">
                      Amount to transfer exclusive of fees.
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3" controlId="txDestination">
                    <Form.Label>Destination Address</Form.Label>
                    <Form.Control
                      type="txDestination"
                      placeholder="Your Base 64 Destination"
                    />
                    <Form.Text className="text-muted">
                      This is your target destination's base64 address
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3" controlId="txFee">
                    <Form.Label>Transaction Fee</Form.Label>
                    <Form.Control type="txFee" placeholder="0" />
                    <Form.Text className="text-muted">
                      This is your bidded transaction fee bid.
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Form.Group className="mb-3" controlId="keyTextInput">
                  <Form.Label>Your Private Key</Form.Label>
                  <Form.Control as="textarea" rows={10} />
                  <Form.Text className="text-muted">
                    Please paste in your private key. Even though your key will
                    never leave this browser window, please do not use any
                    sensitive keys for our test.
                  </Form.Text>
                </Form.Group>
              </Row>
              <Row>
                <Col>
                  <Form.Group className="mb-3" controlId="sender">
                    <Form.Label>Sender (Your) Address</Form.Label>
                    <Form.Control
                      type="sender"
                      readOnly
                      defaultValue={this.state.sender}
                    />
                    <Form.Text className="text-muted">
                      This is your sender address, the base64 SHA256 of your
                      public key.
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3" controlId="txHash">
                    <Form.Label>Transaction Hash</Form.Label>
                    <Form.Control
                      type="txHash"
                      readOnly
                      defaultValue={this.state.transaction_hash}
                    />
                    <Form.Text className="text-muted">
                      This is the transaction hash, a SHA256 hash of the amount,
                      destination, nonce, sender, sender public key, and tx fee.
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3" controlId="txNonce">
                    <Form.Label>Nonce</Form.Label>
                    <Form.Control
                      type="txNonce"
                      readOnly
                      defaultValue={this.state.nonce}
                    />
                    <Form.Text className="text-muted">
                      This is a one time nonce that is must always be higher
                      than your last transaction.
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Form.Group className="mb-3" controlId="senderPublicKey">
                    <Form.Label>Sender (Your) Public Key</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={10}
                      type="senderPublicKey"
                      readOnly
                      defaultValue={this.state.sender_public_key}
                    />
                    <Form.Text className="text-muted">
                      This is your sender public key associated with the private
                      key.
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3" controlId="senderSig">
                    <Form.Label>Sender Signature</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={10}
                      type="senderSig"
                      readOnly
                      defaultValue={this.state.sender_signature}
                    />
                    <Form.Text className="text-muted">
                      This is the transaction hash signed by your private key.
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
              <Button onClick={this.onPrepareBtnClick}>Prepare</Button>{" "}
              <Button
                onClick={this.onSubmitBtnClick}
                disabled={this.state.submit_disabled}
              >
                Submit
              </Button>
            </Container>
          </Form>
        </div>
      </div>
    );
  }
}

export default Home;
