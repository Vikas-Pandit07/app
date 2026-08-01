-- Add missing entity columns required by the current JPA model

ALTER TABLE categories
    ADD COLUMN image_url VARCHAR(500) NULL;

ALTER TABLE categories
    ADD COLUMN display_order INT NOT NULL DEFAULT 0;

ALTER TABLE categories
    ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE products
    ADD COLUMN short_description VARCHAR(500) NULL;

ALTER TABLE products
    ADD COLUMN view_count BIGINT NOT NULL DEFAULT 0;

ALTER TABLE products
    ADD COLUMN purchase_count BIGINT NOT NULL DEFAULT 0;

UPDATE products
    SET short_description = ''
    WHERE short_description IS NULL;

ALTER TABLE users
    ADD COLUMN first_name VARCHAR(100) NULL;

ALTER TABLE users
    ADD COLUMN last_name VARCHAR(100) NULL;

ALTER TABLE users
    ADD COLUMN phone VARCHAR(20) NULL;

ALTER TABLE users
    ADD COLUMN avatar_url VARCHAR(500) NULL;

ALTER TABLE users
    ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE users
    ADD COLUMN phone_verified BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE users
    ADD COLUMN last_login_at DATETIME NULL;

ALTER TABLE users
    ADD COLUMN last_login_ip VARCHAR(45) NULL;

ALTER TABLE users
    ADD COLUMN login_attempts INT NOT NULL DEFAULT 0;

ALTER TABLE users
    ADD COLUMN locked_until DATETIME NULL;

ALTER TABLE users
    ADD COLUMN created_by BIGINT NULL;

ALTER TABLE users
    ADD COLUMN updated_by BIGINT NULL;

ALTER TABLE users
    ADD COLUMN deleted_at DATETIME NULL;

UPDATE users
    SET email_verified = FALSE
    WHERE email_verified IS NULL;

UPDATE users
    SET phone_verified = FALSE
    WHERE phone_verified IS NULL;

UPDATE users
    SET login_attempts = 0
    WHERE login_attempts IS NULL;

ALTER TABLE orders
    ADD COLUMN order_number VARCHAR(50) NULL;

ALTER TABLE orders
    ADD COLUMN discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0;

ALTER TABLE orders
    ADD COLUMN coupon_code VARCHAR(50) NULL;

ALTER TABLE orders
    ADD COLUMN tracking_number VARCHAR(100) NULL;

ALTER TABLE orders
    ADD COLUMN shipping_partner VARCHAR(100) NULL;

ALTER TABLE orders
    ADD COLUMN delivered_at DATETIME NULL;

ALTER TABLE orders
    ADD COLUMN created_at DATETIME NULL;

ALTER TABLE orders
    ADD COLUMN updated_at DATETIME NULL;

ALTER TABLE orders
    ADD COLUMN created_by BIGINT NULL;

ALTER TABLE orders
    ADD COLUMN updated_by BIGINT NULL;

ALTER TABLE orders
    ADD COLUMN deleted_at DATETIME NULL;

UPDATE orders
    SET order_number = CONCAT('ORD-', order_id)
    WHERE order_number IS NULL;

UPDATE orders
    SET created_at = NOW(), updated_at = NOW()
    WHERE created_at IS NULL OR updated_at IS NULL;

ALTER TABLE orders
    MODIFY COLUMN order_number VARCHAR(50) NOT NULL;

ALTER TABLE orders
    ADD CONSTRAINT uk_orders_order_number UNIQUE (order_number);

CREATE TABLE IF NOT EXISTS product_variants (
    variant_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    sku VARCHAR(100) NULL,
    CONSTRAINT fk_product_variants_product FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(512) NOT NULL UNIQUE,
    device_info VARCHAR(255) NULL,
    ip_address VARCHAR(45) NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT uk_refresh_tokens_user UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS loyalty_points (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    points INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_loyalty_points_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT uk_loyalty_points_user UNIQUE (user_id)
);
