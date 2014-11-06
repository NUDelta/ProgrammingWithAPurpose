#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os, re
from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy
from flask import render_template, request, jsonify, make_response, Response, flash, redirect, session, url_for, g
from pwap import config
from pwap.models import Base, Element, Design, CodeSnippet
import cStringIO
from werkzeug import secure_filename
from werkzeug.datastructures import FileStorage

app = Flask(__name__)
app.config.from_object(config)

#lm = LoginManager()
#lm.init_app(app)

db = SQLAlchemy(app)
db.model = Base

@app.route('/learner/edit/<element_id>', methods=['GET'])
def learnerEditElement(element_id):
	element = db.session.query(Element).filter_by(id=element_id).first()
	return render_template('edit_element.html', element=element)

@app.route('/preview', methods=['GET'])
def preview():
    css = request.args.get('css', '')
    html = request.args.get('html', '')
    return render_template('preview.html', css=css, html=html)

@app.route('/learner/select', methods=['GET'])
def select():
	elements = db.session.query(Element)
	return render_template('learner_select.html', elements=elements)

@app.route('/upload', methods=['GET'])
def uploadForm():
    return render_template('uploadForm.html')

@app.route('/save/codesnippet', methods=['POST'])
def saveSnippet():
	html = request.form['html']
	css = request.form['css']
	element_id = request.form['elementID']

	newSnippet = CodeSnippet(element_id, html, css, 1)
	db.session.add(newSnippet)
	db.session.commit()

	return "Successfully saved snippet", 200

@app.route('/tmp', methods=['POST'])
def tmp():
	imgstr = re.search(r'base64,(.*)', request.form['file']).group(1)
	ext = re.search(r'data:image/(\w+)', request.form['file']).group(1)

	decoded_data = imgstr.decode('base64')
	file_data = cStringIO.StringIO(decoded_data)
	file = FileStorage(file_data, filename='screenshot.png') #TODO method for assigning file name

	if file: #and allowed_file(file.filename)
		filename = secure_filename(file.filename)
		file.save(os.path.join('./pwap/static/img/', filename))#app.config['UPLOAD_FOLDER']
	return "success", 200

@app.route('/landing')
def landing():
	return render_template('landing.html')