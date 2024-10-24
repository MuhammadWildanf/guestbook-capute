const cors = require('cors')
const express = require('express');
const admin = require('firebase-admin');
const serviceAccount = require('./config/serviceAccountKey.json');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running in port:${PORT}`);
});

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://infocomm-bangkok-default-rtdb.asia-southeast1.firebasedatabase.app'
});

app.use(express.static(path.join(__dirname, 'frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.use(express.json())

app.use(bodyParser.json());

app.use(cors({ origin: true }));

app.post('/submit-form', async (req, res) => {
  try {
    const db = admin.database()
    const { name, email, company, char, comment } = req.body;
    const timestamp = admin.database.ServerValue.TIMESTAMP;
    const ref = db.ref('testguest');
    const newRef = await ref.push({ name, email, company, char, comment, timestamp })
    const newKey = newRef.key
    res.status(200).json({ key: newKey });
  } catch (error) {
    console.error('Error submitting data:', error);
    res.status(500).send('Error submitting data');
  }
});

app.post('/update-form', async (req, res) => {
  try {
    const db = admin.database()
    const { key, name, email, company, char, comment } = req.body;
    const ref = db.ref(`/testguest/${key}`);
    const timestamp = admin.database.ServerValue.TIMESTAMP;
    await ref.update({ name, email, company, char, comment, timestamp });
    res.status(200).json({ msg: "Data Updated Successfully" });
  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).send('Error updating data');
  }
});
