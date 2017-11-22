const AWS = require("aws-sdk");
const pkg = require("../package.json");
const glob = require("glob");
const fs = require("fs");
const path = require("path");

const s3 = new AWS.S3();
const s3Bucket = "static-asset";
const key = `rizzo-next/${pkg.version}/`;

const upload = (filename) => new Promise((resolve, reject) => {
  const filePath = path.join(process.cwd(), filename);
  const basename = path.basename(filename);
  const body = fs.readFileSync(filePath);
  const mimeTypes = {
    html: "text/html",
    js: "application/javascript",
    css: "text/css",
  };
  const ext = filename.split(".")[1];
  const Key = `${key}${basename}`;

  s3.putObject({
    Bucket: s3Bucket,
    Key,
    ACL: "public-read",
    Body: body,
    ContentType: mimeTypes[ext],
    CacheControl: "public, max-age=0, s-maxage=86400",
  }, (err) => {
    if (err) {
      return reject(err);
    }

    return resolve(Key);
  });
});

const files = glob.sync("dist/*.*");

Promise.all(files.map(upload))
.then((results) => {
  console.log(`Uploaded ${results.length} files to s3.`);
});
