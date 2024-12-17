-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 18, 2024 at 12:49 AM
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
-- Database: `av_de_asis`
--

-- --------------------------------------------------------

--
-- Table structure for table `cancelled_orders`
--

CREATE TABLE `cancelled_orders` (
  `CancelledOrderID` int(11) NOT NULL,
  `TransactionID` int(11) NOT NULL,
  `CustomerID` int(11) NOT NULL,
  `SupplierID` int(11) NOT NULL,
  `Price` decimal(10,2) NOT NULL,
  `Category` varchar(255) NOT NULL,
  `Grams` float NOT NULL,
  `Admin_Fname` varchar(255) NOT NULL,
  `Date_Modified` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customer_record`
--

CREATE TABLE `customer_record` (
  `CustomerID` int(11) NOT NULL,
  `CustomerName` varchar(255) NOT NULL,
  `Facebook` varchar(255) DEFAULT NULL,
  `Contact` varchar(255) NOT NULL,
  `Address` varchar(255) NOT NULL,
  `Admin_Fname` varchar(255) NOT NULL,
  `Date_Modified` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customer_record`
--

INSERT INTO `customer_record` (`CustomerID`, `CustomerName`, `Facebook`, `Contact`, `Address`, `Admin_Fname`, `Date_Modified`) VALUES
(12, 'Marielle Pascual', 'fb/mariel_pascual', '09275478620', 'Perfecto street', 'Sara Mae', '2024-07-17 00:00:00'),
(15, 'Joana San Diego', 'fb/joana', '09285478230', 'Bulacan', 'undefined undefined', '2024-10-17 11:53:49');

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `EmployeeID` int(11) NOT NULL,
  `Admin_Fname` varchar(255) NOT NULL,
  `Admin_Lname` varchar(255) NOT NULL,
  `Phone` varchar(255) NOT NULL,
  `Username` varchar(255) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Date_Modified` timestamp NOT NULL DEFAULT current_timestamp(),
  `Modified_By` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'ADMIN',
  `email` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`EmployeeID`, `Admin_Fname`, `Admin_Lname`, `Phone`, `Username`, `Password`, `Date_Modified`, `Modified_By`, `role`, `email`) VALUES
(1, 'Sara', 'Teodoro', '09275478620', 'admin', 'password', '2024-08-03 00:00:00', '', 'ADMIN', ''),
(13, 'Gwyneth ', 'Santos', '09275478620', 'admin2', 'password', '2024-09-10 00:00:00', 'undefined undefined', 'ADMIN', '');

-- --------------------------------------------------------

--
-- Table structure for table `inventory`
--

CREATE TABLE `inventory` (
  `OrderID` varchar(10) NOT NULL,
  `SupplierID` varchar(10) DEFAULT NULL,
  `Grams` int(11) DEFAULT NULL,
  `Category` varchar(50) DEFAULT NULL,
  `Price` decimal(10,2) DEFAULT NULL,
  `Amount` decimal(15,2) DEFAULT NULL,
  `Date` date DEFAULT NULL,
  `ModifiedBy` varchar(100) DEFAULT NULL,
  `DateModified` date DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inventory`
--

INSERT INTO `inventory` (`OrderID`, `SupplierID`, `Grams`, `Category`, `Price`, `Amount`, `Date`, `ModifiedBy`, `DateModified`) VALUES
('10172401', '9', 25, 'Pendant', 12.00, 12.00, '2024-10-16', '1', '2024-10-16'),
('10172402', '10', 12, 'Bangle', 12.00, 500.00, '2024-10-16', '1', '2024-10-16');

-- --------------------------------------------------------

--
-- Table structure for table `layaway`
--

CREATE TABLE `layaway` (
  `LayawayID` int(11) NOT NULL,
  `OrderID` int(11) NOT NULL,
  `CustomerID` int(11) NOT NULL,
  `CustomerName` varchar(255) NOT NULL,
  `Grams` float NOT NULL,
  `Category` varchar(255) NOT NULL,
  `Price` decimal(10,2) NOT NULL,
  `MonthsToPay` int(11) NOT NULL,
  `Start_Date` date NOT NULL,
  `Due_Date` date NOT NULL,
  `Downpayment` decimal(10,2) NOT NULL,
  `Amount_Paid` decimal(10,2) NOT NULL,
  `RemainingBal` decimal(10,2) NOT NULL,
  `Date_Modified` date NOT NULL DEFAULT current_timestamp(),
  `Payment_Proof` varchar(255) DEFAULT NULL,
  `Admin_Fname` varchar(255) NOT NULL,
  `ItemName` varchar(200) NOT NULL,
  `SupplierID` varchar(200) NOT NULL,
  `status` varchar(250) NOT NULL DEFAULT 'PARTIALLY_PAID'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `layaway`
--

INSERT INTO `layaway` (`LayawayID`, `OrderID`, `CustomerID`, `CustomerName`, `Grams`, `Category`, `Price`, `MonthsToPay`, `Start_Date`, `Due_Date`, `Downpayment`, `Amount_Paid`, `RemainingBal`, `Date_Modified`, `Payment_Proof`, `Admin_Fname`, `ItemName`, `SupplierID`, `status`) VALUES
(10172401, 10172401, 1, '', 20, 'Pendant', 7000.00, 1, '2024-10-17', '2024-11-17', 3500.00, 0.00, 0.00, '2024-10-17', NULL, '1', 'dresss', '9', 'PARTIALLY_PAID'),
(10172402, 10172402, 13, '', 800, 'Pendant', 8000.00, 2, '2024-10-17', '2024-12-17', 4000.00, 0.00, 0.00, '2024-10-17', NULL, '1', 'dress', '10', 'PARTIALLY_PAID'),
(10172403, 10172403, 12, '', 20, 'BRAND NEW', 7000.00, 1, '2024-10-17', '2024-11-17', 3500.00, 0.00, 0.00, '2024-10-17', NULL, '1', 'Dress', '9', 'PARTIALLY_PAID'),
(10172404, 10172404, 12, '', 10.5, 'BRAND NEW', 15000.00, 1, '2024-10-18', '2024-11-18', 2000.00, 0.00, 0.00, '2024-10-17', NULL, '1', 'Pendant', '9', 'PAID'),
(10172405, 10172405, 15, '', 12, 'BRAND NEW', 7000.00, 2, '2024-10-17', '2024-12-17', 3500.00, 0.00, 0.00, '2024-10-17', NULL, '1', 'dress', '10', 'PARTIALLY_PAID');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `layAwayID` varchar(250) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('GCash','BDO','BPI') NOT NULL,
  `payment_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `proof_of_payment` varchar(500) NOT NULL,
  `status` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `layAwayID`, `customer_id`, `amount`, `payment_method`, `payment_date`, `proof_of_payment`, `status`) VALUES
(24, '10172403', 12, 3500.00, '', '2024-10-17 11:54:52', '', ''),
(25, '10172404', 12, 2000.00, '', '2024-10-17 12:09:51', '', ''),
(26, '10172404', 12, 3000.00, 'GCash', '2024-10-17 12:11:17', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/layaway%2F10172404%2Fprof_of_payment%2FDALL%C3%82%C2%B7E%202024-10-13%2008.33.08%20-%20Create%20an%20image%20of%20a%20woven%20rattan%20bag%20inspired%20by%20the%20uploaded%20picture.%20The%20bag%20should%20have%20a%20rectangular%20shape%20with%20natural%20rattan%20material%20and%20dark%20.webp?alt=media&token=8fe11671-d1b3-472a-9d75-bafff88d0a6b', 'PARTIALLY_PAID'),
(27, '10172404', 12, 5000.00, 'GCash', '2024-10-17 12:12:00', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/layaway%2F10172404%2Fprof_of_payment%2F460315998_1852137431858624_5206102408811416762_n.jpg?alt=media&token=1c1713bd-e9e5-4d98-a78f-ced9ae00dcf3', 'PARTIALLY_PAID'),
(28, '10172404', 12, 5000.00, 'BDO', '2024-10-17 12:12:40', 'https://firebasestorage.googleapis.com/v0/b/avdeasis-4b5c7.appspot.com/o/layaway%2F10172404%2Fprof_of_payment%2FPicture1-removebg-preview.png?alt=media&token=a831ac01-cd9a-4800-9a3f-a0db9bbd4cef', 'PAID'),
(29, '10172405', 15, 3500.00, '', '2024-10-17 12:14:54', '', '');

-- --------------------------------------------------------

--
-- Table structure for table `supplier`
--

CREATE TABLE `supplier` (
  `SupplierID` int(11) NOT NULL,
  `SupplierName` varchar(255) NOT NULL,
  `PhoneNo` varchar(255) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `Admin_Fname` varchar(255) NOT NULL,
  `Added_By` varchar(255) NOT NULL,
  `Date_Modified` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `supplier`
--

INSERT INTO `supplier` (`SupplierID`, `SupplierName`, `PhoneNo`, `Email`, `Admin_Fname`, `Added_By`, `Date_Modified`) VALUES
(9, 'supplier 1', '0927547', 'dextermiranda441@gmail.com', 'Dex Miranda', '', '2024-08-03 00:00:00'),
(10, 'supplier 2', '09275474', 'supp2@gmail.com', 'Dex Miranda', '', '2024-08-03 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `supplier_payment`
--

CREATE TABLE `supplier_payment` (
  `PaymentID` int(11) NOT NULL,
  `SupplierID` int(11) NOT NULL,
  `OrderID` int(11) NOT NULL,
  `Date` date NOT NULL,
  `Payment_Status` varchar(255) NOT NULL,
  `Amount` decimal(10,2) NOT NULL,
  `Payment_Method` varchar(255) NOT NULL,
  `Added_By` varchar(255) NOT NULL,
  `Proof_Payment` varchar(255) DEFAULT NULL,
  `Admin_Fname` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `supplier_payment`
--

INSERT INTO `supplier_payment` (`PaymentID`, `SupplierID`, `OrderID`, `Date`, `Payment_Status`, `Amount`, `Payment_Method`, `Added_By`, `Proof_Payment`, `Admin_Fname`) VALUES
(45, 5, 1, '2024-08-02', 'PARTIALLY_PAID', 800.00, 'CASH', 'undefined', '448980290_477816194736293_3557413246480438827_n.jpg.png', 'Dexter Miranda'),
(46, 7, 1, '2024-08-05', 'PAID', 700.00, 'CASH', 'undefined', '448980290_477816194736293_3557413246480438827_n.jpg.png', 'Dexter Miranda'),
(47, 9, 1, '2024-08-03', 'PAID', 1000.00, 'CASH', 'undefined', 'Screenshot 2024-08-03 122710.jpg.png', 'Dex Miranda');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `uuid` varchar(500) NOT NULL,
  `TransactionID` int(11) NOT NULL,
  `CustomerID` int(11) NOT NULL,
  `SupplierID` int(11) NOT NULL,
  `Facebook` varchar(255) DEFAULT NULL,
  `Price` decimal(10,2) NOT NULL,
  `Category` varchar(255) NOT NULL,
  `Grams` float NOT NULL,
  `Date_Created` timestamp NOT NULL DEFAULT current_timestamp(),
  `Modified_By` varchar(255) DEFAULT NULL,
  `Status` varchar(255) NOT NULL,
  `ItemName` varchar(255) NOT NULL,
  `proof_of_payment` varchar(500) DEFAULT '',
  `admin_comments` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`uuid`, `TransactionID`, `CustomerID`, `SupplierID`, `Facebook`, `Price`, `Category`, `Grams`, `Date_Created`, `Modified_By`, `Status`, `ItemName`, `proof_of_payment`, `admin_comments`) VALUES
('10172401', 27, 12, 10, 'fb/mariel_pascual', 15000.00, 'SUBASTA', 50, '2024-10-17 11:56:09', '', 'IN_PROGRESS', 'Bags', '', '');

-- --------------------------------------------------------

--
-- Table structure for table `user_account`
--

CREATE TABLE `user_account` (
  `ID` int(11) NOT NULL,
  `email` varchar(250) NOT NULL,
  `Fname` varchar(255) NOT NULL,
  `Lname` varchar(255) NOT NULL,
  `DOB` date NOT NULL,
  `ContactNo` varchar(255) NOT NULL,
  `Username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_account`
--

INSERT INTO `user_account` (`ID`, `email`, `Fname`, `Lname`, `DOB`, `ContactNo`, `Username`, `password`, `role`) VALUES
(1, 'dextermiranda441@gmail.com', 'Dex', 'Miranda', '2024-06-28', '0927', 'admin', 'password', 'SUPER ADMIN');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cancelled_orders`
--
ALTER TABLE `cancelled_orders`
  ADD PRIMARY KEY (`CancelledOrderID`),
  ADD KEY `TransactionID` (`TransactionID`),
  ADD KEY `CustomerID` (`CustomerID`),
  ADD KEY `SupplierID` (`SupplierID`);

--
-- Indexes for table `customer_record`
--
ALTER TABLE `customer_record`
  ADD PRIMARY KEY (`CustomerID`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`EmployeeID`);

--
-- Indexes for table `inventory`
--
ALTER TABLE `inventory`
  ADD PRIMARY KEY (`OrderID`);

--
-- Indexes for table `layaway`
--
ALTER TABLE `layaway`
  ADD PRIMARY KEY (`LayawayID`),
  ADD KEY `OrderID` (`OrderID`),
  ADD KEY `CustomerID` (`CustomerID`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `supplier`
--
ALTER TABLE `supplier`
  ADD PRIMARY KEY (`SupplierID`);

--
-- Indexes for table `supplier_payment`
--
ALTER TABLE `supplier_payment`
  ADD PRIMARY KEY (`PaymentID`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`TransactionID`),
  ADD KEY `CustomerID` (`CustomerID`),
  ADD KEY `SupplierID` (`SupplierID`);

--
-- Indexes for table `user_account`
--
ALTER TABLE `user_account`
  ADD PRIMARY KEY (`ID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `customer_record`
--
ALTER TABLE `customer_record`
  MODIFY `CustomerID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `EmployeeID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `supplier`
--
ALTER TABLE `supplier`
  MODIFY `SupplierID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `supplier_payment`
--
ALTER TABLE `supplier_payment`
  MODIFY `PaymentID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `TransactionID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
