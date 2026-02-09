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
                        const normalizeAndSplit = (name) => {
                            if (!name) return [];
                            let normalized = name.toUpperCase();
                            
                            // Specific fix for CBOL-G141 -> CBOL G141
                            normalized = normalized.replace(/CBOL-G141/g, 'CBOL G141');

                            // Remove common suffixes/garbage
                            normalized = normalized.replace(/\(.*\)/g, ''); // Remove content in parens e.g. (NEW)
                            normalized = normalized.replace(/\bLAB\b/g, ''); // Remove LAB word
                            normalized = normalized.replace(/-PG\b/g, ''); // Remove -PG
                            normalized = normalized.replace(/-NEW\b/g, ''); // Remove -NEW
                            normalized = normalized.replace(/_NEW\b/g, ''); // Remove _NEW
                            
                            // Handle separators: AND, &, ,
                            normalized = normalized.replace(/\s+AND\s+/g, ' ');
                            normalized = normalized.replace(/[&,]/g, ' ');
                            normalized = normalized.replace(/\//g, ' '); // Treat slash as space
                            
                            // Split by space
                            const parts = normalized.split(/\s+/).filter(p => p.length > 0);
                            
                            // Clean up parts (e.g. remove "NEW" if it stayed, short garbage?)
                            // For now mostly trusting the split.
                            return parts;
                        };

                        rooms.forEach((roomRawVal, index) => {
                             if (!roomRawVal) return;
                             
                             const roomList = normalizeAndSplit(roomRawVal);
                             
                             roomList.forEach((room) => {
                                 if (!room) return;
                                 
                                 // Mapping logic
                                 let cCode = courseRaw;
                                 let sName = subjectRaw;
                                 
                                 if (courses.length > 0) {
                                      // If purely one-to-one mapping was intended by slash split:
                                      // rooms[0] -> courses[0]
                                      // But now rooms[0] might split into [roomA, roomB]. 
                                      // Should both get courses[0]? Yes, meaningful default.
                                      
                                      if (courses.length === 1) {
                                          cCode = courses[0];
                                      } else {
                                          // Try to map by index of the slash-split segment
                                          cCode = courses[index] || courses[0];
                                      }
                                 }
                                 
                                 if (subjects.length > 0) {
                                      if (subjects.length === 1) {
                                          sName = subjects[0];
                                      } else {
                                          sName = subjects[index] || subjects[0];
                                      }
                                 }

                                if (!roomData[room]) {
                                    roomData[room] = {};
                                }
                                if (!roomData[room][day]) {
                                    roomData[room][day] = {};
                                }

                                roomData[room][day][time] = [
                                    batch,      // 0: Batch
                                    cCode,   // 1: CourseCode
                                    sName,   // 2: SubjectName
                                    type    // 3: Type
                                ];
                             });
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
