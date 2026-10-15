package com.campusconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private String id;
    private String title;
    private String message;
    private String category;
    private boolean isRead;
    private String actionUrl;
    private LocalDateTime createdAt;
    private String timeAgo;
}
