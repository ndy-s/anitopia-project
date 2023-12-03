"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeeklySeriesModel = void 0;
const mongoose_1 = require("mongoose");
const weeklySeriesSchema = new mongoose_1.Schema({
    seriesName: {
        type: String,
        required: true
    },
    endsDate: {
        type: Date,
        required: true
    },
});
exports.WeeklySeriesModel = (0, mongoose_1.model)('WeeklySeries', weeklySeriesSchema);
