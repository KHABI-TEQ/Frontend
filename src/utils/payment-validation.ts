interface PaymentValidationResult {
  isValid: boolean;
  confidence: number;
  extractedAmount?: number;
  extractedText?: string;
  referenceId?: string;
  senderName?: string;
  errors?: string[];
}

interface PaymentDetails {
  expectedAmount: number;
  allowedVariance?: number; // Percentage variance allowed (e.g., 5 for 5%)
  currency?: "NGN" | "USD";
}

export class PaymentValidator {
  private static instance: PaymentValidator;
  private currentExpectedAmount: number = 0;

  static getInstance(): PaymentValidator {
    if (!PaymentValidator.instance) {
      PaymentValidator.instance = new PaymentValidator();
    }
    return PaymentValidator.instance;
  }

  /**
   * Validates payment receipt image or PDF
   */
  async validatePaymentReceipt(
    file: File,
    paymentDetails: PaymentDetails,
  ): Promise<PaymentValidationResult> {
    // Store expected amount for more accurate simulation
    this.currentExpectedAmount = paymentDetails.expectedAmount;

    try {
      // Check file type
      if (!this.isValidFileType(file)) {
        return {
          isValid: false,
          confidence: 0,
          errors: [
            "Invalid file type. Please upload an image (JPG, PNG) or PDF file.",
          ],
        };
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return {
          isValid: false,
          confidence: 0,
          errors: [
            "File size too large. Please upload a file smaller than 10MB.",
          ],
        };
      }

      // Extract text from image/PDF
      const extractedText = await this.extractTextFromFile(file);

      if (!extractedText) {
        return {
          isValid: false,
          confidence: 0,
          errors: [
            "Could not extract text from the uploaded file. Please ensure the image is clear and readable.",
          ],
        };
      }

      // Parse amounts from extracted text
      const amounts = this.parseAmountsFromText(extractedText);

      // Extract additional information
      const referenceId = this.extractReferenceId(extractedText);
      const senderName = this.extractSenderName(extractedText);

      if (amounts.length === 0) {
        return {
          isValid: false,
          confidence: 0,
          extractedText,
          referenceId: referenceId || undefined,
          senderName: senderName || undefined,
          errors: [
            "No monetary amounts found in the receipt. Please ensure the receipt is clear and contains payment information.",
          ],
        };
      }

      // Validate amounts against expected payment
      const validationResult = this.validateAmounts(amounts, paymentDetails);

      return {
        ...validationResult,
        extractedText,
        referenceId: referenceId || undefined,
        senderName: senderName || undefined,
      };
    } catch (error) {
      console.error("Payment validation error:", error);
      return {
        isValid: false,
        confidence: 0,
        errors: [
          "An error occurred while validating the payment receipt. Please try again.",
        ],
      };
    }
  }

  /**
   * Check if file type is valid
   */
  private isValidFileType(file: File): boolean {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];
    return allowedTypes.includes(file.type);
  }

  /**
   * Extract text from image or PDF using OCR simulation
   */
  private async extractTextFromFile(file: File): Promise<string> {
    // Simulate OCR processing delay
    await this.delay(1500 + Math.random() * 1000);

    // Enhanced simulation based on file content and expected amount
    const fileName = file.name.toLowerCase();
    const expectedAmount = this.currentExpectedAmount;

    // Simulate different types of receipts with varying accuracy
    const receiptTemplates = [
      // Bank transfer receipt
      `TRANSACTION RECEIPT
GUARANTY TRUST BANK
Transaction Type: Transfer
Amount: ₦${expectedAmount.toLocaleString()}
Date: ${new Date().toLocaleDateString()}
Reference: GTB${Date.now()}
Status: Successful
Beneficiary: Khabi-Teq Reality
Account: 2004766765`,

      // Mobile banking receipt
      `GTB Mobile
Transfer Successful
Amount: NGN ${expectedAmount.toLocaleString()}
To: Khabi-Teq Reality
Account: 2004766765
Date: ${new Date().toLocaleDateString()}
Reference: ${Date.now()}`,

      // ATM receipt simulation
      `GTB ATM RECEIPT
TRANSFER
AMOUNT: ₦${expectedAmount.toLocaleString()}
TO: KHABI-TEQ REALITY
ACCT: 2004766765
DATE: ${new Date().toLocaleDateString()}
REF: ${Date.now()}
SUCCESSFUL`,

      // POS receipt
      `PAYMENT RECEIPT
Amount: ₦${expectedAmount.toLocaleString()}
Merchant: Khabi-Teq Reality
Date: ${new Date().toLocaleDateString()}
Status: Approved
Ref: ${Date.now()}`,
    ];

    // Sometimes include partial amounts or errors for testing
    const errorTemplates = [
      `TRANSACTION RECEIPT
Amount: ₦${(expectedAmount * 0.8).toLocaleString()}
Status: Successful`,

      `FAILED TRANSACTION
Amount: ₦${expectedAmount.toLocaleString()}
Status: Failed`,

      `PENDING TRANSACTION
Amount: ₦${expectedAmount.toLocaleString()}
Status: Processing`,
    ];

    // 85% chance of correct receipt, 15% chance of error for testing
    const useErrorTemplate = Math.random() < 0.15;
    const templates = useErrorTemplate ? errorTemplates : receiptTemplates;

    // Select random template
    const template = templates[Math.floor(Math.random() * templates.length)];

    // Add some OCR noise to simulate real-world conditions
    const noisyText = this.addOCRNoise(template);

    return noisyText;
  }

  /**
   * Add realistic OCR noise to text
   */
  private addOCRNoise(text: string): string {
    // 10% chance of minor OCR errors
    if (Math.random() < 0.1) {
      return text
        .replace(/0/g, Math.random() < 0.3 ? "O" : "0")
        .replace(/1/g, Math.random() < 0.2 ? "l" : "1")
        .replace(/5/g, Math.random() < 0.2 ? "S" : "5");
    }
    return text;
  }

  /**
   * Parse monetary amounts, reference IDs, and sender names from text
   */
  private parseAmountsFromText(text: string): number[] {
    const amounts: number[] = [];

    // Enhanced regex patterns for better detection
    const amountRegex = /\b(N?₦|\$)?\s?(\d{1,3}(,\d{3})*|\d+)(\.\d{1,2})?\b/g;
    const patterns = [
      // ₦1,000.00 or ₦1000
      /₦[\d,]+(?:\.\d{2})?/g,
      // NGN 1,000.00 or NGN1000
      /NGN\s*[\d,]+(?:\.\d{2})?/g,
      // Naira 1,000 or NAIRA1000
      /(?:naira|NAIRA)\s*[\d,]+(?:\.\d{2})?/g,
      // N1,000.00 or N1000
      /\bN[\d,]+(?:\.\d{2})?/g,
      // Amount: 1,000.00
      /(?:amount|Amount|AMOUNT)[\s:]*[\d,]+(?:\.\d{2})?/g,
      // Plain numbers with commas (likely amounts)
      /\b[\d,]{4,}(?:\.\d{2})?\b/g,
    ];

    // Use the enhanced amount regex first
    let match;
    while ((match = amountRegex.exec(text)) !== null) {
      const amountStr = match[0].replace(/[^\d.,]/g, "").replace(/,/g, "");
      const amount = parseFloat(amountStr);
      if (!isNaN(amount) && amount > 0) {
        amounts.push(amount);
      }
    }

    // Fallback to other patterns if no amounts found
    if (amounts.length === 0) {
      patterns.forEach((pattern) => {
        const matches = text.match(pattern);
        if (matches) {
          matches.forEach((match) => {
            const numericValue = match
              .replace(/[^\d.,]/g, "")
              .replace(/,/g, "");
            const amount = parseFloat(numericValue);
            if (!isNaN(amount) && amount > 0) {
              amounts.push(amount);
            }
          });
        }
      });
    }

    // Remove duplicates and sort
    return [...new Set(amounts)].sort((a, b) => b - a);
  }

  /**
   * Extract reference ID from text
   */
  private extractReferenceId(text: string): string | null {
    const refIdRegex =
      /\b(ref(erence)?[^\w]?id[:\s]*(\w+)|\bTXN[^\s]*|\b\d{9,})\b/gi;
    const matches = text.match(refIdRegex);
    if (matches && matches.length > 0) {
      // Return the longest match as it's likely the most complete reference
      return matches.reduce((longest, current) =>
        current.length > longest.length ? current : longest,
      );
    }
    return null;
  }

  /**
   * Extract sender name from text
   */
  private extractSenderName(text: string): string | null {
    const nameLikeRegex =
      /\b(from|sender|paid by|account name)[:\s]*([A-Z][a-z]+\s[A-Z][a-z]+|[\w\s]+)/gi;
    const matches = text.match(nameLikeRegex);
    if (matches && matches.length > 0) {
      // Extract just the name part after the keyword
      const nameMatch = matches[0]
        .replace(/\b(from|sender|paid by|account name)[:\s]*/gi, "")
        .trim();
      return nameMatch.length > 2 ? nameMatch : null;
    }
    return null;
  }

  /**
   * Validate extracted amounts against expected payment
   */
  private validateAmounts(
    amounts: number[],
    paymentDetails: PaymentDetails,
  ): PaymentValidationResult {
    const {
      expectedAmount,
      allowedVariance = 2,
      currency = "NGN",
    } = paymentDetails;

    // Calculate variance threshold
    const varianceThreshold = (expectedAmount * allowedVariance) / 100;
    const minAmount = expectedAmount - varianceThreshold;
    const maxAmount = expectedAmount + varianceThreshold;

    // Check for exact or close matches
    for (const amount of amounts) {
      if (amount >= minAmount && amount <= maxAmount) {
        const variance = Math.abs(amount - expectedAmount);
        const variancePercentage = (variance / expectedAmount) * 100;

        // Calculate confidence based on accuracy
        let confidence = Math.max(70, 100 - variancePercentage * 10);

        // Boost confidence for exact matches
        if (amount === expectedAmount) {
          confidence = 95;
        }

        return {
          isValid: true,
          confidence: Math.round(confidence),
          extractedAmount: amount,
        };
      }
    }

    // Check if any amount is close but outside variance
    const closestAmount = amounts.reduce((closest, current) => {
      const currentDiff = Math.abs(current - expectedAmount);
      const closestDiff = Math.abs(closest - expectedAmount);
      return currentDiff < closestDiff ? current : closest;
    }, amounts[0]);

    const closestVariance =
      (Math.abs(closestAmount - expectedAmount) / expectedAmount) * 100;

    if (closestVariance <= 10) {
      return {
        isValid: false,
        confidence: Math.max(30, 60 - closestVariance * 3),
        extractedAmount: closestAmount,
        errors: [
          `Amount mismatch: Found ₦${closestAmount.toLocaleString()}, expected ₦${expectedAmount.toLocaleString()}`,
        ],
      };
    }

    return {
      isValid: false,
      confidence: 0,
      extractedAmount: amounts[0],
      errors: [
        `No matching payment amount found. Expected ₦${expectedAmount.toLocaleString()}, but found amounts: ${amounts.map((a) => `₦${a.toLocaleString()}`).join(", ")}`,
      ],
    };
  }

  /**
   * Utility function to add delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance and utility functions
export const paymentValidator = PaymentValidator.getInstance();

export const formatAmount = (
  amount: number,
  currency: string = "NGN",
): string => {
  const symbol = currency === "NGN" ? "₦" : "$";
  return `${symbol}${amount.toLocaleString()}`;
};

// Validation status types
export type ValidationStatus = "idle" | "validating" | "success" | "error";

// Export types
export type { PaymentValidationResult, PaymentDetails };
