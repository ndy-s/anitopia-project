import * as cron from 'node-cron';
import redis from '../../lib/redis';
import { WeeklySeriesModel } from '../../models/WeeklySeriesModel';
import { CharacterModel } from '../../models';
import { IWeeklySeriesModel } from '../../interfaces';

const ONE_WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;
const REDIS_KEY = 'WEEKLY-SERIES'; 

export default () => {
    try {
        async function checkAndUpdateSeries() {
            try {
                const currentSeries = await WeeklySeriesModel.findOne();
                const uniqueSeriesList = await getUniqueSeriesList();
                const randomSeries = getRandomSeries(currentSeries?.seriesName as string, uniqueSeriesList);

                if (currentSeries) {
                    updateWeeklySeries(currentSeries, randomSeries);
                    console.log(`Updated Weekly Series ${randomSeries}.`);
                } else {
                    createNewWeeklySeries(randomSeries);
                    console.log(`New Weekly Series Created.`);
                }
            } catch (error) {
                console.error(`Error in checkAndUpdateSeries: ${error}`);
            }
        }

        async function getUniqueSeriesList(): Promise<string[]> {
            const uniqueSeries = await CharacterModel.aggregate([
                { $group: { _id: "$series" } }
            ]);
            return uniqueSeries.map(item => item._id as string);
        }

        function getRandomSeries(previousSeries: string | null, seriesList: string[]): string {
            const randomizedSeriesList = shuffleArray([...seriesList]);
            if (previousSeries && randomizedSeriesList.length > 1) {
                const index = randomizedSeriesList.indexOf(previousSeries);
                if (index !== -1) {
                    randomizedSeriesList.splice(index, 1);
                }
            }
            return randomizedSeriesList[0];
        }

        function updateWeeklySeries(weeklySeries: IWeeklySeriesModel, series: string) {
            weeklySeries.seriesName = series;
            weeklySeries.endsDate = new Date(Date.now() + ONE_WEEK_IN_MS);

            redis.set(REDIS_KEY, JSON.stringify(weeklySeries), 'EX', 60);
            
            return weeklySeries.save();
        }

        function createNewWeeklySeries(series: string) {
            const newWeeklySeries = new WeeklySeriesModel({
                seriesName: series,
                endsDate: new Date(Date.now() + ONE_WEEK_IN_MS),
            });
            
            redis.set(REDIS_KEY, JSON.stringify(newWeeklySeries), 'EX', 60);
            
            return newWeeklySeries.save();
        }

        function shuffleArray(array: string[]) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        checkAndUpdateSeries();
        console.log('Running Weekly Series Scheduler.');
        cron.schedule('0 0 * * *', checkAndUpdateSeries);
    } catch (error) {
        console.log(`Weekly Series Cron Job Error: ${error}`);
    }
};
