import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

// Import models
import Incident from '../src/models/Incident.js';
import Tourist from '../src/models/Tourist.js';

const verifyDatabase = async () => {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_tourist');
        console.log('✅ Connected to MongoDB');

        console.log('\n📊 DATABASE VERIFICATION');
        console.log('=' * 50);

        // Check collections exist
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`📁 Collections found: ${collections.length}`);
        collections.forEach(col => console.log(`   • ${col.name}`));

        // Verify tourists collection
        console.log('\n👥 TOURISTS COLLECTION:');
        const totalTourists = await Tourist.countDocuments();
        const activeTourists = await Tourist.countDocuments({ status: 'active' });
        const emergencyTourists = await Tourist.countDocuments({ status: 'emergency' });
        const verifiedTourists = await Tourist.countDocuments({ 'kycDetails.verified': true });

        console.log(`   Total tourists: ${totalTourists}`);
        console.log(`   Active tourists: ${activeTourists}`);
        console.log(`   Emergency tourists: ${emergencyTourists}`);
        console.log(`   Verified tourists: ${verifiedTourists}`);

        // Show sample tourist data
        const sampleTourist = await Tourist.findOne().select('-password');
        if (sampleTourist) {
            console.log(`   Sample tourist: ${sampleTourist.personalInfo.firstName} ${sampleTourist.personalInfo.lastName}`);
            console.log(`   Digital ID: ${sampleTourist.digitalId}`);
            console.log(`   Safety Score: ${sampleTourist.safetyScore || 'Not set'}`);
        }

        // Verify incidents collection
        console.log('\n🚨 INCIDENTS COLLECTION:');
        const totalIncidents = await Incident.countDocuments();
        const criticalIncidents = await Incident.countDocuments({ severity: 'Critical' });
        const activeIncidents = await Incident.countDocuments({ 
            status: { $in: ['New', 'Acknowledged', 'In Progress'] } 
        });

        console.log(`   Total incidents: ${totalIncidents}`);
        console.log(`   Critical incidents: ${criticalIncidents}`);
        console.log(`   Active incidents: ${activeIncidents}`);

        // Show incident types distribution
        const incidentTypes = await Incident.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        if (incidentTypes.length > 0) {
            console.log('   Incident types:');
            incidentTypes.forEach(type => {
                console.log(`     • ${type._id}: ${type.count}`);
            });
        }

        // Test data integrity
        console.log('\n🔍 DATA INTEGRITY CHECKS:');

        // Check for tourists without digital IDs
        const touristsWithoutDigitalId = await Tourist.countDocuments({ 
            digitalId: { $in: [null, ''] } 
        });
        console.log(`   Tourists without Digital ID: ${touristsWithoutDigitalId}`);

        // Check for incidents without tourist references
        const incidentsWithoutTourist = await Incident.countDocuments({
            touristId: { $exists: false }
        });
        console.log(`   Incidents without tourist reference: ${incidentsWithoutTourist}`);

        // Check for invalid coordinates
        const touristsWithInvalidCoords = await Tourist.countDocuments({
            $or: [
                { 'currentLocation.coordinates.latitude': { $not: { $gte: -90, $lte: 90 } } },
                { 'currentLocation.coordinates.longitude': { $not: { $gte: -180, $lte: 180 } } }
            ]
        });
        console.log(`   Tourists with invalid coordinates: ${touristsWithInvalidCoords}`);

        // Test queries performance
        console.log('\n⚡ PERFORMANCE TESTS:');

        const startTime = Date.now();
        await Tourist.findOne({ email: 'test1@example.com' });
        const emailQueryTime = Date.now() - startTime;
        console.log(`   Email query time: ${emailQueryTime}ms`);

        const startTime2 = Date.now();
        await Tourist.find().limit(10);
        const listQueryTime = Date.now() - startTime2;
        console.log(`   List query time: ${listQueryTime}ms`);

        console.log('\n✅ DATABASE VERIFICATION COMPLETED');

    } catch (error) {
        console.error('❌ Database verification error:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

// Run verification
verifyDatabase();
