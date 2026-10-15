package com.campusconnect.service;

import com.campusconnect.config.JwtTokenProvider;
import com.campusconnect.dto.AuthRequest;
import com.campusconnect.dto.AuthResponse;
import com.campusconnect.exception.UnauthorizedException;
import com.campusconnect.model.Institution;
import com.campusconnect.model.StudentProfile;
import com.campusconnect.model.User;
import com.campusconnect.model.Role;
import com.campusconnect.repository.InstitutionRepository;
import com.campusconnect.repository.StudentProfileRepository;
import com.campusconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final InstitutionRepository institutionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional(readOnly = true)
    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByUsernameOrEmail(request.getUsername(), request.getUsername())
                .orElseThrow(() -> new UnauthorizedException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid username or password");
        }

        StudentProfile student = studentProfileRepository.findByUser(user).orElse(null);
        if (user.getRole() == Role.ROLE_PARENT) {
            String parentName = studentProfileRepository
                    .findByGuardianEmailIgnoreCaseAndInstitutionId(user.getEmail(), user.getInstitutionId())
                    .stream()
                    .map(StudentProfile::getGuardianName)
                    .filter(name -> name != null && !name.isBlank())
                    .findFirst()
                    .orElse(user.getUsername());
            return createAuthResponse(user, null, parentName);
        }

        String studentId = student != null ? student.getId() : "";
        String fullName = student != null ? student.getFirstName() + " " + student.getLastName() : user.getUsername();

        return createAuthResponse(user, student, fullName);
    }

    private AuthResponse createAuthResponse(User user, StudentProfile student, String fullName) {
        String studentId = student != null ? student.getId() : "";

        Institution institution = institutionRepository.findById(user.getInstitutionId()).orElse(null);
        String institutionName = institution != null ? institution.getName() : "CampusConnect University";

        String token = jwtTokenProvider.generateToken(
                user.getUsername(),
                user.getRole().name(),
                user.getId(),
                studentId,
                user.getInstitutionId()
        );

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .studentId(studentId)
                .institutionId(user.getInstitutionId())
                .institutionName(institutionName)
                .fullName(fullName)
                .build();
    }

    @Transactional(readOnly = true)
    public User getAuthenticatedUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
    }

    @Transactional(readOnly = true)
    public StudentProfile getAuthenticatedStudent(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("User not found: " + username));
        return studentProfileRepository.findByUser(user)
                .orElseThrow(() -> new UnauthorizedException("Student profile not found for user: " + username));
    }
}
