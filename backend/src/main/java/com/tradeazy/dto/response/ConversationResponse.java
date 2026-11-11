package com.tradeazy.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationResponse {

    private Long id;

    // Product context
    private Long productId;
    private String productName;
    private String productImageUrl;
    private BigDecimal productPrice; // <--- Added this

    // Peer (buyer or seller, depending on who's viewing)
    private Long peerId;
    private String peerUsername;
    private String peerFirstName;
    private String peerLastName;
    private String peerProfilePictureUrl;

    // Roles from the current user's perspective
    private String role; 

    // Message preview
    private String lastMessagePreview;
    private OffsetDateTime lastMessageAt;

    private long unreadCount;
    private OffsetDateTime createdAt;
}