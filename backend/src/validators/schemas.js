const Joi = require('joi');

const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const generateQRSchema = Joi.object({
    payload: Joi.string().required(),
    customName: Joi.string().max(25).required()
});

const submitProofSchema = Joi.object({
    amount: Joi.number().positive().required(),
    referenceNumber: Joi.string().required(),
    packageId: Joi.number().optional()
});

const submitTaskSchema = Joi.object({
    taskKey: Joi.string().required(),
    submittedValue: Joi.string().trim().min(2).max(100).required()
});

const reviewTaskSchema = Joi.object({
    notes: Joi.string().allow("").max(500).optional()
});

const grantCreditsSchema = Joi.object({
    amount: Joi.number().positive().required(),
    notes: Joi.string().allow("").max(500).optional()
});

module.exports = {
    registerSchema,
    loginSchema,
    generateQRSchema,
    submitProofSchema,
    submitTaskSchema,
    reviewTaskSchema,
    grantCreditsSchema
};
