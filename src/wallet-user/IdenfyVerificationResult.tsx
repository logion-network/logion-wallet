import { LocType, UUID } from "@logion/node-api";
import { useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Button from "src/common/Button";
import { useCommonContext } from "src/common/CommonContext";
import { FullWidthPane } from "src/common/Dashboard";
import Frame from "src/common/Frame";
import Icon from "src/common/Icon";
import IconTextRow from "src/common/IconTextRow";
import "./IdenfyVerificationResult.css";

export interface Props {
    detailsPath: (locId: UUID, type: LocType) => string;
}

export default function IdenfyVerificationResult(props: Props) {
    const { colorTheme } = useCommonContext();
    const [ params ] = useSearchParams();
    const navigate = useNavigate();

    const iconText = useMemo(() => {
        const result = params.get("result");
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
                    onClick={() => navigate(props.detailsPath(new UUID(params.get("locId") || ""), "Identity")) }
                >
                    Go back to Identity LOC
                </Button>
            </Frame>
        </FullWidthPane>
    );
}
