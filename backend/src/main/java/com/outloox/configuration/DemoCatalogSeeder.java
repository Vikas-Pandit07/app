package com.outloox.configuration;

import com.outloox.entity.Category;
import com.outloox.entity.Product;
import com.outloox.entity.ProductImage;
import com.outloox.entity.enums.ProductStatus;
import com.outloox.repository.CategoryRepository;
import com.outloox.repository.ProductImageRepository;
import com.outloox.repository.ProductRepository;
import com.outloox.util.ProductCatalogMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
@Profile("!prod")
public class DemoCatalogSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final CategoryRepository categoryRepository;
    private final boolean seedEnabled;

    public DemoCatalogSeeder(
            ProductRepository productRepository,
            ProductImageRepository productImageRepository,
            CategoryRepository categoryRepository,
            @Value("${app.seed.demo-catalog:true}") boolean seedEnabled
    ) {
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
        this.categoryRepository = categoryRepository;
        this.seedEnabled = seedEnabled;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedEnabled || productRepository.count() > 0) {
            return;
        }

        Map<String, Category> categories = Map.of(
                "men", upsertCategory("men", "Premium streetwear for men"),
                "women", upsertCategory("women", "Premium streetwear for women"),
                "sneakers", upsertCategory("sneakers", "Statement sneakers and performance footwear"),
                "accessories", upsertCategory("accessories", "Accessories that complete the fit")
        );

        seedProduct(categories.get("men"), "Oversized Black Tee", new BigDecimal("1299"), new BigDecimal("1699"), 100,
                "sale", 4.7, 128, List.of("Black", "White", "Grey", "Olive"), List.of("S", "M", "L", "XL", "XXL"),
                List.of("100% Premium Cotton", "240 GSM Heavyweight Fabric", "Drop Shoulder Fit", "Pre-shrunk"),
                "/products/oversized-black-tee.svg",
                "Premium 240 GSM cotton with a relaxed oversized fit. Minimal branding, maximum impact.");

        seedProduct(categories.get("men"), "Urban White Tee", new BigDecimal("1199"), new BigDecimal("1499"), 100,
                "sale", 4.6, 96, List.of("White", "Black", "Beige"), List.of("S", "M", "L", "XL", "XXL"),
                List.of("Soft-touch Cotton", "Reinforced Collar", "Regular Fit", "Tagless Comfort"),
                "/products/urban-white-tee.svg",
                "Crisp white essential tee with subtle OUTLOOX chest branding. Built for the daily grind.");

        seedProduct(categories.get("sneakers"), "OX Signature Sneaker", new BigDecimal("3499"), new BigDecimal("4499"), 60,
                "bestseller", 4.9, 215, List.of("Monochrome", "Black/White", "Grey"), List.of("UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"),
                List.of("Breathable Mesh Upper", "Cushioned Midsole", "Durable Rubber Outsole", "Reflective Details"),
                "/products/ox-signature-sneaker.svg",
                "Chunky silhouette with breathable mesh and premium overlays. Built to perform, designed to stand out.");

        seedProduct(categories.get("men"), "Essential Hoodie", new BigDecimal("2199"), new BigDecimal("2999"), 70,
                "sale", 4.8, 175, List.of("Black", "Grey", "Olive", "Brown"), List.of("S", "M", "L", "XL", "XXL"),
                List.of("Fleece-lined Interior", "Kangaroo Pocket", "Adjustable Hood", "Ribbed Cuffs"),
                "/products/essential-hoodie.svg",
                "Cozy fleece hoodie with kangaroo pocket and tonal embroidered logo. Your everyday armor.");

        seedProduct(categories.get("men"), "Cargo Pants", new BigDecimal("1899"), new BigDecimal("2499"), 80,
                "new", 4.5, 87, List.of("Black", "Khaki", "Olive"), List.of("28", "30", "32", "34", "36"),
                List.of("Cotton Twill Fabric", "Multiple Cargo Pockets", "Tapered Leg", "Adjustable Cuffs"),
                "/products/cargo-pants.svg",
                "Relaxed cargo pants with multiple pockets and a tapered leg. Utility meets street style.");

        seedProduct(categories.get("accessories"), "OX Cap", new BigDecimal("799"), new BigDecimal("999"), 120,
                "new", 4.6, 45, List.of("Black", "White", "Olive"), List.of("One Size"),
                List.of("6-Panel Construction", "Embroidered Logo", "Adjustable Strap", "Curved Brim"),
                "/products/ox-cap.svg",
                "Minimal 6-panel cap with embroidered OX logo. Adjustable strap for the perfect fit.");

        seedProduct(categories.get("women"), "Women's Oversized Tee", new BigDecimal("1099"), new BigDecimal("1399"), 90,
                "sale", 4.7, 62, List.of("Black", "White", "Lavender", "Sage"), List.of("XS", "S", "M", "L", "XL"),
                List.of("Soft Cotton Blend", "Relaxed Fit", "Cropped Hem", "Minimal Logo"),
                "/products/womens-oversized-tee.svg",
                "Relaxed oversized tee with a slightly cropped silhouette. Soft, breathable, and effortlessly cool.");

        seedProduct(categories.get("women"), "Cropped Hoodie", new BigDecimal("1799"), new BigDecimal("2299"), 75,
                "new", 4.8, 53, List.of("Black", "Grey", "Dusty Pink"), List.of("XS", "S", "M", "L", "XL"),
                List.of("Fleece Interior", "Cropped Fit", "Drawcord Hood", "Ribbed Hem"),
                "/products/womens-cropped-hoodie.svg",
                "Cropped fleece hoodie with drawcord and ribbed hem. Perfect for layering.");

        seedProduct(categories.get("men"), "Street Jacket", new BigDecimal("3299"), new BigDecimal("3999"), 40,
                "new", 4.7, 41, List.of("Black", "Olive", "Brown"), List.of("S", "M", "L", "XL", "XXL"),
                List.of("Water-resistant Shell", "Multiple Pockets", "Full Zip Front", "Adjustable Hood"),
                "/products/street-jacket.svg",
                "Utility-inspired street jacket with multiple pockets and a structured fit. Built for the elements.");

        seedProduct(categories.get("sneakers"), "Runner X Sneaker", new BigDecimal("2999"), new BigDecimal("3799"), 55,
                "sale", 4.6, 78, List.of("Black", "White", "Violet"), List.of("UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"),
                List.of("Lightweight Mesh", "Responsive Foam", "Flexible Outsole", "Padded Collar"),
                "/products/running-sneaker.svg",
                "Lightweight runner with responsive cushioning and breathable upper. For those who move fast.");

        seedProduct(categories.get("accessories"), "OUTLOOX Tote", new BigDecimal("599"), new BigDecimal("799"), 110,
                "sale", 4.5, 34, List.of("Black", "White"), List.of("One Size"),
                List.of("Heavy Canvas", "Reinforced Handles", "Inner Pocket", "Screen-printed Logo"),
                "/products/tote-bag.svg",
                "Heavy canvas tote with bold OUTLOOX print. Carry your essentials with attitude.");

        seedProduct(categories.get("women"), "Women's Cargo Pants", new BigDecimal("1699"), new BigDecimal("2199"), 70,
                "new", 4.6, 49, List.of("Black", "Beige", "Olive"), List.of("XS", "S", "M", "L", "XL"),
                List.of("High-waisted Fit", "Side Cargo Pockets", "Tapered Ankle", "Belt Loops"),
                "/products/womens-cargo-pants.svg",
                "High-waisted cargo pants with a relaxed fit and tapered ankle. Streetwear staple.");
    }

    private Category upsertCategory(String name, String description) {
        Optional<Category> existing = categoryRepository.findByCategoryName(name);
        if (existing.isPresent()) {
            return existing.get();
        }
        Category category = new Category();
        category.setCategoryName(name);
        category.setDescription(description);
        return categoryRepository.save(category);
    }

    private void seedProduct(
            Category category,
            String name,
            BigDecimal price,
            BigDecimal originalPrice,
            int stock,
            String badge,
            double rating,
            int reviews,
            List<String> colors,
            List<String> sizes,
            List<String> features,
            String imageUrl,
            String description
    ) {
        Product product = new Product();
        product.setCategory(category);
        product.setName(name);
        product.setSlug(ProductCatalogMapper.slugify(name));
        product.setDescription(description);
        product.setPrice(price);
        product.setOriginalPrice(originalPrice);
        product.setStock(stock);
        product.setBadge(badge);
        product.setRating(rating);
        product.setReviewCount(reviews);
        product.setColorsData(ProductCatalogMapper.joinList(colors));
        product.setSizesData(ProductCatalogMapper.joinList(sizes));
        product.setFeaturesData(ProductCatalogMapper.joinList(features));
        product.setStatus(stock > 0 ? ProductStatus.ACTIVE : ProductStatus.OUT_OF_STOCK);

        Product saved = productRepository.save(product);
        ProductImage image = new ProductImage();
        image.setProduct(saved);
        image.setImageUrl(imageUrl);
        image.setPrimaryImage(true);
        productImageRepository.save(image);
    }
}
