const processGraphData = require("../utils/graphProcessor");

exports.processGraph = (req, res) => {
  const { data } = req.body;

  const result = processGraphData(data || []);

  res.status(200).json({
    user_id: "sahil_24062026",
    email_id: "sahil0873.be23@chitkara.edu.in",
    college_roll_number: "2310990873",
    ...result
  });
};