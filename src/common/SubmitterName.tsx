import Identity from "./types/Identity";
import { Cell } from "./Table";
import React from "react";

export interface Props {
    identity?: Identity,
}

export default function SubmitterName(props: Props) {
    const { identity } = props;
    const content = identity ? identity.firstName + " " + identity.lastName : "!! Unknown submitter !!"
    return (
        <Cell
            content={ content }
        />
    );
}
