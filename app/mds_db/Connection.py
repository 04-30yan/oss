#coding=utf-8

import MySQLdb
import random

def generate (area):
    areas = {\
        u"上海" : [121.4648,31.2891],  u"温州" : [120.498,27.8119],  \
        u"杭州" : [119.5313,29.8773],  u"南京" : [118.8062,31.9208],  \
        u"台州" : [121.1353,28.6688],  u"宜兴" : [119.82, 31.36],  \
        u"烟台" : [120.7397,37.5128],  u"常州" : [119.4543,31.5582],\
        u"苏州" : [120.6519,31.3989],  u"宁波" : [121.5967,29.6466],  \
        u"北京" : [116.4551,40.2539],  u"合肥" : [117.29,32.0581],  \
        u"南通" : [121.1023,32.1625],  u"哈尔" : [127.9688,45.368],  \
        u"无锡" : [120.3442,31.5527],  u"兰州" : [103.5901,36.3043],\
        u"济南" : [117.1582,36.8701],  u"廊坊" : [116.521,39.0509],  \
        u"西安" : [109.1162,34.2004],  u"青岛" : [120.4651,36.3373],  \
        u"石家" : [114.4995,38.1006],  u"乌鲁" : [87.9236,43.5883],  \
        u"大连" : [122.2229,39.4409],  u"太原" : [112.3352,37.9413],\
        u"泰安" : [117.0264,36.0516],  u"郑州" : [113.4668,34.6234], \
        u"昆明" : [102.9199,25.4663],  u"贵阳" : [106.6992,26.7682], \
        u"成都" : [103.9526,30.7617],  u"内江" : [105.04,29.59],\
        u"呼和" : [111.4124,40.4901],  u"重庆" : [107.7539,30.1904],\
        u"佛山" : [112.8955,23.1097],  u"广州" : [113.5107,23.2196],\
        u"深圳" : [114.5435,22.5439],  u"东莞" : [113.75,23.04],
        u"海口" : [110.3893,19.8516],  u"南宁" : [108.479,23.1152],
        u"珠海" : [113.7305,22.1155],  u"南昌" : [116.0046,28.6633],\
        u"潮州" : [116.63,23.68],  u"惠州" : [114.6204,23.1647],
        u"泉州" : [118.3228,25.1147],  u"厦门" :  [118.1689,24.6478],
        u"武汉" : [114.3896,30.6628],  u"娄底" : [111.96, 27.71],
        u"资阳" : [104.6, 30.19],  u"岳阳" : [113.09, 29.37],\
        u"长沙" : [113.0823,28.2568],  u"福州" : [119.4543,25.9222],
        u"长春" : [125.8154,44.2584],  u"荆州" : [112.23, 30.33],
        u"蚌埠" : [117.34,32.93],  u"九江" : [115.97,29.71],
        u"天津" : [117.4219,39.4189],  u"都江" : [103.62, 31.0],\
        u"绵阳" : [104.73, 31.48],  u"西宁" : [101.74,36.56],
        u"沈阳" : [123.1238,42.1216],  u"唐山" : [118.4766,39.6826],
        u"内蒙" : [123.70, 50.58],  u"保定" : [115.0488,39.0948],
        u"西藏" : [91.11, 29.97],  u"柳州" : [109.3799,24.9774],\
        u"淮南" : [117.0167, 32.65],  u"银川" : [106.3586,38.1775],
        u"香港" : [114.15, 22.15],\
    }
    base = areas[area[0:2]]
    sum = 0
    for i in area:
        if i.isalpha():
            sum += ord(i)
        elif i.isdigit() :
            sum += 10 * int(i)
    random.seed(sum)
    return [base[0] + random.randint(0, 1000) / 10000.0, base[1] + random.randint(0, 1000) / 10000.0]

class MDS_DB:
    def __init__ (self):
        self.__error = None
        self.__conn = None
        try :
            self.__conn = MySQLdb.connect (
                db      = "mds_db",
                user    = "root",
                passwd  = "root",
                host    = "localhost",
                charset = "utf8"
            )
        except Exception, ex :
            self.__error = "fail to connect mysql"
        finally:
            if self.__conn == None:
                self.__error = "wrong attibutes"

    def __del__ (self):
        if self.__conn != None:
            self.__conn.close ()

    def select (self, cmd):
        cur = self.__conn.cursor()
        cur.execute (cmd)
        return cur.fetchall ()

    #group
    def getGroupIdList (self):
        rawMsg = self.select ("select distinct(ocgroup_id) from mds3_ocgroup_info")
        idList = []
        for _id in rawMsg:
            idList.append (_id[0])
        #special : 大OC
        #idList.append(20002L)
        return idList

    def getGroupOptionById (self, ocgroup_id):
        ocList = {}
        geoCoordMap = {}
        for oc_id in self.getOCIdListByGroupId (ocgroup_id) :
            ocInfo = self.getOCInfoById (oc_id, ocgroup_id)
            _areaKey = ocInfo['area_name'][0:2]
            geoCoordMap[ocInfo['area_name']] = generate(ocInfo['area_name'])

        priOCIds = self.getPrimaryOCsIdByGroupId (ocgroup_id)
        resOCIds = self.getOCIdListByGroupId (ocgroup_id)
        for iOCId in priOCIds:
            resOCIds.remove (iOCId)

        PriData = []
        for iPriOCId in priOCIds:
            iPriOCInfo = self.getOCInfoById (iPriOCId, ocgroup_id)
            PriData.append([{"name":iPriOCInfo['area_name']}, {"name":iPriOCInfo['area_name'], "value":iPriOCInfo['weight']}])

        ResData = []
        for iPriOCId in priOCIds[0:1]:
            iPriOCInfo = self.getOCInfoById (iPriOCId, ocgroup_id)
            for iResOCId in resOCIds:
                iResOCInfo = self.getOCInfoById (iResOCId, ocgroup_id)
                ResData.append([{"name":iPriOCInfo['area_name']}, {"name":iResOCInfo['area_name'], "value":iResOCInfo['weight']}])


        return {\
            'geoCoordMap' : geoCoordMap,\
            'pridata' : PriData,\
            'resdata' : ResData,\
            }


    def getPrimaryOCsIdByGroupId (self, ocgroup_id) :
        primaryOCs = []
        rawMsg = self.select ("select oc_id, oc_weight from mds3_ocgroup_info where ocgroup_id = %ld order by oc_weight desc limit 2" % (ocgroup_id))
        for _id in rawMsg:
            primaryOCs.append (_id[0])
        return primaryOCs

    def getGroupNameByIdList (self, group_id_list) :
        res = {}
        for iGroupId in group_id_list :
            rawMsg = self.select ("select ocgroup_name from mds3_ocgroup_name where ocgroup_id = %d" % (iGroupId))
            res[iGroupId] =  rawMsg[0][0]
        return res

    def getGroupInfoByIdList (self, group_id_list) :
        res = {}
        for iGroupId in group_id_list :
            res[iGroupId] = {}
            rawMsg = self.select ("select count(oc_id) from mds3_ocgroup_info where ocgroup_id = %ld" % (iGroupId))
            res[iGroupId]['sum'] = rawMsg[0][0]
            rawMsg = self.select ("select count(oc_id) from mds3_ocgroup_info where ocgroup_id = %ld and is_used = 1" % (iGroupId))
            res[iGroupId]['count'] = rawMsg[0][0]
            res[iGroupId]['name'] = self.getGroupNameByIdList([iGroupId])[iGroupId]

        return res

    #zone/oc
    def getOCIdListByGroupId (self, ocgourp_id) :
        rawMsg = self.select ("select oc_id from mds3_ocgroup_info where ocgroup_id = %ld order by oc_id" % (ocgourp_id))
        ocIdList = []
        for _id in rawMsg:
            ocIdList.append (_id[0])
        return ocIdList

    def getOCInfoById (self, oc_id, ocgroup_id) :
        oc = {}
        rawMsg = self.select ("select area_name from zone_info where zone_id = %ld" % (oc_id))
        if len (rawMsg) == 1:
            oc['area_name'] = rawMsg[0][0]
        else :
            print "error in getOCInfoById"
        rawMsg = self.select ("select oc_weight, is_used, max_download_speed from mds3_ocgroup_info where oc_id = %ld" % (oc_id))
        if len (rawMsg) == 1:
            oc['weight'] = rawMsg[0][0]
            oc['is_used'] = rawMsg[0][1]
            oc['max_download_speed'] = rawMsg[0][2]

        oc['is_bigOC'] = self.is_bigOC (oc_id)
        return oc

    def is_bigOC (self, oc_id) :
        rawMsg = self.select ("select * from group_cover_info where group_id = %ld and zone_id = %d"  % (20002L, oc_id))
        return (len(rawMsg) == 1);

    #data_node
    def getDataNodeIpList (self):
        rawMsg = self.select ("select lan_ip from data_node_info")
        ipList = []
        for _lan_ip in rawMsg:
            ipList.append (_lan_ip[0])
        return ipList

    def getDataNodeIpListByZoneId (self, zone_id):
        rawMsg = self.select ("select lan_ip from data_node_info zone_id = %ld" % (zone_id))
        ipList = []
        for _lan_ip in rawMsg:
            ipList.append (_lan_ip[0])
        return ipList

    def getDataNodeInfoByIpList (self, lan_ip_list):
        res = {}
        for iLanIp in lan_ip_list:
            rawMsg = self.select ("select wan_ip, is_used from data_node_info where lan_ip = %ld" % (iLanIp))
            res[iLanIp] = {
                "wan_ip" : rawMsg[0][0],
                "is_used" : rawMsg[0][1],
            }
        return res

    def getDataNodeInfoByZoneId (self, zone_id):
        rawMsg = self.select ("select lan_ip, wan_ip, is_used from data_node_info where zone_id = %ld" % (zone_id))
        res = []
        for iRawMsg in rawMsg:
            res.append( {
                "lan_ip" : iRawMsg[0],
                "wan_ip" : iRawMsg[1],
                "is_used" : iRawMsg[2],
            })
        return res

if __name__ == '__main__' :
    testdb = MDS_DB ()
    print "#test1 : getDataNodeIpList"
    print testdb.getDataNodeIpList ()
    print "#test2 : getDataNodeIpListByZoneId"
    print testdb.getDataNodeIpListByZoneId (1)
    print "#test3 : getGroupIdList"
    print testdb.getGroupIdList ()
    print "#test4 : getOCIdListByGroupId"
    print "#test4 a getOCIdListByGroupId (10L)"
    print testdb.getOCIdListByGroupId (10L)
    print "#test4 b getOCIdListByGroupId (20002L)"
    print testdb.getOCIdListByGroupId (20002L)
    print "#test5 getOCInfoById"
    print "#test5 a getOCInfoById (gid=10L ocid=1L)"
    print testdb.getOCInfoById (1L, 10L)['area_name']
    print "#test6"
    area = [\
        u"上海",  u"温州",  u"杭州",  u"南京",  u"台州",  u"宜兴",  u"烟台",  u"常州",\
        u"苏州",  u"宁波",  u"北京",  u"合肥",  u"南通",  u"哈尔",  u"无锡",  u"兰州",\
        u"济南",  u"廊坊",  u"西安",  u"青岛",  u"石家",  u"乌鲁",  u"大连",  u"太原",\
        u"泰安",  u"郑州",  u"昆明",  u"贵阳",  u"成都",  u"内江",  u"呼和",  u"重庆",\
        u"佛山",  u"广州",  u"深圳",  u"东莞",  u"海口",  u"南宁",  u"珠海",  u"南昌",\
        u"潮州",  u"惠州",  u"泉州",  u"厦门",  u"武汉",  u"娄底",  u"资阳",  u"岳阳",\
        u"长沙",  u"福州",  u"长春",  u"荆州",  u"蚌埠",  u"九江",  u"天津",  u"都江",\
        u"绵阳",  u"西宁",  u"沈阳",  u"唐山",  u"内蒙",  u"保定",  u"西藏",  u"柳州",\
        u"淮南",  u"银川",  u"香港",\
    ]
    for iocgroup_id in testdb.getGroupIdList () :
        print "testing %d " % iocgroup_id
        areaMap = {}
        for oc_id in testdb.getOCIdListByGroupId (iocgroup_id) :
            _area = testdb.getOCInfoById (oc_id, iocgroup_id)['area_name'][0:2]
            if _area not in area:
                print "err"
            if _area not in areaMap.keys():
                areaMap[_area] = 1
            else:
                areaMap[_area] = areaMap[_area] + 1
        for iArea in areaMap.keys():
            print iArea, areaMap[iArea]
    print "#test7"
    gip = testdb.getGroupOptionById (15L)
    for i in gip.keys():
        print i, gip[i]
    print "#test8"
    priocs = testdb.getPrimaryOCsIdByGroupId (15L)
    for i in priocs:
        print "%d %s %d" % (i, testdb.getOCInfoById(i, 10L)["area_name"], testdb.getOCInfoById(i, 10L)["weight"])
