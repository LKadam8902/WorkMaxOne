package com.example.workmaxone.service.exception;


public class AdminException extends RuntimeException {

    // Constructor to take a message
    public AdminException(String message) {
        super(message); // <--- Pass the message to the superclass constructor
    }

    // Constructor to take a message and a cause (the original exception)
    public AdminException(String message, Throwable cause) {
        super(message, cause); // <--- Pass both to the superclass constructor
    }

    // Optional: A constructor to just take a cause, if you want to allow it
    public AdminException(Throwable cause) {
        super(cause);
    }
}