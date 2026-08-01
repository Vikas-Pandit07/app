package com.outloox.controller;

import com.outloox.service.SiteSettingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/settings")
public class SiteSettingController {

    private final SiteSettingService siteSettingService;

    public SiteSettingController(SiteSettingService siteSettingService) {
        this.siteSettingService = siteSettingService;
    }

    @GetMapping
    public ResponseEntity<?> getSettings() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "settings", siteSettingService.getSettingsMap()
        ));
    }
}
