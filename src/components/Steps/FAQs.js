import React from "react";
import Accordion from "./Accordion";
import ListGroup from "react-bootstrap/ListGroup";

const FAQs = () => {
  const accordionData = [
    {
      title: "What is This?",
      content: (
        <div>
          This Blockchain is a fundamental redesign of distributed ledger
          technology. Its core framework separates the unilateral power a
          winning node has across three cooperating, coordinated, but
          independent node networks. By adopting the principle of segregation of
          duties, our proposal prevents front-running attacks by ensuring
          transaction privacy during origination, increases transaction
          throughput through specializing node roles, and provides additional
          security through a series of checks and balances.
          <br />
          <br />
          Our proposed architecture is composed of the three cooperating node
          networks you see below. Each of them only has access to as much
          information as it needs to do its job. To wit, our proposal separates
          the three key components of a financial transaction; origination,
          execution, and settlement, amongst independent node networks that
          cooperate in tandem with careful checks and balances to make changes
          to the global state.
          <br />
          <br />
          In this implementation, when a user wants to initiate a transaction of
          any form, they submit only the SHA256 Hash of their transaction
          details with no plain text information. Our mining node network, whose
          duty is origination, incorporates these hashes into a block without
          knowing what the transaction entails. Executing these transactions is
          the responsibility of the clearing nodes who clear the transactions
          that are in the clearing window as users reveal and append their plain
          text details to their transaction. Users do not have to disclose any
          details until the transaction is committed to the chain and enters
          this clearing window, which ensures their transaction cannot be
          front-run as blocks are immutable at this point. Finally, these
          transactions are committed to the global state by the commit node
          network, which orchestrates the global process.
        </div>
      ),
    },
    {
      title: "Why Do We Need This?",
      content: (
        <div>
          ​​Extant DLT implementations grant a single agent, typically a mining
          node, full power and visibility over the entire transaction lifecycle.
          The ability to clearly view all the transactions in the mempool, order
          them for execution freely, and inject the miner’s own transactions has
          allowed miners to easily and effectively perform malicious attacks on
          users by front- and back-running transactions.
          <br />
          <br />
          These vulnerabilities directly cost the users of decentralized ledgers
          over $700M from January 2021- August 2021. In addition, requiring a
          single node to execute, clear, originate and settle all transactions
          within a very small time-frame, as short as 1 second of CPU execution
          time in Ethereum, limits throughput.
        </div>
      ),
    },
    {
      title: "Who Are You?",
      content: (
        <div>
          Adit has a BSc in Applied Physics from Columbia University, with
          strong technical skills across the broad background of statistics,
          cryptography, computer programing and applied mathematics. After
          graduating he spent 5 years as a banking analyst for Capital One
          primarily focused on developing and launching brand new consumer and
          institutional financial products. He then spent 3 years in Melbourne,
          Australia in corporate strategy for RedBubble, a billion dollar tech
          startup. He is also a full-stack developer who designed and built the
          initial prototype.
          <br />
          <br />
          Theresa has a degree in Industrial Engineering and started her career
          working as a Safety Engineer at ExxonMobil, assisting in developing
          new safety protocols and writing proposals for new global safety and
          reporting standards. She then worked with the former co-founder of
          Cramster (which later sold to Chegg) in developing new business lines
          in online education and film distribution before leaving to start her
          own successful e-commerce business, building an international team to
          support sales globally. She's been invested in the crypto ecosystem
          since 2017 and has seen the industry evolve and directly experienced
          the pain points.
        </div>
      ),
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
