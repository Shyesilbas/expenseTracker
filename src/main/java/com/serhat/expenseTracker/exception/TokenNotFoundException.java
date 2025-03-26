package com.serhat.expenseTracker.exception;

import lombok.AllArgsConstructor;

@AllArgsConstructor
public class TokenNotFoundException extends RuntimeException {
    public TokenNotFoundException(String s) {
        super(s);
    }
}
