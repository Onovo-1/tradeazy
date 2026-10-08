package com.tradeazy.dto.response;

import lombok.*;

import java.time.OffsetDateTime;

/**
 * A conversation summary as shown in the chat sidebar.
 * Includes a small "peer" object for whoever is NOT the current user.
 */
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

    // Peer (buyer or seller, depending on who's viewing)
    private Long peerId;
    private String peerUsername;
    private String peerFirstName;
    private String peerLastName;
    private String peerProfilePictureUrl;

    // Roles from the current user's perspective
    private String role; // "BUYER" if current user is the buyer, "SELLER" otherwise

    // Message preview
    private String lastMessagePreview;
    private OffsetDateTime lastMessageAt;

    private long unreadCount;
    private OffsetDateTime createdAt;
}