import { Dropdown } from "react-bootstrap";
import { Children } from "./types/Helpers";

import "./MultiChoiceButton.css";

export interface Choice {
    text: string;
    onClick: () => void;
}

export interface Props {
    text: Children;
    choices: Choice[];
}

export default function MultiChoiceButton(props: Props) {

    return (
        <Dropdown className="MultiChoiceButton">
            <Dropdown.Toggle className="Button">{ props.text }</Dropdown.Toggle>
            <Dropdown.Menu>
                {
                    props.choices.map((choice, index) => (
                        <Dropdown.Item key={ index } onClick={ () => choice.onClick() }>
                            { choice.text }
                        </Dropdown.Item>
                    ))
                }
            </Dropdown.Menu>
        </Dropdown>
    )
}
