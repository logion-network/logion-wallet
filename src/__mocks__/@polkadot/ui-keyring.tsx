let pairs: Record<string, any> = {
    lockedSigner: {
        isLocked: true,
    },
    regularSigner: {
        isLocked: false,
    },
};

const keyring = {

    loadAll: () => {},

    getPair: (signerId: string): any => {
        return pairs[signerId];
    },
};

export default keyring;
