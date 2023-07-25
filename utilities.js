const AWS = require("aws-sdk");
const { randomUUID } = require("node:crypto");
require("dotenv").config();

const SES = new AWS.SES({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.REGION,
});

const sendEmail = async (full_name, email, baseUrl, userId, db) => {
  var ObjectID = require("mongodb").ObjectID;
  const id = new ObjectID();
  const user_id = new ObjectID(userId);
  const token = randomUUID();
  const data = { _id: id, Token: token, Type: "email", User: user_id };
  await db.collection("validations").insertOne(data);

  let params = {
    Source: "jin.choe@rocknetworks.com",
    Destination: {
      ToAddresses: [email],
    },
    ReplyToAddresses: [],
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `Hello ${full_name}, </br></br> <p>Click on the following link to verify your email - <a href="${baseUrl}/verify-email?token=${token}&user_id=${user_id}">${baseUrl}/verify-email?token=${token}&user_id=${user_id}</a></p>`,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: `Email verification!`,
      },
    },
  };
  return await SES.sendEmail(params).promise();
};

module.exports = { sendEmail };
