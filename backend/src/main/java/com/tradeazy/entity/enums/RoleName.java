package com.tradeazy.entity.enums;

/**
 * The three roles a Tradeazy account can have.
 *
 * Spring Security convention: authorities should be prefixed with "ROLE_".
 * The database stores the enum by its name (e.g. "ROLE_BUYER"),
 * which is why we don't include the prefix in the enum identifier itself —
 * we use a separate field for it.
 */
public enum RoleName {

    /**
     * A user who browses, searches, saves favorites,
     * chats with sellers, and purchases products.
     */
    BUYER,

    /**
     * A user who pays monthly Rent to list products
     * on the marketplace, manages listings, and chats with buyers.
     */
    SELLER,

    /**
     * Platform administrator. Manages users, products,
     * categories, reports, and views marketplace statistics.
     */
    ADMIN;

    /**
     * Spring Security expects authorities to be prefixed with "ROLE_".
     * Example: RoleName.BUYER → "ROLE_BUYER"
     */
    public String toAuthority() {
        return "ROLE_" + this.name();
    }
}