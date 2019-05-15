const fetch = require('node-fetch');
const crypto = require('crypto');
const auth = require('./auth.json');
const connect = require('./models/connect.js');

const oauth_consumer_key = auth.API_Key;
const oauth_signature_method = 'HMAC-SHA1';
const oauth_timestamp = Math.round(Date.now() / 1000);
const oauth_token = auth.Access_token;
const oauth_version = '1.0';
const signing_key = `${encodeURIComponent(
  auth.API_Secret_key,
)}&${encodeURIComponent(auth.Access_token_secret)}`;
const apiURL = 'https://api.twitter.com/1.1/statuses/update.json';

function makeid() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 32; i += 1) {
    const position = Math.floor(Math.random() * possible.length);
    text += possible.charAt(position);
  }
  return text;
}
const oauth_nonce = makeid();

function createSignature(tweet) {
  let txt = '';

  txt += `${encodeURIComponent('include_entities')}=${encodeURIComponent(
    true,
  )}&`;
  txt += `${encodeURIComponent('oauth_consumer_key')}=${encodeURIComponent(
    oauth_consumer_key,
  )}&`;
  txt += `${encodeURIComponent('oauth_nonce')}=${encodeURIComponent(
    oauth_nonce,
  )}&`;
  txt += `${encodeURIComponent('oauth_signature_method')}=${encodeURIComponent(
    oauth_signature_method,
  )}&`;
  txt += `${encodeURIComponent('oauth_timestamp')}=${encodeURIComponent(
    oauth_timestamp,
  )}&`;
  txt += `${encodeURIComponent('oauth_token')}=${encodeURIComponent(
    oauth_token,
  )}&`;
  txt += `${encodeURIComponent('oauth_version')}=${encodeURIComponent(
    oauth_version,
  )}&`;
  txt += `${encodeURIComponent('status')}=${encodeURIComponent(tweet).replace(
    /!/g,
    '%21',
  )}`;

  let base = 'POST&';
  base += encodeURIComponent(apiURL);
  base += '&';
  base += encodeURIComponent(txt);

  const binary_hash = crypto
    .createHmac('sha1', signing_key)
    .update(base)
    .digest('binary');
  const signature = Buffer.from(binary_hash, 'binary').toString('base64');
  return signature;
}

function createHeaderstring(signature) {
  let DST = 'OAuth ';
  DST += `${encodeURIComponent('oauth_consumer_key')}="${encodeURIComponent(
    oauth_consumer_key,
  )}", `;
  DST += `${encodeURIComponent('oauth_nonce')}="${encodeURIComponent(
    oauth_nonce,
  )}", `;
  DST += `${encodeURIComponent('oauth_signature')}="${encodeURIComponent(
    signature,
  )}", `;
  DST += `${encodeURIComponent('oauth_signature_method')}="${encodeURIComponent(
    oauth_signature_method,
  )}", `;
  DST += `${encodeURIComponent('oauth_timestamp')}="${encodeURIComponent(
    oauth_timestamp,
  )}", `;
  DST += `${encodeURIComponent('oauth_token')}="${encodeURIComponent(
    oauth_token,
  )}", `;
  DST += `${encodeURIComponent('oauth_version')}="${encodeURIComponent(
    oauth_version,
  )}" `;
  console.log(DST);
  return DST;
}
async function CreateTweet(tweet) {
  const signature = createSignature(tweet);
  const options = {
    method: 'post',
    body: `status=${encodeURIComponent(tweet).replace(/!/g, '%21')}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: createHeaderstring(signature),
    },
  };
  const request = await fetch(
    'https://api.twitter.com/1.1/statuses/update.json?include_entities=true',
    options,
  );
  const body = await request.json();
  console.log(body);
}
async function AutoPost() {
  const newsposts = {
    name: 'bot',
    title: 'Veckans mest spelade låtar!',
    content:
      'Se veckans mest spelade låtar <a href="http://localhost:1111/topplista">Här</a>',
  };
  const db = await connect();
  const collection = db.collection('newsposts');
  const news = await collection.insertOne(newsposts);
  console.log(news);
  const tweet = `Se veckans mest spelade låtar http://localhost:1111/news/${
    news.insertedId
  }`;
  CreateTweet(tweet);
}

module.exports = AutoPost;
