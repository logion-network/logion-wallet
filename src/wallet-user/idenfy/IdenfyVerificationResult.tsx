import { LocType, UUID } from "@logion/node-api";
import { useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Button from "../../common/Button";
import { useCommonContext } from "../../common/CommonContext";
import { FullWidthPane } from "../../common/Dashboard";
import Frame from "../../common/Frame";
import Icon from "../../common/Icon";
import IconTextRow from "../../common/IconTextRow";
import "./IdenfyVerificationResult.css";
import { PARAM_RESULT, PARAM_LOC_ID } from "../UserPaths";

export interface Props {
    detailsPath: (locId: UUID, type: LocType) => string;
}

export default function IdenfyVerificationResult(props: Props) {
    const { colorTheme } = useCommonContext();
    const [ params ] = useSearchParams();
    const navigate = useNavigate();

    const iconText = useMemo(() => {
        const result = params.get(PARAM_RESULT);
        if(result === "success") {
            return {
                iconId: "ok",
                text: "Your identity verification by iDenfy was successful! You may have to wait a few minutes before the results are actually added to your Identity LOC."
            }
        } else if(result === "error") {
            return {
                iconId: "ko",
                text: "Your identity could not be verified by iDenfy. You may try again or use another verification method."
            }
        } else if(result === "unverified") {
            return {
                iconId: "tip",
                text: "The identification process has been interrupted. You may try again or use another verification method."
            }
        } else {
            return {
                iconId: "tip",
                text: "Unexpected result."
            }
        }
    }, [ params ]);

    return (
        <FullWidthPane
            mainTitle={ "iDenfy Verification" }
            titleIcon={ {
                icon: {
                    id: "identity"
                },
                background: colorTheme.topMenuItems.iconGradient,
            } }
            className={ "IdenfyVerificationResult" }
        >
            <Frame>
                <div className="result">
                    <IconTextRow
                        icon={ <Icon icon={{ id: iconText.iconId }} height="64px" /> }
                        text={
                            <p>
                                { iconText.text }
                            </p>
                        }
                    />
                </div>
                <Button
                    onClick={() => navigate(props.detailsPath(new UUID(params.get(PARAM_LOC_ID) || ""), "Identity")) }
                >
                    Go back to Identity LOC
                </Button>
            </Frame>
        </FullWidthPane>
    );
}
