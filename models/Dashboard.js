const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;

const dashboardSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    dashboards: [{
        name:{required: true,type: String}
    }]
    }, {
    timestamps: true, // Only beacuse monday.com is data-driven application
});

const Dashboard = mongoose.model('Dashboard', dashboardSchema);
module.exports = Dashboard;
