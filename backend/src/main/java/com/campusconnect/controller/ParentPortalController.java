package com.campusconnect.controller;

import com.campusconnect.dto.ApiResponse;
import com.campusconnect.dto.ParentWardOverviewDto;
import com.campusconnect.dto.StudentProfileDto;
import com.campusconnect.model.User;
import com.campusconnect.service.AuthService;
import com.campusconnect.service.ParentPortalService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/parent")
@RequiredArgsConstructor
@Tag(name = "Parent Portal", description = "Read-only parent access to linked student records")
public class ParentPortalController {
    private final AuthService authService;
    private final ParentPortalService parentPortalService;

    @GetMapping("/wards")
    public ResponseEntity<ApiResponse<List<StudentProfileDto>>> getLinkedWards(
            @AuthenticationPrincipal String username) {
        User parent = authService.getAuthenticatedUser(username);
        return ResponseEntity.ok(ApiResponse.ok(parentPortalService.getWards(parent)));
    }

    @GetMapping("/wards/{wardId}/overview")
    public ResponseEntity<ApiResponse<ParentWardOverviewDto>> getWardOverview(
            @AuthenticationPrincipal String username,
            @PathVariable String wardId) {
        User parent = authService.getAuthenticatedUser(username);
        return ResponseEntity.ok(ApiResponse.ok(parentPortalService.getWardOverview(parent, wardId)));
    }
}
