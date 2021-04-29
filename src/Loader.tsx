import React from 'react';

export interface Props {
    text: string
}

export default function Loader(props: Props) {
    return <p>{props.text}</p>;
}
