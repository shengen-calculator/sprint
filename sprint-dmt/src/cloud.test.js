import { database, auth, user, password } from "./firestore";
import chalk from 'chalk';

/* eslint-disable no-console */


auth.signInWithEmailAndPassword(user, password)
  .then(() => {

  database.collection("users").add({
    first: "Ada",
    last: "Lovelace",
    born: 1815
  })
    .then(function(docRef) {
      console.log(chalk.green("Document written with ID: ", docRef.id));

      database.collection("users").doc(docRef.id).delete().then(function() {
        console.log("Document successfully deleted!");
        process.exit();
      }).catch(function(error) {
        console.error("Error removing document: ", error);
        process.exit();
      });

    })
    .catch(function(error) {
      console.error(chalk.red("Error adding document: ", error));
      process.exit();
    });

  })
  .catch(function(error) {
  // Handle Errors here.
  console.log(chalk.red(`${error.code} - ${error.message}`));

});
