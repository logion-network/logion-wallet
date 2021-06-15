import React from 'react';

import './Logo.css';

export default function Logo() {

    return (
        <div className="Logo">
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
