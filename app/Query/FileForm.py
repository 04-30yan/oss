#coding = utf-8

from django import forms

class Forms(forms.Form):
	title = forms.CharField(max_length = 64)
	file = forms.FileField()
