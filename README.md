ProgrammingWithAPurpose
=======================

Setup your local environment:
(Assumes [Homebrew](http://brew.sh/), [Pip](https://pip.pypa.io/en/latest/installing.html) and [virtualenv](http://virtualenv.readthedocs.org/en/latest/virtualenv.html#installation) are installed)

```
git clone https://github.com/NUDelta/ProgrammingWithAPurpose.git
cd ProgrammingWithAPurpose
virtualenv env
source env/bin/activate
pip install -r requirements.txt
```

You may also choose to install the virtual environment in another directory.

```
virtualenv ~/dev/environments/project_name
. ~/dev/environments/project_name
pip install -r requirements.txt
```

Once requirements are installed and you are in the active virtualenv, you may run the server locally on port 5000.

```
python manage.py runserver
```




