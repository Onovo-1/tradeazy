package com.tradeazy.config;

import com.tradeazy.entity.Category;
import com.tradeazy.repository.CategoryRepository;
import com.tradeazy.util.SlugUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Seeds the 7 default categories on startup.
 *
 * Idempotent: existing categories are skipped (matched by slug).
 * Runs AFTER DataSeeder (@Order(2)).
 *
 * Admins can add/edit/delete categories later via the admin API —
 * the seeder only fills in defaults, never overwrites.
 */
@Component
@Order(2)
@RequiredArgsConstructor
@Slf4j
public class CategorySeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    /** (name, slug, description) — order preserved in UI. */
    private static final List<String[]> DEFAULT_CATEGORIES = List.of(
            new String[]{
                    "Fashion",
                    "fashion",
                    "Clothing, shoes, bags, and accessories"
            },
            new String[]{
                    "Electronics",
                    "electronics",
                    "Phones, laptops, TVs, audio, and gadgets"
            },
            new String[]{
                    "Home, Furniture & Appliances",
                    "home-furniture-appliances",
                    "Furniture, kitchenware, home appliances"
            },
            new String[]{
                    "Vehicles",
                    "vehicles",
                    "Cars, motorcycles, spare parts, and accessories"
            },
            new String[]{
                    "Beauty & Personal Care",
                    "beauty-personal-care",
                    "Skincare, cosmetics, and personal care"
            },
            new String[]{
                    "Workout",
                    "workout",
                    "Fitness gear, sportswear, and equipment"
            },
            new String[]{
                    "Foods",
                    "foods",
                    "Groceries, snacks, drinks, and packaged foods"
            }
    );

    @Override
    @Transactional
    public void run(String... args) {
        int seeded = 0;

        for (String[] entry : DEFAULT_CATEGORIES) {
            String name = entry[0];
            String slug = entry[1];
            String description = entry[2];

            if (categoryRepository.existsBySlug(slug)) {
                continue; // already seeded — skip silently
            }

            Category category = Category.builder()
                    .name(name)
                    .slug(slug)
                    .description(description)
                    .active(true)
                    .build();

            categoryRepository.save(category);
            log.info("Seeded category: {} ({})", name, slug);
            seeded++;
        }

        if (seeded > 0) {
            log.info("CategorySeeder: {} category(ies) created", seeded);
        } else {
            log.debug("CategorySeeder: all categories already present");
        }
    }
}