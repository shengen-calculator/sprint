import firebase from 'firebase';

const config = {
  apiKey: "XXXXXXXXX",
  authDomain: "XXXXXXXX.firebaseapp.com",
  projectId: "XXXXXXXXX"
};

if (!firebase.apps.length) {
  firebase.initializeApp(config);
}

export const database = firebase.firestore();
export const auth = firebase.auth();
export const user = 'XXXX';
export const password = '********';

database.settings({
  timestampsInSnapshots: true
});
