import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();


export const products = functions.https.onCall(async (data, context) => {
    let isStrictMatch = true;
    if (data.number.slice(-1) === '*') {
        isStrictMatch = false;
    }
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
            const productAnalogItems = [];
            const productGroupedAnalogItems = [];
            const priceItems = [];

            const productSnapshot = await admin.firestore().collection('products')
                .where('shortNumber', '==', data.number)
                .where('brand', '==', data.brand)
                .limit(200)
                .get();

            productSnapshot.forEach(snap => {
                const row = snap.data();
                row.id = snap.id;
                productItems.push(row);
            });

            if (productItems.length > 0) {
                const productWithAnalogs = productItems.filter(x => x.analogId > 0);

                if (productWithAnalogs.length > 0) {

                    const productAnalogSnapshot = await admin.firestore().collection('products')
                        .where('analogId', '==', productWithAnalogs[0].analogId)
                        .limit(200)
                        .get();

                    productAnalogSnapshot.forEach(snap => {
                        const row = snap.data();
                        row.id = snap.id;
                        row.type = 0;
                        productAnalogItems.push(row);
                    });

                    //group by brand and number

                    const itemMap = new Map();
                    for (const val of productAnalogItems) {
                        if (!itemMap.has(`${val.brand.toUpperCase()}+${val.shortNumber}`)) {
                            itemMap.set(`${val.brand.toUpperCase()}+${val.shortNumber}`, val);
                        }
                    }

                    for (const val of itemMap) {
                        productGroupedAnalogItems.push(val[1]);
                    }

                    //get list of analog
                    const promises = [];

                    for (const val of productGroupedAnalogItems) {
                        promises.push(admin.firestore().collection('analogs')
                            .where('shortNumber', '==', val.shortNumber.toUpperCase())
                            .where('brand', '==', val.brand.toUpperCase())
                            .limit(500)
                            .get());
                    }
                    const analogSnapshots = await Promise.all(promises);
                    itemMap.clear(); //prepare map for analog collection

                    analogSnapshots.forEach(querySnapshot => {
                        querySnapshot.forEach(snap => {
                            const row = snap.data();
                            if (!itemMap.has(`${row.analogBrand.toUpperCase()}+${row.analogShortNumber}`)) {
                                itemMap.set(`${row.analogBrand.toUpperCase()}+${row.analogShortNumber}`, row);
                            }
                        });
                    });
                    //get prices
                    const pricePromises = [];
                    if (!itemMap.has(`${data.brand.toUpperCase()}+${data.number}`)) {
                        pricePromises.push(admin.firestore().collection('prices')
                            .where('shortNumber', '==', data.number.toUpperCase())
                            .where('brand', '==', data.brand.toUpperCase())
                            .limit(500)
                            .get());
                    }

                    for (const val of itemMap) {
                        pricePromises.push(admin.firestore().collection('prices')
                            .where('shortNumber', '==', val[1].analogShortNumber.toUpperCase())
                            .where('brand', '==', val[1].analogBrand.toUpperCase())
                            .limit(500)
                            .get());
                    }

                    const priceSnapshots = await Promise.all(pricePromises);

                    priceSnapshots.forEach(querySnapshot => {
                        querySnapshot.forEach(snap => {
                            const row = snap.data();
                            if (row.brand.toUpperCase() === data.brand.toUpperCase() &&
                                row.shortNumber.toUpperCase() === data.number.toUpperCase()) {
                                row.type = 1;
                            } else {
                                row.type = 2;
                            }
                            priceItems.push(row);
                        });
                    });
                }
            } else {
                // nothing in catalog
                const analogSnapshots = await admin.firestore().collection('analogs')
                    .where('shortNumber', '==', data.number.toUpperCase())
                    .where('brand', '==', data.brand.toUpperCase())
                    .limit(500)
                    .get();

                const itemMap = new Map(); //prepare map for analog collection
                analogSnapshots.forEach(snap => {
                    const row = snap.data();
                    if (!itemMap.has(`${row.analogBrand.toUpperCase()}+${row.analogShortNumber}`)) {
                        itemMap.set(`${row.analogBrand.toUpperCase()}+${row.analogShortNumber}`, row);
                    }
                });

                //get prices
                const pricePromises = [];

                if (!itemMap.has(`${data.brand.toUpperCase()}+${data.number}`)) {
                    pricePromises.push(admin.firestore().collection('prices')
                        .where('shortNumber', '==', data.number.toUpperCase())
                        .where('brand', '==', data.brand.toUpperCase())
                        .limit(500)
                        .get());
                }
                console.log(itemMap);
                for (const val of itemMap) {
                    pricePromises.push(admin.firestore().collection('prices')
                        .where('shortNumber', '==', val[1].analogShortNumber.toUpperCase())
                        .where('brand', '==', val[1].analogBrand.toUpperCase())
                        .limit(500)
                        .get());
                }

                const priceSnapshots = await Promise.all(pricePromises);

                priceSnapshots.forEach(querySnapshot => {
                    querySnapshot.forEach(snap => {
                        const row = snap.data();
                        if (row.brand.toUpperCase() === data.brand.toUpperCase() &&
                            row.shortNumber.toUpperCase() === data.number.toUpperCase()) {
                            row.type = 1;
                        } else {
                            row.type = 2;
                        }
                        priceItems.push(row);
                    });
                });
            }

            return {
                type: 1,
                items: [...productAnalogItems.filter(x => x.availability > 0),
                    ...priceItems.sort(function (a, b) {
                        if (a.type > b.type) {
                            return 1;
                        }
                        if (a.type < b.type) {
                            return -1;
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
