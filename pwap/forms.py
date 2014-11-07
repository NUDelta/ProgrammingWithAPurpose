from flask.ext.wtf import Form
from wtforms import TextField, PasswordField, RadioField
from wtforms.validators import Required, EqualTo

# temporary form - will set this up for our needs though
class LoginForm(Form):
	username = TextField('username', validators = [Required()])
	password = PasswordField('password', validators = [Required()])

class SignupForm(Form):
	username = TextField('username', validators = [Required()])
	email = TextField('email', validators = [Required()])
	password = PasswordField('password', validators = [
		Required(),
		EqualTo('confirm', message='Passwords must match')
	])
	confirm = PasswordField('confirm')
	scope = RadioField('scope', choices=[('1','learner'),('2','client')])