package com.tradeazy.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StartConversationRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;
}