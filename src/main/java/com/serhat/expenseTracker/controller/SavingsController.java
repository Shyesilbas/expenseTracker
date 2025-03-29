package com.serhat.expenseTracker.controller;

import com.serhat.expenseTracker.dto.objects.SavingsDto;
import com.serhat.expenseTracker.dto.requests.SavingsRequest;
import com.serhat.expenseTracker.dto.requests.UpdateSavingsRequest;
import com.serhat.expenseTracker.entity.enums.Currency;
import com.serhat.expenseTracker.service.savings.SavingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/savings")
@RequiredArgsConstructor
public class SavingsController {

    private final SavingsService savingsService;

    @PostMapping("/addSaving")
    public ResponseEntity<SavingsDto> addSaving(@RequestBody SavingsRequest request) {
        return ResponseEntity.ok(savingsService.addSaving(request));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteSavings(@PathVariable Long id) {
        return ResponseEntity.ok(savingsService.deleteSavings(id));
    }

    @PutMapping("/update")
    public ResponseEntity<SavingsDto> updateSavings(@RequestBody UpdateSavingsRequest request) {
        return ResponseEntity.ok(savingsService.updateSavings(request));
    }

    @GetMapping("/mySavings")
    public ResponseEntity<List<SavingsDto>> mySavings() {
        return ResponseEntity.ok(savingsService.mySavings());
    }

    @GetMapping("/byCurrency")
    public ResponseEntity<List<SavingsDto>> savingsByCurrency(@RequestParam Currency currency) {
        return ResponseEntity.ok(savingsService.savingsByCurrency(currency));
    }
}
