package com.kitchencraft.recipe.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Entity
@Getter
@Setter
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, name = "name")
    private String name;

    @Column(nullable = false, name = "type")
    private String type;

    @Column(nullable = true, name = "description")
    private String description;

    @Column(nullable = true, name = "origin")
    private String origin;

    @Column(nullable = false, name = "preparation_time")
    private Integer preparationTime;

    @Column(nullable = true, name = "cooking_time")
    private Integer cookingTime;

    @Column(nullable = true, name = "rest_time")
    private Integer restTime;

    @Column(nullable = true, name = "total_time")
    private Integer totalTime;

    @Column(nullable = false, name = "person")
    private Integer person;

    @Column(nullable = false, name = "is_baby_friendly")
    private Boolean isBabyFriendly = false;

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RecipeIngredient> ingredients = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "recipe_steps", joinColumns = @JoinColumn(name = "recipe_id"))
    @Column(name = "step", columnDefinition = "TEXT")
    @OrderColumn(name = "step_order")
    private List<String> steps = new ArrayList<>();


    // Méthode pour calculer automatiquement le temps total
    public void calculateTotalTime() {
        int total = 0;
        if (preparationTime != null) total += preparationTime;
        if (cookingTime != null) total += cookingTime;
        if (restTime != null) total += restTime;
        this.totalTime = total;
    }


    // Hook JPA pour calculer automatiquement avant sauvegarde
    @PrePersist
    @PreUpdate
    public void prePersist() {
        calculateTotalTime();
    }

}
