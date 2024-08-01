import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "school",
  password: "sm200488",
  port: 5432,
});

db.connect();

let posts = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(bodyParser.json());

app.set("view engine", "ejs");

// Route to render the main page
app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM book_detail;");
    posts = result.rows;
    res.render("index", { posts: posts });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching posts");
  }
});

// Route to render the new post page
app.get("/new", (req, res) => {
  res.render("modify", { heading: "New Post", submit: "Create Post", post: null });
});

// Route to render the edit page
app.get("/edit/:id", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM book_detail WHERE id = $1;", [req.params.id]);
    const post = result.rows[0];
    res.render("modify", { heading: "Edit Post", submit: "Update Post", post: post });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching post");
  }
});

// Create a new post
app.post("/api/posts", async (req, res) => {
  const { book_name, author_name, content, rating, isbn_no } = req.body;
  try {
    await db.query(
      "INSERT INTO book_detail (book_name, author_name, content, rating, isbn_no) VALUES ($1, $2, $3, $4, $5);",
      [book_name, author_name, content, rating, isbn_no]
    );
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating post");
  }
});

// Update an existing post
app.post("/api/posts/:id", async (req, res) => {
  const { book_name, author_name, content, rating, isbn_no } = req.body;
  try {
    await db.query(
      "UPDATE book_detail SET book_name = $1, author_name = $2, content = $3, rating = $4, isbn_no = $5 WHERE id = $6;",
      [book_name, author_name, content, rating, isbn_no, req.params.id]
    );
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating post");
  }
});

// Delete a post
app.get("/api/posts/delete/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM book_detail WHERE id = $1;", [req.params.id]);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting post");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});