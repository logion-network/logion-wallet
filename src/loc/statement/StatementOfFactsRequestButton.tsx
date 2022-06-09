import Button from "../../common/Button";
import { useUserLocContext } from "../UserLocContext";
import { useState, useCallback } from "react";
import Dialog from "../../common/Dialog";
import { useCommonContext } from "../../common/CommonContext";
import { locRequestsPath } from "../../wallet-user/UserRouter";

type Status = 'Idle' | 'Confirming' | 'Requesting' | 'Requested';

export default function StatementOfFactsRequestButton(props: { itemId?: string }) {

    const { itemId } = props;
    const { requestSof, requestSofOnCollection } = useUserLocContext();
    const { refresh } = useCommonContext()
    const [ status, setStatus ] = useState<Status>('Idle')

    const confirmCallback = useCallback(() => {
        setStatus('Requesting')
        if (itemId) {
            requestSofOnCollection!(itemId);
        } else {
            requestSof!();
        }
        refresh(false);
        setStatus('Requested');
    }, [ itemId, refresh, requestSof, requestSofOnCollection ])

    return (
        <>
            <Button onClick={ () => setStatus('Confirming') }>
                Request a Statement of Facts
            </Button>
            <Dialog
                show={ status === 'Confirming' || status === 'Requesting' }
                size="lg"
                actions={ [
                    {
                        id: "cancel",
                        callback: () => setStatus('Idle'),
                        buttonText: 'Cancel',
                        buttonVariant: 'secondary',
                    },
                    {
                        id: "submit",
                        callback: confirmCallback,
                        buttonText: 'Confirm',
                        buttonVariant: 'primary',
                        disabled: status === 'Requesting'
                    }
                ] }
            >
                <p>You are about to request an official Statement of Facts with regards to this Legal Officer Case
                    content to the Legal Officer in charge. Do you confirm that request?</p>
            </Dialog>
            <Dialog
                show={ status === 'Requested' }
                size={ "lg" }
                actions={ [
                    {
                        id: "close",
                        callback: () => setStatus('Idle'),
                        buttonText: 'Close',
                        buttonVariant: 'primary'
                    }
                ] }
            >
                <p>Your request has been submitted: a Legal Officer Case that will secure the requested Statement of
                    Facts would be created if this request is accepted by the Legal Officer in charge. You can follow
                    the status of that Legal Officer Case which will contain the requested Statement of Facts on
                    your <a href={ locRequestsPath("Transaction") }>Transaction LOC dashboard</a>
                </p>
            </Dialog>
        </>
    )
}
