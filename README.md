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
gunicorn -w 4 -b 127.0.0.1:5000 --log-file=log.txt --reload manage:app
```

KILL ALL UNICORNS:
```
kill -9 `ps aux | grep gunicorn | awk '{print $2}'`
```


To develop the javascript, first install modules via npm install:
`npm install`
Then, when you're making changes to the modules, have gulp watch running in the background to recompile and changed files:
`gulp watch`
