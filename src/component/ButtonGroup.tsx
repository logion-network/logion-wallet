import React from "react";
import BootStrapButtonGroup, { ButtonGroupProps } from "react-bootstrap/ButtonGroup";
import "./ButtonGroup.css"

export interface Props extends ButtonGroupProps {

}

export default function ButtonGroup(props: Props) {
    return (
        <div className="ButtonGroup">
            <BootStrapButtonGroup { ...props } />
        </div>
    );
}
