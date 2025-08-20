package com.kitchencraft.recipe.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class RecipeRequest {

    private Long id;
    
    @NotBlank(message = "Le nom de la recette est obligatoire")
    @Size(min = 2, max = 100, message = "Le nom doit contenir entre 2 et 100 caractères")
    private String name;
    
    @NotBlank(message = "Le type de recette est obligatoire")
    @Pattern(regexp = "Plat principal|Entrée|Dessert|Apéritif",
             message = "Type de recette invalide")
    private String type;
    
    @Size(max = 1000, message = "La description ne peut pas dépasser 1000 caractères")
    private String description;
    
    @Size(max = 50, message = "L'origine ne peut pas dépasser 50 caractères")
    private String origin;
    
    @Min(value = 0, message = "Le temps de préparation ne peut pas être négatif")
    @Max(value = 1440, message = "Le temps de préparation ne peut pas dépasser 24 heures")
    private Integer preparationTime;
    
    @Min(value = 0, message = "Le temps de cuisson ne peut pas être négatif")
    @Max(value = 1440, message = "Le temps de cuisson ne peut pas dépasser 24 heures")
    private Integer cookingTime;
    
    @Min(value = 0, message = "Le temps de repos ne peut pas être négatif")
    @Max(value = 1440, message = "Le temps de repos ne peut pas dépasser 24 heures")
    private Integer restTime;
    
    @NotNull(message = "Le nombre de personnes est obligatoire")
    @Min(value = 1, message = "Le nombre de personnes doit être d'au moins 1")
    @Max(value = 100, message = "Le nombre de personnes ne peut pas dépasser 100")
    private Integer person;
    
    private Boolean isBabyFriendly;
    
    @Valid
    @NotNull(message = "La liste des ingrédients est obligatoire")
    @Size(min = 1, message = "Une recette doit contenir au moins un ingrédient")
    private List<RecipeIngredientRequest> ingredients;
    
    @NotNull(message = "La liste des étapes est obligatoire")
    @Size(min = 1, message = "Une recette doit contenir au moins une étape")
    private List<@NotBlank(message = "Une étape ne peut pas être vide") 
                  @Size(max = 500, message = "Une étape ne peut pas dépasser 500 caractères") String> steps;

    public RecipeRequest() {}

    public RecipeRequest(Long id, String name, String type, String description, String origin,
                         Integer preparationTime, Integer cookingTime, Integer restTime, Integer person, 
                         Boolean isBabyFriendly, List<RecipeIngredientRequest> ingredients, List<String> steps) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.description = description;
        this.origin = origin;
        this.preparationTime = preparationTime;
        this.cookingTime = cookingTime;
        this.restTime = restTime;
        this.person = person;
        this.isBabyFriendly = isBabyFriendly;
        this.ingredients = ingredients;
        this.steps = steps;
    }
}
