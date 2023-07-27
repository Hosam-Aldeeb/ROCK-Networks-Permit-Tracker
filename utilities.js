const AWS = require("aws-sdk");
require("dotenv").config();

const SES = new AWS.SES({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.REGION,
});

const sendEmail = async (email, db, user) => {
  const verificationCode = Math.floor(100000 + Math.random() * 900000);

  if (!user) {
    const formData = {
      Email: email,
      Type: "user",
      VerificationCode: verificationCode,
    };
    await db.collection("users").insertOne(formData);
  } else {
    await db
      .collection("users")
      .updateOne({ _id: user._id }, { $set: { VerificationCode: verificationCode } });
  }

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
          Data: `Verification Code - <span><b>${verificationCode}</b></span>`,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: `Email Verification Code`,
      },
    },
  };
  return await SES.sendEmail(params).promise();
};

module.exports = { sendEmail };
