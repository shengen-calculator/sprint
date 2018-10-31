import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();


export const products = functions.https.onCall(async (data, context) => {
    try {
        const promises = [];
        if (!data.number) {
            throw new functions.https.HttpsError('invalid-argument',
                'The function must be called with one arguments "text" containing the condition for search.');
        }

        if (!context.auth) {
            // Throwing an HttpsError so that the client gets the error details.
            throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +
                'while authenticated.');
        }

        promises.push(admin.firestore().collection('products')
            .where('shortNumber', '>=', data.number.toUpperCase())
            .where('shortNumber', '<', next(data.number.toUpperCase()))
            .orderBy('shortNumber')
            .limit(100)
            .get());

        const snapshots = await Promise.all(promises);
        const result = [];
        snapshots.forEach(querySnapshot => {
            querySnapshot.forEach(snap => {
                const row = snap.data();
                row.id = snap.id;
                result.push(row);
            });
        });
        return result;
    }

    catch (error) {
        console.log(error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});


function next(query: string): string {
    if (query) {
        const code = query.charCodeAt(query.length - 1) + 1;
        return `${query.substring(0, query.length - 1)}${String.fromCharCode(code)}`;
    } else {
        return '';
    }
}
