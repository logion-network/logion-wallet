import React, { ReactChild } from "react";
import { Dropdown } from "react-bootstrap";
import { STATEMENT_OF_FACTS_PATH } from "../legal-officer/LegalOfficerPaths";

import './StatementOfFactsButton.css';

interface CustomItemProps {
    children: ReactChild
}

const CustomItem = React.forwardRef<HTMLAnchorElement, CustomItemProps>((props, ref) => (
    <a
      href={ STATEMENT_OF_FACTS_PATH }
      target="_blank"
      rel="noreferrer"
      ref={ ref }
      className="StatementOfFactsButtonDropdownItem"
    >
      { props.children }
    </a>
));

export default function StatementOfFactsButton() {
    return (
        <Dropdown>
            <Dropdown.Toggle className="Button" id="StatementOfFacts-dropdown-toggle">Statement of facts</Dropdown.Toggle>
            <Dropdown.Menu>
                <Dropdown.Item as={ CustomItem }>EN</Dropdown.Item>
                <Dropdown.Item as={ CustomItem }>FR</Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );
}
