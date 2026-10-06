package com.tradeazy.service.impl;

import com.tradeazy.service.PaymentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Development payment processor.
 *
 * Simulates a payment provider by always returning success with a fake reference.
 * Logs every charge so you can see the flow in the terminal.
 *
 * To swap for real Paystack:
 *   1. Add a PaystackPaymentService that implements PaymentService
 *   2. Mark this class @Primary @Profile("!prod") or delete it
 *   3. Annotate the real one @Profile("prod")
 */
@Service
@Slf4j
public class MockPaymentService implements PaymentService {

    @Override
    public PaymentResult charge(Long userId, BigDecimal amount, String description) {
        String reference = "MOCK-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();

        log.warn("=========================================");
        log.warn("  MOCK PAYMENT CHARGED");
        log.warn("  User ID:  {}", userId);
        log.warn("  Amount:   ₦{}", amount);
        log.warn("  Purpose:  {}", description);
        log.warn("  Ref:      {}", reference);
        log.warn("  Time:     {}", OffsetDateTime.now());
        log.warn("=========================================");

        return new PaymentResult(
                true,
                reference,
                "SUCCESS",
                "Mock payment succeeded"
        );
    }
}