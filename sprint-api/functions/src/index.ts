import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();


export const products = functions.https.onCall(async (data, context) => {
    let isStrictMatch = true;
    if (data.number.slice(-1) === '*') {
        isStrictMatch = false;
    }
    const startTime = new Date();
    try {
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
            const productItems = [];
            const priceItems = [];
            const promises = [];

            promises.push(admin.firestore().collection('products')
                .where('analogs', "array-contains",
                    hashCode(`${data.brand.toUpperCase()}+${data.number.toUpperCase()}`))
                .limit(200)
                .get());

            promises.push(admin.firestore().collection('prices')
                .where('analogs', "array-contains",
                    hashCode(`${data.brand.toUpperCase()}+${data.number.toUpperCase()}`))
                .limit(1000)
                .get());


            const snapshots = await Promise.all(promises);


            const endTime = new Date();
            console.log(`Get data  ${(endTime.getTime() - startTime.getTime()) / 1000} sec.}`);

            let type = 0;

            snapshots.forEach(querySnapshot => {
                type++;
                querySnapshot.forEach(snap => {
                    if (type === 1) {
                        const row = snap.data();
                        row.id = snap.id;
                        productItems.push(row);

                    } else {
                        const row = snap.data();
                        if (row.brand.toUpperCase() === data.brand.toUpperCase() &&
                            row.shortNumber.toUpperCase() === data.number.toUpperCase()) {
                            row.type = 1;
                        } else {
                            row.type = 2;
                        }
                        priceItems.push(row);
                    }

                });
            });

            return {
                type: 1,
                items: [...productItems.filter(x => x.availability > 0)
                    .sort(function (a, b) {
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
                    }),
                    ...priceItems
                        .sort(function (a, b) {
                            if (a.type > b.type) {
                                return 1;
                            }
                            if (a.type < b.type) {
                                return -1;
                            }
                            if (a.type === b.type) {
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
                            }
                            return 0;
                        })
                ]
            }
        } else {
            // first step
            const promises = [];
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
            const itemMap = new Map();
            for (const val of autoParts) {
                if (itemMap.has(`${val.brand.toUpperCase()}+${val.shortNumber}`)) {
                    if (val.description && val.description.length > 0) {
                        if (!itemMap.get(`${val.brand.toUpperCase()}+${val.shortNumber}`).description ||
                            itemMap.get(`${val.brand.toUpperCase()}+${val.shortNumber}`).description.length === 0) {
                            itemMap.set(`${val.brand.toUpperCase()}+${val.shortNumber}`, val);
                        } else {
                            if (!itemMap.get(`${val.brand.toUpperCase()}+${val.shortNumber}`).analogId && val.analogId) {
                                itemMap.set(`${val.brand.toUpperCase()}+${val.shortNumber}`, val);
                            }
                        }
                    }

                } else {
                    itemMap.set(`${val.brand.toUpperCase()}+${val.shortNumber}`, val);
                }
            }

            for (const val of itemMap) {
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


function hashCode(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++)
        h = Math.imul(31, h) + s.charCodeAt(i) | 0;
    return h;
}