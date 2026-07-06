package com.example.figure;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FigureApplication {
    public static void main(String[] args) {
        SpringApplication.run(FigureApplication.class, args);
        System.out.println("Figure Application started successfully!");
    }
}