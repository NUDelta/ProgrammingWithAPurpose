from flask.ext.wtf import Form
from wtforms import TextField, PasswordField, RadioField
from wtforms.validators import Required, EqualTo

# temporary form - will set this up for our needs though
class LoginForm(Form):
	username = TextField('username', validators = [Required()])
	password = PasswordField('password', validators = [Required()])

class RegisterForm(Form):
	username = TextField('username', validators = [Required()])
	email = TextField('email', validators = [Required()])
	password = PasswordField('password', validators = [
		Required(),
		EqualTo('confirm', message='Passwords must match')
	])
	confirm = PasswordField('confirm')
	scope = RadioField('scope', choices=[('1','learner'),('2','client')])

class CreateTaskForm(Form):
	image_path = TextField('image_path', validators = [Required()])
	state = TextField('state', validators = [Required()])
	rects = TextField('rects', validators = [Required()])
	class_type = TextField('class_type', validators = [Required()])