const fs = require('fs');
const mammoth = require('mammoth');
const { OpenAI } = require("openai");
const Dashboard = require('../models/Dashboard')
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


exports.readandAnalyze = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No DOCX file uploaded" });
    }
    if(!req.session.authenticated)
      return res.status(400).send({error: "User not uathenticated"})

    const userId = req.session.user.id;
    const dashboards = await Dashboard.findOne({userId})
    if(!dashboards) return res.status(404).send({error : "Dashboards's users not found"})
      

      
      
      const buffer = fs.readFileSync(req.file.path);
      const result = await mammoth.extractRawText({ buffer });
      fs.unlinkSync(req.file.path);
      const text = result.value;
      
      if (text.length > 10000) {
        return res.status(400).send({ error: "DOCX file is too long" });
      }
const systemPrompt = `
You are a helpful assistant for a Product Manager who organizes tasks from a summarized Google Meet discussion.

You will receive a summary of a meeting. Your job is to extract and return ONLY the new tasks (as pure JSON), strictly organized under the correct dashboards and groups, using ONLY existing data.

⚠️ VERY IMPORTANT RULES:
- NEVER create dashboards or groups that do not already exist.
- NEVER invent dashboard names — only use the existing dashboard _IDs_ and group _IDs_ provided.
- ONLY use columns (defines) that are actually defined in the dashboard.
- Group the tasks correctly under their matching dashboard and group.
- Each output block must follow this exact format:

[
  {
    "dashboard": "DASHBOARD_ID",
    "group": "GROUP_ID",
    "tasks": [
      {
        "item": [
          { "key": "COLUMN_ID", "value": "some value" },
          { "key": "COLUMN_ID", "value": "some value" }
        ]
      },
      {
        "item": [
          { "key": "COLUMN_ID", "value": "another task" }
        ]
      }
    ]
  },
  ...
]

✅ Your output must:
- Be valid JSON only — no markdown, no explanations, no labels, no \`\`\` wrapping.
- Use arrays of task objects under "tasks".
- Each task must contain an 'item' array, with key-value objects as strings.
- It is OK to omit a column if the data was not in the summary.
- Tasks must be grouped logically under the correct dashboards and groups based on the context of the summary.

📘 Example output:
[
  {
    "dashboard": "dash_id_123",
    "group": "group_id_abc",
    "tasks": [
      {
        "item": [
          { "key": "task_name", "value": "Implement login" },
          { "key": "due_date", "value": "01/08/2025" }
        ]
      },
      {
        "item": [
          { "key": "task_name", "value": "Fix logout bug" }
        ]
      }
    ]
  }
]

📦 Here is your current dashboards info:
${dashboards.dashboards.map((dashboard) =>
  `\n\nDashboard: ${dashboard.name}
  Dashboard ID: ${dashboard.dashboardId}
  Defines (columns):
  ${dashboard.defines.map((d, i) => `- Column ${i}: key=${d.key}, title="${d.title}", type=${d.type}`).join('\n')}
  Groups:
  ${dashboard.groups.map((g) => `- Group Name: ${g.name}, ID: ${g.id}`).join('\n')}`
).join('\n')}
`;


const response = await openai.chat.completions.create({
  model: "gpt-4o", // or "gpt-4o", or whatever is available to your key
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: text }
  ]
});
console.log(response);
    return res.json({ message: JSON.parse(response.choices[0].message.content) });
  } catch (error) {
    console.error("Error in readandAnalyze:", error);
    return res.status(500).json({ error: "Something went wrong while reading the DOCX" });
  }
};


