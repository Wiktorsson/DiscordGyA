const mongodb = require('mongodb').MongoClient;

const DB_NAME = 'newsDB';
const MONGO_URL = `mongodb://localhost:27017/${DB_NAME}?authSource=admin`;

const connect = async () => {
  let client;
  try {
    client = await mongodb.connect(MONGO_URL, { useNewUrlParser: true });
    return client.db(DB_NAME);
  } catch (error) {
    /* eslint-disable no-console */
    console.log(error);
  }
  return client;
};

module.exports = connect;
