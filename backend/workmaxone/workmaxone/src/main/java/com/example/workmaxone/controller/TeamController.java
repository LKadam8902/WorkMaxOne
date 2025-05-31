package com.example.workmaxone.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/team")
public class TeamController {

    @GetMapping("/hello")
    public String greetings(){
        return "Hello World";
    }

}
