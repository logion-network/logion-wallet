import Checkbox from "../../components/toggle/Checkbox";
import {
    VerifiedThirdPartySelection,
    SelectPartiesParams,
    selectParties,
    unselectParties
} from "../../legal-officer/client";
import { useCallback, useState } from "react";
import { OpenLoc } from "@logion/client";
import { useLocContext } from "../LocContext";
import Dialog from "../../common/Dialog";

export interface Props {
    vtpSelection: VerifiedThirdPartySelection
}

export default function VTPSelectionCheckbox(props: Props) {

    type Status = 'Idle' | 'Selected' | 'Confirming';
    const { vtpSelection } = props;
    const { mutateLocState } = useLocContext();
    const [ status, setStatus ] = useState<Status>('Idle');
    const [ showUnselect, setShowUnselect ] = useState<boolean>(false);
    const toggleSelection = useCallback(async () => {
        setStatus('Confirming');
        await mutateLocState(async current => {
            if (current instanceof OpenLoc) {
                const params: SelectPartiesParams = {
                    locState: current,
                    partyId: vtpSelection.identityLocId,
                }
                if (vtpSelection.selected) {
                    await unselectParties(params);
                } else {
                    await selectParties(params);
                }
                setStatus('Idle');
                return current.refresh();
            } else {
                return current;
            }
        })
    }, [ mutateLocState, vtpSelection.identityLocId, vtpSelection.selected ]);
    const vtpName = `${ vtpSelection.firstName } ${ vtpSelection.lastName }`;

    return (<>
        <Checkbox
            skin="Toggle black"
            checked={ vtpSelection.selected }
            setChecked={ () => {
                setStatus('Selected');
                setShowUnselect(vtpSelection.selected);
            } } />
        <Dialog
            show={ status !== 'Idle' }
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
                    callback: toggleSelection,
                    buttonText: 'Confirm',
                    buttonVariant: 'primary',
                    disabled: status === 'Confirming'
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
        </Dialog>
    </>)
}
