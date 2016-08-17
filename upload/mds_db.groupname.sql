DROP TABLE IF EXISTS `mds3_ocgroup_name`;
CREATE TABLE `mds3_ocgroup_name` (
  `ocgroup_id` int(32) unsigned NOT NULL DEFAULT '0',
  `ocgroup_name` varchar(30) NOT NULL DEFAULT '',
  PRIMARY KEY (`ocgroup_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
LOCK TABLES `mds3_ocgroup_name` WRITE;
INSERT INTO `mds3_ocgroup_name` VALUES
('10L', "东部电信"),('11L', "东部电信2"),('12L', "北方电信"),('13L', "其他电信2"),
('14L', "其他电信3"),('15L', "南方电信1"),('16L', "南方电信2"),('17L', "南方电信3"),
('18L', "中部电信"),('19L', "其他电信"),
('101L', "北方联通2"),('102L', "东部联通"),('103L', "南方联通2"),('104L', "北方联通"),
('105L', "中部联通"),('106L', "东北联通2"),('107L', "北方联通"),
('1001L', "北方移动"),('1002L', "东部移动"),('1003L', "东南移动"),('1004L', "南方移动"),
('1005L', "西南移动"),('1006L', "其他移动"),
("10001L","东部长宽"),
("20001L","香港宽频");
UNLOCK TABLES;
