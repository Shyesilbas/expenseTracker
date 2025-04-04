package com.serhat.expenseTracker.service.savings;

import com.serhat.expenseTracker.dto.objects.SavingsDto;
import com.serhat.expenseTracker.dto.requests.SavingsRequest;
import com.serhat.expenseTracker.dto.requests.UpdateSavingsRequest;
import com.serhat.expenseTracker.entity.AppUser;
import com.serhat.expenseTracker.entity.Savings;
import com.serhat.expenseTracker.entity.enums.Currency;
import com.serhat.expenseTracker.exception.SavingNotFoundException;
import com.serhat.expenseTracker.mapper.SavingsMapper;
import com.serhat.expenseTracker.repository.SavingGoalRepository;
import com.serhat.expenseTracker.repository.SavingsRepository;
import com.serhat.expenseTracker.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SavingsServiceImpl implements SavingsService{
    private final SavingsRepository savingsRepository;
    private final UserService userService;
    private final SavingsMapper savingsMapper;

    @Override
    public SavingsDto addSaving(SavingsRequest request) {
        AppUser user = userService.getCurrentUser();
        Savings savings = savingsRepository.save(Savings.builder()
                .amount(request.amount())
                .currency(request.currency())
                .user(user)
                .build());

        return savingsMapper.toSavingsDto(savings);
    }

    @Override
    public String deleteSavings(Long id) {
        AppUser user = userService.getCurrentUser();
        Savings savings = savingsRepository.findByUserAndId(user, id)
                .orElseThrow(() -> new SavingNotFoundException("Saving not found by id: " + id));

        savingsRepository.delete(savings);
        return "Saving deleted successfully.";
    }

    @Override
    public SavingsDto updateSavings(UpdateSavingsRequest request) {
        AppUser user = userService.getCurrentUser();
        Savings saving = savingsRepository.findByUserAndId(user, request.id())
                .orElseThrow(() -> new SavingNotFoundException("Savings record not found for the given ID."));

        saving.setAmount(request.amount());
        savingsRepository.save(saving);

        return savingsMapper.toSavingsDto(saving);
    }

    @Override
    public List<SavingsDto> mySavings() {
        AppUser user = userService.getCurrentUser();
        return savingsRepository.findByUser(user)
                .stream()
                .map(savingsMapper::toSavingsDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<SavingsDto> savingsByCurrency(Currency currency) {
        AppUser user = userService.getCurrentUser();
        return savingsRepository.findByUserAndCurrency(user, currency)
                .stream()
                .map(savingsMapper::toSavingsDto)
                .collect(Collectors.toList());
    }

}
