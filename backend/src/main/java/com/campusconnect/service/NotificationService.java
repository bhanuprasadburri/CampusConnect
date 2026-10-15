package com.campusconnect.service;

import com.campusconnect.dto.NotificationDto;
import com.campusconnect.exception.ResourceNotFoundException;
import com.campusconnect.model.Notification;
import com.campusconnect.model.User;
import com.campusconnect.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public List<NotificationDto> getUserNotifications(User user) {
        List<Notification> list = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        return list.stream().map(n -> NotificationDto.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .category(n.getCategory())
                .isRead(n.getIsRead())
                .actionUrl(n.getActionUrl())
                .createdAt(n.getCreatedAt())
                .timeAgo("Recent")
                .build()).collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(User user, String notificationId) {
        Notification notif = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + notificationId));
        if (notif.getUser().getId().equals(user.getId())) {
            notif.setIsRead(true);
            notificationRepository.save(notif);
        }
    }

    @Transactional
    public void markAllAsRead(User user) {
        List<Notification> list = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        list.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(list);
    }
}
