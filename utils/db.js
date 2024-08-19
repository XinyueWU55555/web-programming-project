const { MongoClient, ObjectId } = require('mongodb');

process.env.MONGODB_URI = 'mongodb://comp7270-linquan:sNXJBSBw1GxdbrRGVpCyzuPivAnEJYYTCeMYfscpN8oAeVMo4wHKQ7adbkMk33UWDStpVFYjIzi0ACDbU2SXAQ%3D%3D@comp7270-linquan.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=false&maxIdleTimeMS=120000&appName=@comp7270-linquan@';

if (!process.env.MONGODB_URI) {
    // throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
    process.env.MONGODB_URI = 'mongodb://localhost:27017';
}

// Connect to MongoDB
async function connectToDB() {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db('booksDB');
    db.client = client;
    return db;
}

module.exports = { connectToDB, ObjectId };