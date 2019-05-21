const express = require("express");
const handlebars = require("express-handlebars");
const connect = require("./models/connect.js");
const bodyParser = require("body-parser");
const app = express();
const ObjectId = require("mongodb").ObjectId;
const CronJob = require("cron").CronJob;
const AutoPost = require("./twitter.js");
new CronJob("0 0 * * 0", AutoPost, null, true, "America/Los_Angeles");

app.use(bodyParser.urlencoded());
app.use("/static", express.static("public"));
app.post("/news/create", async (request, response) => {
  const newsposts = {
    name: request.body.name,
    title: request.body.title,
    content: request.body.content
  };
  const db = await connect();
  const collection = db.collection("newsposts");
  await collection.insertOne(newsposts);
  console.log("body", request.body.name);
  response.sendStatus(204);
});

app.engine("handlebars", handlebars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.get("/", (request, response) => {
  response.redirect("/news");
});

app.get("/sida2", (request, response) => {
  response.render("second");
});

app.get("/news", async (request, response) => {
  const db = await connect();
  const collection = db.collection("newsposts");
  const newsposts = await collection.find().toArray();
  response.render("news", {
    hasPosts: newsposts.length,
    posts: newsposts
  });
});

app.get("/topplista", async (request, response) => {
  const db = await connect();
  const collection = db.collection("toplist");
  const newsposts = await collection
    .find()
    .sort({ plays: -1 })
    .toArray();
  response.render("topplista", {
    hasPosts: newsposts.length,
    posts: newsposts
  });
});
app.get("/autopost", async (request, response) => {
  AutoPost();
  response.redirect(`/news`);
});

app.get("/news/edit/:id", async (request, response) => {
  const db = await connect();
  const collection = db.collection("newsposts");
  const newsposts = await collection
    .find({ _id: ObjectId(request.params.id) })
    .toArray();
  response.render("newsedit", {
    hasPosts: newsposts.length,
    news: newsposts[0]
  });
});

app.post("/news/edit/:id", async (request, response) => {
  const db = await connect();
  const collection = db.collection("newsposts");
  await collection.findOneAndUpdate(
    { _id: ObjectId(request.params.id) },
    {
      $set: {
        name: request.body.name,
        title: request.body.title,
        content: request.body.content
      }
    }
  );
  response.redirect(`/news/${request.params.id}`);
});

app.get("/createNews", (request, response) => {
  response.render("createNews");
});
app.get("/news/:id", async (request, response) => {
  const db = await connect();
  const collection = db.collection("newsposts");
  const id = request.params.id;
  const newspost = await collection
    .find({ _id: ObjectId(request.params.id) })
    .toArray();
  response.render("newspost", { post: newspost[0], isAdmin: true });
});
app.get("/news/delete/:id", async (request, respone) => {
  const db = await connect();
  const collection = db.collection("newsposts");
  const id = request.params.id;
  await collection.findOneAndDelete({ _id: ObjectId(id) });
  respone.redirect("/news");
});
app.listen(5056, () => console.log("Application is running on port 5056"));
