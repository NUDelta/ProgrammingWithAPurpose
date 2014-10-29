from flask.ext.wtf import Form
from wtforms import TextField, PasswordField
from wtforms.validators import Required


# temporary form - will set this up for our needs though
class LoginForm(Form):
	username = TextField('username', validators = [Required()])
	pin = PasswordField('pin', validators = [Required()])
