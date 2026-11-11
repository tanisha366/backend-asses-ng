
const express=require("express");
const mongoose=require("mongoose");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
require("dotenv").config();

const app=express();

app.use(express.json());

const User=mongoose.model("User",new mongoose.Schema({
    name: String,
    email:{ type: String, unique: true },
    password: String
}));


const Project=mongoose.model("Project", new mongoose.Schema({
    name: String,
    description: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}));


const Task=mongoose.model("Task", new mongoose.Schema({
    title: String,
    description: String,
    status: { type: String, default: "pending" },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}));

app.get("/",(req, res)=>{
    res.send("Backendis running");
});


app.post("/register",async (req, res)=>{                                                                                    
    try {
        const {name,email,password }=req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }


        const existingUser=await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        

        const hashedPassword=await bcrypt.hash(password, 10);
        const user=new User({
            name,
            email,
            password: hashedPassword
        });
        await user.save();
        res.status(201).json({
            message: "User registered successfully"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
app.post("/login", async (req, res) => {
    try {

        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

    
        const isMatch=await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid password"
            });
        }
        


        const token=jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );
        res.json({
            message: "Login successful",
            token: token
        });

    } catch(error) {
        res.status(500).json({ message: error.mesage });
    }
});
app.post("/projects", auth, async (req, res) => {
    try {
        const project = new Project({
            name: req.body.name,
            description: req.body.description,
            user: req.user
        });


    
        await project.save();

        res.status(201).json({
            message: "Project added successfully",
            project
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get("/projects",auth, async (req, res) => {
    try {
        const projects = await Project.find({
            user: req.user
        });

        res.json(projects);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put("/projects/:id", auth, async (req, res) => {
    try {
        const project = await Project.findOneAndUpdate(
            { _id: req.params.id, user: req.user },
            {
                name: req.body.name,
                description: req.body.description
            },
            { new: true }
        );
        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }
        res.json({
            message: "Project updated successfully",
            project
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



app.delete("/projects/:id", auth, async (req, res) => {
    try {
        const project = await Project.findOneAndDelete({
            _id: req.params.id,
            user: req.user
        });
        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }
        res.json({
            message:"Project deleted successfully"
        });


    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
app.post("/tasks",auth,async(req, res)=>{
    try {



        const task = new Task({
            title: req.body.title,
            description: req.body.description,
            status: req.body.status || "pending",
            user: req.user
        });
        await task.save();

        res.status(201).json({
            message: "Task added successfully",
            task
        });


    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


app.get("/tasks", auth, async (req, res) => {
    try {
        const tasks = await Task.find({
            user: req.user
        });
        res.json(tasks);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
app.put("/tasks/:id", auth, async (req, res) => {
    try {
        
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, user: req.user },
            {
                title: req.body.title,
                description: req.body.description,
                status: req.body.status
            },
            { new: true }
        );

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json({
            message: "Task updated successfully",
            task
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


app.delete("/tasks/:id", auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            user: req.user
        });

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json({
            message: "Task deleted successfully"
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("MongoDB connected");
        app.listen(process.env.PORT || 3000,()=>{
            console.log("Server running on port 3000");
        });
    })
    .catch((error) => {
        console.log("MongoDB connection error:", error.message);
    });


