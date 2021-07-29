import { Icon as IconType } from './ColorTheme';
import { useCommonContext } from './CommonContext';

export interface Props {
    icon: IconType,
    type?: 'svg' | 'png',
    height?: string,
    width?: string,
}

export default function Icon(props: Props) {
    const { colorTheme } = useCommonContext();

    let ext = 'svg';
    if(props.type !== undefined) {
        ext = props.type;
    }

    let iconUrl = undefined;
    if(props.icon.category !== undefined && (props.icon.hasVariants !== undefined) && props.icon.hasVariants) {
        iconUrl = `${process.env.PUBLIC_URL}/assets/categories/${props.icon.category}/themes/${colorTheme.type}/${props.icon.id}.${ext}`;
    } else if(props.icon.category !== undefined && ((props.icon.hasVariants === undefined) || !props.icon.hasVariants)) {
        iconUrl = `${process.env.PUBLIC_URL}/assets/categories/${props.icon.category}/${props.icon.id}.${ext}`;
    } else if(props.icon.category === undefined && ((props.icon.hasVariants !== undefined) && props.icon.hasVariants)) {
        iconUrl = `${process.env.PUBLIC_URL}/assets/themes/${colorTheme.type}/${props.icon.id}.${ext}`;
    } else {
        iconUrl = `${process.env.PUBLIC_URL}/assets/${props.icon.id}.${ext}`;
    }

    return (
        <img
            src={ iconUrl }
            alt=''
            height={ props.height }
            width={ props.width }
        />
    );
}
