const EMAIL_CONTENT = {
  ACCEPTED: "Your order has been accepted and would be on the way shortly",
  TRANSIT:
    "Your order has been processed and has been dispatched to your location",
  DELIVERED:
    "Your order has been delivered to your address. Please remember to provide us with feedback",
  REJECTED: "Your has been rejected by the client",
  RECIEVED: "Your client has acknowledged receipt of the order",
};

const EMAIL_HEADER = {
  SUCCESS: "Congratulations",
  FAILURE: "Unfortunately",
};

module.exports = {
  EMAIL_CONTENT,
  EMAIL_HEADER,
};
