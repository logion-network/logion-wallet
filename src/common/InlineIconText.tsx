import { ColorThemeType, Icon as IconType } from "./ColorTheme";
import Icon from "./Icon";
import "./InlineIconText.css";

export interface Props {
    icon: IconType;
    height?: string;
    text: string;
    colorThemeType?: ColorThemeType;
}

export default function InlineIconText(props: Props) {
    return (
        <span className="InlineIconText">
            <Icon icon={ props.icon } height={ props.height } colorThemeType={ props.colorThemeType } />
            <span className="text">{ props.text }</span>
        </span>
    );
}
