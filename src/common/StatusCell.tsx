import * as Css from 'csstype';

import { Icon as IconType } from './ColorTheme';
import Icon from "./Icon";

import './StatusCell.css';
import InlineTooltip from 'src/components/inlinetooltip/InlineTooltip';

export interface Props {
    color: string;
    text: string;
    icon?: IconType;
    textTransform?: Css.Property.TextTransform;
    tooltip?: string;
    tooltipId?: string;
}

export default function StatusCell(props: Props) {

    let icon;
    if(props.icon !== undefined) {
        icon = <Icon icon={ props.icon } height="20px" />;
    } else {
        icon = null;
    }
    let status = <span style={{color: props.color, textTransform: props.textTransform}}>{ props.text }</span>;
    const cell = (
        <span
            className="StatusCell"
            style={{
                borderColor: props.color
            }}
        >
            { icon } { status }
        </span>
    );
    if(props.tooltip && props.tooltipId) {
        return (
            <InlineTooltip
                id={ props.tooltipId }
                inline={ cell }
                text={ props.tooltip }
            />
        );
    } else {
        return cell;
    }
}
