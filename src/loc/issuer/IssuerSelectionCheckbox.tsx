import Checkbox from "../../components/toggle/Checkbox";
import { useCallback, useMemo, useState } from "react";
import { OpenLoc, ClosedCollectionLoc, VerifiedIssuerWithSelect } from "@logion/client";
import { useLocContext } from "../LocContext";
import Dialog from "../../common/Dialog";
import { CallCallback, useLogionChain } from "src/logion-chain";
import ExtrinsicSubmissionStateView from "src/ExtrinsicSubmissionStateView";

export interface Props {
    issuerSelection: VerifiedIssuerWithSelect
}

type Status = 'Idle' | 'Selected' | 'Confirming' | 'Error';

export default function IssuerSelectionCheckbox(props: Props) {
    const { issuerSelection } = props;
    const { signer, submitCall, clearSubmissionState } = useLogionChain();
    const { mutateLocState } = useLocContext();
    const [ status, setStatus ] = useState<Status>('Idle');
    const [ showUnselect, setShowUnselect ] = useState<boolean>(false);

    const clearState = useCallback(async () => {
        setStatus('Idle');
        clearSubmissionState();
    }, [ clearSubmissionState ]);

    const toggleSelection = useCallback(async () => {
        setStatus('Confirming');
        const call = async (callback: CallCallback) => mutateLocState(async current => {
            if(signer && (current instanceof OpenLoc || current instanceof ClosedCollectionLoc)) {
                const params = {
                    payload: {
                        issuer: issuerSelection.account,
                    },
                    signer,
                    callback,
                };
                if (issuerSelection.selected) {
                    await current.legalOfficer.unselectIssuer(params);
                } else {
                    await current.legalOfficer.selectIssuer(params);
                }
                return current.refresh();
            } else {
                return current;
            }
        });
        try {
            await submitCall(call);
            clearState();
        } catch(e) {
            setStatus('Error');
        }
    }, [ mutateLocState, issuerSelection, signer, submitCall, clearState ]);

    const issuerName = useMemo(() => `${ issuerSelection.firstName } ${ issuerSelection.lastName }`, [issuerSelection]);

    return (<>
        <Checkbox
            skin="Toggle black"
            checked={ issuerSelection.selected || false }
            setChecked={ () => {
                setStatus('Selected');
                setShowUnselect(issuerSelection.selected || false);
            } }
        />
        <Dialog
            show={ status !== 'Idle' }
            size="lg"
            actions={ [
                {
                    id: "cancel",
                    callback: clearState,
                    buttonText: 'Cancel',
                    buttonVariant: 'secondary',
                    disabled: status === 'Confirming',
                },
                {
                    id: "submit",
                    callback: toggleSelection,
                    buttonText: 'Confirm',
                    buttonVariant: 'polkadot',
                    disabled: status === 'Confirming' || status === 'Error'
                }
            ] }
        >
            { !showUnselect && <>
                <h3>Verified Issuer Selection</h3>
                <p>You are about to select <strong>{ issuerName }</strong>, a Verified Issuer you previously
                    nominated, as Verified Issuer <strong>for this LOC</strong>.</p>
                <p>With that status, <strong>{ issuerName }</strong> will be able to contribute as a trustable source
                    of public data and confidential documents. You will still have to validate these contributions
                    before blockchain publication.</p>
                <p>Do you confirm you want to make { issuerName } a Verified Issuer <strong>for this
                    LOC</strong> ?
                </p>
            </> }
            { showUnselect && <>
                <h3>Verified Issuer Dismissal</h3>
                <p>You are about to cancel the status of <strong>{ issuerName }</strong> as a Verified Issuer <strong>for this LOC</strong>.</p>
                <p>After confirmation, { issuerName } will not be able to contribute or access this LOC anymore.</p>
                <p>Do you confirm you want to cancel the status of { issuerName } as a Verified Issuer <strong>for
                    this LOC</strong>?</p>
            </> }
            <ExtrinsicSubmissionStateView />
        </Dialog>
    </>)
}
