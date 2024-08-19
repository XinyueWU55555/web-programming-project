var express = require('express');
var router = express.Router();

const { connectToDB, ObjectId } = require('../utils/db');

var passport = require('passport');


// get current user order / all order, depends on username
router.get('/', async function (req, res) {
    const db = await connectToDB();
    try {
        let query = {};
        if (req.query.username) {
            query.username = { $regex: req.query.username };
        }

        let page = parseInt(req.query.page) || 1;
        let perPage = parseInt(req.query.perPage) || 10;
        let skip = (page - 1) * perPage;

        let result = await db.collection("orders").find(query).skip(skip).limit(perPage).toArray();

        let total = await db.collection("orders").countDocuments(query);

        res.json({ orders: result, total: total, page: page, perPage: perPage });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
    finally {
        await db.client.close();
    }
});


// add New orders
router.post('/', async function (req, res) {
    const db = await connectToDB();
    try {
        req.body.orderstatus = parseInt(req.body.orderstatus);
        req.body.created_at = new Date();
        req.body.modified_at = new Date();

        let result = await db.collection("orders").insertOne(req.body);
        res.status(201).json({ id: result.insertedId });
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});


/* Retrieve a single order */
router.get('/:id', async function (req, res) {
    const db = await connectToDB();
    try {
        let result = await db.collection("orders").findOne({ _id: new ObjectId(req.params.id) });
        if (result) {
            res.json(result);   
        } else {
            res.status(404).json({ message: "order not found" });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});

// Update a single order
router.put('/:id', async function (req, res) {
    const db = await connectToDB();
    try {
        req.body.orderstatus = parseInt(req.body.orderstatus);
        req.body.modified_at = new Date();

        delete req.body._id;

        let result = await db.collection("orders").updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body });

        if (result.modifiedCount > 0) {
            res.status(200).json({ message: "order updated" });
        } else {
            res.status(404).json({ message: "order not found" });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});

// Delete a single order
router.delete('/:id', async function (req, res) {
    const db = await connectToDB();
    try {
        let result = await db.collection("orders").deleteOne({ _id: new ObjectId(req.params.id) });

        if (result.deletedCount > 0) {
            res.status(200).json({ message: "order deleted" });
        } else {
            res.status(404).json({ message: "order not found" });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});

module.exports = router;