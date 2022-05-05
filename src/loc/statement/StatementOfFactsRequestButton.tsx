import Button from "../../common/Button";
import { useLocContext } from "../LocContext";
import { useState } from "react";
import Dialog from "../../common/Dialog";
import { useCommonContext } from "../../common/CommonContext";

export default function StatementOfFactsRequestButton(props: { itemId?: string }) {

    const { requestSof } = useLocContext();
    const { refresh } = useCommonContext()
    const [ confirmVisible, setConfirmVisible ] = useState<boolean>(false)

    if (!requestSof) {
        return null;
    }

    return (
        <>
            <Button onClick={ () => setConfirmVisible(true) }>Request a Statement of Facts</Button>
            <Dialog
                show={ confirmVisible }
                size="lg"
                actions={ [
                    {
                        id: "cancel",
                        callback: () => setConfirmVisible(false),
                        buttonText: 'Cancel',
                        buttonVariant: 'secondary',
                    },
                    {
                        id: "submit",
                        callback: () => {
                            requestSof(props.itemId);
                            setConfirmVisible(false);
                            refresh();
                        },
                        buttonText: 'Confirm',
                        buttonVariant: 'primary',
                    }
                ] }
            >
                <p>You are about to request an official Statement of Facts with regards to this Legal Officer Case
                    content to the Legal Officer in charge. Do you confirm that request?</p>
            </Dialog>
        </>
    )
}
