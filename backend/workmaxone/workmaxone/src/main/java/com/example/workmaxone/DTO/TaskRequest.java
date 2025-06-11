package com.example.workmaxone.DTO;

import java.util.List;

public record TaskRequest(String name, List<String> skillSet) {
}
