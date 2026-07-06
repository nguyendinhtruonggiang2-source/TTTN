package com.example.figure.service;

import com.example.figure.entity.Figure;
import com.example.figure.repository.FigureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FigureService {
    
    private final FigureRepository figureRepository;
    
    @Transactional(readOnly = true)
    public List<Figure> getAllFigures() {
        try {
            System.out.println("🔍 FigureService.getAllFigures() called");
            System.out.println("🔍 Repository instance: " + figureRepository.getClass().getSimpleName());
            
            List<Figure> figures = figureRepository.findAll();
            
            // Force initialize lazy loaded properties to avoid serialization issues
            figures.forEach(figure -> {
                if (figure.getCategory() != null) {
                    figure.getCategory().getName();
                }
                if (figure.getBranch() != null) {
                    figure.getBranch().getName();
                }
            });
            
            System.out.println("✅ Retrieved " + figures.size() + " figures from database");
            if (!figures.isEmpty()) {
                System.out.println("📝 Sample figure - ID: " + figures.get(0).getId() + 
                                  ", Name: " + figures.get(0).getName() + 
                                  ", Price: " + figures.get(0).getPrice() +
                                  ", Quantity: " + figures.get(0).getQuantity());
                if (figures.get(0).getBranch() != null) {
                    System.out.println("🏪 Branch: " + figures.get(0).getBranch().getName());
                }
            } else {
                System.out.println("ℹ️ No figures found in database");
            }
            
            return figures;
        } catch (Exception e) {
            System.err.println("🔥 ERROR in FigureService.getAllFigures(): " + e.getMessage());
            System.err.println("🔥 Error type: " + e.getClass().getName());
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch figures from database: " + e.getMessage(), e);
        }
    }
    
    @Transactional(readOnly = true)
    public Figure getFigureById(Long id) {
        try {
            System.out.println("🔍 FigureService.getFigureById(" + id + ") called");
            Figure figure = figureRepository.findById(id)
                    .orElseThrow(() -> {
                        System.err.println("❌ Figure not found with id: " + id);
                        return new RuntimeException("Figure not found with id: " + id);
                    });
            
            // Force initialize lazy loaded properties
            if (figure.getCategory() != null) {
                figure.getCategory().getName();
            }
            if (figure.getBranch() != null) {
                figure.getBranch().getName();
            }
            
            return figure;
        } catch (Exception e) {
            System.err.println("🔥 ERROR in FigureService.getFigureById(): " + e.getMessage());
            throw e;
        }
    }
    
    @Transactional(readOnly = true)
    public List<Figure> searchFigures(String keyword) {
        try {
            System.out.println("🔍 FigureService.searchFigures('" + keyword + "') called");
            if (keyword == null || keyword.trim().isEmpty()) {
                return getAllFigures();
            }
            List<Figure> results = figureRepository.findByNameContainingIgnoreCase(keyword);
            System.out.println("✅ Found " + results.size() + " figures matching '" + keyword + "'");
            return results;
        } catch (Exception e) {
            System.err.println("🔥 ERROR in FigureService.searchFigures(): " + e.getMessage());
            throw new RuntimeException("Search failed: " + e.getMessage(), e);
        }
    }
    
    // ==================== CÁC PHƯƠNG THỨC LIÊN QUAN ĐẾN BRANCH ====================
    
    /**
     * Lấy danh sách sản phẩm theo chi nhánh
     * @param branchId ID của chi nhánh
     * @return Danh sách sản phẩm thuộc chi nhánh đó
     */
    @Transactional(readOnly = true)
    public List<Figure> getFiguresByBranch(Long branchId) {
        try {
            System.out.println("🔍 FigureService.getFiguresByBranch(" + branchId + ") called");
            List<Figure> figures = figureRepository.findByBranch_Id(branchId);
            System.out.println("✅ Found " + figures.size() + " figures for branch ID: " + branchId);
            return figures;
        } catch (Exception e) {
            System.err.println("🔥 ERROR in FigureService.getFiguresByBranch(): " + e.getMessage());
            throw new RuntimeException("Failed to get figures by branch: " + e.getMessage(), e);
        }
    }
    
    /**
     * Lấy danh sách sản phẩm theo chi nhánh (sử dụng Query)
     * @param branchId ID của chi nhánh
     * @return Danh sách sản phẩm thuộc chi nhánh đó
     */
    @Transactional(readOnly = true)
    public List<Figure> findAllByBranchId(Long branchId) {
        try {
            System.out.println("🔍 FigureService.findAllByBranchId(" + branchId + ") called");
            List<Figure> figures = figureRepository.findAllByBranchId(branchId);
            System.out.println("✅ Found " + figures.size() + " figures for branch ID: " + branchId);
            return figures;
        } catch (Exception e) {
            System.err.println("🔥 ERROR in FigureService.findAllByBranchId(): " + e.getMessage());
            throw new RuntimeException("Failed to get figures by branch: " + e.getMessage(), e);
        }
    }
    
    // ==================== CÁC PHƯƠNG THỨC FILTER KHÁC ====================
    
    @Transactional(readOnly = true)
    public List<Figure> filterBySeries(String series) {
        try {
            return figureRepository.findBySeriesContainingIgnoreCase(series);
        } catch (Exception e) {
            throw new RuntimeException("Filter by series failed: " + e.getMessage(), e);
        }
    }
    
    @Transactional(readOnly = true)
    public List<Figure> filterByType(String type) {
        try {
            return figureRepository.findByTypeContainingIgnoreCase(type);
        } catch (Exception e) {
            throw new RuntimeException("Filter by type failed: " + e.getMessage(), e);
        }
    }
    
    @Transactional(readOnly = true)
    public List<Figure> filterByManufacturer(String manufacturer) {
        try {
            return figureRepository.findByManufacturerContainingIgnoreCase(manufacturer);
        } catch (Exception e) {
            throw new RuntimeException("Filter by manufacturer failed: " + e.getMessage(), e);
        }
    }
    
    @Transactional(readOnly = true)
    public List<Figure> filterByPriceRange(double min, double max) {
        try {
            return figureRepository.findByPriceBetween(min, max);
        } catch (Exception e) {
            throw new RuntimeException("Filter by price range failed: " + e.getMessage(), e);
        }
    }
    
    // ==================== CÁC PHƯƠNG THỨC LẤY DANH SÁCH GIÁ TRỊ DUY NHẤT ====================
    
    @Transactional(readOnly = true)
    public List<String> getAllSeries() {
        try {
            System.out.println("🔍 FigureService.getAllSeries() called");
            List<String> series = figureRepository.findAllSeries();
            System.out.println("✅ Found " + series.size() + " unique series");
            return series;
        } catch (Exception e) {
            System.err.println("🔥 ERROR in FigureService.getAllSeries(): " + e.getMessage());
            throw new RuntimeException("Failed to get series: " + e.getMessage(), e);
        }
    }
    
    @Transactional(readOnly = true)
    public List<String> getAllManufacturers() {
        try {
            System.out.println("🔍 FigureService.getAllManufacturers() called");
            List<String> manufacturers = figureRepository.findAllManufacturers();
            System.out.println("✅ Found " + manufacturers.size() + " unique manufacturers");
            return manufacturers;
        } catch (Exception e) {
            System.err.println("🔥 ERROR in FigureService.getAllManufacturers(): " + e.getMessage());
            throw new RuntimeException("Failed to get manufacturers: " + e.getMessage(), e);
        }
    }
    
    @Transactional(readOnly = true)
    public List<String> getAllTypes() {
        try {
            System.out.println("🔍 FigureService.getAllTypes() called");
            List<String> types = figureRepository.findAllTypes();
            System.out.println("✅ Found " + types.size() + " unique types");
            return types;
        } catch (Exception e) {
            System.err.println("🔥 ERROR in FigureService.getAllTypes(): " + e.getMessage());
            throw new RuntimeException("Failed to get types: " + e.getMessage(), e);
        }
    }
    
    // ==================== CÁC PHƯƠNG THỨC SẮP XẾP ====================
    
    @Transactional(readOnly = true)
    public List<Figure> getNewestFigures() {
        try {
            System.out.println("🔍 FigureService.getNewestFigures() called");
            List<Figure> figures = figureRepository.findByOrderByCreatedAtDesc();
            System.out.println("✅ Found " + figures.size() + " newest figures");
            return figures;
        } catch (Exception e) {
            System.err.println("🔥 ERROR in FigureService.getNewestFigures(): " + e.getMessage());
            throw new RuntimeException("Failed to get newest figures: " + e.getMessage(), e);
        }
    }
    
    @Transactional(readOnly = true)
    public List<Figure> getFiguresByPriceAsc() {
        try {
            System.out.println("🔍 FigureService.getFiguresByPriceAsc() called");
            List<Figure> figures = figureRepository.findByOrderByPriceAsc();
            System.out.println("✅ Found " + figures.size() + " figures sorted by price ASC");
            return figures;
        } catch (Exception e) {
            System.err.println("🔥 ERROR in FigureService.getFiguresByPriceAsc(): " + e.getMessage());
            throw new RuntimeException("Failed to get figures by price ASC: " + e.getMessage(), e);
        }
    }
    
    @Transactional(readOnly = true)
    public List<Figure> getFiguresByPriceDesc() {
        try {
            System.out.println("🔍 FigureService.getFiguresByPriceDesc() called");
            List<Figure> figures = figureRepository.findByOrderByPriceDesc();
            System.out.println("✅ Found " + figures.size() + " figures sorted by price DESC");
            return figures;
        } catch (Exception e) {
            System.err.println("🔥 ERROR in FigureService.getFiguresByPriceDesc(): " + e.getMessage());
            throw new RuntimeException("Failed to get figures by price DESC: " + e.getMessage(), e);
        }
    }
    
    // ==================== CÁC PHƯƠNG THỨC CRUD ====================
    
    @Transactional
    public Figure saveFigure(Figure figure) {
        try {
            System.out.println("🔍 FigureService.saveFigure() called");
            System.out.println("📝 Figure to save: " + figure.getName());
            
            // Đảm bảo quantity hợp lệ
            if (figure.getQuantity() <= 0) {
                figure.setQuantity(50);
                System.out.println("⚠️ Adjusted quantity to 50 for: " + figure.getName());
            }
            
            // Đảm bảo price hợp lệ
            if (figure.getPrice() <= 0) {
                figure.setPrice(1000000.0);
                System.out.println("⚠️ Adjusted price to 1,000,000 for: " + figure.getName());
            }
            
            // Log branch info
            if (figure.getBranch() != null) {
                System.out.println("🏪 Branch assigned: " + figure.getBranch().getName() + 
                                 " (ID: " + figure.getBranch().getId() + ")");
            } else {
                System.out.println("⚠️ No branch assigned to this product");
            }
            
            Figure savedFigure = figureRepository.save(figure);
            System.out.println("✅ Figure saved with ID: " + savedFigure.getId());
            return savedFigure;
        } catch (Exception e) {
            System.err.println("🔥 ERROR in FigureService.saveFigure(): " + e.getMessage());
            throw new RuntimeException("Failed to save figure: " + e.getMessage(), e);
        }
    }
    
    @Transactional
    public void deleteFigure(Long id) {
        try {
            System.out.println("🔍 FigureService.deleteFigure(" + id + ") called");
            if (!figureRepository.existsById(id)) {
                throw new RuntimeException("Figure not found with id: " + id);
            }
            figureRepository.deleteById(id);
            System.out.println("✅ Figure deleted with ID: " + id);
        } catch (Exception e) {
            System.err.println("🔥 ERROR in FigureService.deleteFigure(): " + e.getMessage());
            throw new RuntimeException("Failed to delete figure: " + e.getMessage(), e);
        }
    }
    
    // ==================== PHƯƠNG THỨC ĐẢM BẢO TỒN KHO ====================
    
    /**
     * Đảm bảo tất cả figures có quantity > 0 và price > 0
     */
    @Transactional
    public void ensureAllFiguresHaveStock() {
        try {
            System.out.println("🔧 FigureService.ensureAllFiguresHaveStock() called");
            List<Figure> figures = figureRepository.findAll();
            int quantityUpdated = 0;
            int priceUpdated = 0;
            
            System.out.println("📊 Total figures in database: " + figures.size());
            
            for (Figure figure : figures) {
                boolean updated = false;
                
                // Kiểm tra và update quantity
                if (figure.getQuantity() <= 0) {
                    figure.setQuantity(50);
                    System.out.println("✅ Updated figure: " + figure.getName() + 
                                     " (ID: " + figure.getId() + ") quantity to 50");
                    quantityUpdated++;
                    updated = true;
                }
                
                // Kiểm tra và update price
                if (figure.getPrice() <= 0) {
                    figure.setPrice(1000000.0);
                    System.out.println("✅ Updated figure: " + figure.getName() + 
                                     " (ID: " + figure.getId() + ") price to 1,000,000");
                    priceUpdated++;
                    updated = true;
                }
                
                // Save nếu có thay đổi
                if (updated) {
                    figureRepository.save(figure);
                }
            }
            
            System.out.println("📊 Summary:");
            System.out.println("   - Total figures checked: " + figures.size());
            System.out.println("   - Quantity updated: " + quantityUpdated);
            System.out.println("   - Price updated: " + priceUpdated);
            System.out.println("✅ All figures have been validated and updated if needed");
            
        } catch (Exception e) {
            System.err.println("🔥 ERROR in FigureService.ensureAllFiguresHaveStock(): " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to ensure figures have stock: " + e.getMessage(), e);
        }
    }
    
    // ==================== PHƯƠNG THỨC VALIDATE GIỎ HÀNG ====================
    
    /**
     * Kiểm tra figure có tồn tại và hợp lệ không
     */
    @Transactional(readOnly = true)
    public Figure validateFigureForCart(Long figureId) {
        try {
            System.out.println("🔍 FigureService.validateFigureForCart(" + figureId + ") called");
            Figure figure = figureRepository.findById(figureId)
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));
            
            System.out.println("✅ Figure found: " + figure.getName() + 
                             ", Quantity: " + figure.getQuantity() + 
                             ", Price: " + figure.getPrice());
            
            if (figure.getBranch() != null) {
                System.out.println("🏪 Branch: " + figure.getBranch().getName());
            }
            
            // Nếu quantity <= 0, đặt lại thành 50 nhưng vẫn cho phép thêm vào giỏ
            if (figure.getQuantity() <= 0) {
                figure.setQuantity(50);
                figureRepository.save(figure);
                System.out.println("⚠️ Adjusted quantity to 50 for cart validation");
            }
            
            return figure;
        } catch (Exception e) {
            System.err.println("❌ ERROR validating figure for cart: " + e.getMessage());
            throw e;
        }
    }
}