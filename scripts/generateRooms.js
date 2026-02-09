import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, '../src/assets/results_updated.json');
const outputPath = path.join(__dirname, '../src/assets/rooms.json');

try {
    const data = fs.readFileSync(inputPath, 'utf8');
    const scheduleData = JSON.parse(data);
    const roomData = {};

    // Iterate through each batch
    for (const batch in scheduleData) {
        const batchSchedule = scheduleData[batch];
        
        // Iterate through each day
        for (const day in batchSchedule) {
            const daySchedule = batchSchedule[day];
            
            // Iterate through each time slot
            for (const time in daySchedule) {
                const entry = daySchedule[time];
                
                // Entry format: [CourseCode, Room, SubjectName, Type]
                if (Array.isArray(entry) && entry.length >= 2) {
                    const roomRaw = entry[1]; 
                    const courseRaw = entry[0];
                    const subjectRaw = entry[2];
                    const type = entry[3];

                    if (roomRaw) {
                        // Split by slash to handle multiple entries (electives)
                        const rooms = roomRaw.split('/').map(r => r.trim());
                        const courses = courseRaw ? courseRaw.split('/').map(c => c.trim()) : [];
                        const subjects = subjectRaw ? subjectRaw.split('/').map(s => s.trim()) : [];

                        // Helper to normalize room names
                        const normalizeRoom = (name) => {
                            if (!name) return name;
                            let normalized = name.toUpperCase();
                            
                            // Remove common suffixes/garbage
                            normalized = normalized.replace(/\(.*\)/g, ''); // Remove content in parens e.g. (NEW)
                            normalized = normalized.replace(/\s+LAB\s*$/i, ''); // Remove trailing LAB
                            normalized = normalized.replace(/\s+LAB\b/i, ''); // Remove LAB word
                            normalized = normalized.replace(/-NEW/i, ''); // Remove -NEW
                            normalized = normalized.replace(/_NEW/i, ''); // Remove _NEW
                            
                            // Replace dashes with spaces if it makes sense, or just keep distinct?
                            // User example: "es-1" vs "es-1 lab". "es-1 lab" -> "es-1"
                            // "G309(NEW LAB) LAB" -> "G309  " -> "G309"
                            // "G309-NEW LAB" -> "G309 " -> "G309"
                            
                            return normalized.trim();
                        };

                        rooms.forEach((roomRawVal, index) => {
                            if (!roomRawVal) return;
                            
                            const room = normalizeRoom(roomRawVal);

                            if (!roomData[room]) {
                                roomData[room] = {};
                            }
                            if (!roomData[room][day]) {
                                roomData[room][day] = {};
                            }

                            // Try to match course/subject by index, fallback to first or empty
                            const courseCode = courses[index] || courses[0] || courseRaw;
                            const subjectName = subjects[index] || subjects[0] || subjectRaw;

                             // Store relevant info: Batch, CourseCode, SubjectName, Type
                             // If multiple entries end up in same room/time (due to normalization), 
                             // we might overwrite. Ideally we should support arrays.
                             // For now, let's just overwrite as per original logic, 
                             // but maybe we should append if it's a different batch?
                             // Sticking to overwrite for simplicity unless requested.
                            roomData[room][day][time] = [
                                batch,      // 0: Batch
                                courseCode,   // 1: CourseCode
                                subjectName,   // 2: SubjectName
                                type    // 3: Type
                            ];
                        });
                    }
                }
            }
        }
    }

    // sort keys
    const sortedRooms = Object.keys(roomData).sort().reduce((acc, key) => {
        acc[key] = roomData[key];
        return acc;
    }, {});


    fs.writeFileSync(outputPath, JSON.stringify(sortedRooms, null, 4));
    console.log(`Successfully generated rooms.json at ${outputPath}`);
    console.log(`Total rooms found: ${Object.keys(sortedRooms).length}`);

} catch (err) {
    console.error('Error processing data:', err);
}
