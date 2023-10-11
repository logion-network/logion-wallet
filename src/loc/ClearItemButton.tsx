import Button from "src/common/Button";
import InlineIconText from "src/common/InlineIconText";

export interface Props {
    onClick: () => void;
}

export default function ClearItemButton(props: Props) {
    return (
        <Button
            onClick={ props.onClick }
        >
            <InlineIconText icon={ { id: "clear", hasVariants: true } } height="19px" colorThemeType="dark" text="Clear"/>
        </Button>
    );
}
