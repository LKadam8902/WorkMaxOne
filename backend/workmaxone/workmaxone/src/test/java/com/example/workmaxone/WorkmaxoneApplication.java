package com.example.workmaxone;

import com.example.workmaxone.service.AdminService;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class WorkmaxoneApplication {


    @Autowired
    private AdminService adminService;

    public static void main(String[] args) {
       SpringApplication.run(WorkmaxoneApplication.class, args);


    }

    @PostConstruct
    public void init() {
       try {
          adminService.checkAdmin("${app.admin-email}", "${app.admin-password");
       } catch (Exception e) {
          System.err.println("An unexpected error occurred during admin initialization: {}"+ e.getMessage());
       }
    }



}