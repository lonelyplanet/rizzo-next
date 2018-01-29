const AWS = require("aws-sdk");
const pkg = require("../package.json");
const glob = require("glob");
const fs = require("fs");
const path = require("path");

const s3 = new AWS.S3();
const s3Bucket = "static-asset";
const baseKey = "rizzo-next";
const version = pkg.version;

const upload = (Key, Body) => new Promise((resolve, reject) => {
  const mimeTypes = {
    html: "text/html",
    js: "application/javascript",
    css: "text/css",
    json: "application/json",
  };

  const ext = path.extname(Key).replace(/^./, "");

  s3.putObject({
    Bucket: s3Bucket,
    Key,
    ACL: "public-read",
    Body,
    ContentType: mimeTypes[ext],
    CacheControl: "public, max-age=0, s-maxage=86400",
  }, (err) => {
    if (err) {
      return reject(err);
    }

    return resolve(Key);
  });
});

const componentsKey = `${baseKey}/components.json`;
const files = glob.sync("dist/*.*");

const promises = files.map((filename) => {
  const filePath = path.join(process.cwd(), filename);
  const basename = path.basename(filename);
  const body = fs.readFileSync(filePath);
  const key = `${baseKey}/${version}/${basename}`;

  return upload(key, body);
});
Promise.all([
  ...promises,
  upload(componentsKey, JSON.stringify({
    header: `${baseKey}/${version}/header.html`,
    footer: `${baseKey}/${version}/footer.html`,
    version,
  })),
])
.then((results) => {
  console.log(`Uploaded ${results.length} files to s3.`);
});
