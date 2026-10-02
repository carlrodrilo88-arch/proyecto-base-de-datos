const fs = require("fs/promises");
const path = require("path");
const { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");

const driver = process.env.STORAGE_DRIVER || "local";
const localRoot = path.resolve(__dirname, "..", "storage");

function validateKey(key) {
  if (typeof key !== "string" || !/^reportes\/[A-Za-z0-9._/-]+\.pdf$/.test(key) || key.includes("..")) {
    throw new Error("Clave de almacenamiento invalida");
  }
}

function s3Config() {
  return {
    bucket: process.env.STORAGE_BUCKET || process.env.BUCKET,
    client: new S3Client({
      region: process.env.STORAGE_REGION || process.env.REGION || "auto",
      endpoint: process.env.STORAGE_ENDPOINT || process.env.ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.STORAGE_ACCESS_KEY_ID || process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY || process.env.SECRET_ACCESS_KEY,
      },
    }),
  };
}

async function putPdf(key, buffer) {
  validateKey(key);
  if (driver === "s3") {
    const { bucket, client } = s3Config();
    if (!bucket) throw new Error("Falta configurar STORAGE_BUCKET");
    await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: buffer, ContentType: "application/pdf" }));
    return key;
  }
  const target = path.join(localRoot, ...key.split("/"));
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, buffer);
  return key;
}

async function getPdf(key) {
  validateKey(key);
  if (driver === "s3") {
    const { bucket, client } = s3Config();
    const result = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    return Buffer.from(await result.Body.transformToByteArray());
  }
  return fs.readFile(path.join(localRoot, ...key.split("/")));
}

async function deletePdf(key) {
  validateKey(key);
  if (driver === "s3") {
    const { bucket, client } = s3Config();
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  } else {
    await fs.rm(path.join(localRoot, ...key.split("/")), { force: true });
  }
}

module.exports = { deletePdf, getPdf, putPdf, validateKey };
