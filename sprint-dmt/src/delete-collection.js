import * as firebase_tools from 'firebase-tools';

function deleteCollection() {
    // Only allow admin users to execute this function.
    //if (!(context.auth && context.auth.token && context.auth.token.admin)) {


    // Run a recursive delete on the given document or collection path.
    // The 'token' must be set in the functions config, and can be generated
    // at the command line by running 'firebase login:ci'.
    return firebase_tools.firestore
      .delete('prices', {
        project: 'sprt-8ebe3',
        recursive: true,
        yes: true,
        token: '1/hO02DKCOXcGi5e-2E4vN0XhVtGisfjVAT9D0TXGFpYw'
      })
      .then(() => {
        return {
          path: 'prices'
        };
      });
  }

deleteCollection();
