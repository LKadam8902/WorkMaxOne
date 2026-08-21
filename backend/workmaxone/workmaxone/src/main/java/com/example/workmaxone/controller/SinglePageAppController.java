package com.example.workmaxone.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** Lets Angular routes work when opened directly in the deployed application. */
@Controller
public class SinglePageAppController {

    @GetMapping({"/", "/create-account", "/sign-in", "/admin-login", "/admin-view",
            "/team-lead-view", "/benched-employee-view", "/edit-profile", "/contact"})
    public String forwardToApp() {
        return "forward:/index.html";
    }
}
