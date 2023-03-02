import { LocData, VerifiedThirdParty } from "@logion/client";
import { Cell } from "./Table";
import LegalOfficerName from "./LegalOfficerNameCell";
import Icon from "./Icon";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

export interface Props {
    loc: LocData
    submitter: string | undefined;
}

interface Identity {
    firstName: string;
    lastName: string;
}

function format(identity: Identity | undefined, address: string | undefined): string {
    return identity ? identity.firstName + " " + identity.lastName : address || "-";
}

function findVTP(loc: LocData, address: string): VerifiedThirdParty | undefined {
    return loc.issuers.find(vtp => vtp.address === address);
}

export default function SubmitterName(props: Props) {
    const { loc, submitter } = props;
    if (submitter === loc.ownerAddress) {
        return (
            <LegalOfficerName address={ submitter } />
        )
    } else {
        const identity = getIdentity(submitter, loc);
        return (
            <Cell content={
                <div>
                    { format(identity, submitter) }
                    {
                        submitter && submitter !== loc.requesterAddress &&
                        <VTPBadge />
                    }
                </div>
            }
            />
        )
    }
}

function getIdentity(submitter: string | undefined, loc: LocData): Identity | undefined {
    if(submitter === loc.requesterAddress) {
        return loc.userIdentity;
    } else if(submitter) {
        return findVTP(loc, submitter);
    } else {
        return undefined;
    }
}

function VTPBadge() {
    return (
        <OverlayTrigger
            placement="bottom-end"
            delay={ 500 }
            overlay={
                <Tooltip id={ Math.random().toString() }>
                    contributed by this Verified Issuer at the request of the Legal Officer in charge
                </Tooltip>
            }
        >
            <span>
                &nbsp;
                <Icon icon={ { id: "vtp-badge" } } />
            </span>
        </OverlayTrigger>
    )
}
