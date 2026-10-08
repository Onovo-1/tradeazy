package com.tradeazy.dto.response;

import lombok.*;

/**
 * Small payload for the navbar unread badge.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatSummaryResponse {

    private long unreadConversations;
}