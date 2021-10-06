import React from "react";

import "./TwoSideButtonGroup.css"
import { Children } from "./types/Helpers";

export interface Props {
    left: Children;
    right: Children;
}

export default function TwoSideButtonGroup(props: Props) {
    return (
        <div className="TwoSideButtonGroup">
            <div className="left">
                { props.left }
            </div>
            <div className="right">
                { props.right }
            </div>
        </div>
    );
}
