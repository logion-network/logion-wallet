import React from "react";
import BootStrapButtonGroup, { ButtonGroupProps } from "react-bootstrap/ButtonGroup";
import "./ButtonGroup.css"
import { customClassName } from "./types/Helpers";

export interface Props extends ButtonGroupProps {
    align?: string;
}

export default function ButtonGroup(props: Props) {
    const className = customClassName("ButtonGroup", props.align);
    return (
        <div className={ className }>
            <BootStrapButtonGroup { ...props } />
        </div>
    );
}
