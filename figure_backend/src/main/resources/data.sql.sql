-- Đảm bảo tất cả figures có quantity > 0
UPDATE figures 
SET quantity = 50 
WHERE quantity <= 0 OR quantity IS NULL;

-- Đảm bảo tất cả figures có price > 0
UPDATE figures 
SET price = 1000000 
WHERE price <= 0 OR price IS NULL;

-- Hiển thị tất cả figures sau khi update
SELECT id, name, quantity, price FROM figures;