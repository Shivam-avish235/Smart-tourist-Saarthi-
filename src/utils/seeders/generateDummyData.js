import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

// Utility function to generate random coordinates within India
const generateIndianCoordinates = () => {
    // India's approximate bounding box
    const minLat = 8.4; // Southern tip
    const maxLat = 37.6; // Northern tip
    const minLng = 68.7; // Western edge
    const maxLng = 97.25; // Eastern edge

    return {
        latitude: faker.number.float({ min: minLat, max: maxLat, precision: 0.0001 }),
        longitude: faker.number.float({ min: minLng, max: maxLng, precision: 0.0001 })
    };
};

// Generate tourist profile data
export const generateTouristData = async (count = 50) => {
    const tourists = [];
    const states = [
        'Andhra Pradesh', 'Assam', 'Bihar', 'Gujarat', 'Karnataka', 
        'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Punjab', 'Rajasthan',
        'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'
    ];
    
    for (let i = 0; i < count; i++) {
        const coords = generateIndianCoordinates();
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        tourists.push({
            email: faker.internet.email(),
            password: hashedPassword,
            personalInfo: {
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName(),
                phoneNumber: faker.phone.number('+91##########'),
                dateOfBirth: faker.date.past({ years: 50 }),
                nationality: faker.helpers.arrayElement(['Indian', 'NRI']),
                address: {
                    street: faker.location.street(),
                    city: faker.location.city(),
                    state: faker.helpers.arrayElement(states),
                    country: 'India',
                    pinCode: faker.location.zipCode('#####')
                }
            },
            travelInfo: {
                purpose: faker.helpers.arrayElement(['Tourism', 'Business', 'Pilgrimage', 'Adventure']),
                duration: faker.number.int({ min: 1, max: 30 }),
                groupSize: faker.number.int({ min: 1, max: 10 })
            },
            currentLocation: {
                coordinates: coords,
                accuracy: faker.number.float({ min: 5, max: 50 }),
                timestamp: new Date(),
                address: faker.location.streetAddress(true)
            },
            emergencyContacts: [{
                name: faker.person.fullName(),
                relationship: faker.helpers.arrayElement(['Parent', 'Spouse', 'Sibling']),
                phoneNumber: faker.phone.number('+91##########')
            }],
            healthInfo: {
                bloodGroup: faker.helpers.arrayElement(['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-']),
                allergies: faker.helpers.arrayElements(['Peanuts', 'Dairy', 'Dust', 'None'], { min: 0, max: 2 }),
                medications: faker.helpers.arrayElements(['None', 'Blood Pressure', 'Diabetes'], { min: 0, max: 2 })
            },
            documents: {
                type: faker.helpers.arrayElement(['Passport', 'Aadhar Card', 'Driving License']),
                number: faker.string.alphanumeric(12).toUpperCase(),
                issuedBy: 'Government of India',
                validUntil: faker.date.future()
            },
            status: faker.helpers.arrayElement(['active', 'inactive', 'emergency']),
            lastActiveAt: faker.date.recent(),
            safetyScore: faker.number.int({ min: 50, max: 100 }),
            riskLevel: faker.helpers.arrayElement(['low', 'medium', 'high']),
            isVerified: faker.datatype.boolean(0.8)
        });
    }
    return tourists;
};

// Generate incident data
export const generateIncidentData = (tourists, count = 20) => {
    const incidents = [];
    const incidentTypes = [
        'Medical Emergency', 'Theft', 'Lost Documents', 'Natural Disaster',
        'Traffic Accident', 'Harassment', 'Lost/Separated', 'Health Issue'
    ];
    
    for (let i = 0; i < count; i++) {
        const tourist = faker.helpers.arrayElement(tourists);
        const coords = generateIndianCoordinates();
        
        incidents.push({
            touristId: tourist._id,
            type: faker.helpers.arrayElement(incidentTypes),
            description: faker.lorem.paragraph(),
            location: {
                coordinates: coords,
                address: faker.location.streetAddress(true)
            },
            severity: faker.helpers.arrayElement(['Low', 'Medium', 'High', 'Critical']),
            status: faker.helpers.arrayElement(['New', 'Acknowledged', 'In Progress', 'Resolved']),
            reportedAt: faker.date.recent(),
            resolvedAt: faker.helpers.maybe(() => faker.date.recent(), { probability: 0.7 }),
            responders: faker.helpers.maybe(() => [{
                name: faker.person.fullName(),
                role: faker.helpers.arrayElement(['Police', 'Medical Staff', 'Tourist Guide']),
                contactNumber: faker.phone.number('+91##########')
            }], { probability: 0.8 }),
            notes: faker.helpers.maybe(() => [
                { timestamp: faker.date.recent(), text: faker.lorem.sentence() }
            ], { probability: 0.6 })
        });
    }
    return incidents;
};

// Generate attraction data
export const generateAttractionData = (count = 30) => {
    const attractions = [];
    const categories = ['Historical', 'Religious', 'Nature', 'Adventure', 'Cultural'];
    
    for (let i = 0; i < count; i++) {
        const coords = generateIndianCoordinates();
        
        attractions.push({
            name: faker.company.name() + ' ' + faker.helpers.arrayElement(['Temple', 'Fort', 'Palace', 'Park', 'Museum']),
            description: faker.lorem.paragraph(),
            category: faker.helpers.arrayElement(categories),
            location: {
                coordinates: coords,
                address: faker.location.streetAddress(true)
            },
            images: Array(3).fill().map(() => faker.image.url()),
            openingHours: {
                open: '09:00',
                close: '18:00',
                holidays: ['Monday']
            },
            ticketPrice: {
                adult: faker.number.int({ min: 50, max: 500 }),
                child: faker.number.int({ min: 20, max: 250 }),
                foreign: faker.number.int({ min: 500, max: 2000 })
            },
            ratings: {
                average: faker.number.float({ min: 3.5, max: 5, precision: 0.1 }),
                count: faker.number.int({ min: 100, max: 1000 })
            },
            facilities: faker.helpers.arrayElements([
                'Parking', 'Restrooms', 'Cafe', 'Gift Shop', 'Guide Service',
                'Wheelchair Access', 'Photography Allowed'
            ], { min: 3, max: 7 }),
            safetyMetrics: {
                crowdDensity: faker.helpers.arrayElement(['Low', 'Medium', 'High']),
                securityLevel: faker.helpers.arrayElement(['Basic', 'Medium', 'High']),
                emergencyServices: faker.helpers.arrayElement(['Available', 'On Call', '24/7'])
            },
            nearbyServices: Array(3).fill().map(() => ({
                name: faker.company.name(),
                type: faker.helpers.arrayElement(['Restaurant', 'Hotel', 'Hospital', 'Police Station']),
                distance: faker.number.float({ min: 0.1, max: 5, precision: 0.1 })
            }))
        });
    }
    return attractions;
};

// Generate review data
export const generateReviewData = (tourists, attractions, count = 100) => {
    const reviews = [];
    
    for (let i = 0; i < count; i++) {
        const tourist = faker.helpers.arrayElement(tourists);
        const attraction = faker.helpers.arrayElement(attractions);
        
        reviews.push({
            touristId: tourist._id,
            attractionId: attraction._id,
            rating: faker.number.int({ min: 1, max: 5 }),
            title: faker.lorem.sentence(),
            content: faker.lorem.paragraph(),
            visitDate: faker.date.recent(),
            photos: faker.helpers.maybe(() => 
                Array(2).fill().map(() => faker.image.url()),
                { probability: 0.3 }
            ),
            tags: faker.helpers.arrayElements([
                'Family Friendly', 'Worth the Price', 'Clean', 'Crowded',
                'Beautiful', 'Historic', 'Peaceful', 'Must Visit'
            ], { min: 1, max: 4 }),
            helpfulVotes: faker.number.int({ min: 0, max: 50 }),
            isVerified: faker.datatype.boolean(0.9)
        });
    }
    return reviews;
};

// Generate safety alert data
export const generateSafetyAlertData = (count = 15) => {
    const alerts = [];
    const alertTypes = [
        'Weather Warning', 'Security Threat', 'Health Advisory',
        'Transport Disruption', 'Crowd Management', 'Natural Disaster'
    ];
    
    for (let i = 0; i < count; i++) {
        const coords = generateIndianCoordinates();
        
        alerts.push({
            type: faker.helpers.arrayElement(alertTypes),
            title: faker.lorem.sentence(),
            description: faker.lorem.paragraph(),
            severity: faker.helpers.arrayElement(['Low', 'Medium', 'High', 'Critical']),
            location: {
                coordinates: coords,
                address: faker.location.streetAddress(true),
                radius: faker.number.int({ min: 1, max: 10 }) // km
            },
            startTime: faker.date.recent(),
            endTime: faker.date.soon(),
            status: faker.helpers.arrayElement(['Active', 'Resolved', 'Monitoring']),
            affectedAttractions: [], // To be filled after creation
            safetyMeasures: faker.helpers.arrayElements([
                'Avoid Area', 'Carry ID', 'Stay Indoors', 'Follow Guidelines',
                'Contact Authorities', 'Use Emergency Services'
            ], { min: 2, max: 4 }),
            updates: Array(2).fill().map(() => ({
                timestamp: faker.date.recent(),
                message: faker.lorem.sentence()
            }))
        });
    }
    return alerts;
};
