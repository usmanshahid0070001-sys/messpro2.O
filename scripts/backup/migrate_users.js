import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the backup directory
dotenv.config({ path: path.join(__dirname, '.env') });

const ATLAS_URI = process.env.ATLAS_URI || 'mongodb+srv://<username>:<password>@cluster.mongodb.net/<database>?retryWrites=true&w=majority';
const LOCAL_URI = process.env.LOCAL_URI || 'mongodb://localhost:27017/backup';

async function migrateUsers() {
  let atlasConnection;
  let localConnection;

  try {
    console.log('Connecting to Atlas MongoDB...');
    atlasConnection = await mongoose.createConnection(ATLAS_URI, { family: 4 }).asPromise();
    console.log('Connected to Atlas successfully.');

    console.log('Connecting to Local MongoDB...');
    localConnection = await mongoose.createConnection(LOCAL_URI).asPromise();
    console.log('Connected to Local successfully.');

    // Connect to the specific collections
    // using raw collections to bypass mongoose schema validations which might fail data migration
    const atlasStudentsCollection = atlasConnection.collection('students');
    const localUsersCollection = localConnection.collection('users');

    // Fetch all students from Atlas
    console.log('Fetching students from Atlas...');
    const students = await atlasStudentsCollection.find({ role: 'student' }).toArray();
    console.log(`Found ${students.length} students to migrate.`);

    if (students.length === 0) {
      console.log('No students found. Exiting.');
      return;
    }

    // Transform students to new user schema format
    const newUsers = students.map((student) => {
      let roomObjectId = null;
      if (student.room) {
        try {
          roomObjectId = new mongoose.Types.ObjectId(student.room);
        } catch (e) {
          console.warn(`Warning: Could not parse room ID '${student.room}' for student ${student.email}. Setting room to null.`);
        }
      }

      return {
        name: student.name,
        id: student.rollNumber || `student-${student._id}`, // id is mapped from rollNumber (required for student role)
        hostelId: student.hostel === 'B' ? '6a6879e426c580034824c28b' : '6a575ca8e08fdd210be19424',
        role: student.role || 'student',
        permissions: [], // Empty permissions array for the new sparse permissions architecture
        email: student.email,
        password: student.password,
        room: roomObjectId, // Relational link to the Room collection
        additionalInfo: [],
        createdAt: student.createdAt || new Date(),
        updatedAt: student.updatedAt || new Date()
      };
    });

    console.log('Clearing existing users in the local backup database (optional)...');
    // If you want to keep existing users, comment out the next line
    await localUsersCollection.deleteMany({});

    console.log('Inserting users into local MongoDB backup...');
    const result = await localUsersCollection.insertMany(newUsers);
    
    console.log(`Migration completed successfully! Inserted ${result.insertedCount} users.`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    if (atlasConnection) {
      await atlasConnection.close();
      console.log('Atlas connection closed.');
    }
    if (localConnection) {
      await localConnection.close();
      console.log('Local connection closed.');
    }
  }
}

migrateUsers();
