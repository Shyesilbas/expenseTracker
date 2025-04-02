package com.serhat.expenseTracker.entity;

import com.serhat.expenseTracker.entity.enums.Category;
import com.serhat.expenseTracker.entity.enums.Currency;
import com.serhat.expenseTracker.entity.enums.Status;
import com.serhat.expenseTracker.entity.enums.TransactionType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "transaction")
public  class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long transactionId;

    private BigDecimal amount;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    private Category category;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private Status status;


    @Column(name = "description")
    private String description;

    @Column(name = "currency", nullable = false)
    @Enumerated(EnumType.STRING)
    private Currency currency;

    @Column(name = "updated_at")
    private LocalDate updatedAt;

    @Column(name = "type", nullable = false)
    @Enumerated(EnumType.STRING)

    private TransactionType type;
    @Column(name = "day_of_month")
    private Integer dayOfMonth;

    @Column(name = "start_month")
    private Integer startMonth;

    @Column(name = "start_year")
    private Integer startYear;

    @Column(name = "end_month")
    private Integer endMonth;

    @Column(name = "end_year")
    private Integer endYear;

    private String recurringSeriesId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @PrePersist
    void initTransaction(){
        this.updatedAt=LocalDate.now();
    }

}
