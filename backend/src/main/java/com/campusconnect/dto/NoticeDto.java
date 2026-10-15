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
public class NoticeDto {
    private String id;
    private String title;
    private String content;
    private String category;
    private String priority;
    private LocalDateTime publishedAt;
    private String formattedDate;
}
