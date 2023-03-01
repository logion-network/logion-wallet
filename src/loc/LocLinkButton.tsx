import { useState } from "react";

import LocLinkExistingDialog from "./LocLinkExistingLocDialog";
import Icon from "../common/Icon";
import Button from "../common/Button";

export interface Props {
    text: string;
    nature?: string;
}

export default function LocLinkButton(props: Props) {
    const [ visible, setVisible ] = useState<boolean>(false);

    return (
        <>
            <Button onClick={ () => setVisible(true) }>
                <Icon icon={ { id: "add" } } height="19px" />
                <span className="text">{ props.text }</span>
            </Button>
            <LocLinkExistingDialog
                show={ visible }
                exit={ () => setVisible(false) }
                text={ props.text }
                nature={ props.nature }
            />
        </>
    )
}
