import { useState } from "react";
import { Collapse } from "react-bootstrap";

import "./CollapsePane.css";
import Button from "src/common/Button";

export interface Props {
    children: React.ReactNode;
    title: string;
}

export default function CollapsePane(props: Props) {
    const [ open, setOpen ] = useState(false);

    return (
        <div className="CollapsePane">
            <div className="control">
                <Button
                    onClick={ () => setOpen(!open) }
                    variant="link"
                    slim
                    narrow
                >
                    { props.title } [{ open ? "-" : "+" }]
                </Button>
            </div>
            <Collapse
                in={open}
            >
                <div className="pane">
                    { props.children }
                </div>
            </Collapse>
        </div>
    );
}
