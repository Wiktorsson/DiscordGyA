const auth = require("./auth.json");
const fetch = require("node-fetch");
var crypto = require("crypto");
const oauth_consumer_key = auth.API_Key;
const oauth_nonce = makeid();
const oauth_signature_method = "HMAC-SHA1";
const oauth_timestamp = Math.round(Date.now() / 1000);
const oauth_token = auth.Access_token;
const oauth_version = "1.0";
const status = "Hello World!!";
const signing_key = `${encodeURIComponent(
  auth.API_Secret_key
)}&${encodeURIComponent(auth.Access_token_secret)}`;
let apiURL = "https://api.twitter.com/1.1/statuses/update.json";
const oauth_signature = createSignature();

function makeid() {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 32; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function createSignature() {
  let txt = "";

  txt += `${encodeURIComponent("include_entities")}=${encodeURIComponent(
    true
  )}&`;
  txt += `${encodeURIComponent("oauth_consumer_key")}=${encodeURIComponent(
    oauth_consumer_key
  )}&`;
  txt += `${encodeURIComponent("oauth_nonce")}=${encodeURIComponent(
    oauth_nonce
  )}&`;
  txt += `${encodeURIComponent("oauth_signature_method")}=${encodeURIComponent(
    oauth_signature_method
  )}&`;
  txt += `${encodeURIComponent("oauth_timestamp")}=${encodeURIComponent(
    oauth_timestamp
  )}&`;
  txt += `${encodeURIComponent("oauth_token")}=${encodeURIComponent(
    oauth_token
  )}&`;
  txt += `${encodeURIComponent("oauth_version")}=${encodeURIComponent(
    oauth_version
  )}&`;
  txt += `${encodeURIComponent("status")}=${encodeURIComponent(status).replace(
    /!/g,
    "%21"
  )}`;

  let base = "POST&";
  base += encodeURIComponent(apiURL);
  base += "&";
  base += encodeURIComponent(txt);

  const binary_hash = crypto
    .createHmac("sha1", signing_key)
    .update(base)
    .digest("binary");
  var signature = Buffer.from(binary_hash, "binary").toString("base64");
  return signature;
}

function createHeaderstring() {
  let DST = "OAuth ";
  DST += `${encodeURIComponent("oauth_consumer_key")}="${encodeURIComponent(
    oauth_consumer_key
  )}", `;
  DST += `${encodeURIComponent("oauth_nonce")}="${encodeURIComponent(
    oauth_nonce
  )}", `;
  DST += `${encodeURIComponent("oauth_signature")}="${encodeURIComponent(
    oauth_signature
  )}", `;
  DST += `${encodeURIComponent("oauth_signature_method")}="${encodeURIComponent(
    oauth_signature_method
  )}", `;
  DST += `${encodeURIComponent("oauth_timestamp")}="${encodeURIComponent(
    oauth_timestamp
  )}", `;
  DST += `${encodeURIComponent("oauth_token")}="${encodeURIComponent(
    oauth_token
  )}", `;
  DST += `${encodeURIComponent("oauth_version")}="${encodeURIComponent(
    oauth_version
  )}" `;
  console.log(DST);
  return DST;
}
async function CreateTweet() {
  const options = {
    method: "post",
    body: `status=${encodeURIComponent(status).replace(/!/g, "%21")}`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: createHeaderstring()
    }
  };
  const request = await fetch(
    "https://api.twitter.com/1.1/statuses/update.json?include_entities=true",
    options
  );
  const body = await request.json();
  console.log(body);
}
CreateTweet();
