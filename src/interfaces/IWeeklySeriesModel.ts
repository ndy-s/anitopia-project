import { Document } from "mongoose";

export interface IWeeklySeriesModel extends Document{
    seriesName: string;
    endsDate: Date;
}