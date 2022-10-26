import Frame from "src/common/Frame";
import Icon from "src/common/Icon";
import IconTextRow from "src/common/IconTextRow";

import "./DraftLocInstructions.css";

export default function DraftLocInstructions() {

    return (
        <Frame className="DraftLocInstructions">
            <IconTextRow
                icon={ <Icon icon={ { id: "tip" } } width="45px" /> }
                text={
                    <>
                        <p>Please add all public data and confidential documents, you need to send to your Legal Officer.</p>
                        <p>After validation of this request by your Legal Officer:</p>
                        <ul>
                            <li>Public data will be publicly available on the logion blockchain and public certificate.</li>
                            <li>Confidential documents will not be publicly available and will stay confidential between you and your Legal Officer.</li>
                        </ul>
                    </>
                }
            />
        </Frame>
    );
}
