#!/usr/bin/env python
# -*- coding: utf-8 -*- 

from flask import Flask
from flask import render_template, request, jsonify, make_response, Response, flash, redirect, session, url_for, g
from pwap import config

import json

app = Flask(__name__)
app.config.from_object(config)

#lm = LoginManager()
#lm.init_app(app)


@app.route('/welcome', methods=['GET'])
def welcome():	
	return render_template('welcome.html')