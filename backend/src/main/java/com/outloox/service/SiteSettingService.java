package com.outloox.service;

import com.outloox.dto.SiteSettingResponse;
import com.outloox.entity.SiteSetting;
import com.outloox.repository.SiteSettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class SiteSettingService {

    private final SiteSettingRepository siteSettingRepository;

    public SiteSettingService(SiteSettingRepository siteSettingRepository) {
        this.siteSettingRepository = siteSettingRepository;
    }

    public List<SiteSettingResponse> getAllSettings() {
        return siteSettingRepository.findAllByOrderBySettingKeyAsc()
                .stream()
                .map(setting -> new SiteSettingResponse(setting.getSettingKey(), setting.getSettingValue()))
                .toList();
    }

    public Map<String, String> getSettingsMap() {
        Map<String, String> result = new LinkedHashMap<>();
        for (SiteSetting setting : siteSettingRepository.findAllByOrderBySettingKeyAsc()) {
            result.put(setting.getSettingKey(), setting.getSettingValue());
        }
        return result;
    }

    @Transactional
    public List<SiteSettingResponse> updateSettings(Map<String, String> updates) {
        updates.forEach(this::upsertSetting);
        return getAllSettings();
    }

    @Transactional
    public void seedDefaultsIfMissing() {
        Map<String, String> defaults = Map.ofEntries(
                Map.entry("announcement_primary", "FREE SHIPPING ABOVE ₹999"),
                Map.entry("announcement_secondary", "EASY RETURNS"),
                Map.entry("announcement_tertiary", "SECURE PAYMENTS"),
                Map.entry("announcement_quaternary", "COD AVAILABLE"),
                Map.entry("hero_badge", "Premium Streetwear"),
                Map.entry("hero_title_line1", "Wear Your"),
                Map.entry("hero_title_line2", "Outlook."),
                Map.entry("hero_subtitle", "Premium streetwear and footwear designed for individuals who create their own path. Minimal branding, maximum impact."),
                Map.entry("footer_email", "hello@outloox.com"),
                Map.entry("footer_phone", "+91 12345 67890"),
                Map.entry("footer_city", "Mumbai, India")
        );
        defaults.forEach((key, value) -> {
            if (siteSettingRepository.findBySettingKey(key).isEmpty()) {
                upsertSetting(key, value);
            }
        });
    }

    private void upsertSetting(String key, String value) {
        SiteSetting setting = siteSettingRepository.findBySettingKey(key).orElseGet(SiteSetting::new);
        setting.setSettingKey(key);
        setting.setSettingValue(value == null ? "" : value.trim());
        siteSettingRepository.save(setting);
    }
}
