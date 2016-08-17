#coding=utf-8

class MsgFailOC:
	def __init__ (self, rawMsg):
		self.__sArea				=	rawMsg['area']
		self.__iErrorCode			=	int(rawMsg['errcode'])
		self.__sOCid				=	rawMsg['oc_id']
		self.__sOCip				=	rawMsg['oc_ip']
	
	def toDict (self):
		return {\
				'area':self.__sArea,\
				'errorcode':self.parseErrorCode (),\
				'oc_id':self.__sOCid,\
				'oc_ip':self.__sOCip\
				}

	def parseErrorCode (self):
		errorPrefix = ""
		if self.__iErrorCode == 0 and self.__sOCip == "0.0.0.0":
			errorPrefix = "任务超时"
		elif self.__iErrorCode > -111000 and self.__iErrorCode <= -110500:
			errorPrefix = "模块TaskMaster出错"
		elif self.__iErrorCode > -112000 and self.__iErrorCode <= -111500:
			errorPrefix = "模块TaskGenerator出错"
		elif self.__iErrorCode > -113000 and self.__iErrorCode <= -112500:
			errorPrefix = "模块TaskCache出错"
		elif self.__iErrorCode > -114000 and self.__iErrorCode <= -113500:
			errorPrefix = "模块DataAgnet出错"
		else:
			errorPrefix = "未知错误"

		return errorPrefix + "(错误码:%d)" % self.__iErrorCode

class Query :
	'''query result representation'''
	def __init__ (self, rawJson):
		self.__isValid			=	True

		self.__iErrorNo			=	0
		self.__sError			=   "-"
		

		self.__sFileName		=	"-"
		self.__sTaskId			=	"-"
		self.__sFileSize		=	"-"
		self.__sHashValue		=	'-'
		self.__sDomain			=	"-"

		self.__sCreateTime		=	"-"
		self.__sStartTime		=	"-"
		self.__sOC1SuccessRate	=	"-"
		self.__sOC1Time			=	"-"
		self.__sOC1EndTime		=	"-"
		self.__sOC2SuccessRate	=	"-"
		self.__sOC2Time			=	"-"
		self.__sOC2EndTime		=	"-"

		self.__listFailedOCs	=	[]
		self.__sFailMsg			=	"-"	
		self.parse (rawJson)

	def parse (self, rawJson) :
		if rawJson == None:
			self.__iError = "网络故障";
			return

		self.__iErrorNo			=	int(rawJson['errno'])
		self.__sError			=	rawJson['error']
		__data					=	rawJson['data']
		if self.__iErrorNo == 0:
			if __data == None or len(__data) == 0:
				self.__sError = "检索失败:请检查输入数据!"
			else:
				__data						= __data[0]
				self.__sFileName			= __data['file_name']
				self.__sTaskId				= u"任务id: " + str(__data['task_id'])
				self.__sFileSize			= u"文件大小: " + __data['file_size']
				self.__sHashValue			= u"文件哈希值: " + __data['hash_value']
				self.__sDomain				= __data['domain']
				
				self.__sCreateTime			= __data['create_time']
				self.__sStartTime			= __data['start_time']
				self.__sOC1SuccessRate		= u"分发成功率: " + str(__data['success_rate_1st']) + "%"
				self.__sOC1EndTime			= __data['success_time_1st']
				self.__sOC1Time				= u"耗时: " + self.diffTime(__data['success_time_1st'], self.__sCreateTime)
				self.__sOC2SuccessRate		= u"分发成功率: " + str(__data['success_rate_2nd']) + "%"
				self.__sOC2EndTime			= __data['success_time_2nd']
				self.__sOC2Time				= u"耗时: " + self.diffTime(__data['success_time_2nd'], self.__sCreateTime)
				for iFailedOCRawMsg in __data['v_failed_oc_list'] :
					self.__listFailedOCs.append ( MsgFailOC(iFailedOCRawMsg).toDict() )
				self.__sFailMsg				= "分发失败OC总数: %d" % (len(self.__listFailedOCs))
		else:
			self.__sError = self.__sError + "(错误码: %d)" % (self.__iErrorNo)
	def toDict (self):
		return {\
			'file_name'         : self.__sFileName,\
			'task_id'           : self.__sTaskId,\
			'file_size'			: self.__sFileSize, \
			'hash_value'         : self.__sHashValue,\
			\
			'domain'            : self.__sDomain,\
			'create_time'       : self.__sCreateTime, \
			'start_time'        : self.__sStartTime, \
			'success_rate_1st'  : self.__sOC1SuccessRate, \
			'time_1st'			: self.__sOC1Time, \
			'success_time_1st'  : self.__sOC1EndTime, \
			'success_rate_2nd'  : self.__sOC2SuccessRate, \
			'time_2nd'			: self.__sOC2Time, \
			'success_time_2nd'  : self.__sOC2EndTime, \
			'failmsg'			: self.__sFailMsg, \
			'v_failed_oc_list'  : self.__listFailedOCs, \
			'error'				: self.__sError \
		}
	def diffTime (self, end, start) :
		return "0:0:0"
