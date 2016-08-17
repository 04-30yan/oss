#coding=utf-8

import unicodeCast
import MySQLdb

class MDSDB:
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

    def __del__ (self) :
        if self.__conn != None:
            self.__conn.close ()

    #db operations

    def select (self, cmd) :
        cur = self.__conn.cursor()
        cur.execute (cmd)
        return cur.fetchall ()

    #db getter

        #group
    def getGroupIdList (self) :
        _rawMsg = self.select ("select distinct(ocgroup_id) from mds3_ocgroup_info")
        gidList = []
        for iGid in _rawMsg:
            gidList.append (iGid[0])
        #special for ungrouped ocs
        gidList.append (-1)
        return gidList

    def getGroupInfoByIdList (self, gidList) :
        '''{gid : { sum : oc total, count : oc in use, name : group name}}'''
        _res = {}
        for iGroupId in gidList:
            if iGroupId > 0:
                _res[iGroupId] = {}
                _rawMsg = self.select ("select count(oc_id) from mds3_ocgroup_info where ocgroup_id = %ld" % (iGroupId))
                _res[iGroupId]['sum'] = _rawMsg[0][0]
                _rawMsg = self.select ("select count(oc_id) from mds3_ocgroup_info where ocgroup_id = %ld and is_used = 1" % (iGroupId))
                _res[iGroupId]['count'] = _rawMsg[0][0]
                _rawMsg = self.select ("select ocgroup_name from mds3_ocgroup_name where ocgroup_id = %d" % (iGroupId))
                _res[iGroupId]['name'] = _rawMsg[0][0]
            else:
                _res[iGroupId] = {}
                _rawMsg = self.select ("select count(zone_id) from zone_info where zone_id not in (select oc_id from mds3_ocgroup_info)")
                _res[iGroupId]['sum'] = _rawMsg[0][0]
                _rawMsg = self.select ("select count(zone_id) from zone_info where zone_id not in (select oc_id from mds3_ocgroup_info) and is_used = 1")
                _res[iGroupId]['count'] = _rawMsg[0][0]
                _res[iGroupId]['name'] = u"未使用"
        return _res

    def getOCIdListByGroupIdList (self, gidList) :
        '''{gid : {priOCIds : [oc1, oc2], resOCIds : [oc3, oc4, ...]}}'''
        _res = {}
        for iGroupId in gidList:
            _res[iGroupId] = {"priOCIds" : [], "resOCIds" : []}
            if iGroupId > 0:
				_rawMsg = self.select ("select oc_id, oc_weight from mds3_ocgroup_info where ocgroup_id = %ld order by oc_weight desc limit 2"% (iGroupId))
				for _iRawMsg in _rawMsg :
					_res[iGroupId]["priOCIds"].append(_iRawMsg[0])

				_rawMsg = self.select ("select oc_id, oc_weight from mds3_ocgroup_info where ocgroup_id = %ld order by oc_weight desc"% (iGroupId))
				for _iRawMsg in _rawMsg :
					if _iRawMsg[0] not in _res[iGroupId]["priOCIds"]:
						_res[iGroupId]["resOCIds"].append(_iRawMsg[0])
            else:
                _rawMsg = self.select ("select zone_id from zone_info where zone_id not in (select oc_id from mds3_ocgroup_info)")
                for _iRawMsg in _rawMsg :
					_res[iGroupId]["resOCIds"].append(_iRawMsg[0])
        return _res

    def is_bigOC (self, ocidList) :
        '''{ocid : isbigOC}'''
        _res = {}
        for iOCId in ocidList:
            _res[iOCId] = (len(self.select ("select * from group_cover_info where group_id = %ld and zone_id = %d"  % (20002L, iOCId))) == 1);
        return _res

        #oc
    def getOCInfoByIdList (self, ocidList) :
        '''{ocid : {name : name, weight : weight, state : is_used, prior : is_bigOC}}'''
        _res = {}
        for iOCId in ocidList:
			_res[iOCId] = {}
			_rawMsg = self.select ("select area_name, is_used from zone_info where zone_id = %ld" % (iOCId))
			_res[iOCId]['area_name'] = _rawMsg[0][0]
			_res[iOCId]['state'] = _rawMsg[0][1]
			_res[iOCId]['weight'] = 0
			_rawMsg = self.select ("select oc_weight, is_used from mds3_ocgroup_info where oc_id = %ld" % (iOCId))
			if len(_rawMsg) == 1 :
				_res[iOCId]['weight'] = _rawMsg[0][0]
				_res[iOCId]['state'] = _rawMsg[0][1]
				_res[iOCId]['prior'] = self.is_bigOC ([iOCId])[iOCId]
        return _res

if __name__ == '__main__':
	testdb = MDSDB()
	print ">>1: show all group"
	gidList = testdb.getGroupIdList()
	print unicodeCast.unicodeCast (gidList)
	print ">>2: show all group info"
	gInfos = testdb.getGroupInfoByIdList(gidList)
	print unicodeCast.unicodeCast (gInfos)
	print ">>3: show all oc"
	ocIds = testdb.getOCIdListByGroupIdList(gidList)
	print unicodeCast.unicodeCast (ocIds)
	print ">>4: show all oc info"
	for iGroupId in gidList:
		print ">> group", iGroupId
		print unicodeCast.unicodeCast (testdb.getOCInfoByIdList(ocIds[iGroupId]['priOCIds']))
		print unicodeCast.unicodeCast (testdb.getOCInfoByIdList(ocIds[iGroupId]['resOCIds']))
