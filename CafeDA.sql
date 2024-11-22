CREATE DATABASE  IF NOT EXISTS `cafeteria` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `cafeteria`;
-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: localhost    Database: cafeteria
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `detalles_pedido`
--

DROP TABLE IF EXISTS `detalles_pedido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalles_pedido` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_pedido` int DEFAULT NULL,
  `id_producto` int DEFAULT NULL,
  `cantidad` int NOT NULL,
  `detalles` varchar(255) DEFAULT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) GENERATED ALWAYS AS ((`cantidad` * `precio_unitario`)) STORED,
  PRIMARY KEY (`id`),
  KEY `id_pedido` (`id_pedido`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `detalles_pedido_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedidos` (`id`),
  CONSTRAINT `detalles_pedido_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalles_pedido`
--

LOCK TABLES `detalles_pedido` WRITE;
/*!40000 ALTER TABLE `detalles_pedido` DISABLE KEYS */;
INSERT INTO `detalles_pedido` (`id`, `id_pedido`, `id_producto`, `cantidad`, `detalles`, `precio_unitario`) VALUES (7,6,1,1,NULL,1500.00),(8,7,16,1,NULL,4800.00),(9,8,16,1,NULL,4800.00),(14,12,11,1,NULL,4500.00),(48,36,6,1,NULL,1800.00),(49,36,7,2,NULL,4000.00),(50,37,6,2,NULL,1800.00),(51,38,1,2,'Nuevo',1500.00),(52,39,7,1,'Cositas',4000.00);
/*!40000 ALTER TABLE `detalles_pedido` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `facturas`
--

DROP TABLE IF EXISTS `facturas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `facturas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pedido_id` int NOT NULL,
  `fecha_apertura` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_cierre` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `pedido_id` (`pedido_id`),
  CONSTRAINT `facturas_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `facturas`
--

LOCK TABLES `facturas` WRITE;
/*!40000 ALTER TABLE `facturas` DISABLE KEYS */;
/*!40000 ALTER TABLE `facturas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mesas`
--

DROP TABLE IF EXISTS `mesas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mesas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero_mesa` int NOT NULL,
  `estado` enum('Disponible','Ocupada') NOT NULL,
  `sede_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sede_id` (`sede_id`),
  CONSTRAINT `mesas_ibfk_1` FOREIGN KEY (`sede_id`) REFERENCES `sedes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mesas`
--

LOCK TABLES `mesas` WRITE;
/*!40000 ALTER TABLE `mesas` DISABLE KEYS */;
INSERT INTO `mesas` VALUES (1,1,'Disponible',1),(2,2,'Ocupada',1),(3,3,'Disponible',1),(4,1,'Ocupada',2),(5,2,'Ocupada',2),(6,3,'Disponible',2),(7,4,'Ocupada',2),(8,1,'Disponible',3),(9,2,'Disponible',3),(10,3,'Disponible',3),(11,4,'Disponible',3),(12,5,'Disponible',3),(13,1,'Disponible',4),(14,2,'Ocupada',4),(15,3,'Disponible',4),(16,4,'Disponible',4),(17,5,'Ocupada',4),(18,6,'Disponible',4);
/*!40000 ALTER TABLE `mesas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedidos`
--

DROP TABLE IF EXISTS `pedidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedidos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_mesero` int DEFAULT NULL,
  `id_cajero` int DEFAULT NULL,
  `id_mesa` int NOT NULL,
  `fecha_apertura` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_cierre` timestamp NULL DEFAULT NULL,
  `estado` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_mesero` (`id_mesero`),
  KEY `id_cajero` (`id_cajero`),
  KEY `id_mesa` (`id_mesa`),
  CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`id_mesero`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `pedidos_ibfk_2` FOREIGN KEY (`id_cajero`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `pedidos_ibfk_3` FOREIGN KEY (`id_mesa`) REFERENCES `mesas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedidos`
--

LOCK TABLES `pedidos` WRITE;
/*!40000 ALTER TABLE `pedidos` DISABLE KEYS */;
INSERT INTO `pedidos` VALUES (6,4,NULL,2,'2024-11-18 00:51:17',NULL,'Abierto'),(7,4,NULL,14,'2024-11-18 00:53:47',NULL,'Abierto'),(8,4,NULL,17,'2024-11-18 00:58:50',NULL,'Abierto'),(12,4,NULL,11,'2024-11-21 16:26:43',NULL,'Abierto'),(36,1,NULL,5,'2024-11-22 03:47:37',NULL,'Abierto'),(37,1,NULL,7,'2024-11-22 03:48:25',NULL,'Abierto'),(38,1,NULL,7,'2024-11-22 03:54:25',NULL,'Abierto'),(39,1,NULL,4,'2024-11-22 03:57:56',NULL,'Abierto');
/*!40000 ALTER TABLE `pedidos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `precio` decimal(10,2) NOT NULL,
  `stock` int NOT NULL,
  `sede_id` int NOT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sede_id` (`sede_id`),
  CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`sede_id`) REFERENCES `sedes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (1,'Café Americano','Café negro servido en taza grande',1500.00,50,1,'/images/productos/cafe_americano.jpg'),(2,'Latte','Café con leche vaporizada y espuma de leche',3500.00,30,1,'/images/productos/latte.jpg'),(3,'Té Verde','Té verde natural en hoja',2000.00,40,1,'/images/productos/te_verde.jpg'),(4,'Croissant','Croissant de mantequilla recién horneado',2500.00,20,1,'/images/productos/croissant.jpg'),(5,'Muffin de Arándano','Muffin esponjoso con arándanos frescos',3000.00,25,1,'/images/productos/muffin_arandano.jpg'),(6,'Café Expreso','Café puro servido en taza pequeña',1800.00,42,2,'/images/productos/cafe_expreso.jpg'),(7,'Capuchino','Café con leche espumosa y canela',4000.00,26,2,'/images/productos/capuchino.jpg'),(8,'Té Negro','Té negro en hoja con sabor intenso',2200.00,40,2,'/images/productos/te_negro.jpg'),(9,'Donut Glaseada','Donut clásica con glaseado de azúcar',1500.00,35,2,'/images/productos/donut_glaseada.jpg'),(10,'Bagel','Bagel con queso crema y salmón',3500.00,20,2,'/images/productos/bagel.jpg'),(11,'Café Mocha','Café con chocolate y crema batida',4500.00,25,3,'/images/productos/cafe_mocha.jpg'),(12,'Té de Manzanilla','Infusión de manzanilla natural',1800.00,40,3,'/images/productos/te_manzanilla.jpg'),(13,'Sándwich de Pavo','Sándwich con pavo, lechuga y tomate',5000.00,20,3,'/images/productos/sandwich_pavo.jpg'),(14,'Brownie','Brownie de chocolate con nueces',3000.00,15,3,'/images/productos/brownie.jpg'),(15,'Tarta de Queso','Tarta de queso con base de galleta',4500.00,10,3,'/images/productos/tarta_queso.jpg'),(16,'Café Caramel','Café con caramelo y crema batida',4800.00,30,4,'/images/productos/cafe_caramel.jpg'),(17,'Té de Menta','Té refrescante de menta natural',2000.00,40,4,'/images/productos/te_menta.jpg'),(18,'Empanada de Carne','Empanada rellena de carne sazonada',3500.00,20,4,'/images/productos/empanada_carne.jpg'),(19,'Roll de Canela','Pan dulce con canela y glaseado',4000.00,15,4,'/images/productos/roll_canela.jpg'),(20,'Sándwich Vegano','Sándwich con aguacate, tomate y espinacas',4500.00,20,4,'/images/productos/sandwich_vegano.jpg');
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Administrador'),(3,'Cajero'),(2,'Mesero');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sedes`
--

DROP TABLE IF EXISTS `sedes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sedes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sedes`
--

LOCK TABLES `sedes` WRITE;
/*!40000 ALTER TABLE `sedes` DISABLE KEYS */;
INSERT INTO `sedes` VALUES (1,'Sede Central','Avenida Principal 123, Bogotá'),(2,'Sede Norte','Calle Norte 456, Medellín'),(3,'Sede Sur','Calle Sur 789, Bucaramanga'),(4,'Sede Este','Avenida Este 101, Cali');
/*!40000 ALTER TABLE `sedes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol_id` int NOT NULL,
  `sede_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `rol_id` (`rol_id`),
  KEY `sede_id` (`sede_id`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`),
  CONSTRAINT `usuarios_ibfk_2` FOREIGN KEY (`sede_id`) REFERENCES `sedes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Jeyson Murcia','jeyson@gmail.com','6GEn66k3IXt1Wn1hA0RVxg==',1,NULL),(2,'Laura','laura@gmail.com','6GEn66k3IXt1Wn1hA0RVxg==',2,1),(3,'Juan','juan@gmail.com','6GEn66k3IXt1Wn1hA0RVxg==',3,1),(4,'Andres','andres@gmail.com','6GEn66k3IXt1Wn1hA0RVxg==',2,2),(5,'Maria','maria@gmail.com','6GEn66k3IXt1Wn1hA0RVxg==',3,2),(6,'David','david@gmail.com','6GEn66k3IXt1Wn1hA0RVxg==',2,3),(7,'Ana','ana@gmail.com','6GEn66k3IXt1Wn1hA0RVxg==',3,3),(8,'Carlos','carlos@gmail.com','6GEn66k3IXt1Wn1hA0RVxg==',2,4),(9,'Sofia','sofia@gmail.com','6GEn66k3IXt1Wn1hA0RVxg==',3,4),(10,'Pueblo','p@gmail.com','6GEn66k3IXt1Wn1hA0RVxg==',1,NULL);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'cafeteria'
--

--
-- Dumping routines for database 'cafeteria'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-11-21 23:20:23
