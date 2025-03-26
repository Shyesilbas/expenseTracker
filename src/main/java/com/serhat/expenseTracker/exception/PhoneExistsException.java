package com.serhat.expenseTracker.exception;

import lombok.AllArgsConstructor;

@AllArgsConstructor
public class PhoneExistsException extends RuntimeException {
    public PhoneExistsException(String s) {
        super(s);
    }
}
