#coding=utf-8
from django.conf.urls import url, include
from app import views

urlpatterns = [
	url (r"^$", views.test, name="app_test"),
	url (r"^getQueryStatus$", views.getQueryStatus, name="app_getQueryStatus"),
	url (r"^mainDisplay$", views.mainDisplay, name="app_mainDisplay"),
	url (r"^proxy$", views.proxy, name="proxy"),
	url (r"^ftp$", views.ftp, name="app_ftp"),
	url (r"^ftp_scenario$", views.ftp_scenario, name="app_ftp_scenario"),
	url (r"^ftp_express$", views.ftp_express, name="app_ftp_express"),
	url (r"^ftp_cdn$", views.ftp_cdn, name="app_ftp_cdn"),
	url (r"^ftp_distribution$", views.ftp_distribution, name="app_ftp_distribution"),
	url (r"^ftp_distribution_upload$", views.ftp_distribution_upload, name="app_ftp_distribution_upload"),
	url (r"^ftp_distribution_upload_getQueryStatus$", views.ftp_distribution_upload_getQueryStatus, name="app_ftp_distribution_upload_getQueryStatus"),
	url (r"^ftp_distribution_upload_getPage$", views.ftp_distribution_upload_getPage, name="app_ftp_distribution_upload_getPage"),
	url (r"^ftp_distribution_upload_upload$", views.ftp_distribution_upload_upload, name="app_ftp_distribution_upload_upload"),

	url (r"^ftp_distribution_ocinfo$", views.ftp_distribution_ocinfo, name="ftp_distribution_ocinfo"),
	url (r"^ftp_distribution_ocinfo_map$", views.ftp_distribution_ocinfo_map, name="ftp_distribution_ocinfo_map"),
	url (r"^ftp_distribution_ocinfo_pie$", views.ftp_distribution_ocinfo_pie, name="ftp_distribution_ocinfo_pie"),
	url (r"^ftp_distribution_ocinfo_table$", views.ftp_distribution_ocinfo_table, name="ftp_distribution_ocinfo_table"),

	url (r"^ftp_distribution_upload_info$", views.ftp_distribution_upload_info, name="app_ftp_distribution_upload_info"),
	url (r"^ftp_sourcestation$", views.ftp_sourcestation, name="app_ftp_sourcestation"),
	url (r"^ugc$", views.ugc, name="app_ugc"),
	url (r"^ugc_scenario$", views.ugc_scenario, name="app_ugc_scenario"),
	url (r"^ugc_express$", views.ugc_express, name="app_ugc_express"),
	url (r"^ugc_cdn$", views.ugc_cdn, name="app_ugc_cdn"),
	url (r"^ugc_distribution$", views.ugc_distribution, name="app_ugc_distribution"),
	url (r"^ugc_distribution_upload$", views.ugc_distribution_upload, name="app_ugc_distribution_upload"),
	url (r"^ugc_sourcestation$", views.ugc_sourcestation, name="app_ugc_sourcestation"),
	url (r"^developing$", views.developing, name="developing"),
# down_zxy
	url (r"^test$", views.test, name="test"),
	url (r"^test_proxy$", views.test_proxy, name="test_proxy"),
	url (r"^test_path$", views.test_path, name="test_path"),
	url (r"^test_empty$", views.test_empty, name="test_empty"),
	url (r"^test_main$", views.test_main, name="test_main"),
	url (r"^test_content$", views.test_content, name="test_content"),

#vid
 url (r"^ftp_distribution_vid_get_filestatus$", views.ftp_distribution_vid_get_filestatus, name="ftp_distribution_vid_get_filestatus"),


]
