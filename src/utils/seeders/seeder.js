import { config } from 'dotenv';
import mongoose from 'mongoose';
import {
    generateAttractionData,
    generateIncidentData,
    generateReviewData,
    generateSafetyAlertData,
    generateTouristData
} from './generateDummyData.js';

import Attraction from '../../models/Attraction.js';
import Incident from '../../models/Incident.js';
import Review from '../../models/Review.js';
import SafetyAlert from '../../models/SafetyAlert.js';
import Tourist from '../../models/Tourist.js';

// Load environment variables
config();

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB...');

        // Clear existing data
        await Promise.all([
            Tourist.deleteMany({}),
            Incident.deleteMany({}),
            Attraction.deleteMany({}),
            Review.deleteMany({}),
            SafetyAlert.deleteMany({})
        ]);
        console.log('Cleared existing data...');

        // Generate and insert tourist data
        const tourists = await generateTouristData(50);
        const savedTourists = await Tourist.insertMany(tourists);
        console.log('Generated tourist data...');

        // Generate and insert attraction data
        const attractions = await generateAttractionData(30);
        const savedAttractions = await Attraction.insertMany(attractions);
        console.log('Generated attraction data...');

        // Generate and insert incident data
        const incidents = generateIncidentData(savedTourists, 20);
        await Incident.insertMany(incidents);
        console.log('Generated incident data...');

        // Generate and insert review data
        const reviews = generateReviewData(savedTourists, savedAttractions, 100);
        await Review.insertMany(reviews);
        console.log('Generated review data...');

        // Generate and insert safety alert data
        const safetyAlerts = generateSafetyAlertData(15);
        // Add affected attractions to safety alerts
        safetyAlerts.forEach(alert => {
            alert.affectedAttractions = faker.helpers.arrayElements(
                savedAttractions.map(a => a._id),
                { min: 1, max: 3 }
            );
        });
        await SafetyAlert.insertMany(safetyAlerts);
        console.log('Generated safety alert data...');

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
