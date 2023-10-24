import { ReactNode } from "react";

export interface Props {
    show: boolean;
    children: ReactNode;
}

export default function BlockNone(props: Props) {

    return (
        <div style={{
            display: props.show ? "block" : "none"
        }}>
            { props.children }
        </div>
    );
}
