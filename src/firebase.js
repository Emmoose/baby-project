import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

import firebaseConfigTop from "@/utility/firebase-config";

firebase.initializeApp(firebaseConfigTop[process.env.NODE_ENV]);


const db = firebase.firestore();
const auth = firebase.auth();

// collection references
const usersCollection = db.collection("users");
const guessDateCollection = db.collection("guessDate");
const likesCollection = db.collection("likes");
const storiesContentCollection = db.collection("storiesContent");
const storiesCommentsCollection = db.collection("storiesComments");
const allImageUrlsCollection = db.collection("allImageUrls");

const heightCollection = db.collection("height");
const weightCollection = db.collection("weight");

export {
  db,
  auth,
  usersCollection,
  guessDateCollection,
  likesCollection,
  storiesContentCollection,
  heightCollection,
  weightCollection,
  storiesCommentsCollection,
  allImageUrlsCollection
};
