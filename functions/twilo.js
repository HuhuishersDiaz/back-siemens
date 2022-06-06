const accountSid = `AC56ce58997aa15854ba9ff77bd30cf542`;
const authToken = `6b988c35f181a24d6a53803fa431a9e3`;
const client = require("twilio")(accountSid, authToken);

function sendTextMessage(sender, message) {
  return new Promise((resolve, reject) => {
    client.messages
      .create({
        from: "whatsapp:+14155238886",
        body: message,
        mediaUrl: "https://ep-hub-mx.com/assets/images/Ep_hub.png",
        to: "whatsapp:+" + sender,
      })
      .then((message) => resolve())
      .catch((err) => reject(err));
  });
}

module.exports = {
  sendTextMessage,
};
