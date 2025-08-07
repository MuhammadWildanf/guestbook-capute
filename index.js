const cors = require('cors')
const express = require('express');
const admin = require('firebase-admin');
const serviceAccount = require('./config/serviceAccountKey.json');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const fs = require('fs');
const badWordsPath = path.join(__dirname, 'data.json');

const PORT = process.env.PORT || 3002;
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
    const { name, email, char, comment } = req.body;
    const timestamp = admin.database.ServerValue.TIMESTAMP;
    const ref = db.ref('testguest');
    const newRef = await ref.push({ name, email, char, comment, timestamp })
    const newKey = newRef.key
    res.status(200).json({ key: newKey, name, char });
  } catch (error) {
    console.error('Error submitting data:', error);
    res.status(500).send('Error submitting data');
  }
});

app.post('/update-form', async (req, res) => {
  try {
    const db = admin.database()
    const { key, name, email, char, comment } = req.body;
    const ref = db.ref(`/testguest/${key}`);
    const timestamp = admin.database.ServerValue.TIMESTAMP;
    await ref.update({ name, email, char, comment, timestamp });
    res.status(200).json({ msg: "Data Updated Successfully" });
  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).send('Error updating data');
  }
});

app.get('/manage-badwords', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'badwords.html'));
});

app.get('/badwords', (req, res) => {
  try {
    const data = fs.readFileSync(badWordsPath, 'utf-8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: 'Gagal membaca data kata terlarang' });
  }
});

// ADD new bad word
app.post('/badwords', (req, res) => {
  const { word } = req.body;
  if (!word) return res.status(400).json({ error: 'Kata tidak boleh kosong' });

  try {
    let data = JSON.parse(fs.readFileSync(badWordsPath));
    const lowerWord = word.toLowerCase();

    if (!data.includes(lowerWord)) {
      data.push(lowerWord);
      fs.writeFileSync(badWordsPath, JSON.stringify(data, null, 2));
    }

    res.json({ success: true, word: lowerWord });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menambah kata terlarang' });
  }
});

// DELETE bad word
app.delete('/badwords/:word', (req, res) => {
  const wordToDelete = req.params.word.toLowerCase();

  try {
    let data = JSON.parse(fs.readFileSync(badWordsPath));
    const filtered = data.filter(w => w !== wordToDelete);
    fs.writeFileSync(badWordsPath, JSON.stringify(filtered, null, 2));

    res.json({ success: true, deleted: wordToDelete });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus kata terlarang' });
  }
});

app.put('/badwords/:oldWord', (req, res) => {
  const oldWord = req.params.oldWord.toLowerCase();
  const { newWord } = req.body;

  if (!newWord) {
    return res.status(400).json({ error: 'Kata baru tidak boleh kosong' });
  }

  try {
    let data = JSON.parse(fs.readFileSync(badWordsPath));
    const index = data.findIndex(w => w === oldWord);

    if (index === -1) {
      return res.status(404).json({ error: 'Kata lama tidak ditemukan' });
    }

    data[index] = newWord.toLowerCase();
    fs.writeFileSync(badWordsPath, JSON.stringify(data, null, 2));

    res.json({ success: true, oldWord, newWord: newWord.toLowerCase() });
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengupdate kata terlarang' });
  }
});
