const express  = require('express');
const cors     = require('cors');
const fs       = require('fs');
const path     = require('path');
const upload   = require('./uploads/config/uploads');
const mongoose = require('mongoose');
const User     = require('./model/user.model');
const MenuItem = require('./model/menu.model');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// DB CONNECTION
mongoose
    .connect("mongodb://127.0.0.1:27017/kangei-db")
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Connection error:", err));

app.get('/', (req, res) => {
    res.send('Kan-Gei Server is running!');
});

// USER LOGIN

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }
        const user = await User.findOne({ email });
        if (!user || user.password !== password) {
            return res.status(401).json({ message: "Invalid email or password." });
        }
        res.json({
            message: "Login successful",
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error logging in");
    }
});


// ADD USER JSON
app.post("/add-user", (req, res) => {
    const newUser = req.body;
    fs.readFile("data.json", "utf8", (err, data) => {
        if (err) return res.status(500).send("Error reading file");
        const users = JSON.parse(data);
        users.push(newUser);
        fs.writeFile("data.json", JSON.stringify(users, null, 2), (err) => {
            if (err) return res.status(500).send("Error writing file");
            res.send("User added successfully");
        });
    });
});

// VIEW USERS JSON
app.get("/users", (req, res) => {
    fs.readFile("data.json", "utf8", (err, data) => {
        if (err) return res.status(500).send("Error reading file");
        const users = JSON.parse(data);
        res.json(users);
    });
});

// EDIT USER JSON
app.put("/edit-user/:index", (req, res) => {
    const index       = req.params.index;
    const updatedUser = req.body;
    fs.readFile("data.json", "utf8", (err, data) => {
        if (err) return res.status(500).send("Error reading file");
        const users = JSON.parse(data);
        if (users[index] === undefined) return res.status(404).send("User not found");
        users[index] = updatedUser;
        fs.writeFile("data.json", JSON.stringify(users, null, 2), (err) => {
            if (err) return res.status(500).send("Error writing file");
            res.send("User updated successfully");
        });
    });
});

// DELETE USER JSON
app.delete("/delete-user/:index", (req, res) => {
    const index = req.params.index;
    fs.readFile("data.json", "utf8", (err, data) => {
        if (err) return res.status(500).send("Error reading file");
        const users = JSON.parse(data);
        if (users[index] === undefined) return res.status(404).send("User not found");
        users.splice(index, 1);
        fs.writeFile("data.json", JSON.stringify(users, null, 2), (err) => {
            if (err) return res.status(500).send("Error writing file");
            res.send("User deleted successfully");
        });
    });
});


// ADD USER DB
app.post('/add-user-db', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const newUser = new User({ name, email, password, role: role || 'staff' });
        await newUser.save();
        res.status(201).json({ message: 'User added successfully', user: newUser });
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ message: 'Error adding user', error: error.message });
    }
});

// VIEW USERS DB
app.get('/users-db', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});

// EDIT USER DB
app.put('/edit-user-db/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, password, role } = req.body;
    try {
        const updateData = { name, email, role };
        if (password) updateData.password = password;
        const updatedUser = await User.findByIdAndUpdate(
            id, updateData, { new: true, runValidators: true }
        );
        if (!updatedUser) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
});

// DELETE USER DB
app.delete('/delete-user-db/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted successfully', user: deletedUser });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
});

// ADD MENU ITEM JSON
app.post("/add-menu", upload.single('photo'), (req, res) => {
    const newItem = {
        name:        req.body.name,
        description: req.body.description,
        price:       req.body.price,
        category:    req.body.category,
        available:   req.body.available,
        photo:       req.file ? `/uploads/${req.file.filename}` : null
    };
    fs.readFile("menu.json", "utf8", (err, data) => {
        if (err) return res.status(500).send("Error reading file");
        const menu = JSON.parse(data);
        menu.push(newItem);
        fs.writeFile("menu.json", JSON.stringify(menu, null, 2), (err) => {
            if (err) return res.status(500).send("Error writing file");
            res.send("Menu item added successfully");
        });
    });
});

// VIEW MENU ITEMS JSON
app.get("/menu", (req, res) => {
    fs.readFile("menu.json", "utf8", (err, data) => {
        if (err) return res.status(500).send("Error reading file");
        const menu = JSON.parse(data);
        res.json(menu);
    });
});

// EDIT MENU ITEM JSON
app.put("/edit-menu/:index", upload.single('photo'), (req, res) => {
    const index = req.params.index;
    fs.readFile("menu.json", "utf8", (err, data) => {
        if (err) return res.status(500).send("Error reading file");
        const menu = JSON.parse(data);
        if (menu[index] === undefined) return res.status(404).send("Menu item not found");
        const updatedItem = {
            name:        req.body.name,
            description: req.body.description,
            price:       req.body.price,
            category:    req.body.category,
            available:   req.body.available,
            photo:       req.file ? `/uploads/${req.file.filename}` : menu[index].photo
        };
        menu[index] = updatedItem;
        fs.writeFile("menu.json", JSON.stringify(menu, null, 2), (err) => {
            if (err) return res.status(500).send("Error writing file");
            res.send("Menu item updated successfully");
        });
    });
});

// DELETE MENU ITEM JSON
app.delete("/delete-menu/:index", (req, res) => {
    const index = req.params.index;
    fs.readFile("menu.json", "utf8", (err, data) => {
        if (err) return res.status(500).send("Error reading file");
        const menu = JSON.parse(data);
        if (menu[index] === undefined) return res.status(404).send("Menu item not found");
        menu.splice(index, 1);
        fs.writeFile("menu.json", JSON.stringify(menu, null, 2), (err) => {
            if (err) return res.status(500).send("Error writing file");
            res.send("Menu item deleted successfully");
        });
    });
});

// ADD MENU ITEM DB)
app.post('/add-menu-db', upload.single('photo'), async (req, res) => {
    const { name, description, price, category, available } = req.body;
    try {
        const photoPath = req.file ? `/uploads/${req.file.filename}` : null;
        const newItem = new MenuItem({
            name,
            description,
            price:     parseFloat(price),
            category,
            available: available !== undefined ? available === 'true' : true,
            photo:     photoPath
        });
        await newItem.save();
        res.status(201).json({ message: 'Menu item added successfully', item: newItem });
    } catch (error) {
        console.error('Error adding menu item:', error);
        res.status(500).json({ message: 'Error adding menu item', error: error.message });
    }
});

// VIEW MENU ITEMS DB
app.get('/menu-db', async (req, res) => {
    try {
        const items = await MenuItem.find({ available: true }).sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).json({ message: 'Error fetching menu items', error: error.message });
    }
});

// VIEW ALL MENU ITEMS DB
app.get('/menu-db-all', async (req, res) => {
    try {
        const items = await MenuItem.find().sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).json({ message: 'Error fetching menu items', error: error.message });
    }
});

// EDIT MENU ITEM DB
app.put('/edit-menu-db/:id', upload.single('photo'), async (req, res) => {
    const { id } = req.params;
    const { name, description, price, category, available } = req.body;
    try {
        const updateData = { name, description, price: parseFloat(price), category };
        if (available !== undefined) {
            updateData.available = available === 'true' || available === true;
        }
        if (req.file) {
            const existing = await MenuItem.findById(id);
            if (existing && existing.photo) {
                const oldPath = path.join(__dirname, existing.photo);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            updateData.photo = `/uploads/${req.file.filename}`;
        }
        const updatedItem = await MenuItem.findByIdAndUpdate(
            id, updateData, { new: true, runValidators: true }
        );
        if (!updatedItem) return res.status(404).json({ message: 'Menu item not found' });
        res.json({ message: 'Menu item updated successfully', item: updatedItem });
    } catch (error) {
        console.error('Error updating menu item:', error);
        res.status(500).json({ message: 'Error updating menu item', error: error.message });
    }
});

// DELETE MENU ITEM DB
app.delete('/delete-menu-db/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedItem = await MenuItem.findByIdAndDelete(id);
        if (!deletedItem) return res.status(404).json({ message: 'Menu item not found' });
        if (deletedItem.photo) {
            const filePath = path.join(__dirname, deletedItem.photo);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        res.json({ message: 'Menu item deleted successfully', item: deletedItem });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        res.status(500).json({ message: 'Error deleting menu item', error: error.message });
    }
});

// PORT

const port = 1337;
app.listen(port, () => {
    console.log(`Server is running on ${port}`);
});
