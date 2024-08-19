var express = require('express');
var router = express.Router();
const { connectToDB, ObjectId } = require('../utils/db');
const { generateToken } = require('../utils/auth');

router.post('/login', async function (req, res, next) {
  const db = await connectToDB();
  try {
    // check if the user exists
    var user = await db.collection("users").findOne({ username: req.body.username });
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    // validate the password
    // const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (req.body.password != user.password) {
      res.status(401).json({ message: 'Invalid password' });
      return;
    }

    // res.json(user);

    delete user.password;
    delete user.ip_address;

    // generate a JWT token
    const token = generateToken(user);

    // return the token
    res.json({ token: token });

  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});

router.get('/booktag', async function (req, res) {
  const db = await connectToDB();
  try {
    let result = await db.collection("books").aggregate([
      // non null superhero
      { $match: { booktag: { $ne: null } } },
      { $group: { _id: "$booktag", total: { $sum: 1 } } }
    ]).toArray();

    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});

router.post('/register', async function (req, res) {
  const db = await connectToDB();
  try {
    req.body.age = parseInt(req.body.age);

    let result = await db.collection("users").insertOne(req.body);
    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});

// get all books, search by bookname/bookauthor/status
router.get('/allbooks', async function (req, res) {
  const db = await connectToDB();
  try {
    let query = {};
    if (req.query.bookname) {
      query.bookname = { $regex: req.query.bookname };
    }
    if (req.query.bookauthor) {
      query.bookauthor = { $regex: req.query.bookauthor };
    }
    if (req.query.bookstatus) {
      query.bookstatus = parseInt(req.query.bookstatus);
    }

    let page = parseInt(req.query.page) || 1;
    let perPage = parseInt(req.query.perPage) || 10;
    let skip = (page - 1) * perPage;

    // sort by sort_by query parameter
    let sort = {};
    if (req.query.sort_by) {

      // split the sort_by into an array
      let sortBy = req.query.sort_by.split(".");

      // check if the first element is a valid field
      if (sortBy.length > 1 && ["bookprice"].includes(sortBy[0])) {
        sort[sortBy[0]] = sortBy[1] == "desc" ? -1 : 1;
      }
    }

    let result = await db.collection("books").find(query).sort(sort).skip(skip).limit(perPage).toArray();

    //let result = await db.collection("bookings").find(query).skip(skip).limit(perPage).toArray();
    let total = await db.collection("books").countDocuments(query);

    res.json({ books: result, total: total, page: page, perPage: perPage });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
  finally {
    await db.client.close();
  }
});

// purchase a single Book
router.put('/buybook/:id', async function (req, res) {
  const db = await connectToDB();
  try {
    console.log(req.body);
    req.body.bookcount = parseInt(req.body.bookcount);
    // req.body.bookprice = parseInt(req.body.bookprice);
    // req.body.bookstatus = parseInt(req.body.bookstatus);
    // req.body.booktag = req.body.booktag || "";

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


/* Retrieve a single Book */
router.get('/book/:id', async function (req, res) {
  const db = await connectToDB();
  try {
    let result = await db.collection("books").findOne({ _id: new ObjectId(req.params.id) });
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});


/* The SNSD page. */
router.get('/snsd', async function (req, res, next) {

  const db = await connectToDB();
  try {
    let avengers = await db.collection("bookings").find({ team: 'Avengers' }).toArray();
    let jla = await db.collection("bookings").find({ team: 'JLA' }).toArray();
    let neither = await db.collection("bookings").find({ team: '' }).toArray();

    res.render('snsd', {
      data: [
        { name: "Avengers", value: avengers.length },
        { name: "JLA", value: jla.length },
        { name: "Neither", value: neither.length }
      ]
    });

  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Expressd' });
});

/* Handle the Form */
router.post('/booking', async function (req, res) {
  const db = await connectToDB();
  try {
    req.body.numTickets = parseInt(req.body.numTickets);
    req.body.terms = req.body.terms ? true : false;
    req.body.created_at = new Date();
    req.body.modified_at = new Date();

    let result = await db.collection("bookings").insertOne(req.body);
    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});

/* Display all Bookings */
router.get('/booking', async function (req, res) {
  const db = await connectToDB();
  try {
    let results = await db.collection("bookings").find().toArray();
    res.render('bookings', { bookings: results });
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});

/* Display a single Booking */
router.get('/booking/read/:id', async function (req, res) {
  const db = await connectToDB();
  try {
    let result = await db.collection("bookings").findOne({ _id: new ObjectId(req.params.id) });
    if (result) {
      res.render('booking', { booking: result });
    } else {
      res.status(404).json({ message: "Booking not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});

// Delete a single Booking
router.post('/booking/delete/:id', async function (req, res) {
  const db = await connectToDB();
  try {
    let result = await db.collection("bookings").deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount > 0) {
      res.status(200).json({ message: "Booking deleted" });
    } else {
      res.status(404).json({ message: "Booking not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});

// display the update form
router.get('/booking/update/:id', async function (req, res) {
  const db = await connectToDB();
  try {
    let result = await db.collection("bookings").findOne({ _id: new ObjectId(req.params.id) });
    if (result) {
      res.render('update', { booking: result });
    } else {
      res.status(404).json({ message: "Booking not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});

// Update a single Booking
router.post('/booking/update/:id', async function (req, res) {
  const db = await connectToDB();
  try {
    req.body.numTickets = parseInt(req.body.numTickets);
    req.body.terms = req.body.terms ? true : false;
    req.body.superhero = req.body.superhero || "";
    req.body.modified_at = new Date();

    let result = await db.collection("bookings").updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body });

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: "Booking updated" });
    } else {
      res.status(404).json({ message: "Booking not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});

// Search Bookings
router.get('/booking/search', async function (req, res) {
  const db = await connectToDB();
  try {
    let query = {};
    if (req.query.email) {
      query.email = { $regex: req.query.email };
    }
    if (req.query.numTickets) {
      query.numTickets = parseInt(req.query.numTickets);
    }

    let result = await db.collection("bookings").find(query).toArray();
    res.render('bookings', { bookings: result });
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});

// Pagination based on query parameters page and limit, also returns total number of documents
router.get('/booking/paginate', async function (req, res) {
  const db = await connectToDB();
  try {
    let page = parseInt(req.query.page) || 1;
    let perPage = parseInt(req.query.perPage) || 10;
    let skip = (page - 1) * perPage;

    let result = await db.collection("bookings").find().skip(skip).limit(perPage).toArray();
    let total = await db.collection("bookings").countDocuments();

    res.render('paginate', { bookings: result, total: total, page: page, perPage: perPage });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
  finally {
    await db.client.close();
  }
});

module.exports = router;
