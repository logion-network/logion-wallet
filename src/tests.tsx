import { ReactElement } from 'react';
import { createRenderer } from 'react-test-renderer/shallow';
import reactRenderer, { ReactTestRenderer, ReactTestRendererJSON, act as reactAct } from 'react-test-renderer';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

export function render(element: ReactElement): null | ReactTestRendererJSON | ReactTestRendererJSON[] {
    const component = reactRenderer.create(element);
    return component.toJSON();
}

export function renderer(element: ReactElement): ReactTestRenderer {
    return reactRenderer.create(element);
}

export function shallowRender<E extends ReactElement>(element: ReactElement): E {
    const renderer = createRenderer();
    renderer.render(element);
    return renderer.getRenderOutput();
}

export function mockAccount(address: string, name: string) {
    return {
        address,
        meta: {
            name
        }
    };
}

export { reactAct as act };

export async function clickByName(name: string) {
    let button: HTMLElement;
    await waitFor(() => button = screen.getByRole("button", { name }));
    await userEvent.click(button!);
}

export async function typeByLabel(label: string, value: string) {
    let input: HTMLElement;
    await waitFor(() => input = screen.getByLabelText(label));
    await userEvent.type(input!, value);
}
