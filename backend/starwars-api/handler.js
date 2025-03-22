const facts = require("./starwarsFacts");

module.exports.starwarsfact = async (event) => {
  const randomFact = facts[Math.floor(Math.random() * facts.length)];

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "https://cloud.mrcyberleon.org"
    },
    body: JSON.stringify({ fact: randomFact })
  };
};
