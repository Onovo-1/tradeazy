package com.tradeazy.service.impl;

import com.tradeazy.exception.FileValidationException;
import com.tradeazy.service.FileStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

/**
 * Development implementation: writes files to ./uploads/<subfolder>/.
 *
 * Files are served statically by WebMvcConfig at /uploads/**.
 * In production you'd swap in a Cloudinary/S3 implementation that
 * implements the same interface — no caller changes required.
 */
@Service
@Slf4j
public class LocalFileStorageService implements FileStorageService {

    /** Allowed image MIME types. Anything else is rejected. */
    private static final List<String> ALLOWED_CONTENT_TYPES = List.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    /** Allowed file extensions (defence-in-depth — even if MIME lies). */
    private static final List<String> ALLOWED_EXTENSIONS = List.of(
            "jpg", "jpeg", "png", "webp", "gif"
    );

/** 10 MB hard limit for a single file — matches Spring's multipart limit. */
private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    private final Path uploadRoot;

    public LocalFileStorageService(@Value("${tradeazy.upload.dir}") String uploadDir) {
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadRoot);
            log.info("LocalFileStorageService initialized at {}", this.uploadRoot);
        } catch (IOException e) {
            throw new IllegalStateException("Could not create upload directory: " + uploadRoot, e);
        }
    }

    @Override
    public String store(MultipartFile file, String subfolder) {
        validate(file);

        String extension = extractExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + "." + extension;

        // Ensure the subfolder path stays inside uploadRoot (no path traversal)
        Path targetDir = uploadRoot.resolve(subfolder).normalize();
        if (!targetDir.startsWith(uploadRoot)) {
            throw new FileValidationException("Invalid subfolder");
        }

        try {
            Files.createDirectories(targetDir);
            Path targetFile = targetDir.resolve(filename);
            Files.copy(file.getInputStream(), targetFile, StandardCopyOption.REPLACE_EXISTING);
            log.info("Stored file: {}", targetFile);

            // Public URL path (served by WebMvcConfig)
            return "/uploads/" + subfolder + "/" + filename;
        } catch (IOException e) {
            throw new IllegalStateException("Failed to store file", e);
        }
    }

    @Override
    public void delete(String url) {
        if (url == null || url.isBlank()) return;

        // Only handle files we manage (starting with /uploads/)
        final String prefix = "/uploads/";
        if (!url.startsWith(prefix)) {
            log.warn("Skipping delete — URL not managed by this service: {}", url);
            return;
        }

        String relative = url.substring(prefix.length());
        Path target = uploadRoot.resolve(relative).normalize();
        if (!target.startsWith(uploadRoot)) {
            log.warn("Skipping delete — path escapes upload root: {}", url);
            return;
        }

        try {
            boolean deleted = Files.deleteIfExists(target);
            log.info("Deleted file {}: {}", target, deleted);
        } catch (IOException e) {
            log.warn("Failed to delete file {}: {}", target, e.getMessage());
        }
    }

    // ----- Validation -----

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new FileValidationException("File is empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new FileValidationException(
                    "File exceeds the maximum size of " + (MAX_FILE_SIZE / (1024 * 1024)) + " MB"
            );
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new FileValidationException(
                    "Unsupported content type. Allowed: JPEG, PNG, WEBP, GIF"
            );
        }

        String ext = extractExtension(file.getOriginalFilename());
        if (ext.isBlank() || !ALLOWED_EXTENSIONS.contains(ext.toLowerCase())) {
            throw new FileValidationException(
                    "Unsupported file extension. Allowed: jpg, jpeg, png, webp, gif"
            );
        }
    }

    private String extractExtension(String filename) {
        if (filename == null) return "";
        int dot = filename.lastIndexOf('.');
        if (dot < 0 || dot == filename.length() - 1) return "";
        return filename.substring(dot + 1).toLowerCase();
    }
}