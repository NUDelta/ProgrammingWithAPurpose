#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os, re
from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy
from flask import render_template, request, jsonify, make_response, Response, flash, redirect, session, url_for, g
from pwap import config
from pwap.models import Base, Element, Design, CodeSnippet
import cStringIO
import json
from werkzeug import secure_filename
from werkzeug.datastructures import FileStorage

app = Flask(__name__)
app.config.from_object(config)

#lm = LoginManager()
#lm.init_app(app)

db = SQLAlchemy(app)
db.model = Base

ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'])

#@app.route('/login', methods=['GET', 'POST']):

@app.route('/signup', methods=['GET', 'POST'])
def signup():
	if g.user is not None and g.user.is_authenticated():
		return "hi"

	return "yo"

@app.route('/signup', methods=['GET', 'POST'])
def signup():
	if g.user is not None and g.user.is_authenticated():
		return redirect(url_for('home'))

	form = LoginForm() if request.method == 'POST' else LoginForm(request.args)
	if form.validate_on_submit():

		user = db.session.query(User).filter_by(username=form.username.data).first()
		if user:
			flash(('Username already in use, please try again :('))
			return redirect(url_for('signup'))
		else:
			new_user = User(username=form.username.data, email=form.email.data)
			db.session.add(new_user)
			db.session.commit()
		flash(("Successfully registered! Please now login below!"))
		return redirect(url_for('login'))
	elif(form.errors):
		flash((form.errors))
	return render_template('signup.html', form=form)

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
def save_snippet():
	html = request.form['html']
	css = request.form['css']
	element_id = request.form['elementID']

	newSnippet = CodeSnippet(element_id, html, css, 1)
	db.session.add(newSnippet)
	db.session.commit()

	return "Successfully saved snippet", 200

@app.route('/tmp', methods=['POST']) #change to client_save
def client_save():
	imgstr = re.search(r'base64,(.*)', request.form['file']).group(1)
	ext = re.search(r'data:image/(\w+)', request.form['file']).group(1)

	decoded_data = imgstr.decode('base64')
	file_data = cStringIO.StringIO(decoded_data)
	file = FileStorage(file_data, filename=generate_file_name())

	if file and allowed_file(file.filename):
		filename = secure_filename(file.filename)
		file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
		new_design = Design(filename, 2)
		db.session.add(new_design)
		db.session.commit()

	elements = json.loads(request.form['parts'])
	for element in elements:
		new_element = Element(2, new_design.id, element[1], element[0], element[2], element[3])
		db.session.add(new_element)

	db.session.commit()
	return "success", 200

@app.route('/landing')
def landing():
	return render_template('landing.html')

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

def generate_file_name():
	designs = db.session.query(Design).count()
	return "design_%s.png" % str(designs+1)

@app.route('/client/home')
def clientHome():
	return render_template('client_home.html')
