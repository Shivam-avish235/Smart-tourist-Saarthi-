import { body, validationResult } from 'express-validator';

// Validation middleware
export const validate = validations => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    };
};

// Tourist registration validation
export const validateTouristRegistration = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('firstName')
        .trim()
        .notEmpty()
        .withMessage('First name is required'),
    body('lastName')
        .trim()
        .notEmpty()
        .withMessage('Last name is required'),
    body('dateOfBirth')
        .isISO8601()
        .withMessage('Please provide a valid date'),
    body('nationality')
        .trim()
        .notEmpty()
        .withMessage('Nationality is required'),
    body('phoneNumber')
        .matches(/^\+?[1-9]\d{1,14}$/)
        .withMessage('Please provide a valid phone number'),
    body('documentType')
        .isIn(['Passport', 'Aadhar Card', 'Driving License'])
        .withMessage('Invalid document type'),
    body('documentNumber')
        .trim()
        .notEmpty()
        .withMessage('Document number is required')
];

// Login validation
export const validateLogin = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

// Review validation
export const validateReview = [
    body('attractionId')
        .isMongoId()
        .withMessage('Invalid attraction ID'),
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Review title is required'),
    body('content')
        .trim()
        .isLength({ min: 10 })
        .withMessage('Review content must be at least 10 characters long'),
    body('visitDate')
        .isISO8601()
        .withMessage('Please provide a valid date')
];

// Location update validation
export const validateLocationUpdate = [
    body('latitude')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Invalid latitude'),
    body('longitude')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Invalid longitude'),
    body('accuracy')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Invalid accuracy value'),
    body('address')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Address cannot be empty if provided')
];

// Emergency report validation
export const validateEmergencyReport = [
    body('type')
        .trim()
        .notEmpty()
        .withMessage('Emergency type is required')
        .isIn(['Medical Emergency', 'Security Threat', 'Natural Disaster', 'Other'])
        .withMessage('Invalid emergency type'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Description is required'),
    body('location')
        .isObject()
        .withMessage('Location information is required'),
    body('location.latitude')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Invalid latitude'),
    body('location.longitude')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Invalid longitude')
];
