import React from 'react';

import './Logo.css';

export interface Props {
    shadowColor: string,
}

export default function Logo(props: Props) {

    return (
        <div
            className="Logo"
            style={{
                boxShadow: `0 5px 25px ${props.shadowColor}`,
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
