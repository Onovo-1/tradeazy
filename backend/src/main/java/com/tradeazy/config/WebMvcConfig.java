package com.tradeazy.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

/**
 * Serves uploaded files at /uploads/** as static resources.
 *
 * Example: a file at ./uploads/products/abc.jpg
 *          is served at  http://localhost:8080/uploads/products/abc.jpg
 *
 * In production with Cloudinary/S3, files would be served from the CDN
 * and this config could be removed.
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private final String uploadDir;

    public WebMvcConfig(@Value("${tradeazy.upload.dir}") String uploadDir) {
        this.uploadDir = uploadDir;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String absolutePath = Paths.get(uploadDir).toAbsolutePath().normalize().toString();
        String location = "file:" + absolutePath + "/";

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(location);

        System.out.println("Serving /uploads/** from " + location);
    }
}