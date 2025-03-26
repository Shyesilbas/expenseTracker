package com.serhat.expenseTracker.exception;

import lombok.AllArgsConstructor;

@AllArgsConstructor
public class InvalidTokenFormat extends RuntimeException {

    public InvalidTokenFormat(String message) {
        super(message);
    }
}
