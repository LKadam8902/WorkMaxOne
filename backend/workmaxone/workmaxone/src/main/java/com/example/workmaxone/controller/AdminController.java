package com.example.workmaxone.controller;


import com.example.workmaxone.DTO.EmployeeBodyResponse;
import com.example.workmaxone.entity.Admin;
import com.example.workmaxone.entity.Employee;
import com.example.workmaxone.entity.RoleEnum;
import com.example.workmaxone.DTO.AdminBodyResponse;
import com.example.workmaxone.DTO.AdminRequestBody;
// import com.example.workmaxone.DTO.AdminResponse;
import com.example.workmaxone.DTO.LoginResponse;
import com.example.workmaxone.repository.AdminRepository;
import com.example.workmaxone.service.AdminService;
import com.example.workmaxone.service.EmployeeRESTService;
import com.example.workmaxone.service.JWTservice;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletResponse;

import java.net.http.HttpRequest;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;
    @Autowired
    private JWTservice jwtService;

    @Autowired
    private EmployeeRESTService employeeService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody AdminRequestBody req, HttpServletResponse response) {
        var mayBeAdmin = adminService.getAuthenticatedAdmin(req.useremail(), req.password());
        System.out.println("Login api reached");
        if (mayBeAdmin.isEmpty()) {
            return new ResponseEntity<LoginResponse>(new LoginResponse("", "Invalid useremail or password"),
                    HttpStatus.FORBIDDEN);
        }

        var role = RoleEnum.ADMIN;
        var accessToken = adminService.createAccessToken(mayBeAdmin.get(), role.name());
        var refreshToken = adminService.createRefreshToken(mayBeAdmin.get(), role.name());
        Cookie refreshTokenCookie = new Cookie("refreshToken", refreshToken);
        refreshTokenCookie.setHttpOnly(true);
        response.addCookie(refreshTokenCookie);
        return new ResponseEntity<LoginResponse>(
                new LoginResponse(accessToken, "Successful login, use token for further comms"),
                HttpStatus.CREATED);
    }

    @GetMapping("/getAdminDetails")
    public ResponseEntity<AdminBodyResponse> adminDetails() {
        var admin = adminService.getAdmin();
        return new ResponseEntity<>(
                new AdminBodyResponse("Got admin details", admin.get().getAdminId(), admin.get().getAdminEmail()),
                HttpStatus.OK);
    }

    @GetMapping("/view/getApprovalYetUser")
    public ResponseEntity<List<Employee>> getUserDetails(){
        List< Employee>employees=employeeService.getNotApprovedUser();
        return new ResponseEntity<>(employees,HttpStatus.OK);
    }

    @PutMapping("/view/ApproveEmployee/{email}")
    public ResponseEntity<EmployeeBodyResponse> approveEmployee(@PathVariable("email") String employeeEmail){
        employeeService.approveEmployee(employeeEmail);
        return new ResponseEntity<>(new EmployeeBodyResponse("admin approved"),HttpStatus.OK);
    }
}