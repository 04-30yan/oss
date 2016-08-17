from django.conf.urls import url, include

from app import views

urlpatterns = [
	url (r"^map$", views.map, name="map"),
	url (r"^$", views.index, name="index"),
    url (r"^index1$", views.index1, name="index1"),
	url (r"^login$", views.login, name="login"),
	url (r"^data_visualization$", views.data_visualization, name="data_visualization"),
	url (r"^manage_users$", views.manage_users, name="manage_users"),
	url (r"^maps$", views.maps, name="maps"),
	url (r"^preferences$", views.preferences, name="preferences"),
	url (r"^map$", views.map, name="map"),
	url (r"^stellar$", views.stellar, name="stellar"),
    url (r"^getOptions$", views.options, name="options"),
    url (r"^getMapOptions$", views.mapOptions, name="mapOptions"),
    url (r"^getContent$", views.getContent, name="getContent"),
    url (r"^distribution_first$", views.distribution_first, name="distribution_first"),
    url (r"^getFileStatus$", views.fileStatus, name="fileStatus"),
    url (r"^uploadFiles$", views.uploadFiles, name="uploadFiles"),
]
