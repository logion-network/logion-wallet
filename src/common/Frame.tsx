import { Children } from './types/Helpers';
import { useCommonContext } from './CommonContext';

import './Frame.css';
import { ColorTheme } from "./ColorTheme";

export interface Props {
    children: Children,
    disabled?: boolean,
    className?: string,
    fullHeight?: boolean,
    altColors?: boolean,
    title?: Children,
    fillHeight?: boolean,
    colorTheme?: ColorTheme
}

export default function Frame(props: Props) {
    let colorTheme: ColorTheme;
    const commonContext = useCommonContext();
    if (props.colorTheme) {
        colorTheme = props.colorTheme;
    } else {
        colorTheme = commonContext.colorTheme;
    }

    const backgroundColor =
        (props.altColors !== undefined && props.altColors) ?
            colorTheme.frame.altBackground :
            colorTheme.frame.background;
    const inlineCss = `
    .Frame a,
    .Frame .btn-link {
        color: ${colorTheme.frame.link}
    }
    `;

    let className = "Frame";
    if(props.className !== undefined) {
        className = className + " " + props.className;
    }
    if(props.disabled !== undefined && props.disabled) {
        className = className + " disabled";
    }
    if(props.fullHeight !== undefined && props.fullHeight) {
        className = className + " full-height";
    }
    if(props.fillHeight !== undefined && props.fillHeight) {
        className = className + " fill-height";
    }

    return (
        <div
            className={ className }
            style={{
                backgroundColor,
                color: colorTheme.frame.foreground,
                boxShadow: `0 0 25px ${colorTheme.shadowColor}`,
            }}
        >
            <style>
            { inlineCss }
            </style>
            {
                props.title !== undefined &&
                <div className="title">{ props.title }</div>
            }
            { props.children }
        </div>
    );
}
