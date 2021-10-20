import React, { useState } from "react";
import ListGroup from "react-bootstrap/ListGroup";
import Collapse from "react-bootstrap/Collapse";
import Steps from "./index.js";
import Accordion from "./Accordion";
import FAQs from "./FAQs.js";

const FAQsContainer = () => {
  const accordionData = [
    {
      title: "Summary",
      content: <FAQs />,
    },
    {
      title: "How to Perform a Transaction",
      content: <Steps />,
    },
  ];

  return (
    <div>
      <ListGroup as="ul" variant="flush" className="accordion">
        {accordionData.map(({ title, content }) => (
          <ListGroup.Item as="li" className="accordion-item-custom">
            <Accordion title={title} content={content} className={"blah"} />
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default FAQsContainer;
