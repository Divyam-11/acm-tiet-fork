import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, '../src/assets/results_updated.json');

try {
    const data = fs.readFileSync(inputPath, 'utf8');
    const scheduleData = JSON.parse(data);
    const uniqueRooms = new Set();

    for (const batch in scheduleData) {
        const batchSchedule = scheduleData[batch];
        for (const day in batchSchedule) {
            const daySchedule = batchSchedule[day];
            for (const time in daySchedule) {
                const entry = daySchedule[time];
                if (Array.isArray(entry)) {
                    const roomRaw = entry[1];
                    if (roomRaw && typeof roomRaw === 'string') {
                         const rooms = roomRaw.split('/').map(r => r.trim());
                         rooms.forEach(r => uniqueRooms.add(r));
                    }
                }
            }
        }
    }

    const sortedRooms = Array.from(uniqueRooms).sort();
    console.log(JSON.stringify(sortedRooms, null, 2));
    console.log(`Total unique rooms: ${sortedRooms.length}`);

} catch (err) {
    console.error(err);
}
