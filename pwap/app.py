#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os, re
from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.login import LoginManager
from flask.ext.login import login_required, login_user, current_user, logout_user
from flask import render_template, request, jsonify, make_response, Response, flash, redirect, session, url_for, g
from pwap import config
from pwap.models import Base, Element, Design, CodeSnippet, User
from forms import LoginForm, SignupForm
import cStringIO
import json
from werkzeug import secure_filename
from werkzeug.datastructures import FileStorage

app = Flask(__name__)
app.config.from_object(config)

db = SQLAlchemy(app)
db.model = Base

ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'])

lm = LoginManager()
lm.init_app(app)


@app.before_request
def before_request():
    g.user = current_user

@lm.user_loader
def load_user(id):
	return db.session.query(User).get(int(id))

@app.route('/login', methods = ['GET', 'POST'])
def login():
	if g.user is not None and g.user.is_authenticated():
		return redirect(url_for('select'))

	form = LoginForm() if request.method == 'POST' else LoginForm(request.args)
	if form.validate_on_submit():

		user = db.session.query(User).filter_by(name=form.username.data).filter_by(password=form.password.data).first()

		if user is None:
			flash('User does not exist, please register.')
			return redirect(url_for('signup'))

		login_user(user)
		flash(('Logged in successfully.'))
		return redirect(url_for('select'))
	return render_template('login.html', form=form)


@app.route('/signup', methods=['GET', 'POST'])
def signup():
	if g.user is not None and g.user.is_authenticated():
		return redirect(url_for('select'))

	form = SignupForm() if request.method == 'POST' else SignupForm(request.args)
	if form.validate_on_submit():

		user = db.session.query(User).filter_by(name=form.username.data).first()
		if user:
			flash(('Username already in use, please try again :('))
			return redirect(url_for('signup'))
		else:
			new_user = User(name=form.username.data, password=form.password.data, 
				email=form.email.data, scope=form.scope.data)
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
	print element.parent_id
	parent = db.session.query(Design).filter_by(id=element.parent_id).first()
	print parent
	return render_template('edit_element.html', element=element, design=parent)

@app.route('/preview', methods=['GET'])
def preview():
    css = request.args.get('css', '')
    html = request.args.get('html', '')
    return render_template('preview.html', css=css, html=html)


@app.route('/learner/select', methods=['GET'])
def select():
	elements = db.session.query(Element)
	return render_template('learner_select.html', elements=elements)

@app.route('/client/upload', methods=['GET'])
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

@app.route('/client/design', methods=['POST']) #change to client_save
def client_save():
	imgstr = re.search(r'base64,(.*)', request.form['file']).group(1)
	ext = re.search(r'data:image/(\w+)', request.form['file']).group(1)

	decoded_data = imgstr.decode('base64')
	file_data = cStringIO.StringIO(decoded_data)
	file = FileStorage(file_data, filename=generate_file_name(ext))

	if file and allowed_file(file.filename):
		filename = secure_filename(file.filename)
		file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
		new_design = Design(filename, 1)
		db.session.add(new_design)
		db.session.commit()

	elements = json.loads(request.form['parts'])
	for element in elements:
		new_element = Element(2, new_design.id, element[1], element[0], element[2], element[3])
		db.session.add(new_element)

	db.session.commit()
	return "success", 200

@app.route('/client/design/<design_id>', methods=['GET'])
def client_design_view(design_id):
	elements = db.session.query(Element).filter_by(parent_id=design_id)
	element_snippet = []
	for element in elements:
		code = db.session.query(CodeSnippet).filter_by(element_id=element.id).first()
		element_snippet.append((element,code))

	return render_template('design_view.html', element_snippet=element_snippet)


@app.route('/landing')
def landing():
	return render_template('landing.html')

@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('landing'))

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

def generate_file_name(extension):
	designs = db.session.query(Design).count()
	return "design_%s.%s" % (str(designs+1), extension)

@app.route('/client/home')
def clientHome():
	designs = db.session.query(Design).first()
	return render_template('client_home.html', designs=designs)

@app.route('/learner/home')
def learnerHome():
	return render_template('learner_home.html')

@app.route('/learner/modules')
def learnerModules():
	return render_template('learner_modules.html')
