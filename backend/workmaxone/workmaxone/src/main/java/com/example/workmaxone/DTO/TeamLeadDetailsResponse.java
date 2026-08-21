package com.example.workmaxone.DTO;

/** A stable, UI-focused view that avoids serializing JPA relationship graphs. */
public record TeamLeadDetailsResponse(
        String employeeName,
        String email,
        Integer projectId,
        String projectName
) {
}
