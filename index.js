const {
  initializeApp,
  applicationDefault,
  cert,
} = require("firebase-admin/app");
const {
  getFirestore,
  Timestamp,
  FieldValue,
} = require("firebase-admin/firestore");
var cors = require('cors')
const express = require("express");

// Init Firestore
const serviceAccount = require("./react-http-bbe1c-36f9987b063c.json");
initializeApp({
  credential: cert(serviceAccount),
});
const db = getFirestore();

// Init app
const app = express();
const port = 8000;
app.use(cors());
app.use(express.json());
const { createProxyMiddleware } = require('http-proxy-middleware');
app.use('/api', createProxyMiddleware({ 
    target: 'http://localhost:8080/', //original url
    changeOrigin: true, 
    //secure: false,
    onProxyRes: function (proxyRes, req, res) {
       proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    }
}));
app.listen(port);

// get /api/todo
app.get("/todo", async (req, res) => {
  const arr = [];
  const snapshot = await db.collection("todos").get();
  snapshot.forEach((doc) => {
    arr.push(doc.data());
  });

  res.send(arr);
});

// post /api/todo
app.post("/todo", async (req, res) => {
    const snapshot = db.collection('todos').doc(req.body.id);
    await snapshot.set(req.body);
  res.send(true);
});

// put /api/todo
app.put("/todo", async (req, res) => {
    const ids = req.body;
    ids.forEach(async (id) => {
        const snapshot = db.collection('todos').doc(id);
        const doc = await snapshot.get();
        await snapshot.set({...doc.data(), status: 'Completed'});
    })
  res.send(true);
});

// delete /api/todo
app.delete("/todo/:ids", async (req, res) => {
    const ids = req.params.ids.split(',');
    ids.forEach(async (id) => {
        const firestoreRes = await db.collection('todos').doc(id).delete();
    })
  res.send(true);
});
