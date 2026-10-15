package com.campusconnect.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "timetable_slots")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimetableSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "institution_id", nullable = false)
    private String institutionId;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private Integer semester;

    @Column(nullable = false)
    private String section;

    @Column(name = "day_of_week", nullable = false)
    private String dayOfWeek; // MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY

    @Column(name = "start_time", nullable = false)
    private String startTime;

    @Column(name = "end_time", nullable = false)
    private String endTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id")
    private Subject subject;

    @Column(name = "subject_name", nullable = false)
    private String subjectName;

    @Column(name = "room_number", nullable = false)
    private String roomNumber;

    @Column(name = "faculty_name")
    private String facultyName;

    @Column(name = "slot_type")
    @Builder.Default
    private String slotType = "LECTURE"; // LECTURE, LAB, BREAK
}
