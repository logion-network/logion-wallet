import React from 'react';
import * as css from 'csstype';

import LegalOfficer from '../../component/types/LegalOfficer';
import { BackgroundAndForegroundColors } from '../../component/ColorTheme';

import './Officer.css';

export interface Props {
    officer: LegalOfficer | null,
    colors: BackgroundAndForegroundColors,
}

export default function Officer(props: Props) {

    let visibility: css.Property.Visibility;
    if(props.officer !== null) {
        visibility = 'visible';
    } else {
        visibility = 'hidden';
    }

    return (
        <div className="Officer"
            style={{
                visibility,
                color: props.colors.foreground,
                backgroundColor: props.colors.background,
            }}
        >
            <div className="address">{ props.officer?.address }</div>
            <div className="details">{ props.officer?.details }</div>
        </div>
    );
}
