package com.campusconnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "institutions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Institution {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String code;

    private String logoUrl;
    private String website;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
