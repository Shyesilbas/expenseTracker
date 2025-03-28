package com.serhat.expenseTracker.exception;

public class ExpenseNotFoundException extends RuntimeException {
    public ExpenseNotFoundException(String s) {
        super(s);
    }
}
