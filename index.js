let express = require('express');
let path =  require("path");
const {v4: uuidv4} = require("uuid");
const methodOverride = require("method-override");
let app = express();

app.use(methodOverride("_method"));
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "/public")));



let port = 8080;
app.listen(port, () =>{
    console.log(`Server is running on port ${port}`);
    console.log(
      `http://localhost:${port}`)
});

// Mock Data
let user=[];

let posts = [
  {
    id: uuidv4(),
    user: "Sarah Jenkins",
    initial: "S",
    topic: "Technology",
    title: "The Future of AI in Creative Writing",
    content: "Artificial Intelligence is no longer just a buzzword. It is actively shaping how we perceive creativity. In this article, we explore how LLMs are assisting authors rather than replacing them...",
    likes: 124,
    comments: 18
  },
  {
    id: uuidv4(),
    user: "Marcus Aurelius",
    initial: "M",
    topic: "Lifestyle",
    title: "Finding Stillness in a Busy World",
    content: "Modern life moves at a breakneck speed. We often forget to breathe and simply be. Meditation and intentional living can help us reclaim our time and our peace of mind...",
    likes: 89,
    comments: 12
  },
  {
    id: uuidv4(),
    user: "Elena Rodriguez",
    initial: "E",
    topic: "Business",
    title: "Bootstrap vs Venture Capital: The Real Tradeoff",
    content: "Every founder faces the dilemma of how to fund their dream. While VC money brings scale, bootstrapping brings freedom. Let's look at the data behind both paths to success...",
    likes: 256,
    comments: 45
  },
  {
    id: uuidv4(),
    user: "David Chen",
    initial: "D",
    topic: "Art",
    title: "Digital Canvas: Why NFTs Still Matter",
    content: "Beyond the hype cycles and price fluctuations, the underlying technology of digital ownership is revolutionizing the art world for independent creators globally...",
    likes: 110,
    comments: 31
  },
  {
    id: uuidv4(),
    user: "Aria Stark",
    initial: "A",
    topic: "Culture",
    title: "The Hidden History of Street Food",
    content: "From the night markets of Taipei to the taco trucks of Los Angeles, street food tells the story of migration, adaptation, and cultural survival in the modern city...",
    likes: 432,
    comments: 67
  }
];

let topics = [
  { name: "Technology"},
  { name: "Lifestyle" },
  { name: "Business" },
  { name: "Art" },
  { name: "Culture" },
  { name: "Health" }
];

module.exports = {posts, topics};

app.get("/", (req, res) =>{
    res.render("Home");
});



app.get("/SignIn", (req, res) =>{
    res.render("SignIn");
});
app.post("/Blog", (req, res) =>{
    let {username, email, password} = req.body;
    user.push({username, email, password});
    res.redirect("/Blog");
});


app.get("/Blog", (req, res) =>{
    res.render("Blog", {user: user.length > 0 ? user[user.length - 1] : null});
});
app.post("/Posts", (req, res) =>{
    let {title, topic, content} = req.body;
    let id  = uuidv4();
    posts.push({id:uuidv4(), title: title, topic: topic, content: content, user: user.length > 0 ? user[user.length - 1].username : null, initial: user.length > 0 ? user[user.length - 1].username.charAt(0).toUpperCase() : null, likes: 0, comments: 0});
    res.redirect("/Posts");
;});


app.get("/Posts", (req,res) =>{
  res.render("Posts", {posts: posts, topics: topics, user: user.length > 0 ? user[user.length - 1] : null});
});

app.patch("/Posts/:id", (req, res) =>{
  let {id} = req.params;
  let newContent = req.body.content;
  let newTitle = req.body.title;
  let post = posts.find(p => p.id === id);
  post.content = newContent;
  post.title = newTitle;
  res.redirect("/Posts");
});

app.get("/Posts/:id/edit", (req, res) => {
  let {id} = req.params;
  let post = posts.find(p => p.id === id);
  res.render("Edit", {user: user.length > 0 ? user[user.length - 1] : null, post});
});

app.delete("/Posts/:id", (req, res) => {
  let {id} = req.params;
  posts = posts.filter(p => p.id !== id);
  res.redirect("/Posts");
});

app.get("/Posts/:username/MyPosts", (req, res) =>{
  let {username} = req.params;
  let userPosts = posts.filter(p => p.user === username);
  res.render("MyPosts", {posts: userPosts, user: user.length > 0 ? user[user.length - 1] : null});
});


