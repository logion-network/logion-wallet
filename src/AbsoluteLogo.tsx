import { CSSProperties } from 'react';
import * as Css from 'csstype';
import './AbsoluteLogo.css';

export interface Props {
    position?: {
        type: Css.Property.Position;
        top?: string;
        left?: string;
    }
}

export default function AbsoluteLogo(props: Props) {

    const style: CSSProperties = {};
    if(props.position !== undefined) {
        style.position = props.position.type;

        if(props.position.top !== undefined) {
            style.top = props.position.top;
        }

        if(props.position.left !== undefined) {
            style.left = props.position.left;
        }
    }

    return (
        <div
            className="AbsoluteLogo"
            style={ style }
        >
            <img src={process.env.PUBLIC_URL + "/logo.png"} alt="logo" height="70" />
            <p>One blockchain <br/>to trust them all</p>
        </div>
    );
}
