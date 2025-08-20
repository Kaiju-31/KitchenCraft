package com.kitchencraft.recipe.repository;

import com.kitchencraft.recipe.model.WeeklyPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface WeeklyPlanRepository extends JpaRepository<WeeklyPlan, Long> {

    List<WeeklyPlan> findAllByOrderByCreatedDateDesc();

    List<WeeklyPlan> findByStartDateLessThanEqualAndEndDateGreaterThanEqual(LocalDate date1, LocalDate date2);

    @Query("SELECT wp FROM WeeklyPlan wp WHERE wp.startDate >= :startDate ORDER BY wp.startDate ASC")
    List<WeeklyPlan> findFuturePlans(LocalDate startDate);

    @Query("SELECT wp FROM WeeklyPlan wp WHERE wp.endDate < :endDate ORDER BY wp.startDate DESC")
    List<WeeklyPlan> findPastPlans(LocalDate endDate);
}