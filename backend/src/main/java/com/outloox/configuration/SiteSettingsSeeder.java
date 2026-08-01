package com.outloox.configuration;

import com.outloox.service.SiteSettingService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class SiteSettingsSeeder implements CommandLineRunner {

    private final SiteSettingService siteSettingService;

    public SiteSettingsSeeder(SiteSettingService siteSettingService) {
        this.siteSettingService = siteSettingService;
    }

    @Override
    public void run(String... args) {
        siteSettingService.seedDefaultsIfMissing();
    }
}
