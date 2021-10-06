import React, { useState } from "react";
import Button from "../../common/Button";
import Dialog from "../../common/Dialog";

export default function LocPublicDataButton() {
    const [ visible, setVisible ] = useState(false);

    return (
        <>
            <Button onClick={ () => { setVisible(true) } }
            >
                Close LOC
            </Button>
            <Dialog
                show={ visible }
                size={ "lg" }
                actions={ [
                    {
                        id: "cancel",
                        callback: () => setVisible(false),
                        buttonText: 'Cancel',
                        buttonVariant: 'secondary',
                    },
                    {
                        id: "close",
                        callback: () => setVisible(false),
                        buttonText: 'Close the LOC',
                        buttonVariant: 'primary',
                    }
                ] }
            >
                <h3>Close this Case</h3>
                <p>Warning: after processing and blockchain publication, this case cannot be opened again and therefore
                will be completely sealed.</p>
            </Dialog>
        </>
    )
}
