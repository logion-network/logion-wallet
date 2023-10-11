import Button from "src/common/Button";
import { LocItem } from "./LocItem";
import Icon from "src/common/Icon";

export interface Props {
    locItem: LocItem;
    action: (locItem: LocItem) => void;
}

export default function DeleteButton(props: Props) {
    const { locItem, action } = props
    return (
        <Button
            variant="danger-flat"
            onClick={ () => action(locItem) }
            data-testid={ `remove-${ locItem.type }-${ locItem.title() }` }
        >
            <Icon icon={ { id: 'trash' } } />
        </Button>
    );
}
