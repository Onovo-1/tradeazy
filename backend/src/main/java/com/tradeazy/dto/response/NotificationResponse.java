package com.tradeazy.dto.response;

import lombok.*;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {

    private Long id;
    private String type;
    private String title;
    private String content;
    private Long referenceId;
    private String link;
    private Boolean read;
    private OffsetDateTime createdAt;
}