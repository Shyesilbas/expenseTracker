package com.serhat.expenseTracker.service.currency;

import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class CurrencyConversionService {

    @Value("${exchangeratesapi.base-url}")
    private String baseUrl;

    @Value("${exchangeratesapi.api-key}")
    private String apiKey;

    private final RestTemplate restTemplate;

    public CurrencyConversionService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public double convertCurrency(String from, String to, double amount) {
        String url = String.format("%s/latest?access_key=%s&symbols=%s,%s",
                baseUrl, apiKey, from, to);

        ExchangeRateResponse response = restTemplate.getForObject(url, ExchangeRateResponse.class);

        if (response == null || !response.isSuccess()) {
            throw new RuntimeException("Failed to fetch exchange rates from API");
        }

        Double fromRate = response.getRates().get(from);
        Double toRate = response.getRates().get(to);

        if (fromRate == null || toRate == null) {
            throw new RuntimeException("Exchange rate not found for " + from + " or " + to);
        }

        // Convert from -> EUR -> to
        double amountInEur = amount / fromRate;
        return amountInEur * toRate;
    }

    static class ExchangeRateResponse {
        private boolean success;
        private Map<String, Double> rates;

        public boolean isSuccess() {
            return success;
        }

        public Map<String, Double> getRates() {
            return rates;
        }

        public void setSuccess(boolean success) {
            this.success = success;
        }

        public void setRates(Map<String, Double> rates) {
            this.rates = rates;
        }
    }
}
