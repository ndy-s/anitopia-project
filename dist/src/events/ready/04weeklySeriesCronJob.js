"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = require("node-cron");
const WeeklySeriesModel_1 = require("../../models/WeeklySeriesModel");
exports.default = () => {
    try {
        async function checkAndUpdateSeries() {
            let currentSeries = await WeeklySeriesModel_1.WeeklySeriesModel.findOne();
            if (currentSeries) {
                currentSeries.seriesName = 'New Series';
                currentSeries.endsDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                await currentSeries.save();
            }
            else {
                const newWeeklySeries = new WeeklySeriesModel_1.WeeklySeriesModel({
                    seriesName: 'New Series',
                    endsDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                });
                await newWeeklySeries.save();
            }
        }
        console.log('Running Weekly Series Scheduler.');
        node_cron_1.default.schedule('0 0 * * *', checkAndUpdateSeries);
    }
    catch (error) {
        console.log(`Weekly Series Cron Job Error: ${error}`);
    }
};
