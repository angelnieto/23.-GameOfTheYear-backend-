import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as cors from 'cors';
import * as express from 'express';

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://fir-fotos-eecb0.firebaseio.com"
});

const db = admin.firestore();

// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.json({
//    mensaje : "¡Esto es el Hola Mundo desde las Cloud Functions de Firebase!"
//  });
// });

export const getGoty = functions.https.onRequest( async(request, response) => {

  const reference = db.collection('goty');
  const snapshot = await reference.get();
  const games = snapshot.docs.map( doc => doc.data());

 response.status(200).json(games);
});

const app = express();
app.use( cors({ origin:true }) );

app.get('/goty', async(request, response) => {

  const reference = db.collection('goty');
  const snapshot = await reference.get();
  const games = snapshot.docs.map( doc => doc.data());

 response.status(200).json(games);
});

app.post('/goty/:id', async(request, response) => {
  const id = request.params.id;

  let status = 404;
  let json = {
    ok      : false,
    mensaje : 'No se encontró ningún juego con el id ' + id
  }

  const reference = db.collection('goty').doc(id);
  const snapshot = await reference.get();
  if(snapshot.exists){
    const game = snapshot.data() || {votes : 0};
    reference.update({ votes : game.votes + 1})
          .catch(err => {
            status = 500;
            json = {
              ok      : false,
              mensaje : 'Error de servidor'
            }
          });

    status = 200;
    json = {
      ok      : true,
      mensaje : 'Muchas gracias por votar por el juego ' + game.name
    }
  }

  response.status(status).json(json);
});

export const api = functions.https.onRequest( app );
