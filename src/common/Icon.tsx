import { ColorThemeType, Icon as IconType } from './ColorTheme';
import { useCommonContext } from './CommonContext';

export type IconFileType = 'svg' | 'png';

export interface Props {
    icon: IconType;
    type?: IconFileType;
    height?: string;
    width?: string;
    colorThemeType?: ColorThemeType;
}

export default function Icon(props: Props) {
    const { colorTheme } = useCommonContext();

    let ext = 'svg';
    if(props.type !== undefined) {
        ext = props.type;
    }
    
    let colorThemeType;
    if(props.colorThemeType !== undefined) {
        colorThemeType = props.colorThemeType;
    } else {
        colorThemeType = colorTheme.type;
    }

    let iconUrl = undefined;
    if(props.icon.category !== undefined && (props.icon.hasVariants !== undefined) && props.icon.hasVariants) {
        iconUrl = `${process.env.PUBLIC_URL}/assets/categories/${props.icon.category}/themes/${colorThemeType}/${props.icon.id}.${ext}`;
    } else if(props.icon.category !== undefined && ((props.icon.hasVariants === undefined) || !props.icon.hasVariants)) {
        iconUrl = `${process.env.PUBLIC_URL}/assets/categories/${props.icon.category}/${props.icon.id}.${ext}`;
    } else if(props.icon.category === undefined && ((props.icon.hasVariants !== undefined) && props.icon.hasVariants)) {
        iconUrl = `${process.env.PUBLIC_URL}/assets/themes/${colorThemeType}/${props.icon.id}.${ext}`;
    } else {
        iconUrl = `${process.env.PUBLIC_URL}/assets/${props.icon.id}.${ext}`;
    }

    return (
        <img
            src={ iconUrl }
            alt={ props.icon.id }
            height={ props.height }
            width={ props.width }
        />
    );
}
