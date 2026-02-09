import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, '../src/assets/results_updated.json');

try {
    const data = fs.readFileSync(inputPath, 'utf8');
    const scheduleData = JSON.parse(data);

    let found = false;
    for (const batch in scheduleData) {
        if (found) break;
        const batchSchedule = scheduleData[batch];
        for (const day in batchSchedule) {
            if (found) break; // added checks to break outer loops
            const daySchedule = batchSchedule[day];
            for (const time in daySchedule) {
                const entry = daySchedule[time];
                if (Array.isArray(entry)) {
                    const room = entry[1];
                    if (room && typeof room === 'string' && room.includes('ROBOTICS')) {
                        console.log(`Found ROBOTICS room: "${room}"`);
                        console.log('Char codes:');
                        for (let i = 0; i < room.length; i++) {
                            process.stdout.write(`${room.charCodeAt(i)} `);
                        }
                        console.log('');
                        found = true;
                        break;
                    }
                }
            }
        }
    }

} catch (err) {
    console.error(err);
}
