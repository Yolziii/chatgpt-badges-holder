const express = require('express');
const cors = require('cors');

const port = process.env.PORT || 3000;
const host = '127.0.0.1';

require('dotenv').config();
const AWS = require('aws-sdk');

const s3 = new AWS.S3();
const envName = process.env.EB_ENVIRONMENT_NAME;

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = process.env.SECRET;

// Get the S3 bucket URL
const bucketUrl = `https://${process.env.EB_BUCKET_NAME}.s3.amazonaws.com`;

app.post('/:user/:repository/:badgeName', (req, res) => {
  const { user, repository, badgeName } = req.params;
  const { secret } = req.query;

  if (secret !== SECRET) {
    res.status(403).send('Invalid secret');
    return;
  }

  const badge = req.body.badge;
  const key = `${envName}/budges/${user}/${repository}/${badgeName}.json`;

  // Upload the badge data to S3
  s3.upload({
    Bucket: process.env.EB_BUCKET_NAME,
    Key: key,
    Body: JSON.stringify(badge),
    ContentType: 'application/json',
  }, (err, data) => {
    if (err) {
      console.error(`Error saving badge ${badgeName} to S3: ${err}`);
      res.status(500).send(`Error saving badge ${badgeName}`);
    } else {
      const publicUrl = `${bucketUrl}/${key}`;
      console.log(`Saved badge ${badgeName} to S3 at ${publicUrl}`);
      res.send(`Saved badge ${badgeName}`);
    }
  });
});

app.get('/:user/:repository/:badgeName', (req, res) => {
  const { user, repository, badgeName } = req.params;
  const key = `${envName}/budges/${user}/${repository}/${badgeName}.json`;

  // Get the badge data from S3
  s3.getObject({
    Bucket: process.env.EB_BUCKET_NAME,
    Key: key,
  }, (err, data) => {
    if (err) {
      if (err.code === 'NoSuchKey') {
        console.error(`Badge ${badgeName} not found in S3`);
        res.status(404).send(`Badge ${badgeName} not found`);
      } else {
        console.error(`Error loading badge ${badgeName} from S3: ${err}`);
        res.status(500).send(`Error loading badge ${badgeName}`);
      }
    } else {
      const badge = JSON.parse(data.Body.toString('utf-8'));
      console.log(`Loaded badge ${badgeName} from S3`);
      res.json(badge);
    }
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
  });
}

module.exports = [app, s3]; // Export the server instance for test
