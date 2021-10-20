import React from "react";
import Accordion from "./Accordion";
import ListGroup from "react-bootstrap/ListGroup";

const Steps = () => {
  const accordionData = [
    {
      title: "Step 1: Create a New Transaction",
      content: `Create a new transaction by using the attached form at the end of our webpage. In order to initiate a transaction, you need to enter an amount, a transaction fee bid, a destination, and the private key of the sender. If you need to create a destination account, feel free to click the button underneath to generate a new RSA4096 private key and get a new address.`,
    },
    {
      title: "Step 2: Click Prepare",
      content: `After you've entered an amount, transaction fee, valid destination, and valid private key for a sender with an existing balance, hit the prepare button. The Wallet will automatically check your transaction and populate the fields necesary to initiate a transactions. When you are happy with the results, hit the submit button.`,
    },
    {
      title: "Step 3: Click Submit",
      content: `When you submit a transaction to the miner, it isn't sent with the amount or destination. This is to ensure that a malicious miner or bot can't front run your transaction and only you know the details of the transactions until it is confirmed to be on the chain.`,
    },
    {
      title: "Step 4: Verify Transaction and Click Mine",
      content: `You can verify this by seeing that the transactions at the mining node do not have amounts or destinations assigned to them, instead their validity is ensured by signing the transaction hash with your private key. Unlike other implementations, they can be added to the chain without those fields appended. When you are ready to see it in action, just hit the mine button.`,
    },
    {
      title: "Step 5: Prepare Again and Append Information",
      content: `You'll now see the transaction sitting at the clearing node waiting to be cleared. In order to do this, you'll need to submit the appended information. It's really easy to do this, just scroll back down and hit "prepare" with the same transaction details as before, however this time instead of hitting "Submit", hit "Append Data". Our form will automatically sign it and send it out to the network to be appended and cleared.`,
    },
    {
      title: "Step 6: Wait for the Block to Close",
      content: `Once the data hits the clearing nodes, they'll check your balance and execute your transaction moving it to the pre-cleared status. Once the clearing window closes, your transaction will move into the "cleared" status. If you fail to append your transaction in time, your transaction will "fail" when the clearing window closes and you will forfeit any transaction fees you've paid and will need to reinitiate the transaction again.`,
    },
  ];

  return (
    <div>
      <ListGroup as="ul" variant="flush" className="accordion">
        {accordionData.map(({ title, content }) => (
          <Accordion
            title={title}
            content={content}
            className={"accordion-content"}
          />
        ))}
      </ListGroup>
    </div>
  );
};

export default Steps;
