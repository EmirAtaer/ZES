-- ZES_KDSS MySQL Veritabanı Yedeği (Export)
-- 26 Aralık 2025
-- Şema ve örnek veri

CREATE DATABASE IF NOT EXISTS zes_kdss DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE zes_kdss;

-- Bölgeler Tablosu
CREATE TABLE IF NOT EXISTS bolgeler (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ad VARCHAR(100) NOT NULL
);

-- Şehirler Tablosu
CREATE TABLE IF NOT EXISTS sehirler (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ad VARCHAR(100) NOT NULL,
  bolge_id INT,
  FOREIGN KEY (bolge_id) REFERENCES bolgeler(id)
);

-- Şehir Metrikleri Tablosu
CREATE TABLE IF NOT EXISTS sehir_metrikleri (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sehir_id INT,
  zes_istasyon INT DEFAULT 0,
  ac_soket INT DEFAULT 0,
  dc_soket INT DEFAULT 0,
  toplam_soket INT DEFAULT 0,
  FOREIGN KEY (sehir_id) REFERENCES sehirler(id)
);

-- İstasyonlar Tablosu
CREATE TABLE IF NOT EXISTS istasyonlar (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ad VARCHAR(255) NOT NULL,
  sehir_id INT,
  FOREIGN KEY (sehir_id) REFERENCES sehirler(id)
);

-- İstasyon Soketleri Tablosu
CREATE TABLE IF NOT EXISTS istasyon_soketleri (
  id INT AUTO_INCREMENT PRIMARY KEY,
  istasyon_id INT,
  tur ENUM('AC','DC') NOT NULL,
  adet INT DEFAULT 0,
  FOREIGN KEY (istasyon_id) REFERENCES istasyonlar(id)
);

-- Örnek veri eklemek için aşağıya INSERT komutları ekleyebilirsiniz.
-- TRIGGER 1: Yeni istasyon eklenince log tablosuna kayıt ekle
CREATE TABLE IF NOT EXISTS log_istasyon (
  id INT AUTO_INCREMENT PRIMARY KEY,
  istasyon_id INT,
  action VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
DELIMITER $$
CREATE TRIGGER sonra_istasyon_ekle_log
AFTER INSERT ON istasyonlar
FOR EACH ROW
BEGIN
  INSERT INTO log_istasyon (istasyon_id, action) VALUES (NEW.id, 'insert');
END $$
DELIMITER ;

-- TRIGGER 2: Soket eklenince ilgili istasyonun toplam soket sayısını güncelle
DELIMITER $$
CREATE TRIGGER sonra_soket_ekle_toplam_guncelle
AFTER INSERT ON istasyon_soketleri
FOR EACH ROW
BEGIN
  UPDATE sehir_metrikleri sm
  JOIN istasyonlar i ON i.id = NEW.istasyon_id
  SET sm.toplam_soket = sm.toplam_soket + NEW.adet
  WHERE sm.sehir_id = i.sehir_id;
END $$
DELIMITER ;

-- TRIGGER 3: Şehir silinince bağlı istasyon ve soketleri sil (cascade delete için örnek)
DELIMITER $$
CREATE TRIGGER once_sehir_sil_teminlik_temizle
BEFORE DELETE ON sehirler
FOR EACH ROW
BEGIN
  DELETE FROM istasyon_soketleri WHERE istasyon_id IN (SELECT id FROM istasyonlar WHERE sehir_id = OLD.id);
  DELETE FROM istasyonlar WHERE sehir_id = OLD.id;
END $$
DELIMITER ;

-- TRIGGER 4: Yeni istasyon eklenince ilgili şehrin metrik tablosunda ZES istasyon sayısını artır
DELIMITER $$
CREATE TRIGGER sonra_istasyon_ekle_metrik_guncelle
AFTER INSERT ON istasyonlar
FOR EACH ROW
BEGIN
  UPDATE sehir_metrikleri SET zes_istasyon = zes_istasyon + 1 WHERE sehir_id = NEW.sehir_id;
END $$
DELIMITER ;
-- Tam dump almak için phpMyAdmin veya mysqldump kullanabilirsiniz.
