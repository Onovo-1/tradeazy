-- MySQL dump 10.13  Distrib 26.7.0, for macos27.0 (arm64)
--
-- Host: localhost    Database: tradeazy_db
-- ------------------------------------------------------
-- Server version	26.7.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--


--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `parent_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_categories_slug` (`slug`),
  KEY `idx_categories_parent` (`parent_id`),
  CONSTRAINT `FKsaok720gsu4u2wrgbk10b5n8d` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=153 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,_binary '','2026-11-13 01:03:07.665461','Clothing, shoes, bags, and accessories','Fashion','fashion','2026-11-13 01:03:07.665461',NULL),(2,_binary '','2026-11-13 01:03:07.669083','Clothing for men','Men\'s Clothing','fashion-men-s-clothing','2026-11-13 01:03:07.669083',1),(3,_binary '','2026-11-13 01:03:07.671240','Casual and formal shirts','Shirts','fashion-men-s-clothing-shirts','2026-11-13 01:03:07.671240',2),(4,_binary '','2026-11-13 01:03:07.672804','Pants, jeans, chinos','Trousers','fashion-men-s-clothing-trousers','2026-11-13 01:03:07.672804',2),(5,_binary '','2026-11-13 01:03:07.676140','Agbada, kaftans, senator','Traditional Wear','fashion-men-s-clothing-traditional-wear','2026-11-13 01:03:07.676140',2),(6,_binary '','2026-11-13 01:03:07.678273','Everyday tees and polos','T-Shirts & Polos','fashion-men-s-clothing-t-shirts-polos','2026-11-13 01:03:07.678273',2),(7,_binary '','2026-11-13 01:03:07.681475','Clothing for women','Women\'s Clothing','fashion-women-s-clothing','2026-11-13 01:03:07.681475',1),(8,_binary '','2026-11-13 01:03:07.697572','Casual, formal, and evening dresses','Dresses','fashion-women-s-clothing-dresses','2026-11-13 01:03:07.697572',7),(9,_binary '','2026-11-13 01:03:07.717097','Tops and blouses','Tops & Blouses','fashion-women-s-clothing-tops-blouses','2026-11-13 01:03:07.717097',7),(10,_binary '','2026-11-13 01:03:07.726939','Mini, midi, maxi skirts','Skirts','fashion-women-s-clothing-skirts','2026-11-13 01:03:07.726939',7),(11,_binary '','2026-11-13 01:03:07.730117','Ankara, gele, iro & buba','Traditional Wear','fashion-women-s-clothing-traditional-wear','2026-11-13 01:03:07.730117',7),(12,_binary '','2026-11-13 01:03:07.733205','Footwear for every occasion','Shoes','fashion-shoes','2026-11-13 01:03:07.733205',1),(13,_binary '','2026-11-13 01:03:07.735361','Formal, casual, sneakers','Men\'s Shoes','fashion-shoes-men-s-shoes','2026-11-13 01:03:07.735361',12),(14,_binary '','2026-11-13 01:03:07.737761','Heels, flats, sneakers','Women\'s Shoes','fashion-shoes-women-s-shoes','2026-11-13 01:03:07.737761',12),(15,_binary '','2026-11-13 01:03:07.740757','Children\'s footwear','Kids\' Shoes','fashion-shoes-kids-shoes','2026-11-13 01:03:07.740757',12),(16,_binary '','2026-11-13 01:03:07.744888','Open footwear','Sandals & Slippers','fashion-shoes-sandals-slippers','2026-11-13 01:03:07.744888',12),(17,_binary '','2026-11-13 01:03:07.747973','Bags, belts, and more','Bags & Accessories','fashion-bags-accessories','2026-11-13 01:03:07.747973',1),(18,_binary '','2026-11-13 01:03:07.750494','Women\'s handbags and purses','Handbags','fashion-bags-accessories-handbags','2026-11-13 01:03:07.750494',17),(19,_binary '','2026-11-13 01:03:07.752694','School and travel backpacks','Backpacks','fashion-bags-accessories-backpacks','2026-11-13 01:03:07.752694',17),(20,_binary '','2026-11-13 01:03:07.755830','Belts, wallets, cardholders','Belts & Wallets','fashion-bags-accessories-belts-wallets','2026-11-13 01:03:07.755830',17),(21,_binary '','2026-11-13 01:03:07.759942','Hats, caps, beanies','Hats & Caps','fashion-bags-accessories-hats-caps','2026-11-13 01:03:07.759942',17),(22,_binary '','2026-11-13 01:03:07.762899','Fine and fashion jewelry','Jewelry & Watches','fashion-jewelry-watches','2026-11-13 01:03:07.762899',1),(23,_binary '','2026-11-13 01:03:07.765740','Men\'s and women\'s watches','Watches','fashion-jewelry-watches-watches','2026-11-13 01:03:07.765740',22),(24,_binary '','2026-11-13 01:03:07.767686','Chains and pendants','Necklaces & Pendants','fashion-jewelry-watches-necklaces-pendants','2026-11-13 01:03:07.767686',22),(25,_binary '','2026-11-13 01:03:07.769382','Rings and earrings','Rings & Earrings','fashion-jewelry-watches-rings-earrings','2026-11-13 01:03:07.769382',22),(26,_binary '','2026-11-13 01:03:07.771264','Bracelets and bangles','Bracelets','fashion-jewelry-watches-bracelets','2026-11-13 01:03:07.771264',22),(27,_binary '','2026-11-13 01:03:07.773302','Phones, laptops, TVs, audio, and gadgets','Electronics','electronics','2026-11-13 01:03:07.773302',NULL),(28,_binary '','2026-11-13 01:03:07.776962','Smartphones and tablets','Phones & Tablets','electronics-phones-tablets','2026-11-13 01:03:07.776962',27),(29,_binary '','2026-11-13 01:03:07.779422','Android and iOS phones','Smartphones','electronics-phones-tablets-smartphones','2026-11-13 01:03:07.779422',28),(30,_binary '','2026-11-13 01:03:07.781579','iPads and Android tablets','Tablets','electronics-phones-tablets-tablets','2026-11-13 01:03:07.781579',28),(31,_binary '','2026-11-13 01:03:07.783048','Cases, chargers, cables','Phone Accessories','electronics-phones-tablets-phone-accessories','2026-11-13 01:03:07.783048',28),(32,_binary '','2026-11-13 01:03:07.784783','Portable and desktop computers','Laptops & Computers','electronics-laptops-computers','2026-11-13 01:03:07.784783',27),(33,_binary '','2026-11-13 01:03:07.786166','Everyday laptops','Laptops','electronics-laptops-computers-laptops','2026-11-13 01:03:07.786166',32),(34,_binary '','2026-11-13 01:03:07.787657','High-performance gaming laptops','Gaming Laptops','electronics-laptops-computers-gaming-laptops','2026-11-13 01:03:07.787657',32),(35,_binary '','2026-11-13 01:03:07.790005','Desktop PCs and monitors','Desktops & Monitors','electronics-laptops-computers-desktops-monitors','2026-11-13 01:03:07.790005',32),(36,_binary '','2026-11-13 01:03:07.791773','Keyboards, mice, hubs','Computer Accessories','electronics-laptops-computers-computer-accessories','2026-11-13 01:03:07.791773',32),(37,_binary '','2026-11-13 01:03:07.793233','Televisions and projectors','TVs & Displays','electronics-tvs-displays','2026-11-13 01:03:07.793233',27),(38,_binary '','2026-11-13 01:03:07.794520','Android and smart TVs','Smart TVs','electronics-tvs-displays-smart-tvs','2026-11-13 01:03:07.794520',37),(39,_binary '','2026-11-13 01:03:07.796350','Standard LED and OLED','LED & OLED TVs','electronics-tvs-displays-led-oled-tvs','2026-11-13 01:03:07.796350',37),(40,_binary '','2026-11-13 01:03:07.798228','Home and office projectors','Projectors','electronics-tvs-displays-projectors','2026-11-13 01:03:07.798228',37),(41,_binary '','2026-11-13 01:03:07.799653','Headphones, speakers, sound','Audio & Headphones','electronics-audio-headphones','2026-11-13 01:03:07.799653',27),(42,_binary '','2026-11-13 01:03:07.801136','Wireless and wired audio','Headphones & Earbuds','electronics-audio-headphones-headphones-earbuds','2026-11-13 01:03:07.801136',41),(43,_binary '','2026-11-13 01:03:07.802587','Portable and home speakers','Bluetooth Speakers','electronics-audio-headphones-bluetooth-speakers','2026-11-13 01:03:07.802587',41),(44,_binary '','2026-11-13 01:03:07.805193','Soundbars and surround','Home Theater','electronics-audio-headphones-home-theater','2026-11-13 01:03:07.805193',41),(45,_binary '','2026-11-13 01:03:07.807690','Studio and podcast mics','Microphones','electronics-audio-headphones-microphones','2026-11-13 01:03:07.807690',41),(46,_binary '','2026-11-13 01:03:07.809600','Cameras and gear','Cameras & Photography','electronics-cameras-photography','2026-11-13 01:03:07.809600',27),(47,_binary '','2026-11-13 01:03:07.811055','Professional DSLRs','DSLR Cameras','electronics-cameras-photography-dslr-cameras','2026-11-13 01:03:07.811055',46),(48,_binary '','2026-11-13 01:03:07.812925','Compact mirrorless','Mirrorless Cameras','electronics-cameras-photography-mirrorless-cameras','2026-11-13 01:03:07.812925',46),(49,_binary '','2026-11-13 01:03:07.814805','Lenses, tripods, bags','Camera Accessories','electronics-cameras-photography-camera-accessories','2026-11-13 01:03:07.814805',46),(50,_binary '','2026-11-13 01:03:07.816166','Consoles and gaming gear','Gaming','electronics-gaming','2026-11-13 01:03:07.816166',27),(51,_binary '','2026-11-13 01:03:07.817652','PlayStation, Xbox, Nintendo','Consoles','electronics-gaming-consoles','2026-11-13 01:03:07.817652',50),(52,_binary '','2026-11-13 01:03:07.819267','Games and controllers','Video Games','electronics-gaming-video-games','2026-11-13 01:03:07.819267',50),(53,_binary '','2026-11-13 01:03:07.820861','Headsets, chairs, pads','Gaming Accessories','electronics-gaming-gaming-accessories','2026-11-13 01:03:07.820861',50),(54,_binary '','2026-11-13 01:03:07.823987','Smart devices','Smart Home & Wearables','electronics-smart-home-wearables','2026-11-13 01:03:07.823987',27),(55,_binary '','2026-11-13 01:03:07.825448','Wearables','Smart Watches','electronics-smart-home-wearables-smart-watches','2026-11-13 01:03:07.825448',54),(56,_binary '','2026-11-13 01:03:07.826862','Smart lighting and plugs','Smart Bulbs & Plugs','electronics-smart-home-wearables-smart-bulbs-plugs','2026-11-13 01:03:07.826862',54),(57,_binary '','2026-11-13 01:03:07.828538','Home security cameras','Smart Cameras','electronics-smart-home-wearables-smart-cameras','2026-11-13 01:03:07.828538',54),(58,_binary '','2026-11-13 01:03:07.830387','Furniture, kitchenware, home appliances','Home, Furniture & Appliances','home-furniture-appliances','2026-11-13 01:03:07.830387',NULL),(59,_binary '','2026-11-13 01:03:07.831806','Indoor and outdoor furniture','Furniture','home-furniture-appliances-furniture','2026-11-13 01:03:07.831806',58),(60,_binary '','2026-11-13 01:03:07.833145','Living room seating','Sofas & Couches','home-furniture-appliances-furniture-sofas-couches','2026-11-13 01:03:07.833145',59),(61,_binary '','2026-11-13 01:03:07.834861','Beds, mattresses, headboards','Beds & Mattresses','home-furniture-appliances-furniture-beds-mattresses','2026-11-13 01:03:07.834861',59),(62,_binary '','2026-11-13 01:03:07.836310','Dining and coffee tables','Tables & Chairs','home-furniture-appliances-furniture-tables-chairs','2026-11-13 01:03:07.836310',59),(63,_binary '','2026-11-13 01:03:07.838383','Wardrobes, shelving, storage','Wardrobes & Storage','home-furniture-appliances-furniture-wardrobes-storage','2026-11-13 01:03:07.838383',59),(64,_binary '','2026-11-13 01:03:07.842702','Kitchenware and dining essentials','Kitchen & Dining','home-furniture-appliances-kitchen-dining','2026-11-13 01:03:07.842702',58),(65,_binary '','2026-11-13 01:03:07.846861','Pots, pans, and utensils','Cookware','home-furniture-appliances-kitchen-dining-cookware','2026-11-13 01:03:07.846861',64),(66,_binary '','2026-11-13 01:03:07.849694','Plates, cups, and cutlery','Tableware','home-furniture-appliances-kitchen-dining-tableware','2026-11-13 01:03:07.849694',64),(67,_binary '','2026-11-13 01:03:07.851246','Blenders, kettles, toasters','Small Appliances','home-furniture-appliances-kitchen-dining-small-appliances','2026-11-13 01:03:07.851246',64),(68,_binary '','2026-11-13 01:03:07.852806','Containers and organizers','Storage & Organization','home-furniture-appliances-kitchen-dining-storage-organization','2026-11-13 01:03:07.852806',64),(69,_binary '','2026-11-13 01:03:07.855252','Big home appliances','Home Appliances','home-furniture-appliances-home-appliances','2026-11-13 01:03:07.855252',58),(70,_binary '','2026-11-13 01:03:07.857106','Fridges and freezers','Refrigerators & Freezers','home-furniture-appliances-home-appliances-refrigerators-freezers','2026-11-13 01:03:07.857106',69),(71,_binary '','2026-11-13 01:03:07.858503','Laundry appliances','Washing Machines','home-furniture-appliances-home-appliances-washing-machines','2026-11-13 01:03:07.858503',69),(72,_binary '','2026-11-13 01:03:07.859696','Cooling','Air Conditioners & Fans','home-furniture-appliances-home-appliances-air-conditioners-fans','2026-11-13 01:03:07.859696',69),(73,_binary '','2026-11-13 01:03:07.861175','Power supply','Generators & Inverters','home-furniture-appliances-home-appliances-generators-inverters','2026-11-13 01:03:07.861175',69),(74,_binary '','2026-11-13 01:03:07.862881','Decor and soft furnishings','Home Décor & Textiles','home-furniture-appliances-home-decor-textiles','2026-11-13 01:03:07.862881',58),(75,_binary '','2026-11-13 01:03:07.864373','Sheets, duvets, pillows','Bedding & Linens','home-furniture-appliances-home-decor-textiles-bedding-linens','2026-11-13 01:03:07.864373',74),(76,_binary '','2026-11-13 01:03:07.865998','Window treatments','Curtains & Blinds','home-furniture-appliances-home-decor-textiles-curtains-blinds','2026-11-13 01:03:07.865998',74),(77,_binary '','2026-11-13 01:03:07.867444','Floor coverings','Rugs & Carpets','home-furniture-appliances-home-decor-textiles-rugs-carpets','2026-11-13 01:03:07.867444',74),(78,_binary '','2026-11-13 01:03:07.868704','Lamps and ceiling lights','Lighting','home-furniture-appliances-home-decor-textiles-lighting','2026-11-13 01:03:07.868704',74),(79,_binary '','2026-11-13 01:03:07.869908','Cars, motorcycles, spare parts, and accessories','Vehicles','vehicles','2026-11-13 01:03:07.869908',NULL),(80,_binary '','2026-11-13 01:03:07.871407','New and used cars','Cars','vehicles-cars','2026-11-13 01:03:07.871407',79),(81,_binary '','2026-11-13 01:03:07.874068','Sedan cars','Sedans','vehicles-cars-sedans','2026-11-13 01:03:07.874068',80),(82,_binary '','2026-11-13 01:03:07.876103','SUVs and 4x4s','SUVs & Jeeps','vehicles-cars-suvs-jeeps','2026-11-13 01:03:07.876103',80),(83,_binary '','2026-11-13 01:03:07.877433','Compact hatchbacks','Hatchbacks','vehicles-cars-hatchbacks','2026-11-13 01:03:07.877433',80),(84,_binary '','2026-11-13 01:03:07.878761','Pickups and utility vehicles','Pickup Trucks','vehicles-cars-pickup-trucks','2026-11-13 01:03:07.878761',80),(85,_binary '','2026-11-13 01:03:07.880072','Bikes and scooters','Motorcycles & Scooters','vehicles-motorcycles-scooters','2026-11-13 01:03:07.880072',79),(86,_binary '','2026-11-13 01:03:07.881464','Sport motorcycles','Sport Bikes','vehicles-motorcycles-scooters-sport-bikes','2026-11-13 01:03:07.881464',85),(87,_binary '','2026-11-13 01:03:07.882882','Scooters and mopeds','Scooters & Mopeds','vehicles-motorcycles-scooters-scooters-mopeds','2026-11-13 01:03:07.882882',85),(88,_binary '','2026-11-13 01:03:07.884135','Manual and electric bikes','Bicycles','vehicles-motorcycles-scooters-bicycles','2026-11-13 01:03:07.884135',85),(89,_binary '','2026-11-13 01:03:07.885276','Parts and add-ons','Vehicle Parts & Accessories','vehicles-vehicle-parts-accessories','2026-11-13 01:03:07.885276',79),(90,_binary '','2026-11-13 01:03:07.886649','Engine parts','Engine & Transmission','vehicles-vehicle-parts-accessories-engine-transmission','2026-11-13 01:03:07.886649',89),(91,_binary '','2026-11-13 01:03:07.888674','Tires, rims, and wheels','Tires & Wheels','vehicles-vehicle-parts-accessories-tires-wheels','2026-11-13 01:03:07.888674',89),(92,_binary '','2026-11-13 01:03:07.890350','Stereos, alarms, GPS','Car Electronics','vehicles-vehicle-parts-accessories-car-electronics','2026-11-13 01:03:07.890350',89),(93,_binary '','2026-11-13 01:03:07.891613','Covers, mats, kits','Interior & Exterior Accessories','vehicles-vehicle-parts-accessories-interior-exterior-accessories','2026-11-13 01:03:07.891613',89),(94,_binary '','2026-11-13 01:03:07.898981','Skincare, cosmetics, and personal care','Beauty & Personal Care','beauty-personal-care','2026-11-13 01:03:07.898981',NULL),(95,_binary '','2026-11-13 01:03:07.902257','Skin care products','Skincare','beauty-personal-care-skincare','2026-11-13 01:03:07.902257',94),(96,_binary '','2026-11-13 01:03:07.905673','Face washes and cleansers','Cleansers & Face Wash','beauty-personal-care-skincare-cleansers-face-wash','2026-11-13 01:03:07.905673',95),(97,_binary '','2026-11-13 01:03:07.907925','Creams and lotions','Moisturizers','beauty-personal-care-skincare-moisturizers','2026-11-13 01:03:07.907925',95),(98,_binary '','2026-11-13 01:03:07.909924','SPF products','Sunscreens','beauty-personal-care-skincare-sunscreens','2026-11-13 01:03:07.909924',95),(99,_binary '','2026-11-13 01:03:07.911746','Serums and treatments','Serums & Treatments','beauty-personal-care-skincare-serums-treatments','2026-11-13 01:03:07.911746',95),(100,_binary '','2026-11-13 01:03:07.913142','Hair products and tools','Hair Care','beauty-personal-care-hair-care','2026-11-13 01:03:07.913142',94),(101,_binary '','2026-11-13 01:03:07.915762','Wash and condition','Shampoo & Conditioner','beauty-personal-care-hair-care-shampoo-conditioner','2026-11-13 01:03:07.915762',100),(102,_binary '','2026-11-13 01:03:07.917936','Oils, serums, masks','Hair Treatments','beauty-personal-care-hair-care-hair-treatments','2026-11-13 01:03:07.917936',100),(103,_binary '','2026-11-13 01:03:07.923840','Wigs and extensions','Wigs & Extensions','beauty-personal-care-hair-care-wigs-extensions','2026-11-13 01:03:07.923840',100),(104,_binary '','2026-11-13 01:03:07.925929','Dryers, straighteners','Hair Styling Tools','beauty-personal-care-hair-care-hair-styling-tools','2026-11-13 01:03:07.925929',100),(105,_binary '','2026-11-13 01:03:07.927350','Cosmetics and makeup','Makeup & Cosmetics','beauty-personal-care-makeup-cosmetics','2026-11-13 01:03:07.927350',94),(106,_binary '','2026-11-13 01:03:07.929448','Foundation, powder, blush','Face','beauty-personal-care-makeup-cosmetics-face','2026-11-13 01:03:07.929448',105),(107,_binary '','2026-11-13 01:03:07.931507','Mascara, eyeliner, eyeshadow','Eyes','beauty-personal-care-makeup-cosmetics-eyes','2026-11-13 01:03:07.931507',105),(108,_binary '','2026-11-13 01:03:07.934870','Lipsticks and lip gloss','Lips','beauty-personal-care-makeup-cosmetics-lips','2026-11-13 01:03:07.934870',105),(109,_binary '','2026-11-13 01:03:07.936962','Nail polish and tools','Nails','beauty-personal-care-makeup-cosmetics-nails','2026-11-13 01:03:07.936962',105),(110,_binary '','2026-11-13 01:03:07.939499','Perfumes and body sprays','Fragrance','beauty-personal-care-fragrance','2026-11-13 01:03:07.939499',94),(111,_binary '','2026-11-13 01:03:07.941552','Men\'s and women\'s perfumes','Perfumes','beauty-personal-care-fragrance-perfumes','2026-11-13 01:03:07.941552',110),(112,_binary '','2026-11-13 01:03:07.942969','Body sprays','Body Sprays & Mists','beauty-personal-care-fragrance-body-sprays-mists','2026-11-13 01:03:07.942969',110),(113,_binary '','2026-11-13 01:03:07.944133','Deodorants and antiperspirants','Deodorants','beauty-personal-care-fragrance-deodorants','2026-11-13 01:03:07.944133',110),(114,_binary '','2026-11-13 01:03:07.945446','Fitness gear, sportswear, and equipment','Workout','workout','2026-11-13 01:03:07.945446',NULL),(115,_binary '','2026-11-13 01:03:07.947003','Weights and gym equipment','Gym Equipment','workout-gym-equipment','2026-11-13 01:03:07.947003',114),(116,_binary '','2026-11-13 01:03:07.948872','Free weights','Dumbbells & Barbells','workout-gym-equipment-dumbbells-barbells','2026-11-13 01:03:07.948872',115),(117,_binary '','2026-11-13 01:03:07.950120','Mats, blocks, straps','Yoga & Pilates','workout-gym-equipment-yoga-pilates','2026-11-13 01:03:07.950120',115),(118,_binary '','2026-11-13 01:03:07.952148','Treadmills, bikes','Cardio Machines','workout-gym-equipment-cardio-machines','2026-11-13 01:03:07.952148',115),(119,_binary '','2026-11-13 01:03:07.954518','Bands and tubing','Resistance Bands','workout-gym-equipment-resistance-bands','2026-11-13 01:03:07.954518',115),(120,_binary '','2026-11-13 01:03:07.956780','Activewear and athletic clothing','Sportswear','workout-sportswear','2026-11-13 01:03:07.956780',114),(121,_binary '','2026-11-13 01:03:07.958957','Running and training shoes','Shoes','workout-sportswear-shoes','2026-11-13 01:03:07.958957',120),(122,_binary '','2026-11-13 01:03:07.960481','Jerseys, shorts, leggings','Clothing','workout-sportswear-clothing','2026-11-13 01:03:07.960481',120),(123,_binary '','2026-11-13 01:03:07.961875','Sports bras','Sports Bras','workout-sportswear-sports-bras','2026-11-13 01:03:07.961875',120),(124,_binary '','2026-11-13 01:03:07.964311','Supplements and nutrition','Sports Nutrition','workout-sports-nutrition','2026-11-13 01:03:07.964311',114),(125,_binary '','2026-11-13 01:03:07.966500','Whey and plant protein','Protein','workout-sports-nutrition-protein','2026-11-13 01:03:07.966500',124),(126,_binary '','2026-11-13 01:03:07.967974','Energy and focus supplements','Pre-Workout','workout-sports-nutrition-pre-workout','2026-11-13 01:03:07.967974',124),(127,_binary '','2026-11-13 01:03:07.969332','Vitamins and minerals','Vitamins','workout-sports-nutrition-vitamins','2026-11-13 01:03:07.969332',124),(128,_binary '','2026-11-13 01:03:07.971367','Outdoor activities and sports','Outdoor & Sports','workout-outdoor-sports','2026-11-13 01:03:07.971367',114),(129,_binary '','2026-11-13 01:03:07.974146','Balls, boots, jerseys','Football','workout-outdoor-sports-football','2026-11-13 01:03:07.974146',128),(130,_binary '','2026-11-13 01:03:07.976416','Balls and accessories','Basketball','workout-outdoor-sports-basketball','2026-11-13 01:03:07.976416',128),(131,_binary '','2026-11-13 01:03:07.977847','Rackets and balls','Tennis','workout-outdoor-sports-tennis','2026-11-13 01:03:07.977847',128),(132,_binary '','2026-11-13 01:03:07.979077','Tents, packs, gear','Camping & Hiking','workout-outdoor-sports-camping-hiking','2026-11-13 01:03:07.979077',128),(133,_binary '','2026-11-13 01:03:07.980378','Groceries, snacks, drinks, and packaged foods','Foods','foods','2026-11-13 01:03:07.980378',NULL),(134,_binary '','2026-11-13 01:03:07.981548','Everyday groceries','Groceries','foods-groceries','2026-11-13 01:03:07.981548',133),(135,_binary '','2026-11-13 01:03:07.982858','Rice, beans, and grains','Rice & Grains','foods-groceries-rice-grains','2026-11-13 01:03:07.982858',134),(136,_binary '','2026-11-13 01:03:07.984086','Cooking oils and spices','Oils & Spices','foods-groceries-oils-spices','2026-11-13 01:03:07.984086',134),(137,_binary '','2026-11-13 01:03:07.985140','Flour and baking items','Flour & Baking','foods-groceries-flour-baking','2026-11-13 01:03:07.985140',134),(138,_binary '','2026-11-13 01:03:07.986225','Canned goods and packaged food','Canned & Packaged','foods-groceries-canned-packaged','2026-11-13 01:03:07.986225',134),(139,_binary '','2026-11-13 01:03:07.987400','Snacks and treats','Snacks','foods-snacks','2026-11-13 01:03:07.987400',133),(140,_binary '','2026-11-13 01:03:07.989490','Biscuits and cookies','Biscuits & Cookies','foods-snacks-biscuits-cookies','2026-11-13 01:03:07.989490',139),(141,_binary '','2026-11-13 01:03:07.990991','Chips and crisps','Chips & Crisps','foods-snacks-chips-crisps','2026-11-13 01:03:07.990991',139),(142,_binary '','2026-11-13 01:03:07.992232','Chocolates and candy','Chocolates & Sweets','foods-snacks-chocolates-sweets','2026-11-13 01:03:07.992232',139),(143,_binary '','2026-11-13 01:03:07.993416','Nuts and dried fruit','Nuts & Dried Fruits','foods-snacks-nuts-dried-fruits','2026-11-13 01:03:07.993416',139),(144,_binary '','2026-11-13 01:03:07.994945','Everyday beverages','Drinks & Beverages','foods-drinks-beverages','2026-11-13 01:03:07.994945',133),(145,_binary '','2026-11-13 01:03:07.996119','Sodas and juices','Soft Drinks','foods-drinks-beverages-soft-drinks','2026-11-13 01:03:07.996119',144),(146,_binary '','2026-11-13 01:03:07.997434','Bottled and sparkling water','Water','foods-drinks-beverages-water','2026-11-13 01:03:07.997434',144),(147,_binary '','2026-11-13 01:03:07.998576','Tea, coffee, and hot drinks','Tea & Coffee','foods-drinks-beverages-tea-coffee','2026-11-13 01:03:07.998576',144),(148,_binary '','2026-11-13 01:03:07.999781','Beer, wine, spirits','Alcoholic Drinks','foods-drinks-beverages-alcoholic-drinks','2026-11-13 01:03:07.999781',144),(149,_binary '','2026-11-13 01:03:08.001490','Frozen and refrigerated foods','Frozen & Fresh','foods-frozen-fresh','2026-11-13 01:03:08.001490',133),(150,_binary '','2026-11-13 01:03:08.002608','Frozen ready meals','Frozen Meals','foods-frozen-fresh-frozen-meals','2026-11-13 01:03:08.002608',149),(151,_binary '','2026-11-13 01:03:08.003819','Meats and seafood','Frozen Meats & Fish','foods-frozen-fresh-frozen-meats-fish','2026-11-13 01:03:08.003819',149),(152,_binary '','2026-11-13 01:03:08.005411','Milk, cheese, eggs','Dairy & Eggs','foods-frozen-fresh-dairy-eggs','2026-11-13 01:03:08.005411',149);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `last_message_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) NOT NULL,
  `buyer_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `seller_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_conversations_buyer_seller_product` (`buyer_id`,`seller_id`,`product_id`),
  KEY `idx_conversations_buyer` (`buyer_id`),
  KEY `idx_conversations_seller` (`seller_id`),
  KEY `idx_conversations_last_message` (`last_message_at`),
  KEY `FKqy0ufa6yoqyqsqkdfll9hp24a` (`product_id`),
  CONSTRAINT `FK11fycx5lvegp8mwplgsl8401h` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKgcmb2bq98wunnce1y9pyj9sp6` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKqy0ufa6yoqyqsqkdfll9hp24a` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
INSERT INTO `conversations` VALUES (1,'2026-11-13 01:33:11.482087',NULL,'2026-11-13 01:33:11.482087',5,1,4),(2,'2026-11-13 02:06:58.119833',NULL,'2026-11-13 02:06:58.119833',15,3,5),(3,'2026-11-13 02:07:05.534577',NULL,'2026-11-13 02:07:05.534577',15,12,11),(4,'2026-11-13 10:12:30.071325',NULL,'2026-11-13 10:12:30.071325',4,3,5),(5,'2026-11-13 11:04:41.917964','2026-11-13 11:04:47.126706','2026-11-13 11:04:47.136115',5,17,15),(6,'2026-11-13 11:56:02.047591','2026-11-13 11:56:43.496456','2026-11-13 11:56:43.501209',4,19,17);
/*!40000 ALTER TABLE `conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorites`
--

DROP TABLE IF EXISTS `favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorites` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `product_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_favorites_user_product` (`user_id`,`product_id`),
  KEY `idx_favorites_user` (`user_id`),
  KEY `idx_favorites_product` (`product_id`),
  CONSTRAINT `FK6sgu5npe8ug4o42bf9j71x20c` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `FKk7du8b8ewipawnnpg76d55fus` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorites`
--

LOCK TABLES `favorites` WRITE;
/*!40000 ALTER TABLE `favorites` DISABLE KEYS */;
INSERT INTO `favorites` VALUES (1,'2026-11-13 11:51:39.785192',1,5);
/*!40000 ALTER TABLE `favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `is_read` bit(1) NOT NULL,
  `conversation_id` bigint NOT NULL,
  `sender_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_messages_conversation` (`conversation_id`),
  KEY `idx_messages_created` (`conversation_id`,`created_at`),
  KEY `FK4ui4nnwntodh6wjvck53dbk9m` (`sender_id`),
  CONSTRAINT `FK4ui4nnwntodh6wjvck53dbk9m` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKt492th6wsovh1nush5yl5jj8e` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,'hi','2026-11-13 11:04:47.126706',_binary '\0',5,5),(2,'9017626971','2026-11-13 11:56:39.081695',_binary '\0',6,17),(3,'my aza','2026-11-13 11:56:43.496456',_binary '\0',6,17);
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `content` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(6) NOT NULL,
  `link` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `read` bit(1) NOT NULL,
  `reference_id` bigint DEFAULT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('NEW_MESSAGE','NEW_OFFER','OFFER_ACCEPTED','OFFER_COUNTERED','OFFER_REJECTED','ORDER_PLACED','ORDER_STATUS_CHANGED','PRODUCT_SOLD','RENT_EXPIRED','RENT_EXPIRING') COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_user` (`user_id`),
  KEY `idx_notifications_read` (`user_id`,`read`),
  KEY `idx_notifications_created` (`created_at`),
  CONSTRAINT `FK9y21adhxn0ayjhfocscqox7bh` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,'Lamine  offered ₦160000 for 2x 9pm AFNAN Perfume','2026-11-13 01:33:20.935473','/messages?c=1',_binary '\0',1,'New offer received','NEW_OFFER',4),(2,'Richmond offered ₦125000 for 1x Adidas F50 Lamine Yamal Elite Laceless Boots','2026-11-13 02:07:00.911347','/messages?c=2',_binary '\0',2,'New offer received','NEW_OFFER',5),(3,'Richmond offered ₦1200000 for 1x PS5 Console','2026-11-13 02:07:09.089179','/messages?c=3',_binary '\0',3,'New offer received','NEW_OFFER',11),(4,'Bruce offered ₦230000 for 2x Adidas F50 Lamine Yamal Elite Laceless Boots','2026-11-13 10:12:58.641010','/messages?c=4',_binary '\0',4,'New offer received','NEW_OFFER',5),(5,'Your offer of ₦230000.00 was accepted.','2026-11-13 10:13:18.568565','/messages?c=4',_binary '\0',4,'Offer accepted','OFFER_ACCEPTED',4),(6,'Lamine  wants to buy Samsung 55-Inch Class OLED S85H for 250000.00','2026-11-13 11:04:41.955180','/messages?c=5',_binary '\0',5,'Buy request received','NEW_OFFER',15),(7,'hi','2026-11-13 11:04:47.133026','/messages?c=5',_binary '\0',5,'New message from Lamine ','NEW_MESSAGE',15),(8,'Bruce offered ₦600000 for 2x iPhone 14','2026-11-13 11:56:13.964871','/messages?c=6',_binary '\0',6,'New offer received','NEW_OFFER',17),(9,'Your offer of ₦600000.00 was accepted.','2026-11-13 11:56:29.889884','/messages?c=6',_binary '\0',6,'Offer accepted','OFFER_ACCEPTED',4),(10,'9017626971','2026-11-13 11:56:39.086394','/messages?c=6',_binary '\0',6,'New message from Sasuke','NEW_MESSAGE',4),(11,'my aza','2026-11-13 11:56:43.499493','/messages?c=6',_binary '\0',6,'New message from Sasuke','NEW_MESSAGE',4);
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `offers`
--

DROP TABLE IF EXISTS `offers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `offers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(15,2) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `note` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int NOT NULL,
  `status` enum('ACCEPTED','COUNTERED','EXPIRED','PENDING','REJECTED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `buyer_id` bigint NOT NULL,
  `conversation_id` bigint NOT NULL,
  `parent_offer_id` bigint DEFAULT NULL,
  `product_id` bigint NOT NULL,
  `seller_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_offers_conversation` (`conversation_id`),
  KEY `idx_offers_buyer` (`buyer_id`),
  KEY `idx_offers_seller` (`seller_id`),
  KEY `idx_offers_status` (`status`),
  KEY `FKih0iyjcggquh38rd9uctlstoc` (`parent_offer_id`),
  KEY `FKjf1jh3h4v4m7diel8vvhmuqas` (`product_id`),
  CONSTRAINT `FK64dv88mu37r6tcmd4cgu5sve` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKgc18i3k5pqq7ik9x23nw0ndau` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKgnqvxde9byyufyr1d9x3brquh` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`),
  CONSTRAINT `FKih0iyjcggquh38rd9uctlstoc` FOREIGN KEY (`parent_offer_id`) REFERENCES `offers` (`id`),
  CONSTRAINT `FKjf1jh3h4v4m7diel8vvhmuqas` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `offers`
--

LOCK TABLES `offers` WRITE;
/*!40000 ALTER TABLE `offers` DISABLE KEYS */;
INSERT INTO `offers` VALUES (1,160000.00,'2026-11-13 01:33:20.924825','',2,'PENDING','2026-11-13 01:33:20.924825',5,1,NULL,1,4),(2,125000.00,'2026-11-13 02:07:00.903649','',1,'PENDING','2026-11-13 02:07:00.903649',15,2,NULL,3,5),(3,1200000.00,'2026-11-13 02:07:09.083739','',1,'PENDING','2026-11-13 02:07:09.083739',15,3,NULL,12,11),(4,230000.00,'2026-11-13 10:12:58.632800','',2,'ACCEPTED','2026-11-13 10:13:18.572410',4,4,NULL,3,5),(5,250000.00,'2026-11-13 11:04:41.949053','I want to buy this at full price.',1,'PENDING','2026-11-13 11:04:41.949053',5,5,NULL,17,15),(6,600000.00,'2026-11-13 11:56:13.958557','',2,'ACCEPTED','2026-11-13 11:56:29.892206',4,6,NULL,19,17);
/*!40000 ALTER TABLE `offers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `notes` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_reference` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_status` enum('FAILED','PAID','PENDING','UNPAID') COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `status` enum('CANCELLED','COMPLETED','CONFIRMED','PENDING','PROCESSING') COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_amount` decimal(15,2) NOT NULL,
  `unit_price` decimal(15,2) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `buyer_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `seller_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_orders_buyer` (`buyer_id`),
  KEY `idx_orders_seller` (`seller_id`),
  KEY `idx_orders_status` (`status`),
  KEY `idx_orders_created` (`created_at`),
  KEY `FKkp5k52qtiygd8jkag4hayd0qg` (`product_id`),
  CONSTRAINT `FKhtx3insd5ge6w486omk4fnk54` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKkp5k52qtiygd8jkag4hayd0qg` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `FKsb9w6305d2be0rwbtifi7wymp` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'2026-11-13 10:13:56.216014','From accepted offer #4','MOCK-8A0CC53B-0C9','PAID',2,'COMPLETED',230000.00,115000.00,'2026-11-13 10:14:58.561752',4,3,5),(2,'2026-11-13 11:05:12.035177','From accepted offer #4','MOCK-5EE4BA68-21C','PAID',2,'CONFIRMED',230000.00,115000.00,'2026-11-13 11:05:12.035177',4,3,5),(3,'2026-11-13 11:56:50.995496','From accepted offer #6','MOCK-57BF2576-30E','PAID',2,'COMPLETED',600000.00,300000.00,'2026-11-13 11:57:23.241861',4,19,17);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `display_order` int NOT NULL,
  `is_primary` bit(1) NOT NULL,
  `url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_product_images_product` (`product_id`),
  KEY `idx_product_images_primary` (`product_id`,`is_primary`),
  CONSTRAINT `FKqnq71xsohugpqwf3c9gxmsuy` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES (1,'2026-11-13 01:15:57.723595',0,_binary '','/uploads/products/6269ee13-d196-4747-aebf-58fef6586d83.jpeg',1),(2,'2026-11-13 01:15:57.743529',1,_binary '\0','/uploads/products/23d637d6-e4d5-4b3f-93a4-5f4fe183a1e7.jpeg',1),(3,'2026-11-13 01:21:49.317386',0,_binary '','/uploads/products/557fb1ec-50cf-44d6-ac4b-be099f14d29e.webp',2),(4,'2026-11-13 01:21:49.348117',1,_binary '\0','/uploads/products/9975dabd-444c-43a8-85de-1d64e840f4a1.jpeg',2),(5,'2026-11-13 01:25:18.966902',0,_binary '','/uploads/products/7892c21b-9b96-4767-918f-dfd046533ea9.webp',3),(6,'2026-11-13 01:27:21.108573',0,_binary '','/uploads/products/608584b3-1776-4190-9a47-06df1ba70d00.jpeg',4),(7,'2026-11-13 01:27:21.142206',1,_binary '\0','/uploads/products/3efe4e7e-cebb-4327-ba70-6c8854ef4727.jpeg',4),(8,'2026-11-13 01:28:56.006174',0,_binary '','/uploads/products/dc1e20a8-38d0-4b97-861c-4955964424b6.jpeg',5),(9,'2026-11-13 01:32:37.601132',0,_binary '','/uploads/products/ec6073a6-4333-49d3-b155-c3e9bf84b994.jpeg',6),(10,'2026-11-13 01:32:37.622220',1,_binary '\0','/uploads/products/bb176e4f-5b89-4a6e-b7de-97f3c39164d0.jpeg',6),(11,'2026-11-13 01:32:37.683134',2,_binary '\0','/uploads/products/537f39bf-560c-40f7-b458-e1d6ffa891ed.jpeg',6),(12,'2026-11-13 01:39:38.850150',0,_binary '','/uploads/products/29b89ed1-c510-4af3-9a24-480527a1b80f.jpeg',7),(13,'2026-11-13 01:39:38.869815',1,_binary '\0','/uploads/products/a43539fc-ce10-4d6b-9429-f387d7938ade.jpeg',7),(14,'2026-11-13 01:39:38.888556',2,_binary '\0','/uploads/products/8b33d27d-4ac5-4c1d-be81-7087b901d854.jpeg',7),(15,'2026-11-13 01:42:20.247308',0,_binary '','/uploads/products/c5490392-ae13-487d-aeff-9d16dcb4f095.jpeg',8),(16,'2026-11-13 01:42:20.261635',1,_binary '\0','/uploads/products/c3011e6f-50b7-4fd5-a08b-3467100ebd9e.jpeg',8),(17,'2026-11-13 01:42:20.274812',2,_binary '\0','/uploads/products/0f004ad1-09a3-42f9-9646-48962380c741.jpeg',8),(18,'2026-11-13 01:42:20.289837',3,_binary '\0','/uploads/products/b6121203-f800-4bed-9fa7-a9c6684731d7.jpeg',8),(19,'2026-11-13 01:46:07.026351',0,_binary '','/uploads/products/06dd5c0c-53fb-4ffb-8b83-7e55a9833977.jpg',9),(20,'2026-11-13 01:46:07.044100',1,_binary '\0','/uploads/products/361ae764-5c57-495c-816c-5c57badb3087.jpeg',9),(21,'2026-11-13 01:46:07.060125',2,_binary '\0','/uploads/products/ef123704-6ce5-4788-9fc3-3c99502a1465.jpeg',9),(22,'2026-11-13 01:46:07.074776',3,_binary '\0','/uploads/products/ebc35c4b-00af-41c0-a83d-edb1c963570d.jpg',9),(23,'2026-11-13 01:47:06.463158',0,_binary '','/uploads/products/9fb27f41-10dc-466f-b344-74eae6895208.webp',10),(24,'2026-11-13 01:47:06.480734',1,_binary '\0','/uploads/products/96341c81-92fd-4795-a9b4-5672fa9fac41.jpeg',10),(25,'2026-11-13 01:47:06.496475',2,_binary '\0','/uploads/products/c91e9836-4678-4cbc-8b53-2177890815af.jpeg',10),(26,'2026-11-13 01:51:21.990266',0,_binary '','/uploads/products/2f2f764d-e654-4df2-82d6-45805e1cfdd1.jpeg',11),(27,'2026-11-13 01:51:22.009152',1,_binary '\0','/uploads/products/8f7535a8-f497-4540-b8f5-05a3993609c3.jpeg',11),(28,'2026-11-13 01:51:22.026556',2,_binary '\0','/uploads/products/abc015ec-1cba-4820-8b27-ac9581804aba.jpeg',11),(29,'2026-11-13 01:53:06.336174',0,_binary '','/uploads/products/84276695-ede9-4812-9611-469422803c13.jpeg',12),(30,'2026-11-13 01:53:06.355443',1,_binary '\0','/uploads/products/0e565492-171a-4d9d-a368-6a4eea9fb53d.jpeg',12),(31,'2026-11-13 01:53:06.369245',2,_binary '\0','/uploads/products/ae971eda-acf3-4427-a657-657817f5e0a7.jpeg',12),(32,'2026-11-13 01:56:05.246628',0,_binary '','/uploads/products/43b12c70-99e9-45d6-a17b-ae0db00cc51b.png',13),(33,'2026-11-13 01:56:05.270393',1,_binary '\0','/uploads/products/ab30b6a3-ea79-4579-8b10-7d61d8f5fc05.png',13),(34,'2026-11-13 01:56:05.286765',2,_binary '\0','/uploads/products/d5b83990-71e0-49dc-88c2-cc37a41ce63d.png',13),(35,'2026-11-13 01:57:52.465715',0,_binary '','/uploads/products/6b95b795-f973-43c3-b332-b8ba14e29e96.jpeg',14),(36,'2026-11-13 01:57:52.484323',1,_binary '\0','/uploads/products/f399b25a-390a-4450-b49e-e3bff92c155c.jpeg',14),(37,'2026-11-13 01:57:52.497587',2,_binary '\0','/uploads/products/255a4655-934a-4228-bb79-f01b6345bbe0.jpeg',14),(38,'2026-11-13 02:00:43.506281',0,_binary '','/uploads/products/faf0a2a3-3f20-4806-a842-8c56bd47a588.jpeg',15),(39,'2026-11-13 02:00:43.526230',1,_binary '\0','/uploads/products/5018b779-95ec-4666-b1f5-789465f931db.jpeg',15),(40,'2026-11-13 02:00:43.550790',2,_binary '\0','/uploads/products/29fb5155-ef0a-4a37-a97b-b94035190db2.webp',15),(41,'2026-11-13 02:01:38.156642',0,_binary '','/uploads/products/aeb1890f-55e5-4ed7-b9dd-c23b4ed3c09f.jpeg',16),(42,'2026-11-13 02:01:38.184087',1,_binary '\0','/uploads/products/398c2a31-ada3-4736-95cf-74ee1cb11c5c.webp',16),(43,'2026-11-13 02:01:38.203774',2,_binary '\0','/uploads/products/226e4c4f-5164-4805-a328-af3777409d6e.png',16),(44,'2026-11-13 02:05:19.242951',0,_binary '','/uploads/products/12e7f797-3349-40e7-9688-1de3100efe59.webp',17),(45,'2026-11-13 02:06:47.739057',0,_binary '','/uploads/products/52a467c4-0df8-44d6-a083-213d8b1f7722.jpg',18),(46,'2026-11-13 02:06:47.757397',1,_binary '\0','/uploads/products/789b4bea-a479-4f55-a502-80d4503ac2af.jpeg',18),(47,'2026-11-13 02:06:47.776423',2,_binary '\0','/uploads/products/0c33c38f-81da-4697-a05e-6011afa891b8.jpeg',18),(48,'2026-11-13 11:55:18.784070',0,_binary '','/uploads/products/ef0cfc33-4ac6-4fb1-860b-bfacb04b85a1.jpeg',19),(49,'2026-11-13 11:55:18.810738',1,_binary '\0','/uploads/products/929d3766-23b0-480b-8a47-f3f82197d18b.jpeg',19),(50,'2026-11-13 11:55:18.833546',2,_binary '\0','/uploads/products/813f5728-273a-4a86-85ea-9c6dfa051a10.jpeg',19);
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `condition` enum('NEW','REFURBISHED','USED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `discount_percent` int DEFAULT NULL,
  `favorite_count` int NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(15,2) NOT NULL,
  `quantity` int NOT NULL,
  `sold_count` int NOT NULL,
  `specifications` text COLLATE utf8mb4_unicode_ci,
  `status` enum('ACTIVE','EXPIRED','REMOVED','SOLD') COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `view_count` int NOT NULL,
  `category_id` bigint NOT NULL,
  `seller_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKog2rp4qthbtt2lfyhfo32lsw9` (`category_id`),
  KEY `FKbgw3lyxhsml3kfqnfr45o0vbj` (`seller_id`),
  CONSTRAINT `FKbgw3lyxhsml3kfqnfr45o0vbj` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKog2rp4qthbtt2lfyhfo32lsw9` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'NEW','2026-11-13 01:15:57.680924','',0,1,'Lagos,Nigeria','9pm AFNAN Perfume',50000.00,10,0,'','ACTIVE','2026-11-13 08:02:33.844371',12,110,4),(2,'USED','2026-11-13 01:21:49.289475','The Alienware 16 Aurora is a powerful gaming laptop built for smooth, high-performance gaming and demanding tasks. It combines a large 16-inch display, powerful processors and graphics, and Alienware’s distinctive design, making it suitable for both gaming and creative work.',0,0,'Lagos,Nigeria','Alienware 16 Aurora ',1400000.00,12,0,'','ACTIVE','2026-11-13 01:21:49.289477',0,32,4),(3,'NEW','2026-11-13 01:25:18.892282','',0,0,'Lagos,Nigeria','Adidas F50 Lamine Yamal Elite Laceless Boots',125000.00,11,4,'','ACTIVE','2026-11-13 14:03:38.776160',23,120,5),(4,'NEW','2026-11-13 01:27:21.068181','',0,0,'Lagos,Nigeria','Adidas F50 Elite Lamine Yamal Heartbreaker',150000.00,20,0,'','REMOVED','2026-11-13 01:27:32.454888',0,120,5),(5,'NEW','2026-11-13 01:28:55.932192','',0,0,'Lagos,Nigeria','Adidas F50 Elite Lamine Yamal Heartbreaker',150000.00,20,0,'','REMOVED','2026-11-13 01:29:21.650687',4,120,5),(6,'NEW','2026-11-13 01:32:37.558067','',0,0,'Lagos,Nigeria','Adidas F50 Elite Lamine Yamal Heartbreaker',150000.00,1,0,'','ACTIVE','2026-11-13 08:04:43.565373',12,120,5),(7,'NEW','2026-11-13 01:39:38.821843','The 2021 Mercedes-AMG GLE 63 S Coupe is a high-performance luxury SUV that combines powerful performance with a sporty, coupe-inspired design. It offers a luxurious interior, advanced technology, and an impressive driving experience, making it ideal for those who want both comfort and performance.',0,0,'Lagos,Nigeria','Mercedes-AMG GLE 63 S Coupe 2021',65000000.00,6,0,'Colour; White, Black, Grey','ACTIVE','2026-11-13 01:39:46.218524',2,80,9),(8,'NEW','2026-11-13 01:42:20.218608','The Lexus LC 500 is a stunning luxury sports coupe that combines bold styling, a powerful V8 engine, and a refined interior. It delivers an exciting driving experience while offering the comfort, craftsmanship, and advanced technology expected from a premium grand tourer.',0,0,'Lagos,Nigeria','Lexus LC 500 ',150000000.00,4,0,'Colour; White, Red, Black','ACTIVE','2026-11-13 01:42:20.218610',0,80,9),(9,'NEW','2026-11-13 01:46:07.000319','The Apple iPhone Duo is Apple\'s first foldable smartphone, featuring a 7.6-inch OLED inner display and a compact 5.4-inch outer screen. Powered by the A20 Pro chip, it combines premium titanium construction, advanced cameras, and seamless multitasking in a sleek, innovative design',0,0,'Lagos,Nigeria',' iPhone Duo',4000000.00,12,0,'','ACTIVE','2026-11-13 08:04:45.381460',8,28,10),(10,'NEW','2026-11-13 01:47:06.440401','The iPhone 18 Pro Max is Apple\'s premium flagship smartphone, featuring a large immersive display, advanced camera system, powerful performance, and a sophisticated design. It is built to deliver an exceptional experience in photography, gaming, multitasking, and everyday use.',0,0,'Lagos,Nigeria','iPhone 18 Pro Max',3500000.00,12,0,'','ACTIVE','2026-11-13 01:47:06.440405',0,28,10),(11,'NEW','2026-11-13 01:51:21.968117','The MacBook Neo is an affordable and portable Apple laptop designed for everyday tasks, studying, and creative work. It features a 13-inch Liquid Retina display, the powerful A18 Pro chip, a durable aluminium design, and up to 16 hours of battery life.',0,0,'Lagos,Nigeria',' Macbook Neo',5200000.00,15,0,'','ACTIVE','2026-11-13 08:05:03.495740',4,32,11),(12,'REFURBISHED','2026-11-13 01:53:06.306672','',0,0,'Lagos,Nigeria','PS5 Console',1200000.00,20,0,'','ACTIVE','2026-11-13 07:54:29.901670',4,50,11),(13,'USED','2026-11-13 01:56:05.216436','The Logitech G502 X PLUS is a high-performance wireless gaming mouse designed for speed and precision. It features responsive LIGHTFORCE switches, customizable buttons, RGB lighting, and a comfortable ergonomic design, making it ideal for competitive gaming.',0,0,'Lagos,Nigeria',' Logitech G502 X PLUS',90000.00,14,0,'','ACTIVE','2026-11-13 07:54:40.573279',2,50,12),(14,'NEW','2026-11-13 01:57:52.439763','The Samsung Galaxy S26 is a sleek flagship smartphone featuring a vibrant 6.3-inch display, powerful performance, advanced AI features, and a versatile triple-camera system. It is designed to deliver a smooth and premium experience for everyday use, gaming, photography, and entertainment.',0,0,'Lagos,Nigeria','Samsung S26 Ultra',2800000.00,1,0,'','ACTIVE','2026-11-13 01:58:02.751857',2,28,12),(15,'NEW','2026-11-13 02:00:43.483043','The Louis Vuitton Petit Palais Bag in Monogram Empreinte is an elegant luxury handbag crafted from embossed leather with the iconic Monogram pattern. It combines a sophisticated design, spacious interior, and versatile carrying options, making it ideal for both everyday use and special occasions.',0,0,'Abuja, Nigeria','Louis Vuitton Petit Palais Bag Monogram Empreinte',25000000.00,5,0,'','ACTIVE','2026-11-13 02:00:43.483046',0,17,13),(16,'NEW','2026-11-13 02:01:38.123204','The Rolex Sky-Dweller is a luxurious and sophisticated watch designed for frequent travellers. It features dual time zones and an annual calendar, combining advanced functionality with Rolex’s iconic elegance and premium craftsmanship.',0,0,'Abuja, Nigeria','Rolex Sky-Dweller',185000000.00,4,0,'','ACTIVE','2026-11-13 08:04:55.458431',8,22,13),(17,'NEW','2026-11-13 02:05:19.209009','The Samsung 55-Inch Class OLED S85H is a premium 4K smart TV featuring stunning OLED picture quality, deep blacks, vibrant colours, and a smooth 120Hz refresh rate. It offers AI-powered picture enhancement, Dolby Atmos sound, and advanced gaming features for an immersive entertainment experience.',0,0,'Lagos,Nigeria','Samsung 55-Inch Class OLED S85H',250000.00,5,0,'','ACTIVE','2026-11-13 11:04:39.037671',2,37,15),(18,'NEW','2026-11-13 02:06:47.708878','',0,0,'Lagos,Nigeria','Nike Air Max 95',70000.00,25,0,'','ACTIVE','2026-11-13 02:06:47.708909',0,12,15),(19,'USED','2026-11-13 11:55:18.749678','',0,0,'Lagos,Nigeria','iPhone 14',400000.00,18,2,'','ACTIVE','2026-11-13 11:56:51.002382',6,28,17);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` enum('ADMIN','BUYER','SELLER') COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_roles_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (3,'ADMIN'),(1,'BUYER'),(2,'SELLER');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscriptions`
--

DROP TABLE IF EXISTS `subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscriptions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(15,2) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `expiry_date` datetime(6) NOT NULL,
  `payment_status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `plan` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` datetime(6) NOT NULL,
  `status` enum('ACTIVE','CANCELLED','EXPIRED','PENDING') COLLATE utf8mb4_unicode_ci NOT NULL,
  `transaction_reference` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` datetime(6) NOT NULL,
  `seller_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_subscriptions_seller` (`seller_id`),
  KEY `idx_subscriptions_status` (`status`),
  KEY `idx_subscriptions_expiry` (`expiry_date`),
  CONSTRAINT `FKteg7wclw8oqysklanekj5u1gm` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscriptions`
--

LOCK TABLES `subscriptions` WRITE;
/*!40000 ALTER TABLE `subscriptions` DISABLE KEYS */;
INSERT INTO `subscriptions` VALUES (1,13500.00,'2026-11-13 01:14:46.610116','2027-02-11 01:14:46.609755','PAID','QUARTERLY','2026-11-13 01:14:46.609755','ACTIVE','MOCK-C13C3E23-045','2026-11-13 01:14:46.610116',4),(2,50000.00,'2026-11-13 01:23:18.184218','2027-11-13 01:23:18.183828','PAID','YEARLY','2026-11-13 01:23:18.183828','ACTIVE','MOCK-0C4C9437-A0E','2026-11-13 01:23:18.184218',5),(3,5000.00,'2026-11-13 01:38:16.314708','2026-12-13 01:38:16.314558','PAID','MONTHLY','2026-11-13 01:38:16.314558','ACTIVE','MOCK-CDE4EFFD-F17','2026-11-13 01:38:16.314708',9),(4,50000.00,'2026-11-13 01:44:50.565928','2027-11-13 01:44:50.565684','PAID','YEARLY','2026-11-13 01:44:50.565684','ACTIVE','MOCK-26D3BAF8-D44','2026-11-13 01:44:50.565928',10),(5,13500.00,'2026-11-13 01:48:55.165674','2027-02-11 01:48:55.165363','PAID','QUARTERLY','2026-11-13 01:48:55.165363','ACTIVE','MOCK-3E51E866-549','2026-11-13 01:48:55.165674',11),(6,13500.00,'2026-11-13 01:55:11.684846','2027-02-11 01:55:11.684523','PAID','QUARTERLY','2026-11-13 01:55:11.684523','ACTIVE','MOCK-6B045AB0-479','2026-11-13 01:55:11.684846',12),(7,50000.00,'2026-11-13 01:59:49.797848','2027-11-13 01:59:49.797399','PAID','YEARLY','2026-11-13 01:59:49.797399','ACTIVE','MOCK-E72E002F-632','2026-11-13 01:59:49.797848',13),(8,5000.00,'2026-11-13 02:03:45.435539','2026-12-13 02:03:45.435235','PAID','MONTHLY','2026-11-13 02:03:45.435235','ACTIVE','MOCK-9B082667-C43','2026-11-13 02:03:45.435539',15),(9,50000.00,'2026-11-13 11:53:44.353142','2027-11-13 11:53:44.352181','PAID','YEARLY','2026-11-13 11:53:44.352181','ACTIVE','MOCK-07E66696-CE8','2026-11-13 11:53:44.353142',17);
/*!40000 ALTER TABLE `subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `user_id` bigint NOT NULL,
  `role_id` bigint NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `FKh8ciramu9cc9q3qcqiv4ue8a6` (`role_id`),
  CONSTRAINT `FKh8ciramu9cc9q3qcqiv4ue8a6` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  CONSTRAINT `FKhfh9dx7w3ubf1co1vdev94g3f` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (6,1),(7,1),(8,1),(14,1),(16,1),(2,2),(4,2),(5,2),(9,2),(10,2),(11,2),(12,2),(13,2),(15,2),(17,2),(1,3),(3,3);
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `profile_picture_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('ACTIVE','SUSPENDED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`),
  UNIQUE KEY `UKdu5v5sr43g5bfnji4vb8hg5s3` (`phone`),
  UNIQUE KEY `UKr43af9ap4edm43mmtq01oddj6` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'2026-11-13 01:03:07.639768','admin@tradeazy.test','Tradeazy','Admin',NULL,'$2a$10$SbNkBR1jMAbj8I0/yZ/09uQXwhICjKLQQ1IDgnLcUsDT9xm7MLK1G','+2348000000000',NULL,'ACTIVE','2026-11-13 01:03:07.639796','superadmin'),(2,'2026-11-13 02:09:21.000000','seller@test.com','Seller','One',NULL,'$2a$10$8.5rJ1bYwT.r4G9zN5V6.O8p8G5K5X5y5Z5W5V5U5T5S5R5Q5P5O5N','08011111111',NULL,'ACTIVE','2026-11-13 02:09:21.000000','seller1'),(3,'2026-11-13 02:09:21.000000','buyer@test.com','Buyer','One',NULL,'$2a$10$8.5rJ1bYwT.r4G9zN5V6.O8p8G5K5X5y5Z5W5V5U5T5S5R5Q5P5O5N','08022222222',NULL,'ACTIVE','2026-11-13 02:09:21.000000','buyer1'),(4,'2026-11-13 01:12:29.823559','brucewayne@gmail.com','Bruce','Wayne',NULL,'$2a$10$ZH8TrebBx9rNFrVlN3tKFObcFmtBl4r3XvnfsD77buckShgJUT0ca','+2349176253743',NULL,'ACTIVE','2026-11-13 01:12:29.823569','Batman'),(5,'2026-11-13 01:22:53.169158','lamineyaml@gmail.com','Lamine ','Yamal',NULL,'$2a$10$GNfMbt0Em.MfcbpXCLHCr.p7oVkOkHxwjHfvhfC8B5MEPz8jnXk3G','+2349154279812',NULL,'ACTIVE','2026-11-13 01:22:53.169161','LY10'),(6,'2026-11-13 01:34:12.535583','sarahmine@gmail.com','Sarah','Emine',NULL,'$2a$10$lhcsjdWidH9BO5AEtS8/UuBUSZq4RZ5NKYrQ30eyNNM3DyaUWfFv2','+2349078446785',NULL,'ACTIVE','2026-11-13 01:34:12.535587','Saramine'),(7,'2026-11-13 01:35:38.439305','sarahemine@gmail.com','Sarah','Emine',NULL,'$2a$10$eRzzl1TY1zJPhkpZ0IBxn.0nNNhxyM.Wc2FWGbWchP98Hs3uvTN6e','+2349078978790',NULL,'ACTIVE','2026-11-13 01:35:38.439310','SARAHMINE'),(8,'2026-11-13 01:36:54.446145','toxic@gmail.com','Toxic','Boy',NULL,'$2a$10$f3CIM8uMIUtYu87UbnOtc./spauFaOjkGi/JPh1nbwUV9g3.QAheu','+2348072186084',NULL,'ACTIVE','2026-11-13 01:36:54.446148','wydtt'),(9,'2026-11-13 01:37:53.702152','toxicboy@gmail.com','Toxic','Boy',NULL,'$2a$10$aMxQCSn6wGZRGyUSLBSg.uOP2sxAdJpNljPlJNNl0lK/JwTHGAvOm','+2348187907948',NULL,'ACTIVE','2026-11-13 01:37:53.702155','Wydtt1'),(10,'2026-11-13 01:43:41.322001','onovojunior15@gmail.com','Onovo ','Gp',NULL,'$2a$10$AQe6KqGOIXzmFkaV8ppFP.RkE7c0b.rzoRZRhIUirvgH3Eyx3l2de','+2349137922848',NULL,'ACTIVE','2026-11-13 01:43:41.322005','OG_Clips'),(11,'2026-11-13 01:48:34.549605','victorboss@gmail.com','Victor','Final ',NULL,'$2a$10$BqGvkQO3Fra0Mj4BrDYnkuXb9TU2unFH0a5t/Y922b6NKktj3PQie','+2349067724534',NULL,'ACTIVE','2026-11-13 01:48:34.549609','Final'),(12,'2026-11-13 01:54:48.914789','ademolalookman21@gmail.com','Ademola ','Lookman',NULL,'$2a$10$mW/iroql9bLPOSbhy0YOV.LwmRfMz2SCO2DB1QHWWcT6D00MNBSk2','+2349075769778',NULL,'ACTIVE','2026-11-13 01:54:48.914792','Ademola'),(13,'2026-11-13 01:59:21.289345','Nimi@gmail.com','Nimi','Ade',NULL,'$2a$10$SUNe8Jlw9WfCLv1qDVNNMeoW6FABPs4zPj1McSFk6JihIwtAtFSK6','+2349037290820',NULL,'ACTIVE','2026-11-13 01:59:21.289359','Nimi'),(14,'2026-11-13 02:02:49.588424','aaliyah@gmail.com','Aaliyah','Hani',NULL,'$2a$10$6wfgszYz1HUKdn3eIqt3vuZJwP3pOJlLBBesb9APyGmkfhjpj3AxK','+2347008908769',NULL,'ACTIVE','2026-11-13 02:02:49.588433','liyah'),(15,'2026-11-13 02:03:32.671849','richmond@gmail.com','Richmond','Stable',NULL,'$2a$10$9F/eVj0XS.o42vK3CrE77.jFAm6fujCCFPBwPAfwDXkv1RU27NJ2q','+2348098017872',NULL,'ACTIVE','2026-11-13 02:03:32.671854','Richy'),(16,'2026-11-13 08:11:17.528768','loveada@gmail.com','Love','Ada',NULL,'$2a$10$knUEGNrrVbwHZqwYCwfGCOn.AXqUAm/v3hPvoPO6mkBqP7ayKPbsK','+2349138926482',NULL,'ACTIVE','2026-11-13 08:11:17.528770','Loveher'),(17,'2026-11-13 11:53:17.714624','sasukewayne@gmail.com','Sasuke','George',NULL,'$2a$10$3KVaSlAJgz.igD3ROgOhmOkS.20cIPuujVKSfqDFLlfit8znbK4Bi','+2349173816897',NULL,'ACTIVE','2026-11-13 11:53:17.714627','Wayne7');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-13 15:35:26
