import { PublicLoc } from "@logion/client";
import { useMemo } from "react";
import Icon from "src/common/Icon";
import { customClassName } from "src/common/types/Helpers";
import { FALLBACK_ICON_ID, getTemplate } from "src/loc/Template";
import "./CertificateTitle.css";

export interface Props {
    loc: PublicLoc;
}

export default function CertificateTitle(props: Props) {
    const template = useMemo(() =>
        getTemplate(props.loc.data.locType, props.loc.data.template),
    [ props.loc.data.locType, props.loc.data.template ]);
    const withTemplate = useMemo(() => template && template.icon.id !== FALLBACK_ICON_ID, [ template ]);
    const className = useMemo(() => customClassName(
        "CertificateTitle",
        withTemplate ? "with-template" : undefined,
    ), [ withTemplate ]);

    return (
        <div className={ className }>
            {
                withTemplate && template?.icon &&
                <div className={ `icon-container ${ template.icon.id }` }>
                    <Icon icon={ template.icon }/>
                </div>
            }
            <div className="text">
                <h2>Legal Officer Case</h2>
                <h1>CERTIFICATE</h1>
            </div>
        </div>
    );
}
