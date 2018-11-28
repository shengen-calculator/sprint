import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();


export const products = functions.https.onCall(async (data, context) => {
    let isStrictMatch = true;
    if (data.number.slice(-1) === '*') {
        isStrictMatch = false;
    }
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

        if (data.brand) {
            // second step
            const items = [];
            const productSnapshot = await admin.firestore().collection('products')
                .where('shortNumber', '==', data.number)
                .where('brand', '==', data.brand)
                .limit(100)
                .get();

            productSnapshot.forEach(snap => {
                const row = snap.data();
                row.id = snap.id;
                items.push(row);
            });





            return {
                type: 1,
                items: items
            }
        } else {
            // first step

            if (isStrictMatch) {

                promises.push(admin.firestore().collection('products')
                    .where('shortNumber', '==', data.number.toUpperCase())
                    .limit(100)
                    .get());


                promises.push(admin.firestore().collection('prices')
                    .where('shortNumber', '==', data.number.toUpperCase())
                    .limit(100)
                    .get());


                promises.push(admin.firestore().collection('analogs')
                    .where('shortNumber', '==', data.number.toUpperCase())
                    .limit(100)
                    .get());

            } else {
                const number = data.number.slice(0, -1).toUpperCase();
                const nextNumber = `${number}~`;

                promises.push(admin.firestore().collection('products')
                    .where('shortNumber', '>=', number)
                    .where('shortNumber', '<', nextNumber)
                    .orderBy('shortNumber')
                    .limit(1000)
                    .get());


                promises.push(admin.firestore().collection('prices')
                    .where('shortNumber', '>=', number)
                    .where('shortNumber', '<', nextNumber)
                    .orderBy('shortNumber')
                    .limit(1000)
                    .get());


                promises.push(admin.firestore().collection('analogs')
                    .where('shortNumber', '>=', number)
                    .where('shortNumber', '<', nextNumber)
                    .orderBy('shortNumber')
                    .limit(1000)
                    .get());

            }


            const snapshots = await Promise.all(promises);
            const autoParts = [];
            snapshots.forEach(querySnapshot => {
                querySnapshot.forEach(snap => {
                    const row = snap.data();
                    row.id = snap.id;
                    autoParts.push(row);
                });
            });
            const groupResult = [];
            const brandMap = new Map();
            for (const val of autoParts) {
                if (brandMap.has(`${val.brand.toUpperCase()}+${val.shortNumber}`)) {
                    if (val.description && val.description.length > 0) {
                        if (!brandMap.get(`${val.brand.toUpperCase()}+${val.shortNumber}`).description ||
                            brandMap.get(`${val.brand.toUpperCase()}+${val.shortNumber}`).description.length === 0) {
                            brandMap.set(`${val.brand.toUpperCase()}+${val.shortNumber}`, val);
                        } else {
                            if (!brandMap.get(`${val.brand.toUpperCase()}+${val.shortNumber}`).analogId && val.analogId) {
                                brandMap.set(`${val.brand.toUpperCase()}+${val.shortNumber}`, val);
                            }
                        }
                    }

                } else {
                    brandMap.set(`${val.brand.toUpperCase()}+${val.shortNumber}`, val);
                }
            }

            for (const val of brandMap) {
                groupResult.push(val[1]);
            }

            return {
                type: 0,
                items: groupResult.sort(function (a, b) {
                    if (a.brand > b.brand) {
                        return 1;
                    }
                    if (a.brand < b.brand) {
                        return -1;
                    }
                    if (a.brand === b.brand) {
                        if (a.shortNumber > b.shortNumber) {
                            return 1;
                        }
                        if (a.shortNumber < b.shortNumber) {
                            return -1;
                        }
                    }
                    return 0;
                })
            };
        }
    }


    catch (error) {
        console.log(error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});
