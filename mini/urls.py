from django.conf.urls import url, include
from mini import views

urlpatterns = [
	url (r"^$", views.index, name="mini_index"),
	url (r"^ftp_distribution_ocinfo_mapview$", views.ftp_distribution_ocinfo_mapview, name="mini_ftp_distribution_ocinfo_mapview"),
	url (r"^ftp_distribution_ocinfo_dragview$", views.ftp_distribution_ocinfo_dragview, name="mini_ftp_distribution_ocinfo_dragview"),
]
