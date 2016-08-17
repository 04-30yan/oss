#coding=utf-8
from django.shortcuts import render, render_to_response
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.template import RequestContext, loader
from django.shortcuts import render_to_response
import json
from app.models import SimpleResult
from django.db.models import Avg, Count, Min, Max
#utils
from Query import JsonParser, FileForm
from mds_db import Connection
import time

# Create your views here.

# service

def index (request):
	template = loader.get_template ("app/index.html");
	return HttpResponse (template.render())
# service_ftp
def ftp (request):
	template = loader.get_template ("app/developing.html");
	return HttpResponse (template.render())

def ftp_scenario (request):
	template = loader.get_template ("app/developing.html");
	return HttpResponse (template.render())

def ftp_express (request):
	template = loader.get_template ("app/developing.html");
	return HttpResponse (template.render())

def ftp_cdn (request):
	template = loader.get_template ("app/developing.html");
	return HttpResponse (template.render())

def ftp_distribution (request):
	template = loader.get_template ("app/developing.html");
	return HttpResponse (template.render())

def ftp_distribution_upload (request):
	template = loader.get_template ("app/ftp_distribution_upload.html");
	return HttpResponse (template.render())

def ftp_distribution_upload_getQueryStatus(request):
	file_name = request.GET.get ("file_name", "")
	start_time = request.GET.get ("start_time", "")
	end_time = request.GET.get ("end_time", "")
	url = "http://10.134.132.91/cgi-bin/mds_oss/cgi-bin/mds3_dis_query_status.cgi"
	params = {
			"file_name" : file_name,
			"start_time": start_time,
			"end_time" : end_time
	}

	json_data = JsonParser.JsonParser.initQueryFrom(url, params)
	return HttpResponse (json.dumps (json_data.toDict()), content_type="application/json")

def ftp_distribution_upload_getPage_raw (pageno, pages, taskid, sortKey):
	if pageno <= 0 or pageno > pages :
		raise Http404
	url = "http://10.134.132.91/cgi-bin/mds_oss/cgi-bin/mds3_dis_query_status.cgi"
	_lowerBound = (pageno - 1) * 10
	_upperBound = _lowerBound + 10
	if _upperBound > pages :
		_upperBound = pages
	# for fialCount field[without, asc, desc]
	# to extend this, add more state bits
	failCountBits = (sortKey / (2 ** 0)) % 3
	if failCountBits ==  0:
		_resultSet = SimpleResult.objects.filter(task_id = taskid).order_by("-isValid", "id")
	elif failCountBits ==  1:
		_resultSet = SimpleResult.objects.filter(task_id = taskid).order_by("-isValid", "failCount", "id")
	elif failCountBits ==  2:
		_resultSet = SimpleResult.objects.filter(task_id = taskid).order_by("-isValid", "-failCount", "id")
	else :
		raise Http404

	_result = []
	for iResult in _resultSet[_lowerBound: _upperBound]:
		_result.append(JsonParser.JsonParser.initQueryFrom(url, { \
				"file_name" : iResult.file_name, \
				"start_time": iResult.start_time, \
				"end_time"  : iResult.end_time }).toDict())
	return _result

def ftp_distribution_upload_getPage (request):
	pageno = request.GET.get ("pageno", -1)
	pages = request.GET.get ("pages", -1)
	taskId = request.GET.get ("taskid", -1)
	sortKey = request.GET.get ("sortKey", "-1")
	return HttpResponse(json.dumps (ftp_distribution_upload_getPage_raw (int(pageno),  int(pages), int(taskId), int(sortKey))), content_type="application/json")

def ftp_distribution_upload_upload (request) :
	start_time = request.GET.get ("start_time", "")
	end_time = request.GET.get ("end_time", "")
	url = "http://10.134.132.91/cgi-bin/mds_oss/cgi-bin/mds3_dis_query_status.cgi"
	queryCount = 0
	if request.method == "POST":
		_task_id = 0
		if SimpleResult.objects.aggregate (task_id_count = Count ('task_id'))['task_id_count'] != 0:
			_task_id = SimpleResult.objects.aggregate (task_id_max = Max ('task_id'))['task_id_max'] + 1
		fileForm = FileForm.Forms (request.POST, request.FILES)
		if not fileForm.is_valid ():
			for chunk in (request.FILES['file']).chunks():
				for iLine in chunk.split ("\n"):
					iParams = iLine.split()
					if len (iParams) > 0:
						#default args
						if len (iParams) < 3:
							iParams.append (start_time)
							iParams.append (end_time)
						#rs
						queryCount = queryCount + 1;
						#net ops
						json_data = JsonParser.JsonParser.getRawJson(url, {\
							"file_name" : iParams[0], \
							"start_time": iParams[1], \
							"end_time"  : iParams[2]  \
						})
						_iErrorNo		=	int(json_data['errno'])
						_sError			=	json_data['error']
						_data			=	json_data['data']
						_isValid		=	False
						_failCount		=	0
						if _iErrorNo == 0:
							if _data == None or len(_data) == 0:
								_isValid = True
							else :
								_failCount = len(_data[0]['v_failed_oc_list'])
						else:
							_isValid = True
						#db ops
						sr = SimpleResult (
							task_id			=	_task_id,
							file_name		=	iParams[0],
							start_time		=	iParams[1],
							end_time		=	iParams[2],
							isValid			=	_isValid,
							failCount		=   _failCount
						)

						sr.save ()

					else:
						#bad args
						pass
			return HttpResponse (json.dumps({"task_id":_task_id, "pages":queryCount}), content_type="application/json")
		else:
			raise Http404
	else:
		raise Http404

def ftp_distribution_upload_upload_test (request) :
	url = "http://10.134.132.91/cgi-bin/mds_oss/cgi-bin/mds3_dis_query_status.cgi"
	jsonList = []
	if request.method == "POST":
		fileForm = FileForm.Forms (request.POST, request.FILES)
		if not fileForm.is_valid ():
			for chunk in (request.FILES['file']).chunks():
				for iLine in chunk.split ("\n"):
					iParams = iLine.split()
					if len (iParams) == 3:
						json_data = JsonParser.JsonParser.initQueryFrom(url, {\
							"file_name" : iParams[0], \
							"start_time": iParams[1], \
							"end_time"  : iParams[2]  \
						})
						jsonList.append (json_data.toDict())
				else:
					pass
			return HttpResponse (json.dumps(jsonList), content_type="application/json")
		else:
			raise Http404
	else:
		raise Http404

def ftp_distribution_ocinfo_map (request):
	return render_to_response("app/developing.html", {})

def ftp_distribution_ocinfo_pie (request):
	return render_to_response("app/developing.html", {})

def ftp_distribution_ocinfo_table (request):
	gid = request.GET.get ("gid", "none")
	ocid = request.GET.get ("ocid", "none")

	mdsDB = Connection.MDS_DB ()

	title = u""
	nav = u""
	table = u""
	script = ""

	if gid == "none":
		raise Http404
	else:
		if ocid == "none":
			if gid == "all":
				title = u"所有OC组列表"
				nav = u"<a class='linker' href='javascript:void(0)' name='ftp_distribution_ocinfo_table?gid=all&ocid=all'><i class='fa fa-mail-forward fa-fw'></i></a>所有OC列表"
				table += u"<thead><tr><th>组id</th><th>组名称</th><th>oc数量(在用/总数)</th></thead><tbody>"
				script += "<script>\
	                $(document).ready (function () {\
	                    $('#id_table').dataTable({\
	                         'aaSorting': [[0, 'asc']]\
	                     });\
	                 });\
	             </script>"

				groupList = mdsDB.getGroupIdList ()
				groupInfos = mdsDB.getGroupInfoByIdList(groupList)
				for iGroupId in groupList:
					iGroupInfo = groupInfos[iGroupId]
					table += u" \
						<tr> \
							<td><a class='linker' href='javascript:void(0)' name='ftp_distribution_ocinfo_table?gid=%d&ocid=all'>%d</a></td>\
							<td>%s</td>\
							<td>%d/%d</td>"\
							% (iGroupId, iGroupId, iGroupInfo['name'], iGroupInfo['count'], iGroupInfo['sum'])
				table += "</tbody>"
			else:
				raise Http404
		elif ocid == "all":

			gidList = []

			if gid != "all":
				title = mdsDB.getGroupNameByIdList([int(gid)])[int(gid)] + u"组(组id: " +  str(int(gid)) + u")所有OC列表"
				nav = u"<a class='linker' href='javascript:void(0)' name='ftp_distribution_ocinfo_table?gid=all&ocid=all'><i class='fa fa-mail-reply fa-fw'></i></a>所有OC列表			\
						<a class='linker' href='javascript:void(0)' name='ftp_distribution_ocinfo_table?gid=all'><i class='fa fa-mail-reply fa-fw'></i></a>所有OC组列表"

				gidList.append (int(gid))
				chosenGroup = int(gid)
			else:
				title = u"所有OC列表"
				nav = u"<a class='linker' href='javascript:void(0)' name='ftp_distribution_ocinfo_table?gid=all'><i class='fa fa-mail-forward fa-fw'></i></a>所有OC组列表"

				gidList.extend (mdsDB.getGroupIdList ())

			table += u"<thead><tr><th>组id</th><th>组名称</th><th>oc id</th><th>oc名称</th><th>oc权重</th><th>状态</th><th>是否大OC</th></tr></thead><tbody>"

			script += "<script>\
                $(document).ready (function () {\
                    $('#id_table').dataTable({\
                         'aaSorting': [[0, 'asc'], [4, 'desc' ], [ 3, 'desc' ]]\
                     });\
                 });\
             </script>"

			for iGroupId in gidList:
				iOCIdList = mdsDB.getOCIdListByGroupId (iGroupId)
				for iOCId in iOCIdList:
					iOCInfo = mdsDB.getOCInfoById (iOCId, iGroupId)
					table += (u" \
					<tr> \
						<td><a class='linker' href='javascript:void(0)' name='ftp_distribution_ocinfo_table?gid=%d&ocid=all'>%d</a></td>\
						<td>%s</td>\
						<td><a class='linker' href='javascript:void(0)' name='ftp_distribution_ocinfo_table?gid=%d&ocid=%d'>%d</a></td>\
						<td>%s</a></td>\
						<td>%d</td> \
						<td>" +  (u"在用" if iOCInfo["is_used"] == 1 else u"停用") + u"</td> \
						<td>" +  (u"是" if iOCInfo["is_bigOC"] == 1 else u"否") + u"</td> \
						</tr>") % (iGroupId, iGroupId, \
						mdsDB.getGroupNameByIdList([iGroupId])[iGroupId], \
						iGroupId, iOCId, iOCId, \
						iOCInfo["area_name"], \
						iOCInfo["weight"]
						)
			table += u"</tbody>"

		else:
			groupName = mdsDB.getGroupNameByIdList ([int(gid)])[int(gid)]
			title = groupName + u"组(组id:" + gid + u") " + mdsDB.getOCInfoById(int(ocid), int(gid))['area_name'] + "(OCid:" + ocid + u")列表"
			nav = u"<a class='linker' href='javascript:void(0)' name='ftp_distribution_ocinfo_table?gid=all&ocid=all'><i class='fa fa-mail-reply fa-fw'></i></a>所有OC列表			\
					<a class='linker' href='javascript:void(0)' name='ftp_distribution_ocinfo_table?gid=all'><i class='fa fa-mail-reply fa-fw'></i></a>所有OC组列表			\
					<a class='linker' href='javascript:void(0)' name='ftp_distribution_ocinfo_table?gid=" + gid + u"&ocid=all'><i class='fa fa-mail-reply fa-fw'></i></a>" + groupName + u"组(组id: " +  gid + u") 所有OC列表"

			table += u"<thead>\<tr><th>内网ip</th><th>外网ip</th><th>状态</th></tr></thead><tbody>"

			script += "<script>\
                $(document).ready (function () {\
                    $('#id_table').dataTable({\
                         'aaSorting': [[ 2, 'desc' ], [0, 'asc']]\
                     });\
                 });\
             </script>"

			for iDataNodeInfo in mdsDB.getDataNodeInfoByZoneId (int(ocid)):
				table += u"<tr><td>%s</td><td>%s</td><td>%s</td></tr>" \
					% (	iDataNodeInfo["lan_ip"], \
						iDataNodeInfo["wan_ip"], \
						u"在用" if iDataNodeInfo["is_used"] == 1 else "停用")

			table += u"</tbody>"
	return render_to_response("app/ftp_distribution_ocinfo_table.html", { \
		"nav" : nav,\
		"table" : table,\
		'script' : script, \
		'title' : title, \
	})

def ftp_distribution_ocinfo (request):
	mdsDB = Connection.MDS_DB ()

	pridata = []
	resdata = []
	geoCoordMap = {}

	List = mdsDB.getGroupIdList()
	for iId in List:
		res = mdsDB.getGroupOptionById (iId)
		geoCoordMap.update(res["geoCoordMap"])
		pridata.append([str(iId), res["pridata"]])
		resdata.append([str(iId), res["resdata"]])

	#convert geoCoordMap
	geoCoordMapStr = "{"
	first = False
	for i in geoCoordMap.keys() :
		geoCoordMapStr += "'%s':%s," % (i, geoCoordMap[i])
	geoCoordMapStr += "}"

	##data
	#convert data
	priDataStr = "["

	for (iName, iData) in pridata:
		priDataStr += "["
		priDataStr += "'" + iName + "',"

		priDataStr += "["
		for iLine in iData:
			priDataStr += "["
			for iElement in iLine:
				priDataStr += '{'
				for iKey in iElement.keys():
					priDataStr += "%s:'%s'," % (iKey, iElement[iKey])
				priDataStr += "},"
			priDataStr += "],"
		priDataStr += "],"

		priDataStr += "],"
	priDataStr += "]"

	resDataStr = "["

	for (iName, iData) in resdata:
		resDataStr += "["
		resDataStr += "'" + iName + "',"

		resDataStr += "["
		for iLine in iData:
			resDataStr += "["
			for iElement in iLine:
				resDataStr += '{'
				for iKey in iElement.keys():
					resDataStr += "%s:'%s'," % (iKey, iElement[iKey])
				resDataStr += "},"
			resDataStr += "],"
		resDataStr += "],"

		resDataStr += "],"
	resDataStr += "]"


	#convert group name list
	ListStr = "["
	chosenGroupStr = ""
	group2urlMapStr = "{"
	ocname2urlMapStr = "{"
	for iGroupId in List:
		ListStr += u"'" + mdsDB.getGroupNameByIdList([iGroupId])[iGroupId] + u"(组id:%ld)'," % iGroupId
		chosenGroupStr += u"'" + mdsDB.getGroupNameByIdList([iGroupId])[iGroupId] + u"(组id:%ld)' : false," % iGroupId
		group2urlMapStr += u"'" + mdsDB.getGroupNameByIdList([iGroupId])[iGroupId] + u"(组id:%ld)' : 'ftp_distribution_upload_info?gid=%ld&ocid=all', " % (iGroupId , iGroupId )
		for iOCId in mdsDB.getOCIdListByGroupId (iGroupId):
			iOCInfo = mdsDB.getOCInfoById (iOCId, iGroupId)
			ocname2urlMapStr += "'%s' : 'ftp_distribution_upload_info?gid=%ld&ocid=%d', " % (iOCInfo['area_name'], iGroupId, iOCId)
	ListStr += "]"
	#chosenGroupStr += u"'" + mdsDB.getGroupNameByIdList([chosenGroup])[chosenGroup] + u"(组id:%ld)': true" % (chosenGroup)
	group2urlMapStr += "}"
	ocname2urlMapStr += "}"

	return render_to_response("app/ftp_distribution_ocinfo.html", {\
		"geoCoordMap" : geoCoordMapStr,\
		"resData" : resDataStr,\
		"priData" : priDataStr,\
		"List" : ListStr,\
		'ocname2urlMap' : ocname2urlMapStr,\
		'group2urlMap' : group2urlMapStr,\
	})

def ftp_distribution_upload_info (request):

	gid = request.GET.get ("gid", "none")
	ocid = request.GET.get ("ocid", "none")

	mdsDB = Connection.MDS_DB ()

	title = u""
	nav = u""
	table = u""
	script = ""
	chosenGroup = 10

	if gid == "none":
		raise Http404
	else:
		if ocid == "none":
			if gid == "all":
				title = u"所有OC组列表"
				nav = u"<a class='linker' href='javascript:void(0)' name='ftp_distribution_upload_info?gid=all&ocid=all'><i class='fa fa-mail-forward fa-fw'></i></a>所有OC列表"
				table += u"<thead><tr><th>组id</th><th>组名称</th><th>oc数量(在用/总数)</th></thead><tbody>"
				script += "<script>\
	                $(document).ready (function () {\
	                    $('#id_table').dataTable({\
	                         'aaSorting': [[0, 'asc']]\
	                     });\
	                 });\
	             </script>"

				groupList = mdsDB.getGroupIdList ()
				groupInfos = mdsDB.getGroupInfoByIdList(groupList)
				for iGroupId in groupList:
					iGroupInfo = groupInfos[iGroupId]
					table += u" \
						<tr> \
							<td><a class='linker' href='javascript:void(0)' name='ftp_distribution_upload_info?gid=%d&ocid=all'>%d</a></td>\
							<td>%s</td>\
							<td>%d/%d</td>"\
							% (iGroupId, iGroupId, iGroupInfo['name'], iGroupInfo['count'], iGroupInfo['sum'])
				table += "</tbody>"
			else:
				raise Http404
		elif ocid == "all":

			gidList = []

			if gid != "all":
				title = mdsDB.getGroupNameByIdList([int(gid)])[int(gid)] + u"组(组id: " +  str(int(gid)) + u")所有OC列表"
				nav = u"<a class='linker' href='javascript:void(0)' name='ftp_distribution_upload_info?gid=all&ocid=all'><i class='fa fa-mail-reply fa-fw'></i></a>所有OC列表			\
						<a class='linker' href='javascript:void(0)' name='ftp_distribution_upload_info?gid=all'><i class='fa fa-mail-reply fa-fw'></i></a>所有OC组列表"

				gidList.append (int(gid))
				chosenGroup = int(gid)
			else:
				title = u"所有OC列表"
				nav = u"<a class='linker' href='javascript:void(0)' name='ftp_distribution_upload_info?gid=all'><i class='fa fa-mail-forward fa-fw'></i></a>所有OC组列表"

				gidList.extend (mdsDB.getGroupIdList ())

			table += u"<thead><tr><th>组id</th><th>组名称</th><th>oc id</th><th>oc名称</th><th>oc权重</th><th>状态</th><th>是否大OC</th></tr></thead><tbody>"

			script += "<script>\
                $(document).ready (function () {\
                    $('#id_table').dataTable({\
                         'aaSorting': [[0, 'asc'], [4, 'desc' ], [ 3, 'desc' ]]\
                     });\
                 });\
             </script>"

			for iGroupId in gidList:
				iOCIdList = mdsDB.getOCIdListByGroupId (iGroupId)
				for iOCId in iOCIdList:
					iOCInfo = mdsDB.getOCInfoById (iOCId, iGroupId)
					table += (u" \
					<tr> \
						<td><a class='linker' href='javascript:void(0)' name='ftp_distribution_upload_info?gid=%d&ocid=all'>%d</a></td>\
						<td>%s</td>\
						<td><a class='linker' href='javascript:void(0)' name='ftp_distribution_upload_info?gid=%d&ocid=%d'>%d</a></td>\
						<td>%s</a></td>\
						<td>%d</td> \
						<td>" +  (u"在用" if iOCInfo["is_used"] == 1 else u"停用") + u"</td> \
						<td>" +  (u"是" if iOCInfo["is_bigOC"] == 1 else u"否") + u"</td> \
						</tr>") % (iGroupId, iGroupId, \
						mdsDB.getGroupNameByIdList([iGroupId])[iGroupId], \
						iGroupId, iOCId, iOCId, \
						iOCInfo["area_name"], \
						iOCInfo["weight"]
						)
			table += u"</tbody>"

		else:
			groupName = mdsDB.getGroupNameByIdList ([int(gid)])[int(gid)]
			title = groupName + u"组(组id:" + gid + u") " + mdsDB.getOCInfoById(int(ocid), int(gid))['area_name'] + "(OCid:" + ocid + u")列表"
			nav = u"<a class='linker' href='javascript:void(0)' name='ftp_distribution_upload_info?gid=all&ocid=all'><i class='fa fa-mail-reply fa-fw'></i></a>所有OC列表			\
					<a class='linker' href='javascript:void(0)' name='ftp_distribution_upload_info?gid=all'><i class='fa fa-mail-reply fa-fw'></i></a>所有OC组列表			\
					<a class='linker' href='javascript:void(0)' name='ftp_distribution_upload_info?gid=" + gid + u"&ocid=all'><i class='fa fa-mail-reply fa-fw'></i></a>" + groupName + u"组(组id: " +  gid + u") 所有OC列表"
			chosenGroup = int(gid)
			table += u"<thead>\<tr><th>内网ip</th><th>外网ip</th><th>状态</th></tr></thead><tbody>"

			script += "<script>\
                $(document).ready (function () {\
                    $('#id_table').dataTable({\
                         'aaSorting': [[ 2, 'desc' ], [0, 'asc']]\
                     });\
                 });\
             </script>"

			for iDataNodeInfo in mdsDB.getDataNodeInfoByZoneId (int(ocid)):
				table += u"<tr><td>%s</td><td>%s</td><td>%s</td></tr>" \
					% (	iDataNodeInfo["lan_ip"], \
						iDataNodeInfo["wan_ip"], \
						u"在用" if iDataNodeInfo["is_used"] == 1 else "停用")

			table += u"</tbody>"

	pridata = []
	resdata = []
	geoCoordMap = {}

	List = mdsDB.getGroupIdList()
	for iId in List:
		res = mdsDB.getGroupOptionById (iId)
		geoCoordMap.update(res["geoCoordMap"])
		pridata.append([str(iId), res["pridata"]])
		resdata.append([str(iId), res["resdata"]])

	#convert geoCoordMap
	geoCoordMapStr = "{"
	first = False
	for i in geoCoordMap.keys() :
		geoCoordMapStr += "'%s':%s," % (i, geoCoordMap[i])
	geoCoordMapStr += "}"

	##data
	#convert data
	priDataStr = "["

	for (iName, iData) in pridata:
		priDataStr += "["
		priDataStr += "'" + iName + "',"

		priDataStr += "["
		for iLine in iData:
			priDataStr += "["
			for iElement in iLine:
				priDataStr += '{'
				for iKey in iElement.keys():
					priDataStr += "%s:'%s'," % (iKey, iElement[iKey])
				priDataStr += "},"
			priDataStr += "],"
		priDataStr += "],"

		priDataStr += "],"
	priDataStr += "]"

	resDataStr = "["

	for (iName, iData) in resdata:
		resDataStr += "["
		resDataStr += "'" + iName + "',"

		resDataStr += "["
		for iLine in iData:
			resDataStr += "["
			for iElement in iLine:
				resDataStr += '{'
				for iKey in iElement.keys():
					resDataStr += "%s:'%s'," % (iKey, iElement[iKey])
				resDataStr += "},"
			resDataStr += "],"
		resDataStr += "],"

		resDataStr += "],"
	resDataStr += "]"


	#convert group name list
	ListStr = "["
	chosenGroupStr = ""
	group2urlMapStr = "{"
	ocname2urlMapStr = "{"
	for iGroupId in List:
		ListStr += u"'" + mdsDB.getGroupNameByIdList([iGroupId])[iGroupId] + u"(组id:%ld)'," % iGroupId
		chosenGroupStr += u"'" + mdsDB.getGroupNameByIdList([iGroupId])[iGroupId] + u"(组id:%ld)' : false," % iGroupId
		group2urlMapStr += u"'" + mdsDB.getGroupNameByIdList([iGroupId])[iGroupId] + u"(组id:%ld)' : 'ftp_distribution_upload_info?gid=%ld&ocid=all', " % (iGroupId , iGroupId )
		for iOCId in mdsDB.getOCIdListByGroupId (iGroupId):
			iOCInfo = mdsDB.getOCInfoById (iOCId, iGroupId)
			ocname2urlMapStr += "'%s' : 'ftp_distribution_upload_info?gid=%ld&ocid=%d', " % (iOCInfo['area_name'], iGroupId, iOCId)
	ListStr += "]"
	chosenGroupStr += u"'" + mdsDB.getGroupNameByIdList([chosenGroup])[chosenGroup] + u"(组id:%ld)': true" % (chosenGroup)
	group2urlMapStr += "}"
	ocname2urlMapStr += "}"

	return render_to_response("app/ftp_distribution_upload_info.html", {\
			"geoCoordMap" : geoCoordMapStr,\
			"resData" : resDataStr,\
			"priData" : priDataStr,\
			"List" : ListStr,\
			"nav" : nav,\
			"table" : table,\
			"chosenGroup" : chosenGroupStr,\
			'script' : script, \
			'title' : title, \
			'ocname2urlMap' : ocname2urlMapStr,\
			'group2urlMap' : group2urlMapStr,\
	})

def ftp_sourcestation (request):
	template = loader.get_template ("app/developing.html");
	return HttpResponse (template.render())

#service_ugc
def ugc (request):
	template = loader.get_template ("app/developing.html");
	return HttpResponse (template.render())

def ugc_scenario (request):
	template = loader.get_template ("app/developing.html");
	return HttpResponse (template.render())

def ugc_express (request):
	template = loader.get_template ("app/developing.html");
	return HttpResponse (template.render())

def ugc_cdn (request):
	template = loader.get_template ("app/developing.html");
	return HttpResponse (template.render())

def ugc_distribution (request):
	template = loader.get_template ("app/developing.html");
	return HttpResponse (template.render())

def ugc_distribution_upload (request):
	template = loader.get_template ("app/developing.html");
	return HttpResponse (template.render())

def ugc_sourcestation (request):
	template = loader.get_template ("app/developing.html");
	return HttpResponse (template.render())

# test

def getQueryStatus(request):
	file_name = request.GET.get ("file_name", "")
	start_time = request.GET.get ("start_time", "")
	end_time = request.GET.get ("end_time", "")
	url = "http://10.134.132.91/cgi-bin/mds_oss/cgi-bin/mds3_dis_query_status.cgi"
	params = {
			"file_name" : file_name,
			"start_time": start_time,
			"end_time" : end_time
	}

	json_data = JsonParser.JsonParser.getRawJson(url, params)
	return HttpResponse (str(json_data['data']) + "<p>#" + json_data['error']+"</p>")

# main
def mainDisplay (request):
	template = loader.get_template ("app/mainDisplay.html");
	return HttpResponse (template.render())

# proxy
def proxy (request) :
	url = request.GET.get ("url");
	if url == None :
		raise Http404
	else:
		template = loader.get_template ("app/proxy.html")
		return HttpResponse (template.render({"url" : url}));

# developing
def developing (request):
	template = loader.get_template ("app/developing.html");
	return HttpResponse (template.render())

# down_zxy

def test (request):
	template = loader.get_template ("app/test.html");
	return HttpResponse (template.render())

def test_proxy (request):
	url = request.GET.get ("url")
	params = request.GET.get ("params")
	template = loader.get_template ("app/test_proxy.html");
	return HttpResponse (template.render({"url":url, "params":params}))

def test_path (request):
	params = request.GET.get ("params", "empty")
	template = loader.get_template ("app/test_path.html");
	contexts = {}
	if params != "empty":
		id, name = params.split ("$")
		ids = id.split ("_")[1:]
		names = name.split ("_")
		if len (names) > 0 :
			contexts['mynav1st_id'] = "id_" + ids[0]
			contexts['mynav1st_name'] = names[0]
			contexts['mynav1st_realname'] = names[0]
		if len (names) > 1 :
			contexts['mynav2nd_id'] = "id_" + ids[0] + '_' + ids[1]
			contexts['mynav2nd_name'] = names[1]
			contexts['mynav2nd_realname'] = names[0] + '_' + names[1]
	return HttpResponse (template.render(contexts))

def test_empty (request):
	return HttpResponse ()

def test_main (request):
	params = request.GET.get ("params")
	if params == "empty":
		return HttpResponseRedirect ("test_empty")
	else:
		ids = params.split("_")[1:]
		if ids[0] == 'ftp':
			if ids[1] == 'distribution':
				template = loader.get_template ("app/test_main.html")
				contexts= {
					"nav" : [
					("分发进度查询", params + "_progressInfo"),
					("机房信息查询", params + "_hallInfo"),
					("后续开放", "empty")]
				}
				return HttpResponse (template.render (contexts))
			elif ids[1] == 'sourcestation':
				return HttpResponse ()
		elif ids[0] == 'ugc':
			return HttpResponse ()

def test_content (request):
	params = request.GET.get ("params")
	if params == "empty":
		return HttpResponseRedirect ("test_empty")
	else:
		ids = params.split("_")[1:]
		if ids[0] == 'ftp':
			if ids[1] == 'distribution':
				if ids[2] == 'progressInfo':
					template = loader.get_template ("app/ftp_distribution_upload.html")
					return HttpResponse (template.render ())
				else:
					return HttpResponse ()
			elif ids[1] == 'sourcestation':
				return HttpResponse ()
		elif ids[0] == 'ugc':
			return HttpResponse ()

#vid
def ftp_distribution_vid_get_filestatus(request):
    vid = request.GET.get("vid", "")
    otype = "json"
    start_time = request.GET.get("start_time", "")
    end_time = request.GET.get("end_time", "")

    url = "http://10.177.133.40:8095/getfileid"
    params = {
           "vid": vid,
           "otype": otype
    }
    json_data_file_list = JsonParser.JsonParser.getRawJson(url, params)
    iParams_list = json_data_file_list['data'][0]['Results'][0]['Fields']['viddata'][0]['fileids']
    queryCount = 0
    _task_id = 0
    if SimpleResult.objects.aggregate (task_id_count = Count ('task_id'))['task_id_count'] != 0:
	    _task_id = SimpleResult.objects.aggregate (task_id_max = Max ('task_id'))['task_id_max'] + 1
    for data in iParams_list:
    	iParams = []
        iParams.append(data)
        iParams.append(start_time)
        iParams.append(end_time)
        if len (iParams) > 0:
        	 #default args
            queryCount = queryCount + 1
            #iParams.append (time.strftime("%Y%m%d", time.localtime()))
            #status request
            url_status = "http://10.134.132.91/cgi-bin/mds_oss/cgi-bin/mds3_dis_query_status.cgi"
            json_data = JsonParser.JsonParser.getRawJson(url_status, {\
                               "file_name" : iParams[0], \
                               "start_time": iParams[1], \
                               "end_time"  : iParams[2]  \
            })
            _iErrorNo           =       int(json_data['errno'])
            _sError             =       json_data['error']
            _data               =       json_data['data']
            _isValid            =       False
            _failCount          =       0
            if _iErrorNo == 0:
                if _data == None or len(_data) == 0:
                    _isValid = True
                else :
                    _failCount = len(_data[0]['v_failed_oc_list'])
            else :
                _isValid = True
                        #db ops
            sr = SimpleResult (
                task_id                 =       _task_id,
                file_name               =       iParams[0],
                start_time              =       iParams[1],
                end_time                =       iParams[2],
                isValid                 =       _isValid,
                failCount               =   _failCount
            )

            sr.save ()
       	else:
            #bad args
            pass
    return HttpResponse (json.dumps({"task_id":_task_id, "pages":queryCount} ), content_type="application/json")
