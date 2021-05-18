import React from 'react';
import CreateTokenizationRequest from "./CreateTokenizationRequest";
import {shallowRender} from "../tests";
import {act, fireEvent, render} from '@testing-library/react';

test("renders", () => {
    const tree = shallowRender(<CreateTokenizationRequest onCancel={() => null} onSubmit={() => null}/>)
    expect(tree).toMatchSnapshot();
});

test("submit", () => {
    const cancelCallback = jest.fn();
    const submitCallback = jest.fn();
    const tree = render(<CreateTokenizationRequest onCancel={cancelCallback} onSubmit={submitCallback}/>)
    const button = tree.getByTestId("btnSubmit");
    act(() => { fireEvent.click(button) });
    expect(cancelCallback).not.toBeCalled();
    expect(submitCallback).toBeCalled();
});

test("cancel", () => {
    const cancelCallback = jest.fn();
    const submitCallback = jest.fn();
    const tree = render(<CreateTokenizationRequest onCancel={cancelCallback} onSubmit={submitCallback}/>)
    const button = tree.getByTestId("btnCancel");
    act(() => { fireEvent.click(button) });
    expect(cancelCallback).toBeCalled();
    expect(submitCallback).not.toBeCalled();
});

