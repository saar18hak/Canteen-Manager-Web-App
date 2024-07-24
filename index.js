const express = require("express")
const app = express()
const session  = require("express-session")
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser")

app.set("view engine","ejs")
app.use(express.json())

const adminModel = require("./models/admin")
const userModel = require("./models/user")
const menuItemModel = require("./models/menuItem")
const orderModel = require("./models/orders")
const rewardsModel = require("./models/rewards")
const rewardItemModel = require("./models/rewardMenuItems");
const rewardorderModel = require("./models/rewardOrders")
// const rewardItemModel = require("./models/rewardMenuItems");

app.use(express.urlencoded({extended:true}))
app.use(bodyParser.json());

app.use(cookieParser())
app.use(session({
    secret: 'My secret here',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: 'mongodb://127.0.0.1:27017/canteenmanagement' }),
    cookie: { maxAge: 180 * 60 * 1000 } // Example: 3-hour expiration
}));


async function authenticateuser(req,res,next){
    try{
        const p = req.cookies.useridcookie
        console.log(p);
        req.userkaid = p
        next()
    }catch(error){

        console.log(error);
    }

}


async function authenticateadmin(req,res,next){
    try{
        const p = req.cookies.admincookie
        console.log(p);
        req.adminkaid = p
        next()
    }catch(error){

        console.log(error);
    }

}

app.get("/adminlogin",(req,res)=>{
    res.render("index")
})

app.get("/adminUsers/:adminid", async (req, res) => {
    try {
        const users = await userModel.find({ adminid: req.params.adminid });
        res.send(users);
    } catch (error) {
        console.error('Error fetching users for admin:', error);
        res.status(500).send('An error occurred while fetching users. Please try again later.');
    }
});

app.post("/createadmin", async (req, res) => {
    try {
        let { adminname, email, password } = req.body;

        let createdAdmin = await adminModel.create({
            adminname,
            email,
            password
        });

        console.log(createdAdmin);
        res.send(createdAdmin);
    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).send('An error occurred while creating the admin. Please try again later.');
    }
});

app.get("/adminloginnew",(req,res)=>{
    res.render("adminlogin")

})

app.post("/loginadmin", async (req, res) => {
    try {
        let { email } = req.body;
        let admin = await adminModel.findOne({ email: email });
        if (!admin) {
            return res.status(401).send('Invalid email');
        }
        req.session.adminid = admin._id;
        res.cookie("admincookie", `${req.session.adminid}`);
        console.log(req.cookies);
        res.redirect("/ordersadmin");
    } catch (error) {
        console.error('Error logging in admin:', error);
        res.status(500).send('An error occurred while logging in the admin. Please try again later.');
    }
});

app.get("/userlogin",(req,res)=>{
    res.render("userlogin")
})

app.get("/login",(req,res)=>{
    res.render("loginusernew")
})

app.post("/loginpage", async (req, res) => {
    try {
        let { username, password, adminid } = req.body;
        let user = await userModel.findOne({ username: username, password: password, adminid: adminid });
        console.log(user);
        if (!user) {
            return res.status(401).send('Invalid username or password');
        }
        req.session.userid = user._id;
        console.log(req.session.userid);
        res.cookie("useridcookie", `${req.session.userid}`);
        console.log(req.cookies.useridcookie);
        res.redirect("/usermenu");
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('An error occurred while logging in. Please try again later.');
    }
});

app.post("/createuser", async (req, res) => {
    try {
        let { username, email, password, balance, adminid } = req.body;
        let createdUser = await userModel.create({
            username,
            email,
            password,
            balance,
            adminid
        });
        console.log(createdUser);
        res.redirect("/usermenu");
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('An error occurred while creating the user. Please try again later.');
    }
});

app.get("/itempost",(req,res)=>{
    res.render("itempost")
})

app.get("/register", (req, res) => {
    res.render("registerdisplay");
});

app.post("/createItem", authenticateadmin, async (req, res) => {
    try {
        let adminid = req.adminkaid;
        let { itemname, description, price, image, category } = req.body;

        let createdItem = await menuItemModel.create({
            adminid,
            itemname,
            description,
            price,
            image,
            category
        });

        console.log(createdItem);
        res.send(createdItem);
    } catch (error) {
        console.error('Error creating item:', error);
        res.status(500).send('An error occurred while creating the item. Please try again later.');
    }
});

app.get("/category", async (req, res) => {
    try {
        const items = await menuItemModel.find();
        // Extract unique categories
        const categories = [...new Set(items.map(item => item.category))];

        // Render the EJS template with categories and items
        res.render('category', { categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).send('An error occurred while fetching categories. Please try again later.');
    }
});


app.get("/usermenu", authenticateuser, async (req, res) => {
    try {
        const userId = req.userkaid;
        console.log("usermenu id:", userId);
        const user = await userModel.findOne({ _id: userId });
        const items = await menuItemModel.find({ adminid: user.adminid });
        const categories = [...new Set(items.map(item => item.category))];

        console.log(categories);
        res.render("usermenu", { items: items, user: user, categories: categories });
    } catch (error) {
        console.error('Error fetching user menu:', error);
        res.status(500).send('An error occurred while fetching the user menu. Please try again later.');
    }
});

app.get("/allmenu", authenticateadmin, async (req, res) => {
    try {
        const adminid = req.adminkaid;
        const items = await menuItemModel.find({ adminid: adminid });
        res.render("menuitems", { items: items });
    } catch (error) {
        console.error('Error fetching admin menu:', error);
        res.status(500).send('An error occurred while fetching the admin menu. Please try again later.');
    }
});

app.post("/itemavail/:itemid", async (req, res) => {
    try {
        const { available } = req.body;
        const item = await menuItemModel.findByIdAndUpdate(
            { _id: req.params.itemid },
            {
                $set: {
                    available: available
                }
            },
            { new: true }
        );
        console.log(item);
        res.send(item);
    } catch (error) {
        console.error('Error updating item availability:', error);
        res.status(500).send('An error occurred while updating the item availability. Please try again later.');
    }
});


app.post('/order', authenticateuser, async (req, res) => {
    const userId = req.userkaid;
    const itemsOrder = [];

    try {
        // Iterate over items selected in the form and construct itemsOrder array
        Object.keys(req.body).forEach(key => {
            if (key.startsWith('menu_')) {
                const menuId = req.body[key];
                const quantityKey = `quantity_${menuId}`;
                const quantity = req.body[quantityKey];
                const priceKey = `price_${menuId}`;
                const price = req.body[priceKey];

                // Validate and push to itemsOrder array
                if (quantity && !isNaN(quantity) && parseInt(quantity) > 0) {
                    itemsOrder.push({
                        menuId,
                        quantity: parseInt(quantity),
                        price: parseFloat(price)
                    });
                }
            }
        });

        console.log(itemsOrder);

        let totalPrice = 0;
        itemsOrder.forEach(item => {
            totalPrice += item.price * item.quantity;
        });

        // Retrieve user from database
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Check if user balance is sufficient
        if (totalPrice > user.balance) {
            return res.status(400).send('Insufficient balance to place the order.');
        }

        // Deduct totalPrice from user's balance
        user.balance -= totalPrice;
        await user.save();

        // Create the order
        const order = await orderModel.create({
            userId,
            itemsOrder,
            totalPrice,
        });

        console.log(order);
        res.redirect("/userorders");
    } catch (error) {
        console.error('Error processing order:', error);
        res.status(500).send('An error occurred while processing your order. Please try again later.');
    }
});

// app.post('/order', authenticateuser, async (req, res) => {
//     const userId = req.userkaid;

//     const itemsOrder = [];

//     // Iterate over items selected in the form and construct itemsOrder array
//     for (const key of Object.keys(req.body)) {
//         if (key.startsWith('menu_')) {
//             const menuId = req.body[key];
//             const quantityKey = `quantity_${menuId}`;
//             const quantity = req.body[quantityKey];
//             const priceKey = `price_${menuId}`;
//             const price = req.body[priceKey];

//             // Validate and push to itemsOrder array
//             if (quantity && !isNaN(quantity) && parseInt(quantity) > 0) {
//                 itemsOrder.push({
//                     menuId,
//                     quantity: parseInt(quantity),
//                     price: parseFloat(price)
//                 });
//             }
//         }

//         if (key.startsWith('reward_')) {
//             const rewardId = req.body[key];
            
//             // Fetch pointsRequired from the database
//             const rewardItem = await rewardItemModel.findById(rewardId);
//             if (rewardItem) {
//                 itemsOrder.push({
//                     menuId: rewardId, // treating rewardId as menuId for simplicity
//                     quantity: 1, // Reward items always have quantity 1
//                     price: 0, // Assuming reward items are free in terms of currency, but require points
//                     pointsRequired: rewardItem.pointsRequired
//                 });
//             }
//         }
//     }

//     console.log(itemsOrder);

//     let totalPrice = 0;
//     let totalPointsRequired = 0;
//     itemsOrder.forEach(item => {
//         if (item.price) {
//             totalPrice += item.price * item.quantity;
//         }
//         if (item.pointsRequired) {
//             totalPointsRequired += item.pointsRequired * item.quantity;
//         }
//     });

//     // Retrieve user from database
//     const user = await userModel.findById(userId);

//     if (!user) {
//         return res.status(404).send('User not found');
//     }

//     // Check if user balance is sufficient
//     if (totalPrice > user.balance) {
//         return res.status(400).send('Insufficient balance to place the order.');
//     }

//     // Check if user reward points are sufficient
//     if (totalPointsRequired > user.rewardPoints) {
//         return res.status(400).send('Insufficient reward points to place the order.');
//     }

//     // Deduct totalPrice from user's balance
//     user.balance -= totalPrice;
//     user.rewardPoints -= totalPointsRequired;
//     await user.save();

//     const order = await orderModel.create({
//         userId,
//         itemsOrder,
//         totalPrice,
//     });

//     console.log(order);
//     res.send(order);
// // });
// app.post('/order', authenticateuser, async (req, res) => {
//     const userId = req.userkaid;

//     const itemsOrder = [];

//     // Iterate over items selected in the form and construct itemsOrder array
//     for (const key of Object.keys(req.body)) {
//         if (key.startsWith('menu_')) {
//             const menuId = req.body[key];
//             const quantityKey = `quantity_${menuId}`;
//             const quantity = req.body[quantityKey];
//             const priceKey = `price_${menuId}`;
//             const price = req.body[priceKey];

//             // Validate and push to itemsOrder array
//             if (quantity && !isNaN(quantity) && parseInt(quantity) > 0) {
//                 itemsOrder.push({
//                     itemId: menuId,
//                     quantity: parseInt(quantity),
//                     price: parseFloat(price),
//                     itemType: 'MenuItem'
//                 });
//             }
//         }

//         if (key.startsWith('reward_')) {
//             const rewardId = req.body[key];
            
//             // Fetch pointsRequired from the database
//             const rewardItem = await rewardItemModel.findById(rewardId);
//             if (rewardItem) {
//                 itemsOrder.push({
//                     itemId: rewardId, // Use rewardId
//                     quantity: 1, // Reward items always have quantity 1
//                     price: 0, // Assuming reward items are free in terms of currency, but require points
//                     pointsRequired: rewardItem.pointsRequired,
//                     itemType: 'RewardItem'
//                 });
//             }
//         }
//     }

//     console.log(itemsOrder);

//     let totalPrice = 0;
//     let totalPointsRequired = 0;
//     itemsOrder.forEach(item => {
//         if (item.price) {
//             totalPrice += item.price * item.quantity;
//         }
//         if (item.pointsRequired) {
//             totalPointsRequired += item.pointsRequired * item.quantity;
//         }
//     });

//     // Retrieve user from database
//     const user = await userModel.findById(userId);

//     if (!user) {
//         return res.status(404).send('User not found');
//     }

//     // Check if user balance is sufficient
//     if (totalPrice > user.balance) {
//         return res.status(400).send('Insufficient balance to place the order.');
//     }

//     // Check if user reward points are sufficient
//     if (totalPointsRequired > user.rewardPoints) {
//         return res.status(400).send('Insufficient reward points to place the order.');
//     }

//     // Deduct totalPrice from user's balance
//     user.balance -= totalPrice;
//     user.rewardPoints -= totalPointsRequired;
//     await user.save();

//     const order = await orderModel.create({
//         userId,
//         itemsOrder,
//         totalPrice,
//         totalPointsRequired
//     });

//     console.log(order);
//     res.send(order);
// });




app.get("/ordersadmin", authenticateadmin, async (req, res) => {
    try {
        let adminId = req.adminkaid;
        
        // Find users with the specified adminid
        const users = await userModel.find({ adminid: adminId }).select('_id');
        const userIds = users.map(user => user._id);

        // Find orders for those users
        const order = await orderModel.find({ userId: { $in: userIds } }).populate('itemsOrder.menuId').sort({ orderDate: -1 });
        console.log(order);

        res.render("ordersadmin", { order: order });
    } catch (error) {
        console.error("Error retrieving orders for admin:", error);
        res.status(500).send("Internal Server Error");
    }
});

// app.get("/userorders",authenticateuser,async(req,res)=>{
//     const userId = req.userkaid
//     console.log("ID:",userId);
//     const orders = await orderModel.find({userId:userId}).populate('itemsOrder.menuId').sort({ orderDate: -1 });
//     console.log("kutte:",orders);

//     // const user = await userModel.findOne({_id:userId})
//     // console.log(user);
//     res.render("userorders",{orders:orders})
// })
app.get("/userorders", authenticateuser, async (req, res) => {
    try {
        const userId = req.userkaid;
        console.log("ID:", userId);
        const orders = await orderModel.find({ userId: userId }).populate('itemsOrder.menuId').sort({ orderDate: -1 });
        console.log("Orders:", orders);

        // const user = await userModel.findOne({ _id: userId });
        // console.log(user);

        res.render("userorders", { orders: orders });
    } catch (error) {
        console.error("Error retrieving user orders:", error);
        res.status(500).send("Internal Server Error");
    }
});

// app.get('/userorders', authenticateuser, async (req, res) => {
//     const userId = req.userkaid;

//     const orders = await orderModel.find({ userId }).populate('itemsOrder.itemId');
//     // console.log(orders.itemsOrder);
//     const populatedOrders = orders.map(order => {
//         let totalPrice = 0;
//         let totalPointsRequired = 0;

//         order.itemsOrder.forEach(item => {
//             if (item.itemType === 'MenuItem') {
//                 totalPrice += item.price * item.quantity;
//             } else if (item.itemType === 'RewardItem') {
//                 totalPointsRequired += item.price * item.quantity;
//             }
//         });

//         return {
//             ...order.toObject(),
//             totalPrice,
//             totalPointsRequired
//         };
//     });

//     res.render('userorders', { orders: populatedOrders });
// });

// app.get('/userorders', authenticateuser, async (req, res) => {
//     const userId = req.userkaid;

//     // Populate the initial references
//     const orders = await orderModel.find({ userId }).populate('itemsOrder.itemId').exec();

//     // Further populate based on itemType
//     for (let order of orders) {
//         for (let item of order.itemsOrder) {
//             if (item.itemType === 'MenuItem') {
//                 item.itemId = await menuItemModel.findById(item.itemId).exec();
//             } else if (item.itemType === 'RewardItem') {
//                 item.itemId = await rewardItemModel.findById(item.itemId).exec();
//             }
//         }
//     }

//     // Log the orders for debugging
//     console.log(orders);    

//     res.render('userorders', { orders });
// });
// app.get('/userorders', authenticateuser, async (req, res) => {
//     const userId = req.userkaid;

//     try {
//         // Retrieve and populate orders
//         const orders = await orderModel.find({ userId })
//             .populate({
//                 path: 'itemsOrder.itemId',
//                 select: 'itemname price image' // Adjust based on actual fields
//             })
//             .exec();

//         // Log the populated orders
//         console.log('Populated Orders:', JSON.stringify(orders, null, 2));

//         // Check if itemId is populated
//         console.log("SAALA:", orders);
//         console.log(orders[8].itemsOrder[0].itemId.itemType); // This should not be undefined if populated

//         res.render('userorders', { orders });
//     } catch (error) {
//         console.error('Error populating orders:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });

// app.get('/userorders', authenticateuser, async (req, res) => {
//     const userId = req.userkaid;

//     try {
//         // Retrieve orders
//         const orders = await orderModel.find({ userId }).exec();

//         // Populate itemId based on itemType
//         for (const order of orders) {
//             for (const item of order.itemsOrder) {
//                 console.log("Saaale Pagal:",item.itemType);
//                 if (item.itemType === 'MenuItem') {
                    
//                     const x = await menuItemModel.findById(item.itemId).exec();
//                     console.log("madarchod:",x);
//                 } else if (item.itemType === 'RewardItem') {
//                     item.itemId = await rewardItemModel.findById(item.itemId).exec();
//                 }
//             }
//         }

//         // Log the populated orders
//         console.log('Populated Orders:', JSON.stringify(orders, null, 2));

//         // Check if itemType and itemId are correctly populated
//         console.log("SAALA:", orders);
//         // if (orders.length > 0 && orders[0].itemsOrder.length > 0) {
//         //     console.log(orders[0].itemsOrder[0].itemId); // Should have populated details
//         //     console.log(orders[0].itemsOrder[0].itemType); // Should not be undefined
//         // }

//         res.render('userorders', { orders });
//     } catch (error) {
//         console.error('Error populating orders:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });


// app.get("/updatebalance",authenticateuser,async(req,res)=>{
//     const userId = req.userkaid
//     console.log("usermenu id:",userId);
//     const user = await userModel.findOne({_id:userId})
//     res.render("updatebalance",{user:user})
// })

app.get("/updatebalance", authenticateuser, async (req, res) => {
    try {
        const userId = req.userkaid;
        console.log("usermenu id:", userId);
        const user = await userModel.findOne({_id: userId});
        
        if (!user) {
            return res.status(404).send("User not found");
        }

        res.render("updatebalance", { user: user });
    } catch (error) {
        console.error("Error updating balance:", error);
        res.status(500).send("Internal Server Error");
    }
});


app.post("/balanceUpdate",authenticateuser, async (req, res) => {
    const { balance } = req.body;
    const userId = req.userkaid;

    try {
        // Find the user by ID
        const user = await userModel.findOne({_id:userId});

        if (!user) {
            return res.status(404).send("User not found");
        }

        // Calculate the new balance
        const updatedBalance = user.balance + parseFloat(balance);

        // Update the user's balance
        user.balance = updatedBalance;
        await user.save();

        console.log("Updated balance user:", user);
        res.redirect("/usermenu");
    } catch (error) {
        console.error("Error updating balance:", error);
        res.status(500).send("Internal Server Error");
    }
});



app.post("/orderstatus/:orderid", async (req, res) => {
    try {
        const { status } = req.body;
        const order = await orderModel.findByIdAndUpdate(
            { _id: req.params.orderid },
            {
                $set: {
                    status: status
                }
            },
            { new: true }
        );

        if (!order) {
            return res.status(404).send("Order not found");
        }

        console.log(order);
        res.redirect("/ordersadmin");
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/", (req, res) => {
    try {
        res.send("Hello Bro");
    } catch (error) {
        console.error("Error sending greeting:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.post('/userordercancel', async (req, res) => {
    try {
        const { orderid, status } = req.body;

        // Find the order and update its status
        const result = await orderModel.findByIdAndUpdate(
            orderid,
            { status: status },
            { new: true } // Return the updated document
        );

        if (!result) {
            return res.status(404).send('Order not found');
        }

        // Redirect or render success page
        res.redirect('/userorders');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});


//rewards model
app.get("/rewardpage", async (req, res) => {
    try {
        res.render("rewardpage");
    } catch (error) {
        console.error("Error rendering reward page:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/rewardpost", authenticateadmin, async (req, res) => {
    try {
        const adminid = req.adminkaid;
        const { minAmount, points, description, expiryDate, category } = req.body;

        const reward = await rewardsModel.create({
            adminid,
            minAmount,
            points,
            description,
            expiryDate,
            category
        });

        console.log(reward);
        res.send(reward);
    } catch (error) {
        console.error("Error creating reward:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/rewarddisplay", authenticateuser, async (req, res) => {
    try {
        const userId = req.userkaid;
        const user = await userModel.findById(userId);

        if (!user) {
            console.log("User not found");
            return res.status(404).send("User not found");
        }

        const adminId = user.adminid;
        const currentDate = new Date();

        // Debugging output to check variables
        console.log("Admin ID:", adminId);
        console.log("Current Date and Time:", currentDate.toISOString());

        const rewards = await rewardsModel.find({
            adminid: adminId,
            $or: [
                { expiryDate: { $exists: false } },
                { expiryDate: { $gte: currentDate } }
            ]
        });

        // Debugging output to check query results
        console.log("Rewards found:", rewards);

        res.render("rewarddisplay", { rewards: rewards, user: user });
    } catch (error) {
        console.error("Error fetching rewards:", error);
        res.status(500).send("Error fetching rewards");
    }
});
app.get("/rewardOrderspage", authenticateuser, async (req, res) => {
    try {
        const userId = req.userkaid;
        const user = await userModel.findOne({ _id: userId });

        if (!user) {
            return res.status(404).send("User not found");
        }

        const rewardOrders = await rewardorderModel.find({ userId: userId }).populate("itemsOrder.itemId");
        console.log("Reward Orders:", rewardOrders);

        res.render("rewardorderdisplay", { rewardOrders: rewardOrders, user: user });
    } catch (error) {
        console.error("Error retrieving reward orders:", error);
        res.status(500).send("Internal Server Error");
    }
});



app.post("/rewardcollect/:rewardId", authenticateuser, async (req, res) => {
    try {
        const userId = req.userkaid;
        const rewardId = req.params.rewardId;

        if (!userId) {
            return res.status(401).send("Unauthorized");
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).send("User not found");
        }

        // Check if reward has already been collected
        if (user.collectedRewards.includes(rewardId)) {
            return res.status(400).send("Reward has already been collected.");
        }

        const reward = await rewardsModel.findById(rewardId);
        if (!reward) {
            return res.status(404).send("Reward not found");
        }

        // Calculate the total price of orders from the reward's creation date onwards
        const orders = await orderModel.find({
            userId: userId,
            orderDate: { $gte: reward.createdAt }
        });

        const totalPrice = orders.reduce((total, order) => total + order.totalPrice, 0);

        if (totalPrice < reward.minAmount) {
            return res.status(400).send("Minimum amount requirement not met.");
        }

        // Add reward points to the user's total reward points
        user.rewardPoints = (user.rewardPoints || 0) + reward.points;
        user.collectedRewards.push(rewardId); // Mark reward as collected
        await user.save();

        res.redirect("/rewarddisplay");
    } catch (error) {
        console.error("Error collecting reward:", error);
        res.status(500).send("Error collecting reward");
    }
});

// app.get("/rewardOrderAdmin",async(req,res)=>{
    
// })

app.get('/rewardOrderAdmin',authenticateadmin, async (req, res) => {
    try {
        const adminId = req.adminkaid; // Assuming admin ID is passed as a query parameter

        // Find users with the given admin ID
        const users = await userModel.find({ adminid: adminId });

        // Extract user IDs from the users found
        const userIds = users.map(user => user._id);

        // Find reward orders for these user IDs
        const rewardOrders = await rewardorderModel.find({ userId: { $in: userIds } })
            .populate('userId')
            .populate('itemsOrder.itemId');

        res.render('rewardOrderAdmin', { rewardOrders });
    } catch (error) {
        console.error('Error fetching reward orders for admin:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get("/rewardItemcreate", async(req,res)=>{
    res.render("rewardItemcreate")
})

app.post("/rewardorder", authenticateuser, async (req, res) => {
    try {
        const userId = req.userkaid;
        const itemsOrder = [];

        // Iterate over items selected in the form and construct itemsOrder array
        Object.keys(req.body).forEach(key => {
            if (key.startsWith('reward_')) {
                const rewardId = req.body[key];
                const pointsRequired = req.body[`points_${rewardId}`];
                const quantity = 1; // Assuming 1 item per order, adjust if needed

                // Validate and push to itemsOrder array
                if (pointsRequired && !isNaN(pointsRequired) && parseInt(pointsRequired) > 0) {
                    itemsOrder.push({ itemId: rewardId, quantity, pointsRequired: parseInt(pointsRequired) });
                }
            }
        });

        // Calculate total points required
        let totalPointsRequired = 0;
        itemsOrder.forEach(item => {
            totalPointsRequired += item.pointsRequired * item.quantity;
        });

        // Retrieve user from database
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Check if user reward points are sufficient
        if (totalPointsRequired > user.rewardPoints) {
            return res.status(400).send('Insufficient reward points to place the order.');
        }

        // Deduct points from user's reward points
        user.rewardPoints -= totalPointsRequired;
        await user.save();

        // Create the reward order
        const order = await rewardorderModel.create({
            userId,
            itemsOrder,
            totalPointsRequired,
        });

        res.redirect("/rewardOrderspage");
        console.log(order);
    } catch (error) {
        console.error("Error placing reward order:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/updateStatusadmin/:orderId",async(req,res)=>{
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        await rewardorderModel.findByIdAndUpdate(orderId, { status });

        res.redirect('/rewardOrderAdmin'); // Redirect back to the reward orders page
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).send('Internal Server Error');
    }
})
app.get("/rewardItems", authenticateuser, async (req, res) => {
    try {
        const userid = req.userkaid;
        const user = await userModel.findOne({ _id: userid });

        if (!user) {
            return res.status(404).send("User not found");
        }

        console.log(user);
        const rewardItem = await rewardItemModel.find({ adminId: user.adminid });
        console.log(rewardItem);
        res.render("rewardItemdisplay", { rewardItem: rewardItem, user: user });
    } catch (error) {
        console.error("Error retrieving reward items:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/rewardItempost", authenticateadmin, async (req, res) => {
    try {
        const { itemName, description, pointsRequired, image } = req.body;
        const adminId = req.adminkaid;

        const rewardItem = await rewardItemModel.create({
            itemName,
            description,
            pointsRequired,
            image,
            adminId
        });

        console.log(rewardItem);
        res.send(rewardItem);
    } catch (error) {
        console.error("Error creating reward item:", error);
        res.status(500).send("Internal Server Error");
    }
});



app.listen(5000)