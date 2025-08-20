package com.kitchencraft.recipe.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
public class WeeklyPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, name = "name")
    private String name;

    @Column(nullable = false, name = "start_date")
    private LocalDate startDate;

    @Column(nullable = false, name = "end_date")
    private LocalDate endDate;

    @Column(nullable = false, name = "duration_weeks")
    private Integer durationWeeks;

    @Column(nullable = true, name = "description")
    private String description;

    @Column(nullable = false, name = "created_date")
    private LocalDate createdDate;

    @OneToMany(mappedBy = "weeklyPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PlanRecipe> planRecipes = new ArrayList<>();

    @OneToMany(mappedBy = "weeklyPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ShoppingListItem> shoppingListItems = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (createdDate == null) {
            createdDate = LocalDate.now();
        }
    }
}