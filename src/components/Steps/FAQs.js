import React from "react";
import Accordion from "./Accordion";
import ListGroup from "react-bootstrap/ListGroup";

const FAQs = () => {
  const accordionData = [
    {
      title: "What is This?",
      content: `Like all MVPs, this is a highly simplified version of our proposed blockchain. We have kept the core framework of our three node network topology to separate the unilateral power a miner has, and have ensured data privacy when it matters most in the lifecycle of a transaction, creating a truly secure and decentralized blockchain.`,
    },
    {
      title: "Why Do We Need This?",
      content: `Like all MVPs, this is a highly simplified version of our proposed blockchain. We have kept the core framework of our three node network topology to separate the unilateral power a miner has, and have ensured data privacy when it matters most in the lifecycle of a transaction, creating a truly secure and decentralized blockchain.`,
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

export default FAQs;
