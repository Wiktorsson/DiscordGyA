const auth = require("./auth.json");
const fetch = require("node-fetch");
var crypto = require("crypto");
const oauth_consumer_key = auth.API_Key;
const oauth_nonce = makeid();
const oauth_signature_method = "HMAC-SHA1";
const oauth_timestamp = Math.round(Date.now() / 1000);
const oauth_token = auth.Access_token;
const oauth_version = "1.0";
const status = "Hello Ladies + Gentlemen, a signed OAuth request!";
const signing_key = `${oauth_consumer_key}&${auth.Acess_token}`;
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

  txt += `include_entities=${encodeURIComponent(true)}&`;
  txt += `oauth_consumer_key=${encodeURIComponent(oauth_consumer_key)}&`;
  txt += `oauth_nonce=${encodeURIComponent(oauth_nonce)}&`;
  txt += `oauth_signature_method=${encodeURIComponent(
    oauth_signature_method
  )}&`;
  txt += `oauth_timestamp=${encodeURIComponent(oauth_timestamp)}&`;
  txt += `oauth_token=${encodeURIComponent(oauth_token)}&`;
  txt += `oauth_version=${encodeURIComponent(oauth_version)}&`;
  txt += `status=${encodeURIComponent(status).replace(/!/g, "%21")}`;
  const binary_hash = crypto
    .createHmac("sha1", signing_key)
    .update(txt)
    .digest("binary");
  var signature = new Buffer(binary_hash, "binary").toString("base64");
  console.log(signature);
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
  )}", "`;
  DST += `${encodeURIComponent("oauth_token")}="${encodeURIComponent(
    oauth_token
  )}", "`;
  DST += `${encodeURIComponent("oauth_version")}="${encodeURIComponent(
    oauth_version
  )}", `;
  console.log(DST);
  return DST;
}
createHeaderstring();
async function CreateTweet() {
  const options = {
    method: "post",
    body: `status=${encodeURIComponent(status).replace(/!/g, "%21")}`,
    headers: {
      "Content-Type": "application/x-www-urlencoded",
      Authorization: createHeaderstring()
    }
  };
  const request = await fetch(
    "https://api.twitter.com/1.1/statuses/update.json?include_entities=true",
    options
  );
  const body = await request.json();
  console.log(body);
  console.log(request.status);
}
CreateTweet();

/*
include_entities=true&oauth_consumer_key=wPx06jozf3wXmt1tMXEWSPPEy&oauth_nonce=LAky6XMQTSjCBNGTb3Y6afLPUf1Pvyc4&oauth_signature_method=HMAC-SHA1&oauth_timestamp=1545142303&oauth_token=1072462365080371202-6skqCnGSyLNB1BU5l5Mc1Lk0E0FkDp&oauth_version=1.0&status=Hello%20Ladies%20%2B%20Gentlemen%2C%20a%20signed%20OAuth%20request%21
include_entities=true&oauth_consumer_key=xvz1evFS4wEEPTGEFPHBog&oauth_nonce=kYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg&oauth_signature_method=HMAC-SHA1&oauth_timestamp=1318622958&oauth_token=370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb&oauth_version=1.0&status=Hello%20Ladies%20%2B%20Gentlemen%2C%20a%20signed%20OAuth%20request%21
*/
