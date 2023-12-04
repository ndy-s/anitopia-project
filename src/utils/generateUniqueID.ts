export const generateUniqueID = (latestUserToken: string | null, numGenerated = 1) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;
    const codeArrayStore = [];

    let tempLatestUserToken = latestUserToken;

    function incrementToken(token: string) {
        const codeArray = Array.from(token);

        for (let i = codeArray.length - 1; i >= 0; i--) {
            const charIndex = characters.indexOf(codeArray[i]);

            if (charIndex < charactersLength - 1) {
                codeArray[i] = characters.charAt(charIndex + 1);
                break;
            } else {
                codeArray[i] = 'A';
            }
        }

        return codeArray.join('');
    }

    while (numGenerated > 0) {
        if (tempLatestUserToken) {
            const length = Math.max(tempLatestUserToken.length, 4);

            if (tempLatestUserToken === '9'.repeat(length)) {
                return ['A' + 'A'.repeat(length)];
            }

            tempLatestUserToken = incrementToken(tempLatestUserToken);
            codeArrayStore.push(tempLatestUserToken);
            numGenerated--;
        } else {
            codeArrayStore.push('AAAA');
            tempLatestUserToken = 'AAAA';
            numGenerated--;
        }
    }

    return codeArrayStore;
};
