#!/usr/bin/env python
# -*- coding: utf-8 -*- 

from flask import Flask
from flask import render_template, request, jsonify, make_response, Response, flash, redirect, session, url_for, g
from pwap import config
from flask.ext.pymongo import PyMongo

app = Flask(__name__)
app.config.from_object(config)

mongo = PyMongo(app, config_prefix='MONGO')

#lm = LoginManager()
#lm.init_app(app)


@app.route('/welcome', methods=['GET'])
def welcome():	
	return render_template('welcome.html')

@app.route('/learnerEdit', methods=['GET'])
def learnerEdit():
	return render_template('learnerEdit.html')

@app.route('/preview', methods=['GET'])
def preview():
    css = request.args.get('css', '')
    html = request.args.get('html', '')
    return render_template('preview.html', css=css, html=html)

@app.route('/learnerSelect', methods=['GET'])
def learnerSelect():
	return render_template('learnerSelect.html')

@app.route('/upload', methods=['GET'])
def uploadForm():
    return render_template('uploadForm.html')
