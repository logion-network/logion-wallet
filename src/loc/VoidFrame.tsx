import { LocData } from "@logion/client";
import ButtonGroup from "src/common/ButtonGroup";
import DangerFrame from "src/common/DangerFrame";
import Icon from "src/common/Icon";
import IconTextRow from "src/common/IconTextRow";
import VoidLocButton from "./VoidLocButton";
import VoidLocReplaceExistingButton from "./VoidLocReplaceExistingButton";

import "./VoidFrame.css";

export interface Props {
    loc: LocData;
}

export default function VoidFrame(props: Props) {
    const { loc } = props;

    return (
        <DangerFrame
            className="VoidFrame"
        >
            <IconTextRow
                icon={ <Icon icon={ { id: 'void' } } width="31px" /> }
                text={
                    <>
                        <p className="frame-title"> Void this LOC</p>
                        {
                            loc.locType !== 'Collection' &&
                            <p>
                                This action will invalidate the present LOC: the LOC status, its public
                                certificate will show a "VOID" mention to warn people that
                                the content of the LOC is not valid anymore. If another replacing LOC is
                                set,
                                people will be automatically redirected to
                                the replacing LOC when accessing the void LOC URL and a mention of the fact
                                that
                                the replacing LOC <strong>supersedes</strong> the void
                                LOC will be shared on both public certificates. <strong>PLEASE USE
                                CAREFULLY.</strong>
                            </p>
                        }
                        {
                            loc.locType === 'Collection' &&
                            <p>
                                This action will invalidate the present Collection LOC and all its related
                                Collection Items: the Collection LOC and all
                                related Collection Items status / public certificates will show a "VOID"
                                mention
                                to warn people that the content of the
                                Collection LOC and all its related Collection Items are not valid
                                anymore. <strong>PLEASE USE CAREFULLY.</strong>
                            </p>
                        }
                        <ButtonGroup
                            align="left"
                            className="void-buttons-container"
                        >
                            <VoidLocButton />
                            { loc.locType !== 'Collection' && <VoidLocReplaceExistingButton /> }
                        </ButtonGroup>
                    </>
                }
            />
        </DangerFrame>
    );
}
