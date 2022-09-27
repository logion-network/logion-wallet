import { LocData } from "@logion/client";
import { LocType, UUID } from "@logion/node-api";
import DangerFrame from "src/common/DangerFrame";
import Icon from "src/common/Icon";
import InlineDateTime from "src/common/InlineDateTime";
import NewTabLink from "src/common/NewTabLink";

import "./VoidDisclaimer.css";

export interface Props {
    loc: LocData;
    detailsPath: (locId: UUID, type: LocType) => string;
}

export default function VoidDisclaimer(props: Props) {
    const { loc, detailsPath } = props;

    return (
        <>
            {
                loc.voidInfo !== undefined && loc.locType !== 'Collection' &&
                <DangerFrame
                    className="VoidDisclaimer loc-is-void"
                    title={ <span><Icon icon={ { id: 'void' } } width="45px" /> This LOC is VOID</span> }
                >
                    <p><strong>You have voided this LOC at the following date:</strong> <InlineDateTime
                        dateTime={ loc.voidInfo?.voidedOn } /></p>
                    <p><strong>Reason:</strong> { loc.voidInfo?.reason || "-" }</p>
                    {
                        loc.voidInfo.replacer !== undefined &&
                        <p><strong>This VOID LOC has been replaced by the following LOC: </strong>
                            <NewTabLink
                                href={ detailsPath(loc.voidInfo.replacer, loc.locType) }
                                iconId="loc-link"
                                inline
                            >
                                { loc.voidInfo.replacer.toDecimalString() }
                            </NewTabLink>
                        </p>
                    }
                    {
                        loc.voidInfo.replacer === undefined &&
                        <p>Please note that its public certificate shows a "VOID" mention to warn people that the
                            content of the LOC is not valid anymore.</p>
                    }
                    {
                        loc.voidInfo.replacer !== undefined &&
                        <p>Please note that its public certificate shows a "VOID" mention to warn people that the
                            content of the LOC is not valid anymore.
                            People will be automatically redirected to the replacing LOC when accessing to the void
                            LOC
                            URL and a mention of the fact that
                            the replacing LOC supersedes the void LOC will be visible on both certificates.
                        </p>
                    }
                </DangerFrame>
            }
            {
                loc.voidInfo !== undefined && loc.locType === 'Collection' &&
                <DangerFrame
                    className="VoidDisclaimer loc-is-void"
                    title={ <span><Icon icon={ { id: 'void' } } width="45px" /> This Collection LOC with all its related Collection Items are VOID</span> }
                >
                    <p><strong>You have voided this Collection LOC with all its related Collection Items at the
                        following date:</strong> <InlineDateTime dateTime={ loc.voidInfo?.voidedOn } /></p>
                    <p><strong>Reason:</strong> { loc.voidInfo?.reason || "-" }</p>
                    <p>Please note that related public certificates show a "VOID" mention to warn people that the
                        content of the Collection LOC as well as its related Collection Items are not valid
                        anymore.</p>
                </DangerFrame>
            }
        </>        
    );
}
