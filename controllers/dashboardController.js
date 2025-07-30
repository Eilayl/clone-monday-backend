const Dashboard = require('../models/Dashboard')
const crypto = require('crypto');
exports.createDashboard = async (req, res) => {
  try {
    const { name } = req.body;
    if (!req.session.authenticated)
      return res.status(401).send({ error: "User not authenticated" });

    if (!name)
      return res.status(400).send({ error: "Missing dashboard name" });

    const userId = req.session.user.id;

    let userDashboards = await Dashboard.findOne({ userId });

    if (userDashboards) {
      const exists = userDashboards.dashboards.some(d => d.name === name);
      if (exists) {
        return res.status(400).send({ error: "Dashboard with the same name already exists" });
      }
      // אם השם לא קיים, מוסיף את ה-dashboard למערך dashboards
      userDashboards.dashboards.push({
        name,
        defines: [
          {
            key: "taskName",
            title: "Task",
            type: "text",
            required: true,
          },
        ],
        groups: [
          {
            id: crypto.randomUUID(),
            name: "To-Do",
            color: "blue",
            items: [{ taskName: "Task1" }],
          },
          {
            id: crypto.randomUUID(),
            name: "Done",
            color: "green",
            items: [{ taskName: "Task1" }],
          },
        ],
      });

      await userDashboards.save();
      return res.status(201).send({ message: "Dashboard added successfully", dashboards: userDashboards.dashboards });

    } else {
      const newDashboardDoc = new Dashboard({
        userId,
        dashboards: [
          {
            name,
            defines: [
              {
                key: "taskName",
                title:"Task",
                type: "text",
                required: true,
              },
            ],
            groups: [
              {
                id: crypto.randomUUID(),            
                name: "To-Do",
                color: "blue",
                items: [{ taskName: "Task1" }],
              },
              {
                id: crypto.randomUUID(),
                name: "Done",
                color: "green",
                items: [{ taskName: "Task1" }],
              },
            ],
          },
        ],
      });

      await newDashboardDoc.save();
      return res.status(201).send({ message: "Dashboard created successfully", dashboards: newDashboardDoc.dashboards });
    }

  } catch (error) {
    return res.status(500).send({ error: "Something went wrong: " + error.message });
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


exports.deleteDashboard = async (req, res) => {
  try{
    if(!req.session.authenticated)
      return res.status(401).send({error: "User Not authenticated"});
    const {name} = req.body;
    const userId = req.session.user.id;


    const dashboards = await Dashboard.findOne({userId})
    const isExist = dashboards.dashboards.find((item) => item.name === name);
    if(!isExist){
      return res.status(404).send({error: "Dashboard name not found"})
    } 
    else {
        await Dashboard.updateOne(
          { userId },
          { $pull: { dashboards: { name } } }
        );
    }
  }
  catch(error){
    return res.status(500).send({error: "Something went wrong"})
  }
}

exports.updateGroup = async (req, res) => {
  try {
    if (!req.session.authenticated) {
      return res.status(401).send({ error: "User not authenticated" });
    }

    const { dashboard, group, defines } = req.body;
    const userId = req.session.user.id;

    const dashboards = await Dashboard.findOne({ userId });
    if (!dashboards) {
      return res.status(404).send({ message: "User dashboards not found" });
    }

    const specificDashboard = dashboards.dashboards.find(d => d.name=== dashboard.name);
    if (!specificDashboard) {
      return res.status(404).send({ error: "User dashboard not found" });
    }

    const groupIndex = specificDashboard.groups.findIndex(g => g.id === group.id);
    if (groupIndex === -1) {
      return res.status(404).send({ error: "Group not found in dashboard" });
    }

    specificDashboard.groups[groupIndex] = group;
    specificDashboard.defines = defines;
    await dashboards.save();

    return res.status(200).send({ success: true, message: "Group updated successfully" });
  } catch (error) {
    return res.status(500).send({ error: "Something went wrong: " + error.message });
  }
};
