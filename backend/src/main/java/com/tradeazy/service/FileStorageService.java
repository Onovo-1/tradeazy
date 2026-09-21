package com.tradeazy.service;

import org.springframework.web.multipart.MultipartFile;

/**
 * Abstraction over "where files live."
 *
 * Today: LocalFileStorageService writes to disk.
 * Tomorrow: CloudinaryFileStorageService, S3FileStorageService, etc.
 *
 * ProductService depends only on this interface — swapping providers
 * requires zero changes to business logic.
 */
public interface FileStorageService {

    /**
     * Store an uploaded file and return a URL that can be served to clients.
     *
     * @param file      the uploaded file (already validated by the caller)
     * @param subfolder logical subfolder, e.g. "products", "avatars"
     * @return the public URL or relative path (e.g. "/uploads/products/abc.jpg")
     * @throws com.tradeazy.exception.FileValidationException on invalid file
     */
    String store(MultipartFile file, String subfolder);

    /**
     * Delete a previously stored file. No-op if the file doesn't exist.
     *
     * @param url the URL/path returned by store()
     */
    void delete(String url);
}