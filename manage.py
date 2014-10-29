from flask.ext.script import Manager

from pwap.app import app, db


manager = Manager(app)
app.config['DEBUG'] = True 

if __name__ == '__main__':
	manager.run()