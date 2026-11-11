
const express = require("express");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.send("My backend server is running!");
});


app.get("/projects", (req, res) => {
    res.send("project");
});
                                                            
app.post("/projects", (req, res) => {
    res.send("project added successfully");
});

app.put("/projects/:id", (req, res) => {
    res.send("project updated successfully");
});

app.delete("/projects/:id", (req, res) => {
    res.send("project deleted successfully");
});


app.
app.listen(3000, () => {
    console.log("Server running on port 3000");
});









