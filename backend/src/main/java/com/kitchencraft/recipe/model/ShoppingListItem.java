package com.kitchencraft.recipe.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
public class ShoppingListItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "weekly_plan_id", nullable = false)
    private WeeklyPlan weeklyPlan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id", nullable = false)
    private Ingredient ingredient;

    @Column(nullable = false, name = "quantity_needed", precision = 10, scale = 2)
    private BigDecimal quantityNeeded;

    @Column(nullable = false, name = "quantity_owned", precision = 10, scale = 2)
    private BigDecimal quantityOwned = BigDecimal.ZERO;

    @Column(nullable = false, name = "quantity_to_buy", precision = 10, scale = 2)
    private BigDecimal quantityToBuy;

    @Column(nullable = false, name = "unit")
    private String unit;

    @Column(nullable = false, name = "is_checked")
    private Boolean isChecked = false;

    @Column(nullable = false, name = "is_validated")
    private Boolean isValidated = false;

    public void calculateQuantityToBuy() {
        this.quantityToBuy = this.quantityNeeded.subtract(this.quantityOwned);
        if (this.quantityToBuy.compareTo(BigDecimal.ZERO) < 0) {
            this.quantityToBuy = BigDecimal.ZERO;
        }
    }

    @PrePersist
    @PreUpdate
    public void prePersist() {
        calculateQuantityToBuy();
    }
}