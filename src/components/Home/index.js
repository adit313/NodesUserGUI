import React, { Component } from "react";
import {
  Alert,
  Card,
  Form,
  Button,
  Container,
  Row,
  Col,
  Table,
  Modal,
  Spinner,
} from "react-bootstrap";
import Steps from "../Steps";
import FAQsContainer from "../Steps/FAQsContainer.js";

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
      balance: "n/a",
      block_ids: [],
      block_hashes: [],
      curr_commit_node_block: null,
      curr_mining_node_block: null,
      curr_clearing_node_block: null,
      curr_closed_block: null,
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
      validated: null,
      showAlert: false,
      alertMessage: "",
      alertVariant: "danger",
      isMining: false,
      showModal: false,
      yourPrivateKey: "",
      loadingNewKey: false,
    };

    this.onPrepareBtnClick = this.onPrepareBtnClick.bind(this);
    this.onSubmitBtnClick = this.onSubmitBtnClick.bind(this);
    this.onUseOurKeyClicked = this.onUseOurKeyClicked.bind(this);
    this.onMineClick = this.onMineClick.bind(this);
    this.refreshData = this.refreshData.bind(this);
    this.onRevealBtnClick = this.onRevealBtnClick.bind(this);
    this.onUseOurAddressClicked = this.onUseOurAddressClicked.bind(this);
    this.onGetAddressClicked = this.onGetAddressClicked.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
    this.newKeysGenerated = this.newKeysGenerated.bind(this);
  }

  onPrepareBtnClick() {
    this.setState({
      alertMessage: "",
      showAlert: false,
    });

    const inputElement = document.getElementById("keyTextInput");
    const tx_fee_input = document.getElementById("txFee");
    const tx_amount_input = document.getElementById("txAmount");
    const tx_destination_input = document.getElementById("txDestination");
    var checks = true;

    if (
      tx_fee_input.value === "" ||
      !/^\d+\.\d+$|^\d+$/.test(tx_fee_input.value)
    ) {
      checks = false;
      this.setState({
        alertMessage: "Transaction Fee is a required field and must be numeric",
        showAlert: true,
        alertVariant: "danger",
      });
    }

    if (
      tx_destination_input.value === "" ||
      tx_destination_input.value.length !== 44 ||
      !/^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/.test(
        tx_destination_input.value
      )
    ) {
      checks = false;
      this.setState({
        alertMessage:
          "Transaction destination is a required field and must be a valid base64 sting",
        showAlert: true,
        alertVariant: "danger",
      });
    }

    if (
      tx_amount_input.value === "" ||
      !/^\d+\.\d+$|^\d+$/.test(tx_amount_input.value)
    ) {
      checks = false;
      this.setState({
        alertMessage:
          "Transaction amount is a required field and must be numeric",
        showAlert: true,
        alertVariant: "danger",
      });
    }

    if (
      inputElement.value.startsWith("-----BEGIN RSA PRIVATE KEY-----") &&
      checks
    ) {
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
        var md2 = forge.md.sha256.create();
        md2.update(public_key_string);
        let sender_public_key = public_key_string;
        let sender = Buffer.from(md2.digest().toHex(), "hex").toString(
          "base64"
        );
        fetch(
          "https://commit.stardust.finance/account/" +
            encodeURIComponent(sender)
        )
          .then((response) => response.json())
          .then((data) => {
            var balance = data ? parseFloat(data["confirmed_balance"]) : "n/a";
            var nonce = 1;
            if (data && data["highest_nonce"]) {
              nonce = parseInt(data["highest_nonce"], 10) + 1;
            }
            var md_transaction_hash = forge.md.sha256.create();
            var amount = parseFloat(tx_amount_input.value);
            var hash_amount_string = String(amount);
            if (amount % 1 === 0) {
              hash_amount_string = String(amount) + ".0";
            }
            var destination = tx_destination_input.value;
            var tx_fee = parseFloat(tx_fee_input.value);
            var hash_tx_fee_string = String(tx_fee);
            if (tx_fee % 1 === 0) {
              hash_tx_fee_string = String(tx_fee) + ".0";
            }

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
            inputElement.value = pki.privateKeyToPem(privateKey);
            let sig = sign.sign(inputElement.value, "hex");
            if (balance === "n/a" || amount > balance) {
              this.setState({
                amount: hash_amount_string,
                balance: balance,
                destination: destination,
                transaction_hash: transaction_hash,
                sender: sender,
                sender_public_key: sender_public_key,
                sender_signature: sig,
                tx_fee: hash_tx_fee_string,
                nonce: nonce,
                submit_disabled: true,
                alertMessage: "Insufficient Balance",
                showAlert: true,
              });
            } else {
              this.setState({
                amount: hash_amount_string,
                balance: balance,
                destination: destination,
                transaction_hash: transaction_hash,
                sender: sender,
                sender_public_key: sender_public_key,
                sender_signature: sig,
                tx_fee: hash_tx_fee_string,
                nonce: nonce,
                submit_disabled: false,
                alertMessage: "",
                showAlert: false,
              });
            }
          });
      } catch (e) {
        this.setState({
          alertMessage: "Invalid private key",
          showAlert: true,
          alertVariant: "danger",
        });
      }
    }
  }

  onSubmitBtnClick() {
    let payload = {
      amount: null,
      destination: null,
      transaction_hash: this.state.transaction_hash,
      sender: this.state.sender,
      sender_public_key: this.state.sender_public_key,
      sender_signature: this.state.sender_signature,
      tx_fee: this.state.tx_fee,
      nonce: this.state.nonce,
    };

    fetch("https://commit.stardust.finance/new_transaction", {
      method: "POST",
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          alertMessage: data,
          showAlert: true,
          alertVariant: "info",
          submit_disabled: true,
        });
        fetch("https://mining.stardust.finance/unconfirmed_transactions/0")
          .then((response) => response.json())
          .then((data) =>
            this.setState({
              curr_mining_node_block: data,
            })
          );
      });
  }

  onRevealBtnClick() {
    let forge = require("node-forge");
    var md_transaction_hash = forge.md.sha256.create();
    md_transaction_hash.update(
      this.state.amount +
        this.state.destination +
        (this.state.nonce - 1) +
        this.state.sender +
        this.state.sender_public_key +
        this.state.tx_fee
    );

    let temp = JSON.stringify(md_transaction_hash.digest().toHex());
    let transaction_hash = JSON.parse(temp);

    const sign = crypto.createSign("RSA-SHA256");
    const inputElement = document.getElementById("keyTextInput");
    sign.write(transaction_hash);
    sign.end();
    let sig = sign.sign(inputElement.value, "hex");

    let payload = {
      amount: this.state.amount,
      destination: this.state.destination,
      transaction_hash: transaction_hash,
      sender: this.state.sender,
      sender_public_key: this.state.sender_public_key,
      sender_signature: sig,
      tx_fee: this.state.tx_fee,
      nonce: this.state.nonce - 1,
    };

    console.log(payload);
    fetch("https://clearing.stardust.finance/append_information", {
      method: "POST",
      body: JSON.stringify(payload),
    })
      .then((response) => {
        console.log(response);
        return response.json();
      })
      .then((data) => {
        console.log(data);
        this.setState({
          alertMessage: data,
          showAlert: true,
          alertVariant: "info",
          submit_disabled: true,
        });
        setTimeout(this.refreshData, 2000);
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
    fetch("https://mining.stardust.finance/unconfirmed_transactions")
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
    fetch("https://commit.stardust.finance/closed_block")
      .then((response) => response.json())
      .then((data) =>
        this.setState({
          curr_closed_block: data,
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
                <h1 className="Tagline">Executive Summary</h1>
                <FAQsContainer />
              </Col>
            </Row>
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
                <Card className="box commit-card">
                  <Card.Body>
                    <Card.Title tag="h5">Commit Node Blocks</Card.Title>
                    <Card.Subtitle tag="h6" className="mb-2 text-muted">
                      This is the most recent block added to the chain. You can
                      see all the transactions have a status of waiting
                    </Card.Subtitle>
                    <Card.Text>
                      Most Recent Block Hash:{" "}
                      {this.state.curr_commit_node_block
                        ? this.state.curr_commit_node_block.block_hash
                        : " "}
                      <br />
                      Block Height:{" "}
                      {this.state.curr_commit_node_block
                        ? this.state.curr_commit_node_block.block_height
                        : " "}
                    </Card.Text>
                    <Table hover striped bordered responsive size="sm">
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
                                  <tr key={index}>
                                    <td>{txn.transaction_index}</td>
                                    <td>{txn.transaction_hash}</td>
                                    <td>{txn.status}</td>
                                    <td>{txn.sender}</td>
                                    <td>
                                      {txn.amount != null
                                        ? txn.amount
                                        : "In Clearing"}
                                    </td>
                                    <td>
                                      {txn.destination
                                        ? txn.destination
                                        : "In Clearing"}
                                    </td>
                                  </tr>
                                );
                              }
                            )
                          : null}
                      </tbody>
                    </Table>
                    <hr />
                    <Card.Subtitle tag="h6" className="mb-2 text-muted">
                      This is the most recent closed block on the chain. You can
                      see all the transactions were either cleared or failed.
                    </Card.Subtitle>
                    <Card.Text>
                      Most Recent Block Hash:{" "}
                      {this.state.curr_closed_block
                        ? this.state.curr_closed_block.block_hash
                        : " "}
                      <br />
                      Block Height:{" "}
                      {this.state.curr_closed_block
                        ? this.state.curr_closed_block.block_height
                        : " "}
                    </Card.Text>
                    <Table hover striped bordered responsive size="sm">
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
                        {this.state.curr_closed_block
                          ? this.state.curr_closed_block.confirmed_transactions.map(
                              function (txn, index) {
                                return (
                                  <tr key={index}>
                                    <td>{txn.transaction_index}</td>
                                    <td>{txn.transaction_hash}</td>
                                    <td>{txn.status}</td>
                                    <td>{txn.sender}</td>
                                    <td>
                                      {txn.amount != null
                                        ? txn.amount
                                        : "In Clearing"}
                                    </td>
                                    <td>
                                      {txn.destination
                                        ? txn.destination
                                        : "In Clearing"}
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
                <Card className="box clearing-card">
                  <Card.Body>
                    <Card.Title tag="h5">
                      Clearing Node Current Block
                    </Card.Title>
                    <Card.Subtitle tag="h6" className="mb-2 text-muted">
                      (In this prototype, our clearing window is only one block
                      long, so the most recent block is the only open block. In
                      later implementations, this will be fine-tuned for optimum
                      performance.)
                    </Card.Subtitle>
                    <Card.Text>
                      Hash of the Block Waiting to be Cleared:{" "}
                      {this.state.curr_clearing_node_block
                        ? this.state.curr_clearing_node_block.block_hash
                        : " "}
                      <br />
                      Block Height:{" "}
                      {this.state.curr_clearing_node_block
                        ? this.state.curr_clearing_node_block.block_height
                        : " "}
                    </Card.Text>
                    <Table hover striped bordered responsive size="sm">
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
                                  <tr key={index}>
                                    <td>{txn.transaction_index}</td>
                                    <td>{txn.transaction_hash}</td>
                                    <td>{txn.status}</td>
                                    <td>{txn.sender}</td>
                                    <td>
                                      {txn.amount != null
                                        ? txn.amount
                                        : "Listening for Updates"}
                                    </td>
                                    <td>
                                      {txn.destination
                                        ? txn.destination
                                        : "Listening for Updates"}
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
                <Card className="box mining-card">
                  <Card.Body>
                    <Card.Title tag="h5">Mining Node Current Block</Card.Title>
                    <Card.Subtitle tag="h6" className="mb-2 text-muted">
                      Transactions Waiting to be mined
                    </Card.Subtitle>
                    <Table hover striped bordered responsive size="sm">
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
                          ? this.state.curr_mining_node_block.map(function (
                              txn,
                              index
                            ) {
                              return (
                                <tr key={index}>
                                  <td>.</td>
                                  <td>{txn.transaction_hash}</td>
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
                            })
                          : null}
                      </tbody>
                    </Table>
                    {this.state.curr_mining_node_block &&
                    this.state.curr_mining_node_block.length !== 0 ? (
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={this.onMineClick}
                        disabled={this.state.isMining}
                      >
                        {this.state.isMining ? (
                          <Spinner animation="border" variant="secondary" />
                        ) : (
                          "Mine"
                        )}
                      </Button>
                    ) : null}
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
                    <Form.Label>
                      Amount (Your Balance: {this.state.balance})
                    </Form.Label>
                    <Form.Control type="amount" placeholder="Enter Amount" />
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
                      This is your target destination's address. Addresses are
                      the base64 encoded SHA256 hash of their public key.
                    </Form.Text>
                    <br />
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={this.onUseOurAddressClicked}
                    >
                      Use our Primary Test Address
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={this.onGetAddressClicked}
                      disabled={this.state.loadingNewKey}
                    >
                      {!this.state.loadingNewKey
                        ? "Get a new Address"
                        : "Loading.."}
                    </Button>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3" controlId="txFee">
                    <Form.Label>Transaction Fee</Form.Label>
                    <Form.Control type="txFee" placeholder="0" />
                    <Form.Text className="text-muted">
                      This is your transaction fee bid.
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Form.Group className="mb-3" controlId="keyTextInput">
                  <Form.Label>
                    The Private Key of the Sender Address (We will automatically
                    calculate your sender address and public key from your
                    private key)
                  </Form.Label>
                  <Form.Control as="textarea" rows={10} />
                  <Form.Text className="text-muted">
                    Please paste in your private key. Even though your key will
                    never leave this browser window, please do not use any
                    sensitive keys for our test.
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={this.onUseOurKeyClicked}
                    >
                      Use the Key for our Primary Test Address
                    </Button>{" "}
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
                      than your last transaction. We auto-populate the next
                      nonce on the chain, or use your most recent nonce for
                      appending information.
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
              <Button
                onClick={this.onRevealBtnClick}
                disabled={this.state.submit_disabled}
              >
                Submit Appended Data
              </Button>
              <Row>
                <Col width="80%">
                  <Alert
                    variant={this.state.alertVariant}
                    show={this.state.showAlert}
                  >
                    {this.state.alertMessage}
                  </Alert>
                </Col>
              </Row>
            </Container>
          </Form>
          <Modal
            show={this.state.showModal}
            onHide={this.handleModalClose}
            backdrop="static"
            scrollable="true"
            size="lg"
          >
            <Modal.Header>
              <Modal.Title>Your Private key </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              This is your Private key, you'll need this to spend the tokens at
              the associated address. In production please keep it very safe!
              Don't worry about losing it now as we regularly reset our testnet.
              <hr />
              {this.state.yourPrivateKey}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="primary" onClick={this.handleModalClose}>
                Understood
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    );
  }

  onUseOurKeyClicked() {
    const inputElement = document.getElementById("keyTextInput");
    inputElement.value =
      "-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEAyri5U43kBpNJIIC4qbO3WfkC9lBOokHGfUSk7FjYFvc6ehA2\nxog1AdwRn0750C0Fj6ypEzRvz+8LT434ab5V6N3UZF4cEvzg67xHsRN3n0htpIUd\nCzBwNl2Bt8oUJklhM6LDL7DBfTtq5KtBZGyvPHjIfhft9nIUbJu8H4Peapg8SPVb\nEqkfboEgNQCIq8fbiS2CHWunLU9OViJSHG8C7Sp3FO/43s+e2k86DqBBsqOsjMRe\nWBOYMaX+OFHIVY35ezclKY1B75vz5M5SjA21UPM6sy+fyGe5pwxI9s0/Q4D/dRlN\nMXY/c/p1mcRjB4CzRLMM50jj7nrjwshmJWri3wIDAQABAoIBAA4Uloq/KD9sq3+e\ncTUYTnvpV9NT8KJEf0zkH7Bq21d9BIrF5YgUndnrNy4hhih3eBNqorO6yKlgqSB1\nc/OkTMNH5SCziK+o8NZu1WvvNjfSCAuNU18bli+wfvoNBylBn4a+n2AInufb4KjR\nXFFlWyaQHRzk/JpJgjGo/4AQ4Ln2iSllVKhGGzV4LIWeP4VYJrXxolG2horJHOUV\nTnmqBB/MZajsUarXYZW4SpkGWLuERWWdKuepzsl3FfPtaEw1pP65z5+yUhYW+SGY\nApHzW/rRSzjmw0mFjP5+MKdj1NNfB5MkLKL4RCB2Lufip83Z4JY8a+cX1g77HzVQ\nZR5M0QECgYEA/GPX4Ht+c9MWTIP79qPKehmEKFtsaMqi9TvBFuiXBV+IQ9dUVU+f\n7nWQtMt+cvHDeGTwEvFHaOyejoKNxS9E2CUAQT5ngWWxcFPD148Wi6yYzZGOEOmN\nChzu0fTfIAzJX/cCg5sbx9Hr3C9yxphHalckS0Rq8Xj4xAezNcu8+/ECgYEAzZ8D\nflMTFDxLq8YCCCfztFO/YasBB2wkCut3E6sK9HP1k6ws0JkGf4Qh7urla6r/pW1r\n4sAQqI/Vh2LK+SkZ0ls7CEbR99rXNiZY+xpTgtO/UR0FM/jm6rNT88TwlZXhv8Od\nUtvQZSVNLDH98eOoDRVRcrQ0Cl7yQP/xDyFU288CgYEA4dsbORhqHY4dW1WU6a7D\nJ6aj3FWL2u7TCy9w6GY1lypZT5RnNHyvuv3cA95ChuwQpzF0oQ7nf16XuSHdakKV\nkfLymnAUwffV5JYhIEo8u7s1dmg1wK6vdwhTMvG1pgGrR0RNLKZmIteZAI45YLyu\n09utb+mG5hYCT7IwTgjHUpECgYEAmdCm61u3vP5x2Nhxcqp4SuAPHT+vsF68A5Mq\n64Ka2kzYWxSEHbMrQj6Up8X9wvIS9SwKdYAZtg6KvBEyJvsQ/uQSH9nifdeuACrl\ni0mhSQ+fYU0lNECwdMebOJKNKkkJq8roKDCZDuC9fx8SiV00vDzDRdv5xfxKmkcb\ni6bydM8CgYA/zibVRuWlhGViEYA66jHADOBa13MAdkfEXfmnTFAZcWFXlv25F/0A\nUQSt9An4trjv0ONO00D9XC5bZFkGyq+0wKRWjFsvNmg0OmDXv/2kQ8s+1HUI6+mq\nLN7AFRBzKCHUO5HzvmXLCEELVcDMtRdTyBXgOqNIwN0nxxcD+mg5wQ==\n-----END RSA PRIVATE KEY-----";
  }

  onMineClick() {
    this.setState({
      isMining: true,
    });

    fetch("https://mining.stardust.finance/mine").then((response) => {
      setTimeout(this.refreshData, 2000);
    });
  }

  onUseOurAddressClicked() {
    const tx_destination_input = document.getElementById("txDestination");
    tx_destination_input.value = "0aKRMjy4GmRKZ2Ui4Zc8z9fqYOLTzwu9QD/JkGLd5Qw=";
  }

  onGetAddressClicked() {
    let forge = require("node-forge");
    var rsa = forge.pki.rsa;
    this.setState({
      loadingNewKey: true,
    });

    rsa.generateKeyPair({ bits: 2048, workers: -1 }, this.newKeysGenerated);
  }

  newKeysGenerated(err, keypair) {
    const tx_destination_input = document.getElementById("txDestination");
    let forge = require("node-forge");
    let pki = require("node-forge").pki;

    var md2 = forge.md.sha256.create();
    let sender_private_key = pki.privateKeyToPem(keypair.privateKey);
    let public_key_string = JSON.stringify(
      pki.publicKeyToPem(keypair.publicKey)
    ).replaceAll("\\r", "");
    public_key_string = JSON.parse(public_key_string);
    md2.update(public_key_string);
    let sender_public_key = public_key_string;
    let sender = Buffer.from(md2.digest().toHex(), "hex").toString("base64");
    console.log(sender_private_key);
    console.log(sender_public_key);
    console.log(sender);
    tx_destination_input.value = sender;
    this.setState({
      yourPrivateKey: sender_private_key,
      showModal: true,
      loadingNewKey: false,
    });
  }

  handleModalClose() {
    this.setState({
      yourPrivateKey: "",
      showModal: false,
      loadingNewKey: false,
    });
  }

  refreshData() {
    fetch("https://commit.stardust.finance/current_block")
      .then((response) => response.json())
      .then((data) =>
        this.setState({
          curr_commit_node_block: data,
        })
      );
    fetch("https://mining.stardust.finance/unconfirmed_transactions")
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
    fetch("https://commit.stardust.finance/closed_block")
      .then((response) => response.json())
      .then((data) =>
        this.setState({
          curr_closed_block: data,
        })
      );
    this.setState({
      isMining: false,
    });
  }
}

export default Home;
