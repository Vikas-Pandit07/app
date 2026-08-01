-- Create brands table and add brand_id to products
CREATE TABLE IF NOT EXISTS brands (
    brand_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    created_by BIGINT NULL,
    updated_by BIGINT NULL,
    deleted_at DATETIME NULL
);

-- Add nullable brand_id column to products and foreign key to brands
ALTER TABLE products
    ADD COLUMN brand_id INT NULL;

ALTER TABLE products
    ADD CONSTRAINT fk_products_brand FOREIGN KEY (brand_id) REFERENCES brands(brand_id);

CREATE INDEX idx_brands_name ON brands (name);
