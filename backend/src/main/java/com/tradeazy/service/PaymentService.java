package com.tradeazy.service;

import java.math.BigDecimal;

/**
 * Payment provider abstraction.
 *
 * Today: MockPaymentService simulates Paystack/Flutterwave for local dev.
 * Tomorrow: PaystackPaymentService, FlutterwavePaymentService — same interface.
 *
 * The rest of the app never imports the implementation directly.
 */
public interface PaymentService {

    /**
     * Result of a payment attempt.
     */
    record PaymentResult(
            boolean success,
            String reference,
            String status,
            String message
    ) {}

    /**
     * Attempt to charge the given amount.
     * In dev, this always succeeds immediately and returns a fake reference.
     *
     * @param userId      the payer
     * @param amount      amount in Naira
     * @param description human-readable purpose, e.g. "Rent - MONTHLY"
     * @return result with success flag, reference, and status
     */
    PaymentResult charge(Long userId, BigDecimal amount, String description);
}