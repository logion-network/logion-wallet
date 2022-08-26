import CopyPasteButton from "src/common/CopyPasteButton";
import Ellipsis from "src/common/Ellipsis";
import { Cell } from "src/common/Table";

export interface Props {
    content: string;
}

export default function CellWithCopyPaste(props: Props) {

    return (
        <Cell content={
            <span>
                <Ellipsis maxWidth="calc(100% - 75px)">{ props.content }</Ellipsis> <CopyPasteButton value={ props.content } className="medium" />
            </span>
        } />
    );
}
