// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
import { initializeApp } from 'firebase/app';

//Replace the following with your app's Firebase project configuration 
//(https://firebase.google.com/docs/web/setup?authuser=1#config-object)
const firebaseConfig = {
  apiKey: "Axxxxxxxxxxxxxxxxxxxxxxxxxxxxx8",
  authDomain: "xxxxxxxxxxx.firebaseapp.com",
  databaseURL: "https://xxxxxxx.firebaseio.com",
  projectId: "xxxxxxxxxx",
  storageBucket: "xxxxxxxx.appspot.com",
  messagingSenderId: "123123123123",
  appId: "1:123123:web:123123123123123",
  measurementId: "G-123123"
};

initializeApp(firebaseConfig);