package com.tradeazy.util;

import java.text.Normalizer;

/**
 * Turns arbitrary text into a URL-friendly slug.
 *
 * Examples:
 *   "Home, Furniture & Appliances" → "home-furniture-appliances"
 *   "Beauty & Personal Care"        → "beauty-personal-care"
 *   "iPhone 15 Pro"                 → "iphone-15-pro"
 *   "Café & Crème"                  → "cafe-creme"
 *
 * We don't use it yet in the seeder (we hardcoded the slugs there for
 * stability), but it's here for when sellers create categories or when
 * we generate slugs from arbitrary names later.
 */
public final class SlugUtil {

    private SlugUtil() {
        // utility class
    }

    public static String slugify(String input) {
        if (input == null || input.isBlank()) return "";

        // 1. Normalize accents (é → e)
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");

        return normalized
                // 2. Lowercase
                .toLowerCase()
                // 3. Replace any non-alphanumeric with hyphen
                .replaceAll("[^a-z0-9]+", "-")
                // 4. Strip leading/trailing hyphens
                .replaceAll("^\\-+", "")
                .replaceAll("\\-+$", "");
    }
}