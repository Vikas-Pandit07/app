package com.outloox.entity.enums;

public enum LoyaltyTier {
    BRONZE(0, 0),
    SILVER(500, 5),
    GOLD(1500, 10),
    PLATINUM(5000, 15);

    private final int minPoints;
    private final int discountPercentage;

    LoyaltyTier(int minPoints, int discountPercentage) {
        this.minPoints = minPoints;
        this.discountPercentage = discountPercentage;
    }

    public int getMinPoints() { return minPoints; }
    public int getDiscountPercentage() { return discountPercentage; }
}