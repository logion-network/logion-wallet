import { TokensRecord } from "@logion/client";
import { useState } from "react";
import Button from "src/common/Button";
import Icon from "src/common/Icon";
import AddTokensRecordDialog from "./AddTokensRecordDialog";

export interface Props {
    records: TokensRecord[];
}

export default function AddTokensRecordButton(props: Props) {
    const [ showDialog, setShowDialog ] = useState(false);

    return (
        <>
            <Button
                onClick={ () => setShowDialog(true) }
            >
                <Icon icon={{id: "add"}}/> Add a tokens record
            </Button>
            <AddTokensRecordDialog
                show={ showDialog }
                hide={ () => setShowDialog(false) }
                records={ props.records }
            />
        </>
    );
}
