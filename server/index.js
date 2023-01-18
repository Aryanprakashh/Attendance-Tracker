const express = require("express");
const app = express();

app.post("/api/login", function (req, res) {
  const { email, password } = req.body;
  console.log(email, password);
});

app.listen(3000);
