import Checkbox from "../../components/toggle/Checkbox";
import {
    SelectPartiesParams,
    selectParties,
    unselectParties,
    VerifiedThirdPartyWithSelect
} from "../../legal-officer/client";
import { useCallback, useMemo, useState } from "react";
import { OpenLoc, ClosedCollectionLoc } from "@logion/client";
import { useLocContext } from "../LocContext";
import Dialog from "../../common/Dialog";
import ClientExtrinsicSubmitter, { Call, CallCallback } from "src/ClientExtrinsicSubmitter";
import { useLogionChain } from "src/logion-chain";

export interface Props {
    vtpSelection: VerifiedThirdPartyWithSelect
}

type Status = 'Idle' | 'Selected' | 'Confirming' | 'Error';

export default function VTPSelectionCheckbox(props: Props) {
    const { vtpSelection } = props;
    const { signer } = useLogionChain();
    const { mutateLocState } = useLocContext();
    const [ status, setStatus ] = useState<Status>('Idle');
    const [ showUnselect, setShowUnselect ] = useState<boolean>(false);
    const [ call, setCall ] = useState<Call>();

    const toggleSelection = useCallback(async () => {
        setStatus('Confirming');
        const call = async (callback: CallCallback) => mutateLocState(async current => {
            if(signer && (current instanceof OpenLoc || current instanceof ClosedCollectionLoc)) {
                const params: SelectPartiesParams = {
                    locState: current,
                    issuer: vtpSelection.address,
                    signer,
                    callback,
                }
                if (vtpSelection.selected) {
                    await unselectParties(params);
                } else {
                    await selectParties(params);
                }
                return current.refresh();
            } else {
                return current;
            }
        });
        setCall(() => call);
    }, [ mutateLocState, vtpSelection, signer ]);

    const clearState = useCallback(async () => {
        setStatus('Idle');
        setCall(undefined);
    }, []);

    const vtpName = useMemo(() => `${ vtpSelection.firstName } ${ vtpSelection.lastName }`, [vtpSelection]);

    return (<>
        <Checkbox
            skin="Toggle black"
            checked={ vtpSelection.selected || false }
            setChecked={ () => {
                setStatus('Selected');
                setShowUnselect(vtpSelection.selected || false);
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
                <h3>Verified Third Party Selection</h3>
                <p>You are about to select <strong>{ vtpName }</strong>, a Verified Third Party you previously
                    nominated, as Verified Third Party <strong>for this LOC</strong>.</p>
                <p>With that status, <strong>{ vtpName }</strong> will be able to contribute as a trustable source
                    of public data and confidential documents. You will still have to validate these contributions
                    before blockchain publication.</p>
                <p>Do you confirm you want to make { vtpName } a Verified Third Party <strong>for this
                    LOC</strong> ?
                </p>
            </> }
            { showUnselect && <>
                <h3>Verified Third Party Dismissal</h3>
                <p>You are about to cancel the status of <strong>{ vtpName }</strong> as a Verified Third
                    Party <strong>for this LOC</strong>.</p>
                <p>After confirmation, { vtpName } will not be able to contribute or access this LOC anymore.</p>
                <p>Do you confirm you want to cancel the status of { vtpName } as a Verified Third Party <strong>for
                    this LOC</strong>?</p>
            </> }
            <ClientExtrinsicSubmitter
                call={call}
                onSuccess={clearState}
                onError={() => setStatus('Error')}
            />
        </Dialog>
    </>)
}
