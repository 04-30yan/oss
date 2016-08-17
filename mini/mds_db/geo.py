#coding=utf-8
import unicodeCast
import random

class Geo :
    def __init__ (self):
        self.__cityNameFirst22GeoMap = { \
            u"上海" : [121.4648,31.2891], \
            u"北京" : [116.4551,40.2539], \
            u"南京" : [118.8062,31.9208], \
            u"深圳" : [114.5435,22.5439], \
            u"香港" : [114.15, 22.15],    \
            u"测试" : [114.5435,22.5439], \
            u"郑州" : [113.4668,34.6234], \
            u"宁波" : [121.5967,29.6466], \
            u"长春" : [125.8154,44.2584], \
            u"广州" : [113.5107,23.2196], \
            u"济南" : [117.1582,36.8701], \
            u"成都" : [103.9526,30.7617], \
            u"沈阳" : [123.1238,42.1216], \
            u"石家" : [114.4995,38.1006], \
            u"南昌" : [116.0046,28.6633], \
            u"杭州" : [119.5313,29.8773], \
            u"珠海" : [113.7305,22.1155], \
            u"东莞" : [113.75,23.04],     \
            u"苏州" : [120.6519,31.3989], \
            u"西安" : [109.1162,34.2004], \
            u"泉州" : [118.3228,25.1147], \
            u"太原" : [112.3352,37.9413], \
            u"武汉" : [114.3896,30.6628], \
            u"永州" : [111.6187,26.4266], \
            u"重庆" : [107.7539,30.1904], \
            u"哈尔" : [127.9688,45.368], \
            u"昆明" : [102.9199,25.4663], \
            u"南宁" : [108.479,23.1152], \
            u"天津" : [117.4219,39.4189], \
            u"福州" : [119.4543,25.9222], \
            u"兰州" : [103.5901,36.3043], \
            u"宜兴" : [119.82, 31.36], \
            u"合肥" : [117.29,32.0581], \
            u"新疆" : [87.9236,43.5883], \
            u"娄底" : [111.96, 27.71], \
            u"岳阳" : [113.09, 29.37], \
            u"南通" : [121.1023,32.1625], \
            u"温州" : [120.498,27.8119],  \
            u"贵阳" : [106.6992,26.7682], \
            u"厦门" :  [118.1689,24.6478], \
            u"资阳" : [104.6, 30.19], \
            u"台州" : [121.1353,28.6688], \
            u"荆州" : [112.23, 30.33], \
            u"常州" : [119.4543,31.5582], \
            u"西藏" : [91.11, 29.97], \
            u"蚌埠" : [117.34,32.93], \
            u"都江" : [103.62, 31.0], \
            u"泰安" : [117.0264,36.0516], \
            u"银川" : [106.3586,38.1775],\
            u"马来" : [100.5436, 5.1245],\
            u"内江" : [105.04,29.59],\
            u"海口" : [110.3893,19.8516], \
            u"呼和" : [111.4124,40.4901], \
            u"大连" : [122.2229,39.4409], \
            u"泰国" : [100.31, 13.45], \
            u"烟台" : [120.7397,37.5128], \
            u"柳州" : [109.3799,24.9774],\
            u"西宁" : [101.74,36.56], \
            u"九江" : [115.97,29.71], \
            u"保定" : [115.0488,39.0948],\
            u"潮州" : [116.63,23.68], \
            u"惠州" : [114.6204,23.1647],\
            u"淮南" : [117.0167, 32.65],\
            u"无锡" : [120.3442,31.5527],\
            u"唐山" : [118.4766,39.6826], \
			u"佛山" : [113.0743,23.0139],\
			u"青岛" : [120.2322,36.0420],\
			u"廊坊" : [116.4125,393236],\
            u"乌鲁" : [87.9236,43.5883], \
            u"长沙" : [112.5643,28.142], \
            u"绵阳" : [104.4110,31.2824], \
            u"内蒙" : [111.4618,40.4923], \
        }

    def getGeoCoordByCityName (self, cityName) :
        _stdGeo = self.__cityNameFirst22GeoMap[cityName[0:2]]
        return [_stdGeo[0] + (random.random() * 100 + 30) / 1000.0, _stdGeo[1] + (random.random() * 100 + 30) / 1000.0]


    def getGeoCoordByCityNameList (self, ocnameList) :
        random.seed ()

        _res = {}
        for iOCName in ocnameList:
            _res[iOCName] = self.getGeoCoordByCityName (iOCName[0:2])

        return _res


if __name__ == '__main__' :
    geoHandler = Geo()
    print ">>Test 1"
    print unicodeCast.unicodeCast(geoHandler.getGeoCoordByCityNameList(
        [
            u'无锡电信VG1城域点OC1',
            u'兰州电信VG1城域点OC8',
            u'东莞电信VG1城域点OC4',
            u'唐山联通VG1城域点OC4',
            u'郑州电信VG1城域点OC5',
            u'重庆移动VG2城域点OC2',
            u'淮南移动VG1城域点OC5',
            u'淮南移动VG1城域点OC4',
            u'淮南移动VG1城域点OC3',
        ]
    ))
