package com.example.figure.repository;

import com.example.figure.entity.Figure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FigureRepository extends JpaRepository<Figure, Long> {
    
    List<Figure> findByNameContainingIgnoreCase(String name);
    
    List<Figure> findBySeriesContainingIgnoreCase(String series);
    
    List<Figure> findByManufacturerContainingIgnoreCase(String manufacturer);
    
    List<Figure> findByTypeContainingIgnoreCase(String type);
    
    List<Figure> findByPriceBetween(double minPrice, double maxPrice);
    
    // Lấy sản phẩm theo branch_id
    List<Figure> findByBranch_Id(Long branchId);
    
    // THÊM PHƯƠNG THỨC NÀY
    @Query("SELECT f FROM Figure f WHERE f.branch.id = :branchId")
    List<Figure> findAllByBranchId(Long branchId);
    
    // Lấy tất cả sản phẩm kèm theo category và branch (để tránh lazy loading)
    @Query("SELECT f FROM Figure f LEFT JOIN FETCH f.category LEFT JOIN FETCH f.branch")
    List<Figure> findAllWithRelations();
    
    @Query("SELECT DISTINCT f.series FROM Figure f WHERE f.series IS NOT NULL")
    List<String> findAllSeries();
    
    @Query("SELECT DISTINCT f.manufacturer FROM Figure f WHERE f.manufacturer IS NOT NULL")
    List<String> findAllManufacturers();
    
    @Query("SELECT DISTINCT f.type FROM Figure f WHERE f.type IS NOT NULL")
    List<String> findAllTypes();
    
    List<Figure> findByOrderByCreatedAtDesc();
    
    List<Figure> findByOrderByPriceAsc();
    
    List<Figure> findByOrderByPriceDesc();
}