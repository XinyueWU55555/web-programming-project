var express = require('express');
var router = express.Router();
const { generateToken, isadmin } = require('../utils/auth');
const { connectToDB, ObjectId } = require('../utils/db');

var passport = require('passport');


// add New Books
router.post('/', isadmin, async function (req, res, next) {
    const db = await connectToDB();
    try {
        req.body.bookcount = parseInt(req.body.bookcount);
        req.body.bookprice = parseInt(req.body.bookprice);
        req.body.bookstatus = parseInt(req.body.bookstatus);
        req.body.created_at = new Date();
        req.body.modified_at = new Date();

        let result = await db.collection("books").insertOne(req.body);
        res.status(201).json({ id: result.insertedId });
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});



// Update a single Book
router.put('/:id', isadmin, async function (req, res, next) {
    const db = await connectToDB();
    try {
        req.body.bookcount = parseInt(req.body.bookcount);
        req.body.bookprice = parseInt(req.body.bookprice);
        req.body.bookstatus = parseInt(req.body.bookstatus);
        req.body.booktag = req.body.booktag || "";
        req.body.modified_at = new Date();

        delete req.body._id;

        let result = await db.collection("books").updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body });

        if (result.modifiedCount > 0) {
            res.status(200).json({ message: "Book updated" });
        } else {
            res.status(404).json({ message: "Book not found" });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});

// Delete a single Book
router.delete('/:id', isadmin, async function (req, res, next) {
    const db = await connectToDB();
    try {
        let result = await db.collection("books").deleteOne({ _id: new ObjectId(req.params.id) });

        if (result.deletedCount > 0) {
            res.status(200).json({ message: "Book deleted" });
        } else {
            res.status(404).json({ message: "Book not found" });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});






// Get the total number of bookings per superhero
router.get('/stats/superhero', async function (req, res) {
    const db = await connectToDB();
    try {
        let pipelines = [];
    
        if (req.query.team) {
            pipelines.push({ $match: { team: req.query.team } });
        }
    
        pipelines = pipelines.concat([
            // non null superhero
            { $match: { superhero: { $ne: null } } },
            { $group: { _id: "$superhero", total: { $sum: 1 } } }
        ]);
    
        let result = await db.collection("bookings").aggregate(pipelines).toArray();
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});

// Specify booking being managed by a user
router.patch('/:id/manage', passport.authenticate('bearer', { session: false }), async function (req, res) {
    const db = await connectToDB();
    try {
        let result = await db.collection("bookings").updateOne({ _id: new ObjectId(req.params.id) },
            {
                $set: { manager: new ObjectId(req.user._id) }
            });

        if (result.modifiedCount > 0) {
            res.status(200).json({ message: "Booking updated" });
        } else {
            res.status(404).json({ message: "Booking not found" });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
    finally {
        await db.client.close();
    }
});


module.exports = router;