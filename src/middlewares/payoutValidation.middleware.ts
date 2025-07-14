import { Request, Response, NextFunction } from "express";

export const validateCreatePayout = (req: Request, res: Response, next: NextFunction) => {
    const { storeId, paymentIds, payoutMethod, bankDetails, paypalEmail } = req.body;

    // Required fields validation
    if (!storeId) {
         res.status(400).json({ message: "Store ID is required" });
         return;
    }

    if (!paymentIds || !Array.isArray(paymentIds) || paymentIds.length === 0) {
        res.status(400).json({ message: "At least one payment ID is required" });
        return;
    }

    if (!payoutMethod || !["BANK_TRANSFER", "PAYPAL", "WALLET"].includes(payoutMethod)) {
        res.status(400).json({ message: "Valid payout method is required" });
        return;
    }

    // Method-specific validation
    if (payoutMethod === "BANK_TRANSFER") {
        if (!bankDetails || !bankDetails.bankName || !bankDetails.accountNumber || !bankDetails.accountName) {
             res.status(400).json({
                message: "Bank details (bankName, accountNumber, accountName) are required for bank transfer"
            });
            return;
        }
    }

    if (payoutMethod === "PAYPAL") {
        if (!paypalEmail || !isValidEmail(paypalEmail)) {
            res.status(400).json({ message: "Valid PayPal email is required" });
            return;
        }
    }

    // Commission validation
    if (req.body.commission !== undefined) {
        const commission = Number(req.body.commission);
        if (isNaN(commission) || commission < 0 || commission > 100) {
            res.status(400).json({ message: "Commission must be between 0 and 100%" });
            return;
        }
    }

    next();
};

export const validateUpdatePayoutStatus = (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.body;

    if (!status || !["PENDING", "PROCESSING", "COMPLETED", "FAILED"].includes(status)) {
        res.status(400).json({ message: "Valid status is required" });
        return;
    }

    next();
};

export const validateQueryParams = (req: Request, res: Response, next: NextFunction) => {
    const { page, limit } = req.query;

    // Validate page
    if (page && (isNaN(Number(page)) || Number(page) < 1)) {
        res.status(400).json({ message: "Page must be a positive number" });
        return;
    }

    // Validate limit
    if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)) {
        res.status(400).json({ message: "Limit must be between 1 and 100" });
        return;
    }

    next();
};

// Helper function to validate email
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
