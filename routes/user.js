var express = require('express');
var router = express.Router();
const { generateToken, isadmin } = require('../utils/auth');
const { connectToDB, ObjectId } = require('../utils/db');

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

/* GET users listing. */
// router.get('/', isadmin, function (req, res, next) {
//   res.send('respond with a resource');
// });

router.get('/all', isadmin, async function (req, res, next) {
  const db = await connectToDB();
  try {
      let query = {};
      let page = parseInt(req.query.page) || 1;
      let perPage = parseInt(req.query.perPage) || 10;
      let skip = (page - 1) * perPage;
      let result = await db.collection("users").find().skip(skip).limit(perPage).toArray();

      //let result = await db.collection("bookings").find(query).skip(skip).limit(perPage).toArray();
      let total = await db.collection("users").countDocuments(query);

      res.json({ users: result, total: total, page: page, perPage: perPage });
  } catch (err) {
      res.status(400).json({ message: err.message });
  }
  finally {
      await db.client.close();
  }
});

// // register
// router.post('/', async function (req, res) {
//   const db = await connectToDB();
//   try {
//       req.body.age = parseInt(req.body.age);

//       let result = await db.collection("users").insertOne(req.body);
//       res.status(201).json({ id: result.insertedId });
//   } catch (err) {
//       res.status(400).json({ message: err.message });
//   } finally {
//       await db.client.close();
//   }
// });

router.get('/with/bookings', isadmin, async function (req, res, next) {
  const db = await connectToDB();
  try {
    let result = await db.collection("users").aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "username",
          foreignField: "username",
          as: "HistoryOrder"
        }
      },
      // remove the ip_address field
      { $project: { ip_address: 0 } }
    ]).toArray();
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
  finally {
    await db.client.close();
  }
});

module.exports = router;
