import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, '../src/assets/results_updated.json');

try {
    const data = fs.readFileSync(inputPath, 'utf8');
    const scheduleData = JSON.parse(data);

    // Search for "ROBOTICS" in any field
    for (const batch in scheduleData) {
        const batchSchedule = scheduleData[batch];
        for (const day in batchSchedule) {
            const daySchedule = batchSchedule[day];
            for (const time in daySchedule) {
                const entry = daySchedule[time];
                // entry: [Course, Room, Subject, Type]
                if (Array.isArray(entry)) {
                    const room = entry[1];
                    if (room && typeof room === 'string' && room.includes('/')) {
                        console.log(`Found Entry with Slash in Room:`);
                        console.log(`Batch: ${batch}, Day: ${day}, Time: ${time}`);
                        console.log('Room Raw:', room);
                        
                        const splitRooms = room.split('/');
                        console.log('Split Result:', splitRooms);
                        
                        // Check char codes around slash
                        const slashIndex = room.indexOf('/');
                        console.log(`Char at slash index (${slashIndex}): ${room.charCodeAt(slashIndex)}`);
                        return; // Stop after first match to keep output clean
                    }
                }
            }
        }
    }

} catch (err) {
    console.error('Error:', err);
}
