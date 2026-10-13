package com.tradeazy.controller;

import com.tradeazy.dto.response.AdminDashboardResponse;
import com.tradeazy.dto.response.PagedResponse;
import com.tradeazy.dto.response.ProductSummaryResponse;
import com.tradeazy.dto.response.UserResponse;
import com.tradeazy.entity.enums.ProductStatus;
import com.tradeazy.entity.enums.UserStatus;
import com.tradeazy.security.SecurityUtils;
import com.tradeazy.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Admin dashboard, user and product moderation")
public class AdminController {

    private final AdminService adminService;

    // ------------------------------------------------------------
    // Dashboard
    // ------------------------------------------------------------
    @GetMapping("/dashboard")
    @Operation(summary = "Get platform-wide statistics")
    public ResponseEntity<AdminDashboardResponse> dashboard() {
        return ResponseEntity.ok(adminService.dashboard());
    }

    // ------------------------------------------------------------
    // Users
    // ------------------------------------------------------------
    @GetMapping("/users")
    @Operation(summary = "List all users (searchable, paginated)")
    public ResponseEntity<PagedResponse<UserResponse>> listUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(adminService.listUsers(search, status, page, size));
    }

    @PatchMapping("/users/{id}/suspend")
    @Operation(summary = "Suspend a user")
    public ResponseEntity<UserResponse> suspendUser(@PathVariable Long id) {
        Long adminId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(adminService.setUserStatus(id, UserStatus.SUSPENDED, adminId));
    }

    @PatchMapping("/users/{id}/activate")
    @Operation(summary = "Activate a user")
    public ResponseEntity<UserResponse> activateUser(@PathVariable Long id) {
        Long adminId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(adminService.setUserStatus(id, UserStatus.ACTIVE, adminId));
    }

    // ------------------------------------------------------------
    // Products
    // ------------------------------------------------------------
    @GetMapping("/products")
    @Operation(summary = "List all products (paginated)")
    public ResponseEntity<PagedResponse<ProductSummaryResponse>> listProducts(
            @RequestParam(required = false) ProductStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(adminService.listProducts(status, page, size));
    }

    @DeleteMapping("/products/{id}")
    @Operation(summary = "Remove a product from the marketplace")
    public ResponseEntity<Void> removeProduct(@PathVariable Long id) {
        Long adminId = SecurityUtils.getCurrentUserId();
        adminService.removeProduct(id, adminId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/products/{id}/restore")
    @Operation(summary = "Restore a removed product")
    public ResponseEntity<Void> restoreProduct(@PathVariable Long id) {
        Long adminId = SecurityUtils.getCurrentUserId();
        adminService.restoreProduct(id, adminId);
        return ResponseEntity.noContent().build();
    }
}