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

/**
 * Category tree: 7 top categories, ~4 sub-categories each, ~3 leaves each.
 * No overlap — each leaf lives under exactly one sub-category.
 */
@Component
@Order(2)
@RequiredArgsConstructor
@Slf4j
public class CategorySeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    @Override
    @Transactional
    public void run(String... args) {
        seedTree();
        log.info("CategorySeeder: full tree ensured");
    }

    private void seedTree() {

        // ═══════════════ FASHION ═══════════════
        var fashion = top("Fashion", "Clothing, shoes, bags, and accessories");
        var menClothing = child(fashion, "Men's Clothing", "Clothing for men");
        leaf(menClothing, "Shirts", "Casual and formal shirts");
        leaf(menClothing, "Trousers", "Pants, jeans, chinos");
        leaf(menClothing, "Traditional Wear", "Agbada, kaftans, senator");
        leaf(menClothing, "T-Shirts & Polos", "Everyday tees and polos");

        var womenClothing = child(fashion, "Women's Clothing", "Clothing for women");
        leaf(womenClothing, "Dresses", "Casual, formal, and evening dresses");
        leaf(womenClothing, "Tops & Blouses", "Tops and blouses");
        leaf(womenClothing, "Skirts", "Mini, midi, maxi skirts");
        leaf(womenClothing, "Traditional Wear", "Ankara, gele, iro & buba");

        var shoes = child(fashion, "Shoes", "Footwear for every occasion");
        leaf(shoes, "Men's Shoes", "Formal, casual, sneakers");
        leaf(shoes, "Women's Shoes", "Heels, flats, sneakers");
        leaf(shoes, "Kids' Shoes", "Children's footwear");
        leaf(shoes, "Sandals & Slippers", "Open footwear");

        var bags = child(fashion, "Bags & Accessories", "Bags, belts, and more");
        leaf(bags, "Handbags", "Women's handbags and purses");
        leaf(bags, "Backpacks", "School and travel backpacks");
        leaf(bags, "Belts & Wallets", "Belts, wallets, cardholders");
        leaf(bags, "Hats & Caps", "Hats, caps, beanies");

        var jewelry = child(fashion, "Jewelry & Watches", "Fine and fashion jewelry");
        leaf(jewelry, "Watches", "Men's and women's watches");
        leaf(jewelry, "Necklaces & Pendants", "Chains and pendants");
        leaf(jewelry, "Rings & Earrings", "Rings and earrings");
        leaf(jewelry, "Bracelets", "Bracelets and bangles");


        // ═══════════════ ELECTRONICS ═══════════════
        var electronics = top("Electronics", "Phones, laptops, TVs, audio, and gadgets");
        var phones = child(electronics, "Phones & Tablets", "Smartphones and tablets");
        leaf(phones, "Smartphones", "Android and iOS phones");
        leaf(phones, "Tablets", "iPads and Android tablets");
        leaf(phones, "Phone Accessories", "Cases, chargers, cables");

        var laptops = child(electronics, "Laptops & Computers", "Portable and desktop computers");
        leaf(laptops, "Laptops", "Everyday laptops");
        leaf(laptops, "Gaming Laptops", "High-performance gaming laptops");
        leaf(laptops, "Desktops & Monitors", "Desktop PCs and monitors");
        leaf(laptops, "Computer Accessories", "Keyboards, mice, hubs");

        var tvs = child(electronics, "TVs & Displays", "Televisions and projectors");
        leaf(tvs, "Smart TVs", "Android and smart TVs");
        leaf(tvs, "LED & OLED TVs", "Standard LED and OLED");
        leaf(tvs, "Projectors", "Home and office projectors");

        var audio = child(electronics, "Audio & Headphones", "Headphones, speakers, sound");
        leaf(audio, "Headphones & Earbuds", "Wireless and wired audio");
        leaf(audio, "Bluetooth Speakers", "Portable and home speakers");
        leaf(audio, "Home Theater", "Soundbars and surround");
        leaf(audio, "Microphones", "Studio and podcast mics");

        var cameras = child(electronics, "Cameras & Photography", "Cameras and gear");
        leaf(cameras, "DSLR Cameras", "Professional DSLRs");
        leaf(cameras, "Mirrorless Cameras", "Compact mirrorless");
        leaf(cameras, "Camera Accessories", "Lenses, tripods, bags");

        var gaming = child(electronics, "Gaming", "Consoles and gaming gear");
        leaf(gaming, "Consoles", "PlayStation, Xbox, Nintendo");
        leaf(gaming, "Video Games", "Games and controllers");
        leaf(gaming, "Gaming Accessories", "Headsets, chairs, pads");

        var smartHome = child(electronics, "Smart Home & Wearables", "Smart devices");
        leaf(smartHome, "Smart Watches", "Wearables");
        leaf(smartHome, "Smart Bulbs & Plugs", "Smart lighting and plugs");
        leaf(smartHome, "Smart Cameras", "Home security cameras");


        // ═══════════════ HOME, FURNITURE & APPLIANCES ═══════════════
        var home = top("Home, Furniture & Appliances", "Furniture, kitchenware, home appliances");
        var furniture = child(home, "Furniture", "Indoor and outdoor furniture");
        leaf(furniture, "Sofas & Couches", "Living room seating");
        leaf(furniture, "Beds & Mattresses", "Beds, mattresses, headboards");
        leaf(furniture, "Tables & Chairs", "Dining and coffee tables");
        leaf(furniture, "Wardrobes & Storage", "Wardrobes, shelving, storage");

        var kitchen = child(home, "Kitchen & Dining", "Kitchenware and dining essentials");
        leaf(kitchen, "Cookware", "Pots, pans, and utensils");
        leaf(kitchen, "Tableware", "Plates, cups, and cutlery");
        leaf(kitchen, "Small Appliances", "Blenders, kettles, toasters");
        leaf(kitchen, "Storage & Organization", "Containers and organizers");

        var appliances = child(home, "Home Appliances", "Big home appliances");
        leaf(appliances, "Refrigerators & Freezers", "Fridges and freezers");
        leaf(appliances, "Washing Machines", "Laundry appliances");
        leaf(appliances, "Air Conditioners & Fans", "Cooling");
        leaf(appliances, "Generators & Inverters", "Power supply");

        var decor = child(home, "Home Décor & Textiles", "Decor and soft furnishings");
        leaf(decor, "Bedding & Linens", "Sheets, duvets, pillows");
        leaf(decor, "Curtains & Blinds", "Window treatments");
        leaf(decor, "Rugs & Carpets", "Floor coverings");
        leaf(decor, "Lighting", "Lamps and ceiling lights");


        // ═══════════════ VEHICLES ═══════════════
        var vehicles = top("Vehicles", "Cars, motorcycles, spare parts, and accessories");
        var cars = child(vehicles, "Cars", "New and used cars");
        leaf(cars, "Sedans", "Sedan cars");
        leaf(cars, "SUVs & Jeeps", "SUVs and 4x4s");
        leaf(cars, "Hatchbacks", "Compact hatchbacks");
        leaf(cars, "Pickup Trucks", "Pickups and utility vehicles");

        var bikes = child(vehicles, "Motorcycles & Scooters", "Bikes and scooters");
        leaf(bikes, "Sport Bikes", "Sport motorcycles");
        leaf(bikes, "Scooters & Mopeds", "Scooters and mopeds");
        leaf(bikes, "Bicycles", "Manual and electric bikes");

        var vehicleParts = child(vehicles, "Vehicle Parts & Accessories", "Parts and add-ons");
        leaf(vehicleParts, "Engine & Transmission", "Engine parts");
        leaf(vehicleParts, "Tires & Wheels", "Tires, rims, and wheels");
        leaf(vehicleParts, "Car Electronics", "Stereos, alarms, GPS");
        leaf(vehicleParts, "Interior & Exterior Accessories", "Covers, mats, kits");


        // ═══════════════ BEAUTY & PERSONAL CARE ═══════════════
        var beauty = top("Beauty & Personal Care", "Skincare, cosmetics, and personal care");
        var skin = child(beauty, "Skincare", "Skin care products");
        leaf(skin, "Cleansers & Face Wash", "Face washes and cleansers");
        leaf(skin, "Moisturizers", "Creams and lotions");
        leaf(skin, "Sunscreens", "SPF products");
        leaf(skin, "Serums & Treatments", "Serums and treatments");

        var hair = child(beauty, "Hair Care", "Hair products and tools");
        leaf(hair, "Shampoo & Conditioner", "Wash and condition");
        leaf(hair, "Hair Treatments", "Oils, serums, masks");
        leaf(hair, "Wigs & Extensions", "Wigs and extensions");
        leaf(hair, "Hair Styling Tools", "Dryers, straighteners");

        var makeup = child(beauty, "Makeup & Cosmetics", "Cosmetics and makeup");
        leaf(makeup, "Face", "Foundation, powder, blush");
        leaf(makeup, "Eyes", "Mascara, eyeliner, eyeshadow");
        leaf(makeup, "Lips", "Lipsticks and lip gloss");
        leaf(makeup, "Nails", "Nail polish and tools");

        var fragrance = child(beauty, "Fragrance", "Perfumes and body sprays");
        leaf(fragrance, "Perfumes", "Men's and women's perfumes");
        leaf(fragrance, "Body Sprays & Mists", "Body sprays");
        leaf(fragrance, "Deodorants", "Deodorants and antiperspirants");


        // ═══════════════ WORKOUT ═══════════════
        var workout = top("Workout", "Fitness gear, sportswear, and equipment");
        var gym = child(workout, "Gym Equipment", "Weights and gym equipment");
        leaf(gym, "Dumbbells & Barbells", "Free weights");
        leaf(gym, "Yoga & Pilates", "Mats, blocks, straps");
        leaf(gym, "Cardio Machines", "Treadmills, bikes");
        leaf(gym, "Resistance Bands", "Bands and tubing");

        var sportswear = child(workout, "Sportswear", "Activewear and athletic clothing");
        leaf(sportswear, "Shoes", "Running and training shoes");
        leaf(sportswear, "Clothing", "Jerseys, shorts, leggings");
        leaf(sportswear, "Sports Bras", "Sports bras");

        var nutrition = child(workout, "Sports Nutrition", "Supplements and nutrition");
        leaf(nutrition, "Protein", "Whey and plant protein");
        leaf(nutrition, "Pre-Workout", "Energy and focus supplements");
        leaf(nutrition, "Vitamins", "Vitamins and minerals");

        var outdoor = child(workout, "Outdoor & Sports", "Outdoor activities and sports");
        leaf(outdoor, "Football", "Balls, boots, jerseys");
        leaf(outdoor, "Basketball", "Balls and accessories");
        leaf(outdoor, "Tennis", "Rackets and balls");
        leaf(outdoor, "Camping & Hiking", "Tents, packs, gear");


        // ═══════════════ FOODS ═══════════════
        var foods = top("Foods", "Groceries, snacks, drinks, and packaged foods");
        var groceries = child(foods, "Groceries", "Everyday groceries");
        leaf(groceries, "Rice & Grains", "Rice, beans, and grains");
        leaf(groceries, "Oils & Spices", "Cooking oils and spices");
        leaf(groceries, "Flour & Baking", "Flour and baking items");
        leaf(groceries, "Canned & Packaged", "Canned goods and packaged food");

        var snacks = child(foods, "Snacks", "Snacks and treats");
        leaf(snacks, "Biscuits & Cookies", "Biscuits and cookies");
        leaf(snacks, "Chips & Crisps", "Chips and crisps");
        leaf(snacks, "Chocolates & Sweets", "Chocolates and candy");
        leaf(snacks, "Nuts & Dried Fruits", "Nuts and dried fruit");

        var drinks = child(foods, "Drinks & Beverages", "Everyday beverages");
        leaf(drinks, "Soft Drinks", "Sodas and juices");
        leaf(drinks, "Water", "Bottled and sparkling water");
        leaf(drinks, "Tea & Coffee", "Tea, coffee, and hot drinks");
        leaf(drinks, "Alcoholic Drinks", "Beer, wine, spirits");

        var frozen = child(foods, "Frozen & Fresh", "Frozen and refrigerated foods");
        leaf(frozen, "Frozen Meals", "Frozen ready meals");
        leaf(frozen, "Frozen Meats & Fish", "Meats and seafood");
        leaf(frozen, "Dairy & Eggs", "Milk, cheese, eggs");
    }

    // ─────────────────── helpers ───────────────────

    private Category top(String name, String description) {
        String slug = SlugUtil.slugify(name);
        return categoryRepository.findBySlug(slug).orElseGet(() -> {
            Category c = Category.builder()
                    .name(name).slug(slug).description(description).active(true).build();
            Category saved = categoryRepository.save(c);
            log.info("Seeded top: {}", name);
            return saved;
        });
    }

    private Category child(Category parent, String name, String description) {
        String slug = SlugUtil.slugify(parent.getSlug() + "-" + name);
        return categoryRepository.findBySlug(slug).orElseGet(() -> {
            Category c = Category.builder()
                    .name(name).slug(slug).description(description).active(true)
                    .parent(parent).build();
            Category saved = categoryRepository.save(c);
            log.info("  Sub: {} → {}", parent.getName(), name);
            return saved;
        });
    }

    private Category leaf(Category parent, String name, String description) {
        String slug = SlugUtil.slugify(parent.getSlug() + "-" + name);
        return categoryRepository.findBySlug(slug).orElseGet(() -> {
            Category c = Category.builder()
                    .name(name).slug(slug).description(description).active(true)
                    .parent(parent).build();
            Category saved = categoryRepository.save(c);
            log.info("    Leaf: {} → {}", parent.getName(), name);
            return saved;
        });
    }
}