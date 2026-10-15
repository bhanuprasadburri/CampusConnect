package com.campusconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeeRecordDto {
    private String id;
    private String category;
    private BigDecimal amount;
    private LocalDate dueDate;
    private String status; // PAID, DUE, OVERDUE
    private String receiptNo;
    private LocalDateTime paidAt;
}
