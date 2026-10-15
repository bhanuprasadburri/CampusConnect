package com.campusconnect.service;

import com.campusconnect.dto.NoticeDto;
import com.campusconnect.model.Notice;
import com.campusconnect.model.StudentProfile;
import com.campusconnect.repository.NoticeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NoticeService {

    private final NoticeRepository noticeRepository;

    @Transactional(readOnly = true)
    public List<NoticeDto> getTargetedNotices(StudentProfile student) {
        List<Notice> notices = noticeRepository.findTargetedNotices(
                student.getInstitutionId(), student.getDepartment(), student.getCurrentYear(), LocalDateTime.now());

        return notices.stream().map(n -> NoticeDto.builder()
                .id(n.getId())
                .title(n.getTitle())
                .content(n.getContent())
                .category(n.getCategory())
                .priority(n.getPriority())
                .publishedAt(n.getPublishedAt())
                .formattedDate(n.getPublishedAt().toLocalDate().toString())
                .build()).collect(Collectors.toList());
    }
}
