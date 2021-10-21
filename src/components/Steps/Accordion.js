import React, { useState } from "react";
import ListGroup from "react-bootstrap/ListGroup";
import Collapse from "react-bootstrap/Collapse";

const Accordion = ({ title, content, className }) => {
  const [isActive, setIsActive] = useState(false);

  return (
    <ListGroup.Item as="li">
      <div className="accordion-title" onClick={() => setIsActive(!isActive)}>
        <div>
          {isActive ? <h5>{title + "  -"}</h5> : <h6>{title + "  +"}</h6>}
        </div>
      </div>
      <Collapse in={isActive}>
        <div id="example-collapse-text">
          {isActive && <div className={className}>{content}</div>}
        </div>
      </Collapse>
    </ListGroup.Item>
  );
};

export default Accordion;
