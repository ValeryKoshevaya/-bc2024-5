const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3001;
const NOTES_DIR = path.join(__dirname, 'notes');


// Для парсингу JSON
app.use(express.json());
// Для парсингу x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
 

if (!fs.existsSync(NOTES_DIR)) {
  fs.mkdirSync(NOTES_DIR);
}



app.get('/notes/:name', (req, res) => {
  const noteName = req.params.name;
  const notePath = path.join(NOTES_DIR, noteName + '.txt');
  
  if (!fs.existsSync(notePath)) {
    return res.status(404).send('Not found');
  }
  
  const noteContent = fs.readFileSync(notePath, 'utf-8');
  res.send(noteContent);
});

app.put('/notes/:name', (req, res) => {
  const noteName = req.params.name;
  const notePath = path.join(NOTES_DIR, noteName + '.txt');
  
  if (!fs.existsSync(notePath)) {
    return res.status(404).send('Not found');
  }

  const newText = req.body.text;
  
  if (typeof newText === 'undefined') {
    return res.status(400).send('Bad request: text is undefined');
  }

  fs.writeFileSync(notePath, newText);
  res.send('Updated');
});

app.delete('/notes/:name', (req, res) => {
  const noteName = req.params.name;
  const notePath = path.join(NOTES_DIR, noteName + '.txt');
  
  if (!fs.existsSync(notePath)) {
    return res.status(404).send('Not found');
  }

  fs.unlinkSync(notePath);
  res.send('Deleted');
});

app.get('/notes', (req, res) => {
  const notes = fs.readdirSync(NOTES_DIR).map(file => {
    const notePath = path.join(NOTES_DIR, file);
    if (fs.statSync(notePath).isFile()) {
      const name = path.basename(file, '.txt');
      const text = fs.readFileSync(notePath, 'utf-8');
      return { name, text };
    }
  }).filter(note => note !== undefined);

  res.status(200).json(notes);
});

const upload = multer(); // Налаштування multer для обробки форм
app.post('/write', upload.none(), (req, res) => {
  const noteName = req.body.note_name;
  const noteText = req.body.note;
  const notePath = path.join(NOTES_DIR, noteName + '.txt');

  // Перевірка на існування нотатки з таким ім’ям
  if (fs.existsSync(notePath)) {
    return res.status(400).send('Note already exists');
  }

  // Запис нової нотатки
  fs.writeFileSync(notePath, noteText);
  res.status(201).send('Created');
});


app.get('/UploadForm.html', (req, res) => {
  res.send(`
    <html>
      <body>
        <h1>Upload a New Note</h1>
        <form action="/write" method="post" enctype="multipart/form-data">
          <label for="note_name">Note Name:</label>
          <input type="text" name="note_name" required placeholder="Enter note name"><br><br>
          <label for="note">Note Text:</label>
          <textarea name="note" required placeholder="Enter note content"></textarea><br><br>
          <button type="submit">Submit</button>
        </form>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
