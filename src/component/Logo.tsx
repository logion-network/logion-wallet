import React from 'react';

import { BackgroundAndForegroundColors } from './ColorTheme';

import './Logo.css';

export interface Props extends BackgroundAndForegroundColors {
    logoShadow: string,
}

export default function Logo(props: Props) {

    return (
        <div
            className="Logo"
            style={{
                backgroundColor: props.background,
                color: props.foreground,
                boxShadow: `0 5px 25px ${props.logoShadow}`,
            }}
        >
            <div className="image-and-slogan">
                <div className="image">
                    <img src={process.env.PUBLIC_URL + "/logo.png"} alt="logo" />
                </div>
                <div className="slogan">
                    <div className="text">
                        One blockchain<br/>
                        to trust them all
                    </div>
                </div>
            </div>
        </div>
    );
}
