#coding=utf-8

import requests, json
import Query
class JsonParser:
	''' to get json from a remote url'''
	@staticmethod
	def initQueryFrom (url, params):
		return Query.Query (JsonParser.getRawJson(url, params), params)

	@staticmethod
	def getRawJson (url, params):
		try:
			jsonData = requests.get (url, params).json()
		except ValueError :
			return None
		else:
			return jsonData

'''
if __name__ ==  '__main__':
	myurls = "http://10.134.132.91/cgi-bin/mds_oss/cgi-bin/mds3_dis_query_status.cgi"
	myParams = {
			"file_name":"w00209q25a2.320070.4.mp4",
			"start_time":"20160717",
			"end_time":"20160717"
			}
	print JsonParser.getRawJson(myurls, myParams)
'''