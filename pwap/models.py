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
	password = Column(String(100))
	scope = Column(Integer)

	def __init__(self, name, password, scope):
		self.name = name
		self.password = password
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

""" Element """ 
class Element(Base):
	__tablename__ = 'element'

	id = Column(Integer, primary_key=True)
	img_src = Column(Text)
	parent_id = Column(Integer)
	difficulty = Column(Integer)


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