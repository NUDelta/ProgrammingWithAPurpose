#!/usr/bin/env python
# -*- coding: utf-8 -*- 

from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy
from flask import render_template, request, jsonify, make_response, Response, flash, redirect, session, url_for, g
from pwap import config
from pwap.models import Base, Element, Design, CodeSnippet
from flask.ext.pymongo import PyMongo

app = Flask(__name__)
app.config.from_object(config)

#mongo = PyMongo(app, config_prefix='MONGO')

#lm = LoginManager()
#lm.init_app(app)

db = SQLAlchemy(app)
db.model = Base


@app.route('/welcome', methods=['GET'])
def welcome():	
	return render_template('welcome.html')

@app.route('/learnerEdit', methods=['GET'])
def learnerEdit():
	return render_template('learnerEdit.html')


@app.route('/learner/edit/<element_id>', methods=['GET'])
def learnerEditElement(element_id):
	element = db.session.query(Element).filter_by(id=element_id).first()
	return render_template('edit_element.html', element=element)

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
