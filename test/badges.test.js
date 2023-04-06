const { expect } = require('chai');

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const sinon = require('sinon');

require('dotenv').config();

const [app, s3] = require('../index');

describe('Badge endpoint', () => {
  const testBadge = {
    schemaVersion: 1,
    label: 'Test Badge',
    message: 'success',
    color: 'green',
  };
  const testUser = 'mocha';
  const testRepository = 'chatgpt-badges-holder';
  const testBadgeName = 'test-badge';
  const SECRET = process.env.SECRET;

  it('should save a badge with the specified name', async () => {
    const res = await chai.request(app)
      .post(`/${testUser}/${testRepository}/${testBadgeName}?secret=${SECRET}`)
      .send({ badge: testBadge });
    expect(res.status).to.equal(200);
    expect(res.text).to.equal(`Saved badge ${testBadgeName}`);
  });

  it('should retrieve a badge with the specified name', async () => {
    const res = await chai.request(app).get(`/${testUser}/${testRepository}/${testBadgeName}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal(testBadge);
  });

  it('should return a 404 error when a badge is not found', async () => {
    const res = await chai.request(app).get(`/${testUser}/${testRepository}/non-existent-badge`);
    expect(res.status).to.equal(404);
    expect(res.text).to.equal('Badge non-existent-badge not found');
  });

  it('should return a 403 error when the secret is missing', async () => {
    const res = await chai.request(app)
      .post(`/${testUser}/${testRepository}/${testBadgeName}`)
      .send({ badge: testBadge });
    expect(res.status).to.equal(403);
    expect(res.text).to.equal('Invalid secret');
  });
  
  it('should return a 500 error when there is an error while saving a badge', async () => {
    // Stub the s3.upload method to return an error
    const s3UploadStub = sinon.stub(s3, 'upload').callsArgWith(1, new Error('S3 upload error'));

    const res = await chai.request(app)
      .post(`/${testUser}/${testRepository}/${testBadgeName}?secret=${SECRET}`)
      .send({ badge: testBadge });

    // Restore the original s3.upload method
    s3UploadStub.restore();

    expect(res.status).to.equal(500);
    expect(res.text).to.equal(`Error saving badge ${testBadgeName}`);
  });

  it('should return a 500 error when there is an error while loading a badge', async () => {
    // Stub the s3.getObject method to return an error
    sinon.stub(s3, 'getObject').callsArgWith(1, new Error('S3 getObject error'));

    const res = await chai.request(app).get(`/${testUser}/${testRepository}/${testBadgeName}`);

    // Restore the s3.getObject method
    s3.getObject.restore();

    expect(res.status).to.equal(500);
    expect(res.text).to.equal(`Error loading badge ${testBadgeName}`);
  });
  
});
