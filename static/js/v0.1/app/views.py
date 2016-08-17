#coding=utf-8
from django.shortcuts import render
from django.http import HttpResponse, Http404
from django.template import RequestContext, loader
from django.shortcuts import render_to_response
#from django.template.context_processors import csrf
import json
from file import File
from upload_form import Forms


# Create your views here.

def home (request):
    template = loader.get_template ("app/index.html")
    MODULES = ["Home", "Dispatch", "Allocate", "Download"]
    contexts = {"MODULES" : MODULES }
    return HttpResponse (template.render (contexts))

def index (request):
    template = loader.get_template ("app/index.html")
    return HttpResponse (template.render ())

def index1 (request):
    template = loader.get_template ("app/index1.html")
    return HttpResponse (template.render ())

def login (request):
    template = loader.get_template ("app/login.html")
    return HttpResponse (template.render ())

def data_visualization (request):
    template = loader.get_template ("app/data-visualization.html")
    return HttpResponse (template.render ())

def manage_users (request):
    template = loader.get_template ("app/manage-users.html")
    return HttpResponse (template.render ())

def maps (request):
    template = loader.get_template ("app/maps.html")
    return HttpResponse (template.render ())

def preferences (request):
    template = loader.get_template ("app/preferences.html")
    return HttpResponse (template.render ())


def map (request):
    template = loader.get_template ("app/map.html")
    return HttpResponse (template.render ())

def stellar (request):
    template = loader.get_template ("app/stellar.html")
    return HttpResponse (template.render ())

def options (request) :
    options = {}
    options['title'] = {"text":"test"}
    options['tooltip'] = {}
    options['legend'] = {"data":['sale']}
    options['xAxis'] = {'data':["1", "2", "3", "4", "5", "6"]}
    options['yAxis'] = {}
    options['series'] = [{'name':"sales", "type":"bar","data":[1, 2, 3, 4, 5, 6]}]
    return HttpResponse (json.dumps (options), content_type="application/json")

def mapOptions (request):
    region = request.GET.get ("region", "china");
    options = {}
    options['tooltip'] = {"triggle":"item", "formatter":"{b}"}
    options['series'] = [{"type":"map", "mapType":region, "selectedMode":"multiple", "label":{"normal":{"show":"true"}, "emphasis":{"show":"true"}}}]
    return HttpResponse (json.dumps (options), content_type="application/json")


def distribution_first (request):
    template = loader.get_template  ("app/ftp_distribution_upload_temp.html")
    return HttpResponse (template.render ())


def getContent (request) :
    contexts = {}
    subject = request.GET.get ("s")
    srcs = subject.split("_")
    if len(srcs) == 2:
        if srcs[1] == "distribution" :
            contexts["navigationTable"] = [
            ("platform=" + srcs[0] + "&service=" + srcs[1] + "&sub=upload", "id_" + subject + "_upload", subject + "_upload", "上传分发"),
            ("platform=" + srcs[0] + "&service=" + srcs[1] + "&sub=302", "id_" + subject + "_302", subject + "_302", "302补分发"),
            ("platform=" + srcs[0] + "&service=" + srcs[1] + "&sub=servicedriven", "id_" + subject + "_servicedriven", subject + "_servicedriven", "业务主动分发")]
        return HttpResponse (loader.get_template("app/navigationTabs.html").render(contexts))
    elif len(srcs) == 3 :
        if srcs[1] == "distribution" :
            if srcs[2] == "upload" :
                return HttpResponse (loader.get_template  ("app/ftp_distribution_upload.html").render())
            else:
                return HttpResponse ("123")
    elif len(srcs) == 4 :
        if srcs[1] == "distribution" :
            if srcs[2] == "upload" :
                if srcs[3] == "display" :
                    file_name = request.GET.get("file_name", "w00209q25a2.320070.4.mp4")
                    start_time = request.GET.get("start_time", "20160717")
                    end_time = request.GET.get("end_time", "20160717")
                    param = { "file_name":file_name, "start_time":start_time, "end_time":end_time }
                    file = File()
                    template = loader.get_template ("app/table.html")
                    contexts = { "tableLines" : file.get_file(param) }
                    return HttpResponse (template.render (contexts))




def fileStatus (request):
    file_name = request.GET.get("file_name", "w00209q25a2.320070.4.mp4")
    start_time = request.GET.get("start_time", "20160717")
    end_time = request.GET.get("end_time", "20160717")

    param = { "file_name":file_name, "start_time":start_time, "end_time":end_time }
    file = File()
    return HttpResponse (json.dumps (file.get_file(param)), content_type="application/json")
    #template = loader.get_template ("app/table1.html")
    #contexts = { "tableLines" : file.get_file(param) }
    #return HttpResponse (template.render (contexts))

def uploadFiles (request):
    params = []
    if request.method == 'POST':
        print "post"
        form = Forms(request.POST, request.FILES)
        print request.FILES
        if not form.is_valid():
            for chunk in (request.FILES['file']).chunks():
                arrays = chunk.split()
                for key in arrays:
                    params.append(key)

    print params
    return HttpResponse (json.dumps (params), content_type="application/json")

