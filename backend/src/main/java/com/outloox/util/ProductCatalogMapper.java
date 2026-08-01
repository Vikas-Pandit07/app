package com.outloox.util;

import com.outloox.entity.Product;
import com.outloox.entity.enums.ProductStatus;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

public final class ProductCatalogMapper {

    private static final String DELIMITER = "|";

    private ProductCatalogMapper() {
    }

    public static String slugify(String value) {
        if (value == null || value.isBlank()) {
            return "product";
        }
        return value.toLowerCase(Locale.ROOT)
                .trim()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
    }

    public static String joinList(List<String> values) {
        if (values == null || values.isEmpty()) {
            return null;
        }
        return values.stream()
                .filter(v -> v != null && !v.isBlank())
                .map(String::trim)
                .collect(Collectors.joining(DELIMITER));
    }

    public static List<String> splitList(String value) {
        if (value == null || value.isBlank()) {
            return Collections.emptyList();
        }
        return Arrays.stream(value.split("\\|"))
                .map(String::trim)
                .filter(v -> !v.isBlank())
                .toList();
    }

    public static String normalizeBadge(String badge) {
        if (badge == null || badge.isBlank()) {
            return null;
        }
        return badge.trim().toLowerCase(Locale.ROOT);
    }

    public static void applyDerivedStatus(Product product) {
        if (product.getStatus() == ProductStatus.DISABLED) {
            return;
        }
        product.setStatus(product.getStock() > 0 ? ProductStatus.ACTIVE : ProductStatus.OUT_OF_STOCK);
    }

    public static BigDecimal nullablePrice(BigDecimal value) {
        return value == null || value.signum() <= 0 ? null : value;
    }
}
