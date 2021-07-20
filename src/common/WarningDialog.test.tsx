import { shallowRender } from '../tests';
import WarningDialog from './WarningDialog';
import { COLOR_THEME } from './TestData';

test("renders with default space above", () => {
    const result = shallowRender(<WarningDialog
        show={ true }
        actions={[
            {
                id: "button",
                buttonText: "Text",
                callback: jest.fn(),
                buttonVariant: 'primary'
            }
        ]}
        size="lg"
        colors={ COLOR_THEME }
    >
        Content
    </WarningDialog>);
    expect(result).toMatchSnapshot();
});

test("renders with custom space above", () => {
    const result = shallowRender(<WarningDialog
        show={ true }
        actions={[
            {
                id: "button",
                buttonText: "Text",
                callback: jest.fn(),
                buttonVariant: 'primary'
            }
        ]}
        size="lg"
        colors={ COLOR_THEME }
        spaceAbove="200px"
    >
        Content
    </WarningDialog>);
    expect(result).toMatchSnapshot();
});
