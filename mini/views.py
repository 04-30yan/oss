#coding=utf-8
from django.shortcuts import render
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.template import RequestContext, loader
from django.shortcuts import render_to_response
import json
from django.db.models import Avg, Count, Min, Max
import random
#utils

from mds_db import mdsDB, geo, unicodeCast



def index (request) :
    template = loader.get_template ("mini/index.html")
    return HttpResponse (template.render ())

def ftp_distribution_ocinfo_mapview (request):
    template = loader.get_template ("mini/ftp_distribution_ocinfo_mapview.html")

    mds_db = mdsDB.MDSDB ()
    geoHandler = geo.Geo()

    gIdList = mds_db.getGroupIdList ()
    gInfos = mds_db.getGroupInfoByIdList(gIdList)
    ocIds = mds_db.getOCIdListByGroupIdList(gIdList)

    legendData = []
    geoCoordMap = {}
    priOCs = []
    resOCs = []
    nav = {}

    for iGroupId in gIdList:
        legendData.append (u"'" + gInfos[iGroupId]["name"] + u"'")
        nav[gInfos[iGroupId]["name"]] = []

        priOCs.append ([u"'" + gInfos[iGroupId]["name"] + u"'", []])
        ocInfos = mds_db.getOCInfoByIdList(ocIds[iGroupId]['priOCIds'])
        for iOCId in ocInfos.keys():
            iOCInfo = ocInfos[iOCId]
            if iOCInfo['state'] == 1:
                priOCs[-1][1].append ({u"name" : u"'" +  iOCInfo['area_name'] + "'", u"value": iOCInfo['weight']})
                geoCoordMap[u"'" + iOCInfo['area_name'] + u"'"] = geoHandler.getGeoCoordByCityNameList([iOCInfo['area_name']])[iOCInfo['area_name']]
                nav[gInfos[iGroupId]["name"]].append(iOCInfo['area_name'])
        resOCs.append ([u"'" + gInfos[iGroupId]["name"] + u"'", []])
        ocInfos = mds_db.getOCInfoByIdList(ocIds[iGroupId]['resOCIds'])
        for iOCId in ocInfos.keys():
            iOCInfo = ocInfos[iOCId]
            if iOCInfo['state'] == 1:
                resOCs[-1][1].append ({u"name" : u"'" +  iOCInfo['area_name'] + "'", u"value": iOCInfo['weight']})
                geoCoordMap[u"'" + iOCInfo['area_name'] + u"'"] = geoHandler.getGeoCoordByCityNameList([iOCInfo['area_name']])[iOCInfo['area_name']]
                nav[gInfos[iGroupId]["name"]].append(iOCInfo['area_name'])

    return HttpResponse (template.render ({\
        "nav" : nav,\
        "geoCoordMap" : unicodeCast.unicodeCast(geoCoordMap),\
        "legendData" : unicodeCast.unicodeCast(legendData),\
        "priOCs" : unicodeCast.unicodeCast(priOCs),\
        "resOCs" : unicodeCast.unicodeCast(resOCs), \
    }))

def ftp_distribution_ocinfo_dragview (request):
    template = loader.get_template ("mini/ftp_distribution_ocinfo_dragview.html")
    return HttpResponse (template.render ())
