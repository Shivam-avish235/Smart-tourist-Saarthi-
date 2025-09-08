import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const generateDigitalId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `DI-${timestamp}-${randomStr}`.toUpperCase();
};

const fixExistingDigitalIds = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_tourist', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const { default: Tourist } = await import('../src/models/Tourist.js');

    const tourists = await Tourist.find({ digitalId: null });
    console.log(`Found ${tourists.length} documents with null digitalId`);

    if (tourists.length > 0) {
      const bulkOps = tourists.map(tourist => ({
        updateOne: {
          filter: { _id: tourist._id },
          update: { $set: { digitalId: generateDigitalId() } }
        }
      }));
      await Tourist.bulkWrite(bulkOps);
      console.log('All documents updated successfully');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error fixing digitalIds:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

fixExistingDigitalIds();
