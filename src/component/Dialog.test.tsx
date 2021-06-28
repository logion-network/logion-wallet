import { shallowRender } from '../tests';
import Dialog from './Dialog';
import { COLOR_THEME } from './TestData';

test("renders with default space above", () => {
    const result = shallowRender(<Dialog
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
        borderColor="black"
    >
        Content
    </Dialog>);
    expect(result).toMatchSnapshot();
});

test("renders with custom space above", () => {
    const result = shallowRender(<Dialog
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
        borderColor="black"
        spaceAbove="200px"
    >
        Content
    </Dialog>);
    expect(result).toMatchSnapshot();
});
