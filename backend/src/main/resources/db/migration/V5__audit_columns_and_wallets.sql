-- Add audit fields for BaseEntity subclasses and create wallets table

ALTER TABLE categories
    ADD COLUMN created_at DATETIME NULL,
    ADD COLUMN updated_at DATETIME NULL,
    ADD COLUMN created_by BIGINT NULL,
    ADD COLUMN updated_by BIGINT NULL,
    ADD COLUMN deleted_at DATETIME NULL;

UPDATE categories SET created_at = NOW(), updated_at = NOW() WHERE created_at IS NULL;

ALTER TABLE categories
    MODIFY COLUMN created_at DATETIME NOT NULL,
    MODIFY COLUMN updated_at DATETIME NOT NULL;

ALTER TABLE products
    ADD COLUMN created_at DATETIME NULL,
    ADD COLUMN updated_at DATETIME NULL,
    ADD COLUMN created_by BIGINT NULL,
    ADD COLUMN updated_by BIGINT NULL,
    ADD COLUMN deleted_at DATETIME NULL;

UPDATE products SET created_at = NOW(), updated_at = NOW() WHERE created_at IS NULL;

ALTER TABLE products
    MODIFY COLUMN created_at DATETIME NOT NULL,
    MODIFY COLUMN updated_at DATETIME NOT NULL;

CREATE TABLE IF NOT EXISTS wallets (
    wallet_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    balance DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_earned DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_spent DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    created_by BIGINT NULL,
    updated_by BIGINT NULL,
    deleted_at DATETIME NULL,
    CONSTRAINT fk_wallets_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_wallets_user_id ON wallets (user_id);
