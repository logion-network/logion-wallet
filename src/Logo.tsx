import React from 'react';
import './Logo.css';

export default function Component() {
    return (
        <div className="logo">
            <img src={process.env.PUBLIC_URL + "/logo.png"} alt="logo" />
        </div>
    );
}
