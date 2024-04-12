import { LocData, VerifiedIssuer } from "@logion/client";
import { ValidAccountId } from "@logion/node-api";
import { Cell } from "./Table";
import LegalOfficerName from "./LegalOfficerNameCell";
import Icon from "./Icon";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

export interface Props {
    loc: LocData
    submitter: ValidAccountId | undefined;
}

interface Identity {
    firstName: string;
    lastName: string;
}

function format(identity: Identity | undefined, account: ValidAccountId | undefined): string {
    return identity ? identity.firstName + " " + identity.lastName : account?.address || "-";
}

function findIssuer(loc: LocData, account: ValidAccountId): VerifiedIssuer | undefined {
    return loc.issuers.find(issuer => issuer.account.equals(account));
}

export default function SubmitterName(props: Props) {
    const { loc, submitter } = props;
    if (submitter && loc.ownerAccountId.equals(submitter)) {
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
                        submitter && !submitter.equals(loc.requesterAccountId) &&
                        <IssuerBadge />
                    }
                </div>
            }
            />
        )
    }
}

function getIdentity(submitter: ValidAccountId | undefined, loc: LocData): Identity | undefined {
    if(submitter?.equals(loc.requesterAccountId)) {
        return loc.userIdentity;
    } else if(submitter) {
        return findIssuer(loc, submitter);
    } else {
        return undefined;
    }
}

function IssuerBadge() {
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
                <Icon icon={ { id: "issuer-badge" } } />
            </span>
        </OverlayTrigger>
    )
}
