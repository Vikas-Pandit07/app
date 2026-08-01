package com.outloox.dto;

import jakarta.validation.constraints.NotNull;

import java.util.Map;

public class UpdateSiteSettingsRequest {

    @NotNull(message = "settings map is required")
    private Map<String, String> settings;

    public Map<String, String> getSettings() {
        return settings;
    }

    public void setSettings(Map<String, String> settings) {
        this.settings = settings;
    }
}
