package com.example.workmaxone.payload;

import java.util.List;

public record TaskRequest(String name, List<String> skillSet,Integer projectId) {
}
