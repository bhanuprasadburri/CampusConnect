package com.campusconnect;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class StudentPortalSecurityTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void unauthenticatedRequests_shouldReturnForbiddenOrUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/student/dashboard"))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/v1/student/profile"))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/v1/student/attendance/summary"))
                .andExpect(status().isForbidden());
    }

    @Test
    public void validLogin_shouldReturnJwtToken() throws Exception {
        String loginPayload = "{\"username\": \"student@college.edu\", \"password\": \"Password@123\"}";

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.role").value("ROLE_STUDENT"));
    }

    @Test
    public void invalidPassword_shouldReturnUnauthorized() throws Exception {
        String loginPayload = "{\"username\": \"student@college.edu\", \"password\": \"WrongPassword!\"}";

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginPayload))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }
}
