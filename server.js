const express = require('express');
const path = require('path');
const fs = require('fs/promises');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(express.static('public'));

// API routes
const dbPath = path.join(__dirname, 'db', 'db.json');

app.get('/api/notes', async (req, res) => {
  try {
    const data = await fs.readFile(dbPath, 'utf8');
    const notes = JSON.parse(data);
    res.json(notes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/notes', async (req, res) => {
  try {
    const { title, text } = req.body;
    if (!title || !text) {
      return res.status(400).json({ error: 'Title and text are required' });
    }

    const data = await fs.readFile(dbPath, 'utf8');
    const notes = JSON.parse(data);

    const newNote = {
      title,
      text,
      id: Date.now().toString(), // Use timestamp as a simple ID
    };

    notes.push(newNote);

    await fs.writeFile(dbPath, JSON.stringify(notes, null, 2), 'utf8');

    res.json(newNote);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  try {
    const idToDelete = req.params.id;

    const data = await fs.readFile(dbPath, 'utf8');
    const notes = JSON.parse(data);

    const updatedNotes = notes.filter((note) => note.id !== idToDelete);

    await fs.writeFile(dbPath, JSON.stringify(updatedNotes, null, 2), 'utf8');

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// HTML routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'notes.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
