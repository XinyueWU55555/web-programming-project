var express = require('express');
var router = express.Router();
const { generateToken, isRay } = require('../utils/auth');
const { connectToDB, ObjectId } = require('../utils/db');

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

/* GET users listing. */
router.get('/', isRay, function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/with/bookings', async function (req, res) {
  const db = await connectToDB();
  try {
    let result = await db.collection("users").aggregate([
      {
        $lookup: {
          from: "bookings",
          localField: "_id",
          foreignField: "manager",
          as: "bookings"
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
