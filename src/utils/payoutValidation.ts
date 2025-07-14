import Joi from "joi";

export const createPayoutSchema = Joi.object({
    storeId: Joi.string().required().messages({
        "string.empty": "Store ID is required",
        "any.required": "Store ID is required"
    }),
    paymentIds: Joi.array().items(Joi.string()).min(1).required().messages({
        "array.min": "At least one payment ID is required",
        "any.required": "Payment IDs are required"
    }),
    commission: Joi.number().min(0).max(100).default(10).messages({
        "number.min": "Commission must be at least 0%",
        "number.max": "Commission cannot exceed 100%"
    }),
    payoutMethod: Joi.string().valid("BANK_TRANSFER", "PAYPAL", "WALLET").required().messages({
        "any.required": "Payout method is required",
        "any.only": "Invalid payout method"
    }),
    bankDetails: Joi.when("payoutMethod", {
        is: "BANK_TRANSFER",
        then: Joi.object({
            bankName: Joi.string().required().messages({
                "string.empty": "Bank name is required for bank transfer",
                "any.required": "Bank name is required for bank transfer"
            }),
            accountNumber: Joi.string().required().messages({
                "string.empty": "Account number is required for bank transfer",
                "any.required": "Account number is required for bank transfer"
            }),
            accountName: Joi.string().required().messages({
                "string.empty": "Account name is required for bank transfer",
                "any.required": "Account name is required for bank transfer"
            }),
            swiftCode: Joi.string().optional()
        }).required(),
        otherwise: Joi.optional()
    }),
    paypalEmail: Joi.when("payoutMethod", {
        is: "PAYPAL",
        then: Joi.string().email().required().messages({
            "string.email": "Invalid PayPal email format",
            "string.empty": "PayPal email is required for PayPal method",
            "any.required": "PayPal email is required for PayPal method"
        }),
        otherwise: Joi.optional()
    }),
    notes: Joi.string().max(500).optional().messages({
        "string.max": "Notes cannot exceed 500 characters"
    })
});

export const updatePayoutStatusSchema = Joi.object({
    status: Joi.string().valid("PENDING", "PROCESSING", "COMPLETED", "FAILED").required().messages({
        "any.required": "Status is required",
        "any.only": "Invalid status value"
    }),
    notes: Joi.string().max(500).optional().messages({
        "string.max": "Notes cannot exceed 500 characters"
    })
});

export const getPayoutsQuerySchema = Joi.object({
    status: Joi.string().valid("PENDING", "PROCESSING", "COMPLETED", "FAILED").optional(),
    storeId: Joi.string().optional(),
    page: Joi.number().integer().min(1).default(1).messages({
        "number.min": "Page must be at least 1"
    }),
    limit: Joi.number().integer().min(1).max(100).default(10).messages({
        "number.min": "Limit must be at least 1",
        "number.max": "Limit cannot exceed 100"
    })
});
