import { LocData, PublicLoc } from "@logion/client";
import { LocType, UUID } from "@logion/node-api";

import DangerFrame from "src/common/DangerFrame";
import Icon from "src/common/Icon";
import IconTextRow from "src/common/IconTextRow";
import InlineDateTime from "src/common/InlineDateTime";
import NewTabLink from "src/common/NewTabLink";

import "./SupersedesDisclaimer.css";

export interface Props {
    loc: LocData;
    supersededLoc: PublicLoc | undefined;
    detailsPath: (locId: UUID, type: LocType) => string;
}

export default function SupersedesDisclaimer(props: Props) {
    const {
        loc,
        supersededLoc,
        detailsPath,
    } = props;

    if(!supersededLoc) {
        return null;
    }

    return (
        <DangerFrame
            className="SupersedesDisclaimer"
        >
            <IconTextRow
                icon={ <Icon icon={ { id: 'void_supersede' } } width="45px" /> }
                text={
                    <>
                        <p className="frame-title">IMPORTANT: this logion Legal Officer Case (LOC)
                        supersedes a
                        previous LOC (VOID)</p>
                        <p><strong>This LOC supersedes a previous LOC (VOID) since the following
                            date:</strong>
                            <InlineDateTime dateTime={ supersededLoc.data.voidInfo?.voidedOn } /></p>
                        <p><strong>For record purpose, this LOC supersedes the following LOC: </strong>
                            <NewTabLink
                                href={ detailsPath(supersededLoc.data.id, loc.locType) }
                                iconId="loc-link"
                                inline
                            >
                                { supersededLoc.data.id.toDecimalString() }
                            </NewTabLink>
                        </p>
                    </>
                }
            />
        </DangerFrame>
    );
}
