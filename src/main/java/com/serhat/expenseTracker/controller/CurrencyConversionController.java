package com.serhat.expenseTracker.controller;

import com.serhat.expenseTracker.service.currency.CurrencyConversionService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/currency")
public class CurrencyConversionController {

    private final CurrencyConversionService conversionService;

    public CurrencyConversionController(CurrencyConversionService conversionService) {
        this.conversionService = conversionService;
    }

    @GetMapping("/usd-to-try")
    public double usdToTry(@RequestParam double amount) {
        return conversionService.convertCurrency("USD", "TRY", amount);
    }

    @GetMapping("/usd-to-eur")
    public double usdToEur(@RequestParam double amount) {
        return conversionService.convertCurrency("USD", "EUR", amount);
    }

    @GetMapping("/eur-to-try")
    public double eurToTry(@RequestParam double amount) {
        return conversionService.convertCurrency("EUR", "TRY", amount);
    }

    @GetMapping("/eur-to-usd")
    public double eurToUsd(@RequestParam double amount) {
        return conversionService.convertCurrency("EUR", "USD", amount);
    }

    @GetMapping("/try-to-usd")
    public double tryToUsd(@RequestParam double amount) {
        return conversionService.convertCurrency("TRY", "USD", amount);
    }

    @GetMapping("/try-to-eur")
    public double tryToEur(@RequestParam double amount) {
        return conversionService.convertCurrency("TRY", "EUR", amount);
    }
}
