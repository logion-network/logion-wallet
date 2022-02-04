import React from 'react';
import * as css from 'csstype';

import { BackgroundAndForegroundColors } from '../../common/ColorTheme';

import './Officer.css';
import CopyPasteButton from "../../common/CopyPasteButton";
import { Row } from "../../common/Grid";
import { LegalOfficer } from '../../directory/DirectoryApi';
import { LegalOfficerPostalAddress } from '../../common/LegalOfficerPostalAddress';
import LegalOfficerAdditionalDetails from '../../common/LegalOfficerAdditionalDetails';

export interface Props {
    officer: LegalOfficer | null,
    colors: BackgroundAndForegroundColors,
    borderColor?: string,
}

export default function Officer(props: Props) {

    let visibility: css.Property.Visibility;
    if(props.officer !== null) {
        visibility = 'visible';
    } else {
        visibility = 'hidden';
    }
    let border = undefined;
    if(props.borderColor !== undefined) {
        border = `1px solid ${props.borderColor}`;
    }

    const polkadotAddress = props.officer?.address ? props.officer?.address : "";
    return (
        <div className="Officer"
             style={ {
                 visibility,
                 color: props.colors.foreground,
                 backgroundColor: props.colors.background,
                 border,
             } }
        >
            <Row className="address">
                <span className="text">{ polkadotAddress }</span>
                <CopyPasteButton value={ polkadotAddress } className="medium" />
            </Row>
            <div className="details">
                { props.officer && <LegalOfficerPostalAddress address={ props.officer.postalAddress } /> }
                { props.officer && <LegalOfficerAdditionalDetails additionalDetails={ props.officer.additionalDetails } /> }
            </div>
        </div>
    );
}
