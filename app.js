const express = require('express');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true })); // for form data
app.use(express.json()); // for JSON payloads

// In-memory store (no DB)
const posts = []; // { id, title, content, slug, createdAt }

function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Routes
app.get('/', (req, res) => {
  res.render('index', { posts });
});

app.get('/compose', (req, res) => {
  res.render('compose', { error: null, values: {} });
});

app.post('/compose', (req, res) => {
  let { title, content } = req.body;
  title = title ? title.trim() : '';
  content = content ? content.trim() : '';

  if (!title || !content) {
    return res.status(400).render('compose', {
      error: 'Title and content are required.',
      values: { title, content }
    });
  }

  const base = slugify(title) || 'post';
  let slug = base;
  let i = 1;
  while (posts.some(p => p.slug === slug)) slug = `${base}-${i++}`;

  const post = {
    id: Date.now().toString(36),
    title,
    content,
    slug,
    createdAt: new Date()
  };

  posts.unshift(post); // latest first
  res.redirect(`/posts/${slug}`);
});

app.get('/posts/:slug', (req, res) => {
  const post = posts.find(p => p.slug === req.params.slug);
  if (!post) return res.status(404).render('404');
  res.render('post', { post });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).render('404');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`\nServer running → http://localhost:${PORT}`));