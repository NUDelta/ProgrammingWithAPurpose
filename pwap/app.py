#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os, re, cStringIO, json, urllib, datetime
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

SURVEYS = [
	["1CL5N-S7LLrmdSzL4gniaglUwOrZthqBwW_v16w-Y7nI", "1DL3mdoz0BSy3MjBnGDIkpxJdBL-JAIR_2sY7IBSGKZc"],
	["1mQlm-LFXW7eFeAKmo-pMqFeZf_NpruiJoM1q_x1Nspc", "1vl7qmilek-2fK9p24YqEjonaseSukrQmj4y1Ta9VXSY"],
	["14sMRlJeEgTf7ug62PsS4zQN5Z1WIGTkOIiWgf7swuAw", "1bSogqn1LRzEKvj-GkR2NL93YJ0IFPwsBe6eUek8bR30"],
	["1fqCB4gWKydc8Zgi6D4AnwsSrjr9GeUZAbGi3PJc0RTQ", "1Dx9sIekHgxcy-dhgi5Eekp6kpY5w1_mEoMQ1N_B_yQk"],
	["1FXfqqL_bNZk9sVtypuJbXYfK7Hyc1zAQQSBWbzfRTNE", "1_TU-U98cnj8PLn0BKF3Tffe6yyJC30OVIE5orGxEtjk"],
	["1yq_xixCR7EaijxPytTo3Ypkb9WsFfgmgrpxiXUxgLq4", "1awOj61_kB4TCPUd5ZYBqJcKTl05P645MQXHLuYDOF9A"],
	["1AKZChVPThwtG93wXcXKypyDjDyIRHz78O5VSRHdyAPI", "1a_CbcAOQPvTnY7gngMyUKtZisXVkyXatOfrguN_Gifc"],
	["1qhaNfR_rtTu1OAzWrxORUL33c98a4_l6MqwOmua5lu0", "14J0M9AalGxR1VwzxDwCCxL3pMpkrl6WBs7d5Q5b8gfg"],
	["1qqKsNZ9BRaVL6COk3CSaIft76ADVZSMkSg6dQDvwTT4", "17mIWj68fEruO6DkQewMG9yXtfYScKrxu5NMoDduqa5k"],
	["1N9IbbUy3Ta9LDugaIctAu32Kj4f-doCAnLaJsP6vbgo", "1rjfDGuZgN9gjXm2VmQX4NwGJ2EBAk0zMe7VqG83R05Y"]
]

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
		if g.user.scope == 1:
			return redirect(url_for('learnerHome'))
		else:
			return redirect(url_for('clientHome'))

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

@app.route('/learner/home')
@login_required
def learnerHome():
	modules = db.session.query(LearningModule).all()

	modules_to_send = []
	completed = 0
	for module in modules:
		done = db.session.query(UserToModule).filter_by(module_id=module.id, user_id=g.user.id).all()
		if len(done) > 0:
			modules_to_send.append([module, 1])
			completed += 1
		else:
			modules_to_send.append([module, 0])

	if completed < 5:
		locked = 1
	else:
		locked = 0

	return render_template('learner_home.html', modules=modules_to_send, completed=completed, not_done=len(modules)-completed, locked=locked, surveys=SURVEYS[g.user.id % 10])

@app.route('/client/home')
@login_required
def clientHome():
	designs = db.session.query(Design)
	return render_template('client_home.html', designs=designs)

@app.route('/learner/modules/<module_id>')
@login_required
def modules(module_id):
	module = db.session.query(LearningModule).filter_by(id=module_id).first()
	tasks = db.session.query(LearningTask).filter_by(module_id=module_id).all()

	tasks_to_send = []
	for task in tasks:
		done = db.session.query(UserToTask).filter_by(task_id=task.id, user_id=g.user.id).all()
		if len(done) > 0:
			tasks_to_send.append([task, 1])
		else:
			tasks_to_send.append([task, 0])

	return render_template('learner_module.html', module=module, tasks=tasks_to_send)

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

		return jsonify(status='success', completed='false', tasks=[e.serialize() for e in test])
	else:
		new_module = UserToModule(module_id=task.module_id, user_id=g.user.id, time=100)
		db.session.add(new_module)
		db.session.commit()
		return jsonify(status='success', completed='true', tasks=[])

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
		new_element = Element(new_design.id, 2, element[1], element[0], element[2], element[3])
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
def logg():
	logs = json.loads(request.form['logs'])

	for i in logs:
		new_log = LearnerLogs(g.user.id, i['log_type'], i['content'], datetime.datetime.fromtimestamp(i['timestamp'] / 1e3))
		db.session.add(new_log)
		db.session.commit()

	return jsonify(status='success')

@app.route('/learner/log/view', methods = ['GET'])
@login_required
def logviewer():
	logs = db.session.query(LearnerLogs).all()
	return render_template('logs.html', logs=logs)

@app.route('/learner/log/<user_id>', methods=['GET'])
@login_required
def view_log_by_user(user_id):
	logs = db.session.query(LearnerLogs).filter_by(user_id=user_id).all()
	users = db.session.query(User).all()
	user = db.session.query(User).filter_by(id=user_id).first()
	snippets = db.session.query(CodeSnippet).filter_by(author_id=user_id).all()
	return render_template('log_user.html', logs=logs, users=users, user=user,snippets=snippets)

# Dummy route for testing the new collaborative interface
@app.route('/learner/collab')
def collab():
	return render_template('collab.html')

# Sandbox for making modules
@app.route('/learner/module_sandbox')
def sandbox():
	return render_template('module_sandbox.html')