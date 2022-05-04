import React from "react";
import { UUID } from "logion-api/dist/UUID";

import Button from "../../common/Button";
import Icon from "../../common/Icon";
import { Children } from "../../common/types/Helpers";

import './StatementOfFactsSummary.css';

export interface Props {
    locId: UUID,
    nodeOwner: string,
    previewPath: string;
    relatedLocPath: string;
}

export default function StatementOfFactsSummary(props: Props) {

    interface NewTabForwardProps {
        path: string;
        children: Children;
    }

    const NewTabForward = React.forwardRef<HTMLAnchorElement, NewTabForwardProps>((props, ref) => {
        const { path, children } = props;
        return (
            <a
                href={ path }
                target="_blank"
                rel="noreferrer"
                ref={ ref }
            >
                { children }
            </a>
        );
    });

    return (
        <div className="StatementOfFactsSummary">
            <h3>Statement of Facts generator</h3>
            <div className="Step1">
                <h4>Step 1 :</h4>
                <p>Your statement of Facts is ready, you can preview it by clicking on the related icon, hereafter.</p>
                <NewTabForward path={ props.previewPath }>
                    <Button slim>
                        <Icon icon={ { id: 'preview' } } />
                        Statement of Facts Preview
                    </Button>
                </NewTabForward>
            </div>
            <div className="Step2">
                <h4>Step 2 :</h4>
                <p>
                    <strong>As a mandatory step, you must submit the signed Statement of Fact PDF in the related
                        LOC: </strong>
                    You can access the related LOC by clicking on the link, hereafter. Do not forget to upload the
                    <strong> signed version of your Statement of Facts</strong> before closing the related LOC. DO NOT
                    put the signed version of this Statement of Facts in another LOC, otherwise, the LOC URL mentioned
                    in the Statement of Facts will not be valid.
                </p>
                <NewTabForward path={ props.relatedLocPath }>
                    <Button>
                        <Icon icon={ { id: 'loc' } } />
                        Go to related LOC
                    </Button>
                </NewTabForward>
            </div>
        </div>
    )
}
