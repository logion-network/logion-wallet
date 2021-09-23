import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useCommonContext } from '../../common/CommonContext';
import Table, { Cell, EmptyTableMessage, DateCell } from '../../common/Table';
import LocStatusCell from '../../common/LocStatusCell';
import Button from '../../common/Button';
import Dialog from '../../common/Dialog';
import { CreateLocRequest, createLocRequest } from '../../common/Model';

import LocCreationForm, { FormValues } from './LocCreationForm';

export default function RequestedLocs() {
    const { colorTheme, pendingLocRequests, accounts, refresh, axios } = useCommonContext();
    const [ requestLoc, setRequestLoc ] = useState(false);
    const { control, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
        defaultValues: {
            description: "",
            legalOfficer: "",
        }
    });

    const submit = useCallback((formValues: FormValues) => {
        (async function() {
            const currentAddress = accounts!.current!.address;
            const request: CreateLocRequest = {
                ownerAddress: formValues.legalOfficer,
                requesterAddress: currentAddress,
                description: formValues.description,
            }
            await createLocRequest!(axios!, request);
            reset();
            setRequestLoc(false);
            refresh!();
        })();
    }, [ axios, accounts, setRequestLoc, refresh, reset ]);

    if(pendingLocRequests === null) {
        return null;
    }

    return (
        <>
            <Table
                columns={[
                    {
                        header: "Legal officer",
                        render: request => <Cell content={ request.ownerAddress }  overflowing tooltipId={ `dest-${request.id}` } />,
                        align: 'left',
                    },
                    {
                        "header": "Description",
                        render: request => <Cell content={ request.description } />,
                        align: 'left',
                    },
                    {
                        header: "Status",
                        render: request => <LocStatusCell status={ request.status }/>,
                        width: "140px",
                    },
                    {
                        header: "Creation date",
                        render: request => <DateCell dateTime={ request.createdOn || null } />,
                        width: '200px',
                    }
                ]}
                data={ pendingLocRequests }
                renderEmpty={ () => <EmptyTableMessage>No requested LOCs</EmptyTableMessage> }
            />
            <Button onClick={() => setRequestLoc(true)}>Request new LOC</Button>
            <Dialog
                show={ requestLoc }
                size="lg"
                actions={[
                    {
                        id: "submit",
                        buttonText: 'Submit',
                        buttonVariant: 'primary',
                        type: 'submit',
                    },
                    {
                        id: "cancel",
                        callback: () => { reset() ; setRequestLoc(false) },
                        buttonText: 'Cancel',
                        buttonVariant: 'secondary',
                    }
                ]}
                onSubmit={handleSubmit(submit)}
            >
                <LocCreationForm
                    control={ control }
                    errors={ errors }
                    colors={ colorTheme.dialog }
                />
            </Dialog>
        </>
    );
}
