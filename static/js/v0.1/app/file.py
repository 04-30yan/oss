#coding=utf-8

import requests
import json


class File:
	"""
	deal with one file or files
	"""
	def __init__(self):
		self.url = 'http://10.134.132.91/cgi-bin/mds_oss/cgi-bin/mds3_dis_query_status.cgi'

	def get_file(self, param):
		try:
			data_json = requests.get(self.url, param).json()#dict
		except ValueError:
			return None
		else:
		#raw = json.dumps(data_json)->str
			#print  data_json['errno']
			#print data_json['data'][0]['domain']
			return data_json
		#return self.json_dict(data_json)
'''
	def json_dict(self, data_json):
		if(isinstance(data_json, dict)):
			if not data_json:
				return None

			line = {"errno":}


				if(isinstance(data_json[key], list)):
					al_list = data_json[key]
					for al in al_list:
						line.extend(self.json_string(al))
				elif(isinstance(data_json[key], dict)):
					line.append(self.json_string(data_json[key]))
				else:
					if(isinstance(data_json[key], int)):
						line.append(str(data_json[key]))
					else:
						if data_json[key]:
							line.append(str(data_json[key].encode('utf-8')))

		return line
		'''





