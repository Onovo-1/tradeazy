package com.tradeazy.controller;

import com.tradeazy.dto.response.PagedResponse;
import com.tradeazy.dto.response.ProductSummaryResponse;
import com.tradeazy.security.SecurityUtils;
import com.tradeazy.service.FavoriteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Favorites REST API.
 *
 * All endpoints require authentication.
 * The current user is derived from the JWT — never from the request body.
 */
@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
@Tag(name = "Favorites", description = "Buyer's saved products")
public class FavoriteController {

    private final FavoriteService favoriteService;

    // ------------------------------------------------------------
    // POST /api/favorites/{productId}
    // ------------------------------------------------------------
    @PostMapping("/{productId}")
    @Operation(summary = "Save a product to favorites")
    public ResponseEntity<Void> add(@PathVariable Long productId) {
        Long userId = SecurityUtils.getCurrentUserId();
        favoriteService.addFavorite(userId, productId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    // ------------------------------------------------------------
    // DELETE /api/favorites/{productId}
    // ------------------------------------------------------------
    @DeleteMapping("/{productId}")
    @Operation(summary = "Remove a product from favorites")
    public ResponseEntity<Void> remove(@PathVariable Long productId) {
        Long userId = SecurityUtils.getCurrentUserId();
        favoriteService.removeFavorite(userId, productId);
        return ResponseEntity.noContent().build();
    }

    // ------------------------------------------------------------
    // GET /api/favorites
    // ------------------------------------------------------------
    @GetMapping
    @Operation(summary = "List the current user's saved products")
    public ResponseEntity<PagedResponse<ProductSummaryResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(favoriteService.listUserFavorites(userId, page, size));
    }

    // ------------------------------------------------------------
    // GET /api/favorites/check/{productId}
    // ------------------------------------------------------------
    @GetMapping("/check/{productId}")
    @Operation(summary = "Check whether a product is favorited by the current user")
    public ResponseEntity<Map<String, Boolean>> check(@PathVariable Long productId) {
        Long userId = SecurityUtils.getCurrentUserId();
        boolean favorited = favoriteService.isFavorited(userId, productId);
        return ResponseEntity.ok(Map.of("favorited", favorited));
    }

    // ------------------------------------------------------------
    // GET /api/favorites/count
    // ------------------------------------------------------------
    @GetMapping("/count")
    @Operation(summary = "Count the current user's favorites")
    public ResponseEntity<Map<String, Long>> count() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(Map.of("count", favoriteService.countByUser(userId)));
    }
}