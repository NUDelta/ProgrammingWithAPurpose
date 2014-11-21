#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os, re, cStringIO, json, urllib
from flask import Flask, render_template, request, jsonify, flash, redirect, url_for, g
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.login import LoginManager, login_required, login_user, current_user, logout_user
from pwap import config
from pwap.models import Base, Element, Design, CodeSnippet, User, LearningModule, LearningTask, Skills, SkillToModule, UserToModule, UserToTask, LearnerLogs
from forms import LoginForm, RegisterForm
from werkzeug import secure_filename
from werkzeug.datastructures import FileStorage
from subprocess import check_output

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

@lm.unauthorized_handler
def unauthorized():
	# do stuff
	return render_template('unauthorized.html')

@app.route('/', methods=['GET'])
def landing():
	return render_template('landing.html')

@app.route('/login', methods = ['GET', 'POST'])
def login():
	if g.user is not None and g.user.is_authenticated():
		return redirect(url_for('home'))

	if request.method == 'POST':
		if request.form['btn'] == 'Log In':
			login = LoginForm(request.form, prefix='login')
			register = RegisterForm(prefix='register')

			if login.validate():
				user = db.session.query(User).filter_by(
						name=login.username.data
					).filter_by(
						password=login.password.data
					).first()

				if user is None:
					flash('User does not exist, please register.')
					return redirect(url_for('login'))

				login_user(user)
				flash('Logged in successfully.')
				if user.scope == 1:
					return redirect(url_for('learnerHome'))
				else:
					return redirect(url_for('clientHome'))
		else:
			login = LoginForm(prefix='login')
			register = RegisterForm(request.form, prefix='register')

			if register.validate():
				user = db.session.query(User).filter_by(name=register.username.data).first()
				if user:
					flash('Username already in use, please try again :(')
					return redirect(url_for('login'))
				else:
					new_user = User(name=register.username.data, password=register.password.data,
						email=register.email.data, scope=register.scope.data)
					db.session.add(new_user)
					db.session.commit()
				flash("Successfully registered! Please now login below!")
				return redirect(url_for('login'))
	else:
		login = LoginForm(prefix='login')
		register = RegisterForm(prefix='register')

	return render_template('login.html', login=login, register=register)

@app.route('/logout')
def logout():
	logout_user()
	return redirect(url_for('landing'))

@app.route('/learner/edit/<element_id>', methods=['GET'])
@login_required
def learnerEditElement(element_id):
	element = db.session.query(Element).filter_by(id=element_id).first()
	parent = db.session.query(Design).filter_by(id=element.parent_id).first()
	return render_template('edit_element.html', element=element, design=parent)

@app.route('/preview', methods=['GET'])
def preview():
	css = request.args.get('css', '')
	html = request.args.get('html', '')
	return render_template('preview.html', css=css, html=html)

@app.route('/evaluate', methods=['GET'])
def evaluate():
	resp = check_output(['curl', 'http://127.0.0.1:3000/preview?opts=%s' % urllib.quote(request.args.get('opts', ''))])

	return resp, 200

@app.route('/learner/select', methods=['GET'])
@login_required
def select():
	elements = db.session.query(Element)
	return render_template('learner_select.html', elements=elements)

@app.route('/client/upload', methods=['GET'])
@login_required
def uploadForm():
	return render_template('uploadForm.html')

@app.route('/save/codesnippet', methods=['POST'])
@login_required
def save_snippet():
	html = request.form['html']
	css = request.form['css']
	element_id = request.form['elementID']

	newSnippet = CodeSnippet(element_id, html, css, g.user.id)
	db.session.add(newSnippet)
	db.session.commit()

	return "Successfully saved snippet", 200

@app.route('/client/design', methods=['POST'])
@login_required #change to client_save
def client_save():
	imgstr = re.search(r'base64,(.*)', request.form['file']).group(1)
	ext = re.search(r'data:image/(\w+)', request.form['file']).group(1)

	decoded_data = imgstr.decode('base64')
	file_data = cStringIO.StringIO(decoded_data)
	file = FileStorage(file_data, filename=generate_file_name(ext))

	if file and allowed_file(file.filename):
		filename = secure_filename(file.filename)
		file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
		new_design = Design(filename, g.user.id)
		db.session.add(new_design)
		db.session.commit()

	elements = json.loads(request.form['parts'])
	for element in elements:
		new_element = Element(2, new_design.id, element[1], element[0], element[2], element[3])
		db.session.add(new_element)

	db.session.commit()
	return "success", 200

@app.route('/client/design/<design_id>', methods=['GET'])
@login_required
def client_design_view(design_id):
	elements = db.session.query(Element).filter_by(parent_id=design_id)
	element_snippet = []
	for element in elements:
		code = db.session.query(CodeSnippet).filter_by(element_id=element.id).first()
		element_snippet.append((element,code))

	return render_template('design_view.html', element_snippet=element_snippet)

def allowed_file(filename):
	return '.' in filename and \
		   filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

def generate_file_name(extension):
	designs = db.session.query(Design).count()
	return "design_%s.%s" % (str(designs+1), extension)

@app.route('/client/home')
@login_required
def clientHome():
	designs = db.session.query(Design)
	return render_template('client_home.html', designs=designs)

@app.route('/learner/home')
@login_required
def learnerHome():
	module = db.session.query(LearningModule)
	return render_template('learner_home.html', modules=module)

@app.route('/learner/modules')
@login_required
def learnerModules():
	return render_template('learner_modules.html')

@app.route('/learner/modules/<module_id>')
@login_required
def modules(module_id):
	module = db.session.query(LearningModule).filter_by(id=module_id).first()
	tasks = db.session.query(LearningTask).filter_by(module_id=module_id)
	return render_template('learner_module.html', module=module, tasks=tasks)

@app.route('/learner/task/<task_id>', methods = ['POST'])
@login_required
def task_complete(task_id):
	time = request.form['time']
	exists = db.session.query(UserToTask).filter_by(user_id=g.user.id).filter_by(task_id=task_id).count()
	if exists > 0:
		return jsonify(status='failure')

	new_task = UserToTask(task_id=task_id, user_id=g.user.id, time=time)
	db.session.add(new_task)
	db.session.commit()

	task = db.session.query(LearningTask).filter_by(id=task_id).first()
	total_tasks = db.session.query(LearningTask).filter_by(module_id=task.module_id).all()
	user_tasks = db.session.query(UserToTask).filter_by(user_id=g.user.id).all()
	if len(user_tasks) < len(total_tasks):

		test = list(set(total_tasks) - set(user_tasks))
		print test

		return jsonify(completed='false', tasks=[e.serialize() for e in test])
	else:
		new_module = UserToModule(module_id=task.module_id, user_id=g.user.id, time=100)
		db.session.add(new_module)
		db.session.commit()
		return jsonify(completed='true', tasks=[])


# temporary routes to add modules and tasks
@app.route('/add/module', methods = ['GET', 'POST'])
def add_module():
	if request.method == 'POST':
		new_module = LearningModule(title=request.form['title'], description=request.form['description'], intro=request.form['intro'])
		db.session.add(new_module)
		db.session.commit()
		return jsonify(status='success')
	else:
		modules = db.session.query(LearningModule)
		return render_template('add_module.html', modules=modules)

@app.route('/add/task/<module_id>', methods = ['GET', 'POST'])
def add_task(module_id):
	if request.method == 'POST':
		new_task = LearningTask(module_id=module_id, HTML=request.form['HTML'], starterCSS=request.form['starterCSS'], answer=request.form['answer'], hints=request.form['hints'], task_description=request.form['task_description'])
		db.session.add(new_task)
		db.session.commit()
		return jsonify(status='success')
	else:
		tasks = db.session.query(LearningTask).filter_by(module_id=module_id)
		return render_template('add_task.html', tasks=tasks, module_id=module_id)

@app.route('/learner/log', methods = ['POST'])
@login_required
def log():
	logs = json.loads(request.form['logs'])
	for i in logs:
		new_log = LearnerLogs(g.user.id, i.log_type, i.content, i.timestamp)
		db.session.add(new_log)
		db.session.commit()

	return jsonify(status='success')

# Sandbox for making modules
@app.route('/learner/module_sandbox')
def sandbox():
	return render_template('module_sandbox.html')

