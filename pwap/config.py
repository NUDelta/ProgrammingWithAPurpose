import os
PWD = os.path.abspath(os.curdir)

DEBUG=True
SECRET_KEY = 'thisissecret'
CSRF_ENABLED = True
SESSION_PROTECTION = 'strong'
# set mongo db name to pwap due to unknown error
MONGO_DBNAME = 'pwap'
