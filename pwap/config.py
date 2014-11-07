import os
PWD = os.path.abspath(os.curdir)

DEBUG=True
SECRET_KEY = 'thisissecret'
CSRF_ENABLED = True
SESSION_PROTECTION = 'strong'
SQLALCHEMY_DATABASE_URI = 'postgres://philhouse:house@ec2-54-172-221-13.compute-1.amazonaws.com/pwap'
UPLOAD_FOLDER = 'pwap/static/uploads/designs'