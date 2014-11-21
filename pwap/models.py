from datetime import datetime
import os
from sqlalchemy import Column, ForeignKey
from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import relationship, synonym, backref

from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

""" User """
class User(Base):
	__tablename__ = 'leader'

	id = Column(Integer, primary_key=True)
	name = Column(String(200))
	email = Column(Text)
	password = Column(String(100))
	scope = Column(Integer)

	def __init__(self, name, password, email, scope):
		self.name = name
		self.password = password
		self.email = email
		self.scope = scope

	def is_authenticated(self):
		return True

	def is_active(self):
		return True

	def is_anonymous(self):
		return False

	def get_id(self):
		return unicode(self.id)

	def __repr__(self):
		return '<User %r>' % self.name

""" Design """
class Design(Base):
	__tablename__ = 'design'

	id = Column(Integer, primary_key=True)
	original_file = Column(Text)
	uploader_id = Column(Integer)

	def __init__(self, original_file, uploader_id):
		self.original_file = original_file
		self.uploader_id = uploader_id

""" Element """ 
class Element(Base):
	__tablename__ = 'element'

	id = Column(Integer, primary_key=True)
	parent_id = Column(Integer)
	difficulty = Column(Integer)
	yorigin = Column(Integer)
	xorigin = Column(Integer)
	width = Column(Integer)
	height = Column(Integer)

	def __init__(self,parent_id,difficulty,yorigin,xorigin,width,height):
		self.parent_id = parent_id
		self.difficulty = difficulty
		self.yorigin = yorigin
		self.xorigin = xorigin
		self.width = width
		self.height = height

""" Code Snippet """
class CodeSnippet(Base):
	__tablename__ = 'code_snippet'

	id = Column(Integer, primary_key=True)
	element_id = Column(Integer)
	html = Column(Text)
	css = Column(Text)
	author_id = Column(Integer)

	def __init__(self, element_id, html, css, author_id):
		self.element_id = element_id
		self.html = html
		self.css = css
		self.author_id = author_id

class LearningModule(Base):
	__tablename__ = 'learning_module'

	id = Column(Integer, primary_key=True)
	description = Column(Text)
	intro = Column(Text)
	title = Column(Text)

class LearningTask(Base):
	__tablename__ = 'learning_task'

	id = Column(Integer, primary_key=True)
	module_id = Column(Integer)
	HTML = Column(Text)
	starterCSS = Column(Text)
	answer = Column(Text) # tbs as json
	hints = Column(Text) # also tbs as json
	task_description = Column(Text)

class Skills(Base):
	__tablename__ = 'skills'

	id = Column(Integer, primary_key=True)
	skill = Column(Text)

class SkillToModule(Base):
	__tablename__ = 'skill_module'

	id = Column(Integer, primary_key=True)
	skill_id = Column(Integer)
	module_id = Column(Integer)

class UserToModule(Base):
	__tablename__ = 'user_to_module'

	id = Column(Integer, primary_key=True)
	module_id = Column(Integer)
	user_id = Column(Integer)
	timeToComplete = Column(Integer)

	def __init__(self, module_id, user_id, time):
		self.module_id = module_id
		self.user_id = user_id
		self.timeToComplete = time

class UserToTask(Base):
	__tablename__ = 'user_to_task'

	id = Column(Integer, primary_key=True)
	task_id = Column(Integer)
	user_id = Column(Integer)
	timeToComplete = Column(Integer)

	def __init__(self, task_id, user_id, time):
		self.task_id = task_id
		self.user_id = user_id
		self.timeToComplete = time

    def serialize(self):
        return {
            'id': self.id, 
            'task_id': self.task_id,
            'user_id': self.user_id,
            'timeToComplete': self.timeToComplete
        }

class LearnerLogs(Base):
	__tablename__ = 'learner_logs'

	id = Column(Integer, primary_key=True)
	timestamp = Column(DateTime)
	user_id = Column(Integer)
	log_type = Column(String)
	content = Column(String)

	def __init__(self, user_id, log_type, content):
		self.user_id = user_id
		self.log_type = log_type
		self.content = content
		self.timestamp = datetime.now()

if __name__ == '__main__':
	from datetime import timedelta

	from sqlalchemy import create_engine
	from sqlalchemy.orm import sessionmaker

	PWD = os.path.abspath(os.curdir)

	SQLALCHEMY_DATABASE_URI = 'postgres://philhouse:house@ec2-54-172-221-13.compute-1.amazonaws.com/pwap'
	#location = os.environ['DATABASE_URL']
	location = SQLALCHEMY_DATABASE_URI

	engine = create_engine(location, echo=True)

	Base.metadata.create_all(engine)
	Session = sessionmaker(bind=engine)
	session = Session()

	# Add a sample user
	user = User(name='Philip House', password="test", scope=int(0))

	session.add(user)
	session.commit()