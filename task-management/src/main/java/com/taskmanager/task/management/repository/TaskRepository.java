package com.taskmanager.task.management.repository;

import com.taskmanager.task.management.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {
    
}
