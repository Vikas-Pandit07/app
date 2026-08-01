CREATE TABLE IF NOT EXISTS site_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(120) NOT NULL UNIQUE,
    setting_value TEXT NULL,
    updated_at DATETIME NOT NULL
);

CREATE INDEX idx_site_settings_key ON site_settings (setting_key);
