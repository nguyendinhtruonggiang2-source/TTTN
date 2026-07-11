package com.example.figure.controller;

import com.example.figure.entity.*;
import com.example.figure.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final FigureRepository figureRepository;
    private final ReviewRepository reviewRepository;

    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats(@RequestParam(defaultValue = "month") String period) {
        Map<String, Object> stats = new HashMap<>();

        // 1. Counts
        long totalOrders = orderRepository.count();
        long totalUsers = userRepository.count();
        long totalProducts = figureRepository.count();

        stats.put("totalOrders", totalOrders);
        stats.put("totalUsers", totalUsers);
        stats.put("totalProducts", totalProducts);

        // 2. Revenue calculations
        List<Order> allOrders = orderRepository.findAll();
        List<Order> deliveredOrders = allOrders.stream()
                .filter(o -> "DELIVERED".equalsIgnoreCase(o.getStatus()))
                .collect(Collectors.toList());

        double totalRevenue = deliveredOrders.stream()
                .mapToDouble(Order::getTotalAmount)
                .sum();

        LocalDate today = LocalDate.now();
        LocalDateTime startOfToday = today.atStartOfDay();
        LocalDateTime endOfToday = today.atTime(LocalTime.MAX);
        double todayRevenue = deliveredOrders.stream()
                .filter(o -> o.getCreatedAt() != null && !o.getCreatedAt().isBefore(startOfToday) && !o.getCreatedAt().isAfter(endOfToday))
                .mapToDouble(Order::getTotalAmount)
                .sum();

        LocalDate startOfMonth = today.withDayOfMonth(1);
        LocalDateTime startOfThisMonth = startOfMonth.atStartOfDay();
        double thisMonthRevenue = deliveredOrders.stream()
                .filter(o -> o.getCreatedAt() != null && !o.getCreatedAt().isBefore(startOfThisMonth))
                .mapToDouble(Order::getTotalAmount)
                .sum();

        stats.put("totalRevenue", totalRevenue);
        stats.put("todayRevenue", todayRevenue);
        stats.put("thisMonthRevenue", thisMonthRevenue);

        // 3. Status breakdown
        long pendingOrders = allOrders.stream().filter(o -> "PENDING".equalsIgnoreCase(o.getStatus())).count();
        long processingOrders = allOrders.stream().filter(o -> "PROCESSING".equalsIgnoreCase(o.getStatus())).count();
        long shippedOrders = allOrders.stream().filter(o -> "SHIPPED".equalsIgnoreCase(o.getStatus())).count();
        long deliveredOrdersCount = allOrders.stream().filter(o -> "DELIVERED".equalsIgnoreCase(o.getStatus())).count();
        long cancelledOrders = allOrders.stream().filter(o -> "CANCELLED".equalsIgnoreCase(o.getStatus())).count();

        stats.put("pendingOrders", pendingOrders);
        stats.put("processingOrders", processingOrders);
        stats.put("shippedOrders", shippedOrders);
        stats.put("deliveredOrders", deliveredOrdersCount);
        stats.put("cancelledOrders", cancelledOrders);

        // 4. Last 6 months monthly revenue
        List<Map<String, Object>> monthlyRevenue = new ArrayList<>();
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MM/yyyy");
        for (int i = 5; i >= 0; i--) {
            LocalDate monthDate = today.minusMonths(i);
            String monthKey = monthDate.format(monthFormatter);
            LocalDate startOfM = monthDate.withDayOfMonth(1);
            LocalDate endOfM = monthDate.withDayOfMonth(monthDate.lengthOfMonth());
            LocalDateTime startLDT = startOfM.atStartOfDay();
            LocalDateTime endLDT = endOfM.atTime(LocalTime.MAX);

            List<Order> monthOrders = deliveredOrders.stream()
                    .filter(o -> o.getCreatedAt() != null && !o.getCreatedAt().isBefore(startLDT) && !o.getCreatedAt().isAfter(endLDT))
                    .collect(Collectors.toList());

            double revenue = monthOrders.stream().mapToDouble(Order::getTotalAmount).sum();
            
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", "Tháng " + monthDate.getMonthValue());
            monthData.put("revenue", revenue);
            monthData.put("orderCount", monthOrders.size());
            monthlyRevenue.add(monthData);
        }
        stats.put("monthlyRevenue", monthlyRevenue);

        // 5. Top selling products
        Map<Long, Integer> productQuantities = new HashMap<>();
        Map<Long, Double> productRevenues = new HashMap<>();
        Map<Long, Figure> productInfo = new HashMap<>();

        for (Order o : deliveredOrders) {
            for (OrderItem item : o.getItems()) {
                Figure figure = item.getFigure();
                if (figure != null) {
                    Long fid = figure.getId();
                    productQuantities.put(fid, productQuantities.getOrDefault(fid, 0) + item.getQuantity());
                    productRevenues.put(fid, productRevenues.getOrDefault(fid, 0.0) + (item.getPrice() * item.getQuantity()));
                    productInfo.put(fid, figure);
                }
            }
        }

        List<Map<String, Object>> topProducts = productQuantities.entrySet().stream()
                .map(entry -> {
                    Long fid = entry.getKey();
                    Figure f = productInfo.get(fid);
                    Map<String, Object> prodData = new HashMap<>();
                    prodData.put("id", fid);
                    prodData.put("name", f.getName());
                    prodData.put("image", f.getImage());
                    prodData.put("soldCount", entry.getValue());
                    prodData.put("revenue", productRevenues.get(fid));
                    return prodData;
                })
                .sorted((a, b) -> Integer.compare((Integer) b.get("soldCount"), (Integer) a.get("soldCount")))
                .limit(5)
                .collect(Collectors.toList());

        stats.put("topProducts", topProducts);

        // 6. Recent reviews
        List<Review> recentReviewsList = reviewRepository.findAll();
        List<Map<String, Object>> recentReviews = recentReviewsList.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(5)
                .map(r -> {
                    Map<String, Object> revData = new HashMap<>();
                    revData.put("id", r.getId());
                    revData.put("username", r.getUser() != null ? r.getUser().getUsername() : "Anonymous");
                    revData.put("productName", r.getFigure() != null ? r.getFigure().getName() : "Unknown Figure");
                    revData.put("rating", r.getRating());
                    revData.put("content", r.getContent());
                    revData.put("createdAt", r.getCreatedAt().toString());
                    return revData;
                })
                .collect(Collectors.toList());

        stats.put("recentReviews", recentReviews);

        return ResponseEntity.ok(stats);
    }
}
