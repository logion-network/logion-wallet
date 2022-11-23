import { LocData, VerifiedThirdParty } from "@logion/client";
import { Cell } from "./Table";
import { LocItem } from "../loc/types";
import LegalOfficerName from "./LegalOfficerNameCell";
import Icon from "./Icon";

export interface Props {
    loc: LocData
    locItem: LocItem
}

function format(identity: { firstName: string, lastName: string } | undefined): string {
    return identity ? identity.firstName + " " + identity.lastName : "!! Unknown submitter !!";
}

function findVTP(loc: LocData, address: string): VerifiedThirdParty | undefined {
    return loc.selectedParties.find(vtp => vtp.address === address);
}

export default function SubmitterName(props: Props) {
    const { loc, locItem } = props;
    if (locItem.submitter === loc.ownerAddress) {
        return (
            <LegalOfficerName address={ locItem.submitter } />
        )
    } else {
        const identity = locItem.submitter === loc.requesterAddress ?
            loc.userIdentity :
            findVTP(loc, locItem.submitter);
        return (
            <Cell content={
                <div>
                    { format(identity) }
                    { locItem.submitter !== loc.requesterAddress && <>
                        &nbsp;
                        <Icon icon={ { id: "vtp-badge" } } />
                    </> }
                </div>
            }
            />
        )
    }
}
