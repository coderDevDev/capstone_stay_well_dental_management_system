-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 15, 2025 at 08:33 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dental_clinic`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `admin_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `appointments`
--

CREATE TABLE `appointments` (
  `id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `dentist_id` int(11) DEFAULT NULL,
  `service_id` int(11) NOT NULL,
  `start` datetime NOT NULL,
  `end` datetime NOT NULL,
  `status_id` int(11) NOT NULL DEFAULT 1,
  `service_fee` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `appointments`
--

INSERT INTO `appointments` (`id`, `patient_id`, `dentist_id`, `service_id`, `start`, `end`, `status_id`, `service_fee`) VALUES
(14, 4, NULL, 4, '2025-02-11 09:00:00', '2025-02-11 11:00:00', 1, 1500.00),
(15, 4, NULL, 3, '2025-02-15 10:00:00', '2025-02-15 10:45:00', 2, 700.00);

-- --------------------------------------------------------

--
-- Table structure for table `appointment_statuses`
--

CREATE TABLE `appointment_statuses` (
  `id` int(11) NOT NULL,
  `status_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `appointment_statuses`
--

INSERT INTO `appointment_statuses` (`id`, `status_name`) VALUES
(4, 'Cancelled'),
(7, 'Completed'),
(2, 'Confirmed'),
(10, 'Follow-Up Required'),
(6, 'In Progress'),
(8, 'Missed'),
(5, 'No-Show'),
(9, 'On Hold'),
(1, 'Pending'),
(3, 'Rescheduled');

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `employee_name` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `status` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`id`, `employee_id`, `employee_name`, `date`, `status`, `created_at`, `updated_at`) VALUES
(7, 5, '', '2025-02-13', 'Present', '2025-02-13 11:09:48', '2025-02-13 11:09:48'),
(8, 5, '', '2025-02-12', 'Half Day', '2025-02-13 11:21:55', '2025-02-13 11:21:55');

-- --------------------------------------------------------

--
-- Table structure for table `dentists`
--

CREATE TABLE `dentists` (
  `dentist_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `middle_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `specialization` varchar(100) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dentists`
--

INSERT INTO `dentists` (`dentist_id`, `user_id`, `first_name`, `middle_name`, `last_name`, `specialization`, `phone_number`) VALUES
(1, 2, 'Dr. John', NULL, 'Doe', 'General Dentistry', '09112223334'),
(2, 1, 'Dr. Susan', NULL, 'Smith', 'Orthodontics', '09112223335');

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `position` varchar(255) DEFAULT NULL,
  `salary` decimal(10,2) NOT NULL,
  `salary_basis` enum('hourly','daily','monthly') NOT NULL,
  `working_hours` int(11) NOT NULL,
  `category` enum('full-time','part-time','contract') NOT NULL,
  `sss_contribution` decimal(10,2) DEFAULT 0.00,
  `pagibig_contribution` decimal(10,2) DEFAULT 0.00,
  `philhealth_contribution` decimal(10,2) DEFAULT 0.00,
  `withholding_tax` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `user_id`, `name`, `position`, `salary`, `salary_basis`, `working_hours`, `category`, `sss_contribution`, `pagibig_contribution`, `philhealth_contribution`, `withholding_tax`, `created_at`, `updated_at`) VALUES
(5, 15, 'Dexter Miranda', NULL, 1000.00, 'daily', 40, 'full-time', 0.00, 100.00, 100.00, 100.00, '2025-02-13 11:09:35', '2025-02-13 11:23:02');

-- --------------------------------------------------------

--
-- Table structure for table `inventory`
--

CREATE TABLE `inventory` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `category` varchar(50) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `min_quantity` int(11) NOT NULL DEFAULT 0,
  `supplier_id` int(11) NOT NULL,
  `batch_number` varchar(50) NOT NULL,
  `location` varchar(100) DEFAULT NULL,
  `expiration_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inventory`
--

INSERT INTO `inventory` (`id`, `name`, `category`, `quantity`, `min_quantity`, `supplier_id`, `batch_number`, `location`, `expiration_date`, `notes`, `created_at`, `updated_at`) VALUES
(1, 'Paracetamol', 'supplies', 1000, 100, 1, 'BATCH001', 'Shelf A1', NULL, '123', '2025-02-13 03:37:49', '2025-02-13 06:48:48'),
(2, 'Bandages', 'medication', 500, 50, 2, 'BATCH002', 'Shelf B2', NULL, 'asas', '2025-02-13 03:37:49', '2025-02-13 06:12:08'),
(3, 'biogesic', 'consumables', 1, 1, 1, '1', '1', NULL, '1', '2025-02-13 06:13:39', '2025-02-13 07:06:51'),
(4, 'FACE MASK', 'equipment', 47, 1234, 1, '1234', '1234', NULL, '1234', '2025-02-13 06:25:57', '2025-02-13 06:40:06'),
(5, 'gamot', 'medication', 90, 3, 1, 'BATCH001', 'sipocot', NULL, '122', '2025-02-13 06:41:44', '2025-02-13 06:44:53'),
(6, 'hihi', 'equipment', 12, 12, 1, '12', '12', NULL, '12', '2025-02-13 07:07:37', '2025-02-13 07:07:37');

-- --------------------------------------------------------

--
-- Table structure for table `inventory_history`
--

CREATE TABLE `inventory_history` (
  `id` int(11) NOT NULL,
  `inventory_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `previous_quantity` int(11) NOT NULL,
  `change_type` enum('update','order','adjustment') NOT NULL,
  `notes` text DEFAULT NULL,
  `recorded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inventory_history`
--

INSERT INTO `inventory_history` (`id`, `inventory_id`, `quantity`, `previous_quantity`, `change_type`, `notes`, `recorded_at`) VALUES
(1, 3, 16, 0, 'update', NULL, '2025-02-13 07:06:48'),
(2, 3, 1, 0, 'update', NULL, '2025-02-13 07:06:51'),
(3, 3, 1, 0, 'update', NULL, '2025-02-13 07:06:53'),
(4, 3, 1, 0, 'update', NULL, '2025-02-13 07:07:00'),
(5, 3, 1, 0, 'update', NULL, '2025-02-13 07:07:03'),
(6, 3, 1, 0, 'update', NULL, '2025-02-13 07:07:05'),
(7, 3, 1, 0, 'update', NULL, '2025-02-13 07:07:09'),
(8, 3, 1, 0, 'update', NULL, '2025-02-13 07:07:10'),
(9, 3, 1, 0, 'update', NULL, '2025-02-13 07:07:10');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `order_date` date NOT NULL,
  `status` enum('Pending','Shipped','Delivered') DEFAULT 'Pending',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `supplier_id`, `item_id`, `quantity`, `order_date`, `status`, `notes`, `created_at`, `updated_at`) VALUES
(6, 1, 4, 30, '2025-02-13', 'Delivered', 'asas', '2025-02-13 06:28:04', '2025-02-13 06:36:05'),
(7, 2, 4, 7, '2025-02-13', 'Delivered', '12', '2025-02-13 06:39:35', '2025-02-13 06:40:06'),
(8, 4, 5, 78, '2025-02-13', 'Delivered', '12', '2025-02-13 06:44:37', '2025-02-13 06:44:53');

-- --------------------------------------------------------

--
-- Table structure for table `order_status_history`
--

CREATE TABLE `order_status_history` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `previous_status` enum('Pending','Shipped','Delivered') DEFAULT NULL,
  `new_status` enum('Pending','Shipped','Delivered') DEFAULT NULL,
  `inventory_updated` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_status_history`
--

INSERT INTO `order_status_history` (`id`, `order_id`, `previous_status`, `new_status`, `inventory_updated`, `created_at`) VALUES
(6, 6, 'Pending', 'Shipped', 1, '2025-02-13 06:28:10'),
(7, 6, 'Shipped', 'Delivered', 1, '2025-02-13 06:36:05'),
(8, 7, 'Pending', 'Shipped', 0, '2025-02-13 06:39:57'),
(9, 7, 'Shipped', 'Delivered', 1, '2025-02-13 06:40:06'),
(10, 8, 'Pending', 'Shipped', 0, '2025-02-13 06:44:49'),
(11, 8, 'Shipped', 'Delivered', 1, '2025-02-13 06:44:53');

-- --------------------------------------------------------

--
-- Table structure for table `patients`
--

CREATE TABLE `patients` (
  `patient_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `middle_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `address_region` varchar(50) DEFAULT NULL,
  `address_province` varchar(50) DEFAULT NULL,
  `address_city` varchar(50) DEFAULT NULL,
  `address_or_location` varchar(100) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `medical_history` text DEFAULT NULL,
  `profile_pic` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `patients`
--

INSERT INTO `patients` (`patient_id`, `user_id`, `first_name`, `middle_name`, `last_name`, `date_of_birth`, `age`, `gender`, `address`, `address_region`, `address_province`, `address_city`, `address_or_location`, `phone_number`, `medical_history`, `profile_pic`) VALUES
(4, 8, 'patient1', 'patient1', 'patient1', '2025-02-09', 0, 'Male', NULL, '05', '0505', '050506', '050506001', '09275478620', '1234', ''),
(5, 9, 'jam', 'jam', 'jam', '2025-02-12', 0, 'Female', NULL, '01', '0128', '012801', '012801001', '09275478620', '', ''),
(14, 23, 'DEXTERJHAM', 'Benusa', 'MIRANDA', '2025-02-12', NULL, 'Male', NULL, '01', '0128', '012801', '012801001', '09275478620', 'allergy', ''),
(15, 24, 'Daniel', 'Benusa', 'Miranda', '2025-02-14', NULL, 'Female', NULL, '01', '0128', '012808', '012808006', '09275478620', 'none', ''),
(16, 25, 'newton', 'newnew', 'newnew', '2025-02-11', NULL, 'Male', NULL, '01', '0129', '012906', '012906005', '09275478620', 'medical history ko', ''),
(17, 26, 'Daniel', 'Benusa', 'Miranda', '2025-02-14', NULL, 'Other', NULL, '01', '0129', '012908', '012908013', '09275478620', '1221', '');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `appointment_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_date` datetime DEFAULT current_timestamp(),
  `payment_method` enum('Credit Card','Debit Card','Cash','Bank Transfer','Online Payment Gateway') NOT NULL,
  `status` enum('Pending','Completed','Failed') DEFAULT 'Pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `role_id` int(11) NOT NULL,
  `role_name` enum('admin','dentist','secretary','patient') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`role_id`, `role_name`) VALUES
(1, 'admin'),
(2, 'dentist'),
(3, 'secretary'),
(4, 'patient');

-- --------------------------------------------------------

--
-- Table structure for table `secretaries`
--

CREATE TABLE `secretaries` (
  `secretary_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `middle_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `secretaries`
--

INSERT INTO `secretaries` (`secretary_id`, `user_id`, `first_name`, `middle_name`, `last_name`, `phone_number`) VALUES
(1, 2, 'Sarah', NULL, 'Jones', '09112223336');

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `duration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`id`, `name`, `amount`, `duration`) VALUES
(1, 'Cleaning', 500.00, 60),
(2, 'Filling', 600.00, 90),
(3, 'Extraction', 700.00, 45),
(4, 'Root Canal', 1500.00, 120),
(5, 'PASTA', 600.00, 60);

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `contact` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `address` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `name`, `contact`, `phone`, `address`, `created_at`, `updated_at`) VALUES
(1, 'Acme Medical Suppliers', 'contact@acme.com', '+1234567890', '123 Medical Drive', '2025-02-13 03:37:49', '2025-02-13 06:13:13'),
(2, 'PharmaCare Inc', 'orders@pharmacare.com', '+1987654321', '456 Health Street', '2025-02-13 03:37:49', '2025-02-13 03:37:49'),
(3, 'pharmacia ni doc', 'p1@gmail.com', '09275478620', 'Pawa, Legazpi City', '2025-02-13 06:06:32', '2025-02-13 06:06:32'),
(4, 'companyone', 'company1@gmail.com', '09275478620', 'Barangay 44, Pawa', '2025-02-13 06:40:36', '2025-02-13 06:48:10');

-- --------------------------------------------------------

--
-- Table structure for table `treatments`
--

CREATE TABLE `treatments` (
  `id` varchar(36) NOT NULL,
  `appointment_id` varchar(36) DEFAULT NULL,
  `patient_id` varchar(36) NOT NULL,
  `date` datetime NOT NULL,
  `dentist_id` varchar(36) NOT NULL,
  `notes` text DEFAULT NULL,
  `type` enum('medical','cosmetic') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `treatments`
--

INSERT INTO `treatments` (`id`, `appointment_id`, `patient_id`, `date`, `dentist_id`, `notes`, `type`, `created_at`, `updated_at`) VALUES
('aafde8a1-eec8-465b-a6ea-2840d5612cd4', '15', '4', '2025-02-15 11:48:34', '5', '1234567890', 'medical', '2025-02-15 03:48:34', '2025-02-15 03:48:34');

-- --------------------------------------------------------

--
-- Table structure for table `treatment_teeth`
--

CREATE TABLE `treatment_teeth` (
  `treatment_id` varchar(36) NOT NULL,
  `tooth_number` varchar(2) NOT NULL,
  `treatment` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `treatment_teeth`
--

INSERT INTO `treatment_teeth` (`treatment_id`, `tooth_number`, `treatment`) VALUES
('aafde8a1-eec8-465b-a6ea-2840d5612cd4', '12', 'Tooth Extraction'),
('aafde8a1-eec8-465b-a6ea-2840d5612cd4', '13', 'Tooth Extraction'),
('aafde8a1-eec8-465b-a6ea-2840d5612cd4', '14', 'Tooth Extraction');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role_id` int(11) NOT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `email`, `password`, `role_id`, `is_verified`, `created_at`) VALUES
(1, 'admin@example.com', 'adminhashedpassword', 1, 0, '2025-02-05 12:43:20'),
(2, 'dr.john@example.com', 'dentisthashedpassword', 2, 1, '2025-02-05 12:43:20'),
(3, 'dr.susan@example.com', 'dentisthashedpassword', 2, 0, '2025-02-05 12:43:20'),
(4, 'secretary@example.com', 'secretaryhashedpassword', 3, 0, '2025-02-05 12:43:20'),
(5, 'john.doe@example.com', 'patienthashedpassword', 4, 0, '2025-02-05 12:43:20'),
(6, 'jane.smith@example.com', 'patienthashedpassword', 4, 0, '2025-02-05 12:43:20'),
(7, 'bob.johnson@example.com', 'patienthashedpassword', 4, 0, '2025-02-05 12:43:20'),
(8, 'dextermiranda441@gmail.com', 'password', 4, 0, '2025-02-12 23:20:23'),
(9, 'jam@gmail.com', 'password', 4, 0, '2025-02-12 23:41:43'),
(10, 'brsy@gmail.com', 'password', 4, 0, '2025-02-12 23:43:29'),
(11, 'dextermiranda44144@gmail.com', 'defaultpassword', 2, 0, '2025-02-13 10:12:04'),
(12, '1222@gmail.com', 'defaultpassword', 2, 0, '2025-02-13 10:12:13'),
(13, '12221155@gmail.com', 'defaultpassword', 3, 0, '2025-02-13 10:14:04'),
(14, 'desntist121@gmail.com', 'defaultpassword', 2, 0, '2025-02-13 10:26:38'),
(15, 'dextermiranda442@gmail.com', 'defaultpassword', 2, 0, '2025-02-13 11:09:35'),
(23, 'mdexter958@gmail.com', 'password', 4, 0, '2025-02-14 07:56:19'),
(24, 'mdexter95812@gmail.com', 'password', 4, 0, '2025-02-14 07:57:33'),
(25, 'newnew@gmail.com', 'password', 4, 0, '2025-02-14 08:05:38'),
(26, 'dextermiranda44122@gmail.com', 'password', 4, 0, '2025-02-14 08:55:57');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`admin_id`);

--
-- Indexes for table `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patient_id` (`patient_id`),
  ADD KEY `dentist_id` (`dentist_id`),
  ADD KEY `service_id` (`service_id`),
  ADD KEY `status_id` (`status_id`);

--
-- Indexes for table `appointment_statuses`
--
ALTER TABLE `appointment_statuses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `status_name` (`status_name`);

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `dentists`
--
ALTER TABLE `dentists`
  ADD PRIMARY KEY (`dentist_id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `inventory`
--
ALTER TABLE `inventory`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_inventory_supplier` (`supplier_id`),
  ADD KEY `idx_inventory_category` (`category`);

--
-- Indexes for table `inventory_history`
--
ALTER TABLE `inventory_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `inventory_id` (`inventory_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_orders_supplier` (`supplier_id`),
  ADD KEY `idx_orders_item` (`item_id`),
  ADD KEY `idx_orders_status` (`status`);

--
-- Indexes for table `order_status_history`
--
ALTER TABLE `order_status_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `patients`
--
ALTER TABLE `patients`
  ADD PRIMARY KEY (`patient_id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `appointment_id` (`appointment_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`role_id`),
  ADD UNIQUE KEY `role_name` (`role_name`);

--
-- Indexes for table `secretaries`
--
ALTER TABLE `secretaries`
  ADD PRIMARY KEY (`secretary_id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `treatments`
--
ALTER TABLE `treatments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `treatment_teeth`
--
ALTER TABLE `treatment_teeth`
  ADD PRIMARY KEY (`treatment_id`,`tooth_number`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `role_id` (`role_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `admin_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `appointments`
--
ALTER TABLE `appointments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `appointment_statuses`
--
ALTER TABLE `appointment_statuses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `dentists`
--
ALTER TABLE `dentists`
  MODIFY `dentist_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `inventory`
--
ALTER TABLE `inventory`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `inventory_history`
--
ALTER TABLE `inventory_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `order_status_history`
--
ALTER TABLE `order_status_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `patients`
--
ALTER TABLE `patients`
  MODIFY `patient_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `secretaries`
--
ALTER TABLE `secretaries`
  MODIFY `secretary_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`dentist_id`) REFERENCES `dentists` (`dentist_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_3` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_4` FOREIGN KEY (`status_id`) REFERENCES `appointment_statuses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `dentists`
--
ALTER TABLE `dentists`
  ADD CONSTRAINT `dentists_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `inventory`
--
ALTER TABLE `inventory`
  ADD CONSTRAINT `inventory_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`);

--
-- Constraints for table `inventory_history`
--
ALTER TABLE `inventory_history`
  ADD CONSTRAINT `inventory_history_ibfk_1` FOREIGN KEY (`inventory_id`) REFERENCES `inventory` (`id`);

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`),
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `inventory` (`id`);

--
-- Constraints for table `order_status_history`
--
ALTER TABLE `order_status_history`
  ADD CONSTRAINT `order_status_history_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`);

--
-- Constraints for table `patients`
--
ALTER TABLE `patients`
  ADD CONSTRAINT `patients_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `secretaries`
--
ALTER TABLE `secretaries`
  ADD CONSTRAINT `secretaries_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `treatment_teeth`
--
ALTER TABLE `treatment_teeth`
  ADD CONSTRAINT `treatment_teeth_ibfk_1` FOREIGN KEY (`treatment_id`) REFERENCES `treatments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
