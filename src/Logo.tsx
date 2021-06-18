import React from 'react';

export interface Props {
    size: number
}

export default function Logo(props: Props) {
    return (
        <div className="logo">
            <img src={process.env.PUBLIC_URL + "/logo_black.png"} alt="logo" height={props.size} />
        </div>
    );
}
