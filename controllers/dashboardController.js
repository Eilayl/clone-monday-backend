const Dashboard = require('../models/Dashboard')

exports.additem = async (req, res) => {
  try {
    const { name } = req.body;

    if (!req.session.authenticated) {
      return res.status(401).send({ error: "User not authenticated" });
    }

    if(!name)
      return res.status(404).send({error: "Name is not exists"})
    const userId = req.session.user.id;
    let dashboard = await Dashboard.findOne({ userId });

    if (!dashboard) {
      dashboard = new Dashboard({
        userId,
        dashboards: [{ name }],
      });
      await dashboard.save();
      return res.status(200).send({ message: "Dashboard created with new item" });
    }

    const alreadyExists = dashboard.dashboards.some(d => d.name === name);
    if (alreadyExists) {
      return res.status(409).send({ error: "Item with the same name already exists" });
    }

    dashboard.dashboards.push({ name });
    await dashboard.save();

    return res.status(200).send({ message: "Item added successfully", dashboards: dashboard.dashboards });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong: " + error.message });
  }
};

exports.getItems = async (req, res) => {
  try {
    if (!req.session.authenticated) {
      return res.status(401).send({ error: "User not authenticated" });
    }

    const userId = req.session.user.id;

    const dashboard = await Dashboard.findOne({ userId });

    if (!dashboard) {
      return res.status(404).send({ error: "Dashboard not found for this user" });
    }

    return res.status(200).send({ dashboards: dashboard.dashboards });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong: " + error.message });
  }
};
