package com.example.workmaxone.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/teamLead")
public class TeamLeadController {

    @GetMapping("/hello")
    public String greetings(){
        return "Hello World";
    }

//    @PostMapping("/createTask")
//    public ResponseEntity<> createTask(){
//
//    }

}
