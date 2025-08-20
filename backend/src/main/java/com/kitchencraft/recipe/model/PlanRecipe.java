package com.kitchencraft.recipe.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
public class PlanRecipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "weekly_plan_id", nullable = false)
    private WeeklyPlan weeklyPlan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @Column(nullable = false, name = "planned_date")
    private LocalDate plannedDate;

    @Column(nullable = true, name = "meal_type")
    private String mealType; // "déjeuner", "dîner", etc.

    @Column(nullable = true, name = "scaled_person")
    private Integer scaledPerson;

    @Column(nullable = false, name = "added_date")
    private LocalDate addedDate;

    @PrePersist
    public void prePersist() {
        if (addedDate == null) {
            addedDate = LocalDate.now();
        }
        if (scaledPerson == null && recipe != null) {
            scaledPerson = recipe.getPerson();
        }
    }
}