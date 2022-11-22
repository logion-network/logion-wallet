import { Children } from './types/Helpers';
import { useCommonContext } from './CommonContext';

import './Frame.css';
import { ColorTheme, MenuIcon as MenuIconType } from "./ColorTheme";
import MenuIcon from "./MenuIcon";

export interface Props {
    children: Children,
    disabled?: boolean,
    className?: string,
    fullHeight?: boolean,
    altColors?: boolean,
    title?: Children,
    fillHeight?: boolean,
    colorTheme?: ColorTheme,
    titleIcon?: MenuIconType,
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
            <div className="title-area">
            {
                props.titleIcon !== undefined &&
                <MenuIcon
                    { ...props.titleIcon }
                />
            }
            {
                props.title !== undefined &&
                <div className="title">{ props.title }</div>
            }
            </div>
            { props.children }
        </div>
    );
}
