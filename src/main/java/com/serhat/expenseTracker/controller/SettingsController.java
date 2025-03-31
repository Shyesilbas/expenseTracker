package com.serhat.expenseTracker.controller;

import com.serhat.expenseTracker.entity.enums.Currency;
import com.serhat.expenseTracker.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/settings")
public class SettingsController {
    private final UserService userService;

    @PostMapping("/setFavCurrency")
    public ResponseEntity<Currency> favCurrency(@RequestBody Map<String, String> requestBody) {
        String currencyCode = requestBody.get("currency");
        if (currencyCode == null) {
            return ResponseEntity.badRequest().build();
        }
        try {
            Currency currency = Currency.valueOf(currencyCode.toUpperCase());
            Currency updatedCurrency = userService.setfavoriteCurrency(currency);
            return ResponseEntity.ok(updatedCurrency);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}
