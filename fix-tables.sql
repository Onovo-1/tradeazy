CREATE TABLE products (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(15,2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  `condition` VARCHAR(20) NOT NULL,
  location VARCHAR(120) NOT NULL,
  discount_percent INT DEFAULT 0,
  specifications TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  view_count BIGINT NOT NULL DEFAULT 0,
  favorite_count BIGINT NOT NULL DEFAULT 0,
  seller_id BIGINT NOT NULL,
  category_id BIGINT NOT NULL,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL
);

CREATE TABLE product_images (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  url VARCHAR(500) NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_primary BIT(1) NOT NULL DEFAULT 0,
  product_id BIGINT NOT NULL,
  created_at DATETIME(6) NOT NULL
);