package com.campusconnect.service;

import com.campusconnect.dto.FeeRecordDto;
import com.campusconnect.model.FeeRecord;
import com.campusconnect.model.StudentProfile;
import com.campusconnect.repository.FeeRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeeService {

    private final FeeRecordRepository feeRecordRepository;

    @Transactional(readOnly = true)
    public List<FeeRecordDto> getFeeRecords(StudentProfile student) {
        List<FeeRecord> records = feeRecordRepository.findByStudentOrderByDueDateAsc(student);
        return records.stream().map(f -> FeeRecordDto.builder()
                .id(f.getId())
                .category(f.getCategory())
                .amount(f.getAmount())
                .dueDate(f.getDueDate())
                .status(f.getStatus())
                .receiptNo(f.getReceiptNo())
                .paidAt(f.getPaidAt())
                .build()).collect(Collectors.toList());
    }
}
