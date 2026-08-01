package com.outloox.controller.admin;

import com.outloox.dto.UpdateSiteSettingsRequest;
import com.outloox.service.SiteSettingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/settings")
@PreAuthorize("hasRole('ADMIN')")
public class AdminSiteSettingController {

    private final SiteSettingService siteSettingService;

    public AdminSiteSettingController(SiteSettingService siteSettingService) {
        this.siteSettingService = siteSettingService;
    }

    @GetMapping
    public ResponseEntity<?> getAllSettings() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "settings", siteSettingService.getAllSettings()
        ));
    }

    @PutMapping
    public ResponseEntity<?> updateSettings(@Valid @RequestBody UpdateSiteSettingsRequest request) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "settings", siteSettingService.updateSettings(request.getSettings())
        ));
    }
}
