async function getStatus (connection) {
  try {
    let body = await connection.send("status");
    body = body?.slice(1).split("&");
  
    let coolData = {};
  
    body.forEach((obj) => {
      let newStr = obj.split("=");
      if (newStr[1]) return coolData[newStr[0]] = newStr[1];
    });

    connection.destroy();
    return { data: coolData, error: null };
  } catch (err) {
    if (err.message.includes("timeout")) {
      connection.destroy();
      return { data: null, error: 'timeout' }
    };
  };
};

module.exports = { getStatus }