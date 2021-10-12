import React, { Component } from "react";
import {
  Card,
  FormGroup,
  Form,
  Input,
  Label,
  FormText,
  CardText,
  CardBody,
  CardTitle,
  CardSubtitle,
  Button,
} from "reactstrap";
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
    };
  }

  componentDidMount() {
    const inputElement = document.getElementById("keyTextInput");
    inputElement.addEventListener("change", handleFiles, false);
    function handleFiles() {
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

    fetch("http://commit.stardust.finance/current_block")
      .then((response) => response.json())
      .then((data) =>
        this.setState({
          curr_commit_node_block: data,
        })
      );
    fetch("http://mining.stardust.finance/current_block")
      .then((response) => response.json())
      .then((data) =>
        this.setState({
          curr_mining_node_block: data,
        })
      );
    fetch("http://clearing.stardust.finance/open_blocks")
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
          <h2>Home page</h2>
          <div className="row">
            <div className="col">
              <div className="box">
                <Card>
                  <CardBody>
                    <CardTitle tag="h5">Mining Node Current Block</CardTitle>
                    <CardSubtitle tag="h6" className="mb-2 text-muted">
                      {this.state.curr_mining_node_block
                        ? this.state.curr_mining_node_block.block_hash
                        : " "}
                    </CardSubtitle>
                    <CardText>
                      Solution Hash:{" "}
                      {this.state.curr_mining_node_block
                        ? this.state.curr_mining_node_block.solution_hash
                        : " "}
                    </CardText>
                    <Button>Button</Button>
                  </CardBody>
                </Card>
              </div>
            </div>
            <div className="col">
              <div className="box">
                <Card>
                  <CardBody>
                    <CardTitle tag="h5">Commit Node Current Block</CardTitle>
                    <CardSubtitle tag="h6" className="mb-2 text-muted">
                      {this.state.curr_commit_node_block
                        ? this.state.curr_commit_node_block.block_hash
                        : " "}
                    </CardSubtitle>
                    <CardText>
                      Solution Hash:{" "}
                      {this.state.curr_commit_node_block
                        ? this.state.curr_commit_node_block.solution_hash
                        : " "}
                    </CardText>
                    <Button>Button</Button>
                  </CardBody>
                </Card>
              </div>
            </div>
            <div className="col">
              <div className="box">
                <Card>
                  <CardBody>
                    <CardTitle tag="h5">Clearing Node Current Block</CardTitle>
                    <CardSubtitle tag="h6" className="mb-2 text-muted">
                      {this.state.curr_clearing_node_block
                        ? this.state.curr_clearing_node_block.block_hash
                        : " "}
                    </CardSubtitle>
                    <CardText>
                      Solution Hash:{" "}
                      {this.state.curr_clearing_node_block
                        ? this.state.curr_clearing_node_block.solution_hash
                        : " "}
                    </CardText>
                    <Button>Button</Button>
                  </CardBody>
                </Card>
              </div>
            </div>
          </div>
        </div>
        <div className="form">
          <Form>
            <FormGroup>
              <Label for="amount">Amount</Label>
              <Input
                type="amount"
                name="amount"
                id="amount"
                placeholder="0.0"
              />
            </FormGroup>
            <FormGroup>
              <Label for="destination">Destination</Label>
              <Input
                type="destination"
                name="destination"
                id="destination"
                placeholder="JfwdBmSpFNO2IqcxGDwR1RVH3eRyHQbNhdXroGOGAcs="
              />
            </FormGroup>
            <FormGroup>
              <Label for="nonce">Nonce</Label>
              <Input type="nonce" name="nonce" id="nonce" placeholder="0.0" />
            </FormGroup>
            <FormGroup>
              <Label for="tx_fee">TX Fee</Label>
              <Input type="select" name="select" id="exampleSelect">
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
                <option>5</option>
              </Input>
            </FormGroup>
            <FormGroup>
              <Label for="exampleText">Your Private Key</Label>
              <Input type="textarea" name="text" id="keyTextInput" />
            </FormGroup>
          </Form>
          <Button>Prepare</Button>
        </div>
      </div>
    );
  }
}

export default Home;
