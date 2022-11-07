import { useState } from "react";

import LocLinkExistingDialog from "./LocLinkExistingLocDialog";
import Icon from "../common/Icon";
import Button from "../common/Button";

export default function LocLinkButton() {
    const [ visible, setVisible ] = useState<boolean>(false);

    return (
        <>
            <Button onClick={ () => setVisible(true) }>
                <Icon icon={ { id: "add" } } height="19px" />
                <span className="text">Link to an existing LOC</span>
            </Button>
            <LocLinkExistingDialog
                show={ visible }
                exit={ () => setVisible(false) }
            />
        </>
    )
}
