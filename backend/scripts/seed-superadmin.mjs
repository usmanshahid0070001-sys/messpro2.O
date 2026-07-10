import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const User = mongoose.models.User || mongoose.model(
    'User',
    new mongoose.Schema(
      {
        name: String,
        id: String,
        hostelId: String,
        role: String,
        email: String,
        password: String,
        additionalInfo: Array,
        additionalFunctionality: String,
      },
      { timestamps: true }
    )
  );

  const email = 'musmanshahid003';
  const passwordHash = await bcrypt.hash('password1234', 12);

  const existing = await User.findOne({ email });

  if (existing) {
    await User.updateOne(
      { _id: existing._id },
      {
        $set: {
          name: 'Musman Shahid',
          id: 'superadmin-001',
          hostelId: 'default-hostel',
          role: 'superadmin',
          email,
          password: passwordHash,
          additionalInfo: [{ key: 'phoneNumber', value: '+92-300-0000000' }],
          additionalFunctionality: 'none',
        },
      }
    );
    console.log('Updated superadmin user.');
  } else {
    await User.create({
      name: 'Musman Shahid',
      id: 'superadmin-001',
      hostelId: 'default-hostel',
      role: 'superadmin',
      email,
      password: passwordHash,
      additionalInfo: [{ key: 'phoneNumber', value: '+92-300-0000000' }],
      additionalFunctionality: 'none',
    });
    console.log('Created superadmin user.');
  }

  await mongoose.disconnect();
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
