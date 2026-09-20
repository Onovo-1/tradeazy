package com.tradeazy.entity.enums;

/**
 * Account status for a Tradeazy user.
 *
 * ACTIVE     — normal account, can log in and use the platform.
 * SUSPENDED  — account has been disabled by an admin.
 *              Cannot log in or perform any authenticated action.
 */
public enum UserStatus {
    ACTIVE,
    SUSPENDED
}