package com.example.workmaxone.controller;

import com.example.workmaxone.service.exception.EmployeeException;
import com.example.workmaxone.service.exception.ProjectException;
import com.example.workmaxone.service.exception.TaskException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/** Produces predictable, safe error payloads for the Angular client. */
@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler({EmployeeException.class, ProjectException.class, TaskException.class})
    public ProblemDetail handleBusinessException(RuntimeException exception) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, exception.getMessage());
        problem.setTitle("Request could not be completed");
        return problem;
    }
}
