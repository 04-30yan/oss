#coding=utf-8

from datetime import datetime


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
	def __init__ (self, rawJson, user_input_params):
		self.__iErrorNo			=	0
		self.__sError			=   "-"


		self.__sFileName		=	user_input_params['file_name']
		self.__sTaskId			=	"-"
		self.__sFileSize		=	"-"
		self.__sHashValue		=	'-'
		self.__sDomain			=	"-"

		self.__sCreateTime		=	"-"
		self.__sStartTime		=	"-"
		self.__sOC1SuccessRate	=	"-"
		self.__sOC1SuccessRateMax	=	"-"
		self.__sOC1Time			=	"-"
		self.__sOC1EndTime		=	"-"
		self.__sOC2SuccessRate	=	"-"
		self.__sOC2SuccessRateMax	=	"-"
		self.__sOC2Time			=	"-"
		self.__sOC2EndTime		=	"-"

		self.__listFailedOCs	=	[]
		self.__sFailMsg			=	"-"
		self.parse (rawJson, user_input_params)

	def parse (self, rawJson, user_input_params) :
		if rawJson == None:
			self.__iError 		= "网络故障";
			return

		self.__iErrorNo			=	int(rawJson['errno'])
		self.__sError			=	rawJson['error']
		__data					=	rawJson['data']
		if self.__iErrorNo == 0:
			if __data == None or len(__data) == 0:  
				self.__bHasError	= True
				self.__sError  		= u"检索失败:请检查输入数据!"
				self.__sError +=  u"分发数据库中并无此文件名"
			else:
				i = 1
				__data_i						= __data[0]    
				self.__sOC1SuccessRateMax		= str(__data_i['success_rate_1st'])
				self.__sOC2SuccessRateMax		= str(__data_i['success_rate_2nd'])
				while i < len(__data):
					if __data_i['create_time'] > __data[i]['create_time']:
					    __data_i = __data[i]
                                        if self.__sOC1SuccessRateMax < str(__data[i]['success_rate_1st']):
                                            self.__sOC1SuccessRateMax = str(__data[i]['success_rate_1st'])
                                        if self.__sOC2SuccessRateMax < str(__data[i]['success_rate_2nd']):
                                            self.__sOC2SuccessRateMax = str(__data[i]['success_rate_2nd'])
                                        i =  i +1 
                    

				self.__sFileName			= __data_i['file_name']
				self.__sTaskId				= str(__data_i['task_id'])
				self.__sFileSize			= __data_i['file_size']
				self.__sHashValue			= __data_i['hash_value']
				self.__sDomain				= __data_i['domain']

				self.__sCreateTime			= __data_i['create_time']
				self.__sStartTime			= __data_i['start_time']
				self.__sOC1SuccessRate		= str(__data_i['success_rate_1st'])
				self.__sOC1EndTime			= __data_i['success_time_1st']
				if self.__sOC1EndTime == "1970-01-01 00:00:00":
					self.__sOC1Time = u"分发未完成"
				else:
				    self.__sOC1Time				= u"分发耗时: " + self.diffTime(__data_i['success_time_1st'], self.__sCreateTime)
				self.__sOC2SuccessRate		= str(__data_i['success_rate_2nd'])
				self.__sOC2EndTime			= __data_i['success_time_2nd']
				if self.__sOC2EndTime == "1970-01-01 00:00:00":
					self.__sOC2Time = u"分发未完成"
				else:
				    self.__sOC2Time				= u"分发耗时: " + self.diffTime(__data_i['success_time_2nd'], self.__sCreateTime)
				if 'v_failed_oc_list' in __data_i.keys () :
					for iFailedOCRawMsg in __data_i['v_failed_oc_list'] :
						self.__listFailedOCs.append ( MsgFailOC(iFailedOCRawMsg).toDict() )
				self.__sFailMsg				= "分发失败的OC个数：%d" % (len(self.__listFailedOCs))
		else:
			self.__sError 		= self.__sError + "(错误码: %d)" % (self.__iErrorNo)

	def toDict (self):
		return {\
			'file_name'         : self.__sFileName,\
			'task_id'           : self.__sTaskId,\
			'file_size'			: self.__sFileSize, \
			'hash_value'        : self.__sHashValue,\
			\
			'domain'            : self.__sDomain,\
			'create_time'       : self.__sCreateTime, \
			'start_time'        : self.__sStartTime, \
			'success_rate_1st'  : self.__sOC1SuccessRate, \
			'success_rate_1st_max'  : self.__sOC1SuccessRateMax, \
			'time_1st'			: self.__sOC1Time, \
			'success_time_1st'  : self.__sOC1EndTime, \
			'success_rate_2nd'  : self.__sOC2SuccessRate, \
			'success_rate_2nd_max'  : self.__sOC2SuccessRateMax, \
			'time_2nd'			: self.__sOC2Time, \
			'success_time_2nd'  : self.__sOC2EndTime, \
			'failmsg'			: self.__sFailMsg, \
			'v_failed_oc_list'  : self.__listFailedOCs, \
			'error'				: self.__sError \
		}


	def diffTime (self, end, start) :
		_e = datetime.strptime (end, "%Y-%m-%d %H:%M:%S")	
		_s = datetime.strptime (start, "%Y-%m-%d %H:%M:%S")
		_diff = _e - _s
		_expr = ""

		if _diff.days != 0:
			_expr += unicode(_diff.days) + u"天"
		if _diff.seconds >= 3600:
			_expr += unicode(_diff.seconds / 3600) + u"小时"
		_expr += unicode(_diff.seconds % 3600) + u"秒"
		return _expr

	def hasError (self):
		return self.__hasError;
